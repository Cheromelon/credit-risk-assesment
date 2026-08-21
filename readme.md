# AI-Powered Credit Risk Assessment

An explainable machine learning system that predicts the probability of a customer defaulting on their next credit card payment using historical repayment, billing, and payment behavior.

## Features

- Data preprocessing and exploratory analysis
- Behavioral feature engineering
- Logistic Regression and Random Forest model comparison
- Probability threshold optimization
- SHAP-based prediction explainability
- FastAPI REST API for real-time predictions
- Risk classification into LOW, MEDIUM, and HIGH

## Dataset

The project uses 30,000 customer records containing credit limit, age, six months of repayment status, six months of billing amounts, and six months of payment amounts.

### Target

- `0` → No Default
- `1` → Default

## Feature Engineering

The raw monthly financial and repayment features were transformed into behavioral features to provide the model with more meaningful information about customer payment patterns. From the repayment status features (`PAY_0` to `PAY_6`), the following features were created: `late_payment_count`, which represents the number of months with a positive repayment delay; `max_delay`, which represents the maximum repayment delay; `recent_delay`, which represents the most recent repayment delay; and `avg_delay`, which represents the average positive repayment delay. From the billing features (`BILL_AMT1` to `BILL_AMT6`), `avg_bill`, `max_bill`, and `bill_std` were created to capture the average billing amount, maximum billing amount, and variation in billing amounts. From the payment features (`PAY_AMT1` to `PAY_AMT6`), `avg_payment`, `total_payment`, and `payment_std` were created to capture average payment behavior, total payments, and payment variability.

## Exploratory Findings

The analysis showed a strong relationship between repeated payment delays and default risk. The observed default rate increased from 11.71% for customers with zero late-payment months to 70.32% for customers with six late-payment months. Recent repayment behavior was also highly informative, with the observed default rate increasing from 13.83% for a recent delay of 0 to 75.78% for a recent delay of 3.

These are observational relationships and should not be interpreted as proof of causation.

## Model Development

Multiple machine learning models were evaluated to compare performance and understand the effect of feature engineering.

| Model | Accuracy | F1 Score | ROC-AUC |
|---|---:|---:|---:|
| Logistic Regression | 73.77% | 50.35% | 75.57% |
| Random Forest | 81.28% | 45.56% | 75.45% |

Feature engineering improved Logistic Regression ROC-AUC from 70.68% to 75.57% and F1 Score from 46.65% to 50.35%.

The Random Forest model achieved higher accuracy and precision but had lower recall at the default 0.5 threshold.

## Threshold Optimization

Different probability thresholds were evaluated for the Random Forest model to find a better balance between precision and recall.

| Threshold | Precision | Recall | F1 Score |
|---:|---:|---:|---:|
| 0.20 | 40.41% | 65.71% | 50.04% |
| 0.30 | 51.28% | 52.83% | 52.04% |
| 0.40 | 57.94% | 42.88% | 49.29% |
| 0.50 | 63.78% | 35.57% | 45.67% |

A threshold of `0.30` was selected for the prototype because it produced the highest F1 Score among the tested thresholds.

## Risk Classification

The predicted probability is converted into a risk category using the prototype threshold configuration:

- Probability < `0.30` → LOW
- `0.30` ≤ Probability < `0.50` → MEDIUM
- Probability ≥ `0.50` → HIGH

The 0.30 threshold is a prototype operating point and is not intended to represent a universal or production financial-risk threshold.

## Explainability

SHAP (SHapley Additive exPlanations) is used to explain individual model predictions by showing how different features contribute to the predicted default risk.

For example, a customer prediction may return a default probability of 14.67%, with features such as `max_delay`, `avg_delay`, `avg_payment`, `bill_std`, `PAY_AMT1`, and `recent_delay` contributing to the prediction.

Positive SHAP values push the prediction toward default, while negative SHAP values push the prediction away from default. SHAP explains model contribution and should not be interpreted as proof of causality.

## API

The trained model is served using FastAPI.

### Endpoints

- `GET /health` — Checks whether the API is running.
- `POST /predict` — Accepts customer financial information and returns a default-risk assessment.

### Example Response

```json
{
  "default_probability": 0.3463,
  "default_percentage": 34.63,
  "risk_level": "MEDIUM",
  "prediction": 1,
  "prediction_label": "Some Risk of Default"
}
Response Fields
default_probability — Model-estimated probability of default.
default_percentage — Default probability represented as a percentage.
risk_level — LOW, MEDIUM, or HIGH.
prediction — Binary prediction where 0 represents no default and 1 represents default.
prediction_label — Human-readable interpretation of the prediction.
Workflow

The complete prediction workflow is: customer financial data is provided to the FastAPI endpoint, the input is validated using Pydantic, the raw repayment, billing, and payment data is transformed into engineered behavioral features, the trained Random Forest model generates a probability of default, the selected 0.30 threshold is applied to generate the binary prediction, the probability is mapped to a LOW, MEDIUM, or HIGH risk category, and SHAP is used to provide an explanation of the model prediction before the final structured response is returned through the API.

System Architecture
Customer Input
      ↓
FastAPI API
      ↓
Input Validation
      ↓
Feature Engineering
      ↓
Random Forest
      ↓
Default Probability
      ↓
Risk Classification
      ↓
SHAP Explanation
      ↓
Prediction Response
Project Structure
credit-risk-assessment/
│
├── model.ipynb
├── credit_risk_model.pkl
├── feature_cols.pkl
├── default of credit card clients.xls
│
└── backend/
    └── main.py
Tech Stack
Python
Pandas
NumPy
Scikit-learn
SHAP
FastAPI
Pydantic
Uvicorn
Joblib
Jupyter Notebook
Installation

Clone the repository:

git clone <your-repository-url>

Move into the project directory:

cd credit-risk-assessment

Install the required dependencies:

pip install pandas numpy scikit-learn shap fastapi uvicorn joblib xlrd
Running the Project

Open model.ipynb and run the notebook to perform data preprocessing, feature engineering, model training, evaluation, threshold analysis, and SHAP analysis.

The trained model is saved as:

credit_risk_model.pkl

The feature list used during training is saved as:

feature_cols.pkl

To start the FastAPI backend:

cd backend
uvicorn main:app --reload

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation is available at:

http://127.0.0.1:8000/docs
Responsible AI

This project is intended as a credit-risk assessment and decision-support prototype rather than an autonomous lending decision system. SHAP is used to improve prediction explainability, FastAPI and Pydantic provide input validation, and the model focuses on financial and repayment-related information. Before production use, additional validation would be required, including fairness evaluation, probability calibration, model monitoring, security controls, and business validation of risk thresholds.

Future Improvements
Web-based user interface
Model calibration
Hyperparameter optimization
Model and data drift monitoring
Fairness evaluation
Automated testing
Authentication and authorization
Secure production deployment
Improved model monitoring and retraining
Disclaimer

This project is a machine learning prototype for credit risk assessment and decision support. It is not intended to make autonomous lending decisions or serve as the sole basis for real-world credit decisions.
