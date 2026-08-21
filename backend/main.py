from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path


app = FastAPI(
    title="Credit Risk Assessment API",
    description="ML-based credit default prediction",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Load model
# -------------------------
# -------------------------
# Load model
# -------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

model = joblib.load(BASE_DIR / "credit_risk_model.pkl")
feature_cols = joblib.load(BASE_DIR / "feature_cols.pkl")


# -------------------------
# Input schema
# -------------------------

class CustomerData(BaseModel):

    LIMIT_BAL: float
    AGE: int

    PAY_0: int
    PAY_2: int
    PAY_3: int
    PAY_4: int
    PAY_5: int
    PAY_6: int

    BILL_AMT1: float
    BILL_AMT2: float
    BILL_AMT3: float
    BILL_AMT4: float
    BILL_AMT5: float
    BILL_AMT6: float

    PAY_AMT1: float
    PAY_AMT2: float
    PAY_AMT3: float
    PAY_AMT4: float
    PAY_AMT5: float
    PAY_AMT6: float


# -------------------------
# Feature engineering
# -------------------------

def create_features(data):

    df = pd.DataFrame([data])

    pay_cols = [
        "PAY_0",
        "PAY_2",
        "PAY_3",
        "PAY_4",
        "PAY_5",
        "PAY_6"
    ]

    bill_cols = [
        "BILL_AMT1",
        "BILL_AMT2",
        "BILL_AMT3",
        "BILL_AMT4",
        "BILL_AMT5",
        "BILL_AMT6"
    ]

    payment_cols = [
        "PAY_AMT1",
        "PAY_AMT2",
        "PAY_AMT3",
        "PAY_AMT4",
        "PAY_AMT5",
        "PAY_AMT6"
    ]

    # -------------------------
    # Repayment features
    # -------------------------

    df["late_payment_count"] = (
        df[pay_cols] > 0
    ).sum(axis=1)

    df["max_delay"] = (
        df[pay_cols]
        .clip(lower=0)
        .max(axis=1)
    )

    df["recent_delay"] = (
        df["PAY_0"]
        .clip(lower=0)
    )

    positive_delays = (
        df[pay_cols]
        .clip(lower=0)
        .replace(0, float("nan"))
    )

    df["avg_delay"] = (
        positive_delays
        .mean(axis=1)
        .fillna(0)
    )

    # -------------------------
    # Bill features
    # -------------------------

    df["avg_bill"] = df[bill_cols].mean(axis=1)

    df["max_bill"] = df[bill_cols].max(axis=1)

    df["bill_std"] = df[bill_cols].std(axis=1)

    # -------------------------
    # Payment features
    # -------------------------

    df["avg_payment"] = df[payment_cols].mean(axis=1)

    df["total_payment"] = df[payment_cols].sum(axis=1)

    df["payment_std"] = df[payment_cols].std(axis=1)

    return df


# -------------------------
# Health check
# -------------------------

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# -------------------------
# Prediction
# -------------------------

@app.post("/predict")
def predict(customer: CustomerData):

    # Convert Pydantic object to dictionary
    data = customer.model_dump()

    # Create engineered features
    df = create_features(data)

    # Make sure feature order matches training
    X = df[feature_cols]

    # Get probability of default
    probability = float(model.predict_proba(X)[0][1])

    # Convert probability to percentage
    default_percentage = round(probability * 100, 2)

    # -------------------------
    # Risk classification
    # -------------------------

    if probability < 0.30:
        risk_level = "LOW"
        prediction = 0
        prediction_label = "Likely to Repay"

    elif probability < 0.50:
        risk_level = "MEDIUM"
        prediction = 1
        prediction_label = "Some Risk of Default"

    else:
        risk_level = "HIGH"
        prediction = 1
        prediction_label = "Likely to Default"

    return {
        "default_probability": round(probability, 4),
        "default_percentage": default_percentage,
        "risk_level": risk_level,
        "prediction": prediction,
        "prediction_label": prediction_label
    }
    