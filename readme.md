# Credit Card Default Prediction

A machine learning project that predicts whether a credit card customer is likely to default on their payment. The project combines a trained machine learning model with a **FastAPI REST API** to provide real-time default predictions and risk classification.

## Overview

Credit card default prediction is a binary classification problem where the goal is to determine whether a customer is likely to default based on their financial and repayment behavior.

The system accepts customer financial information through a FastAPI endpoint, validates the input using **Pydantic**, processes the data, and uses a trained machine learning model to generate a prediction.

The API returns:

* Default probability
* Default percentage
* Risk level
* Binary prediction
* Human-readable prediction label

## Features

* Predicts credit card payment default
* Returns probability of default
* Classifies customers into **LOW, MEDIUM, or HIGH** risk
* Input validation using Pydantic
* REST API built with FastAPI
* Machine learning inference through a trained classification model
* Interactive API documentation through Swagger UI
* Structured JSON responses

## Machine Learning Workflow

The complete prediction workflow is:

```text
Customer Financial Data
        ↓
FastAPI Endpoint
        ↓
Pydantic Input Validation
        ↓
Data Preprocessing
        ↓
Trained ML Model
        ↓
Default Probability
        ↓
Risk Classification
        ↓
JSON Response
```

The model uses customer financial information such as repayment, billing, and payment-related features to estimate the probability of default.

## API Response

The API provides the following response fields:

| Field                 | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `default_probability` | Model-estimated probability that the customer will default                   |
| `default_percentage`  | Default probability represented as a percentage                              |
| `risk_level`          | Customer risk classification: LOW, MEDIUM, or HIGH                           |
| `prediction`          | Binary prediction where `0` represents no default and `1` represents default |
| `prediction_label`    | Human-readable interpretation of the prediction                              |

Example response:

```json
{
    "default_probability": 0.23,
    "default_percentage": 23.0,
    "risk_level": "MEDIUM",
    "prediction": 0,
    "prediction_label": "Customer is unlikely to default"
}
```

## Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* Machine Learning Classification

### Backend

* FastAPI
* Pydantic
* Uvicorn

### Development

* Jupyter Notebook
* Git
* GitHub

## Project Structure

```text
credit-card-default/
│
├── data/
│   └── ...
│
├── notebooks/
│   └── model_training.ipynb
│
├── models/
│   └── ...
│
├── app/
│   ├── main.py
│   └── ...
│
├── requirements.txt
├── README.md
└── .gitignore
```

## Running the Project Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd credit-card-default
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### 5. Open API Documentation

FastAPI automatically provides interactive Swagger documentation at:

```text
http://127.0.0.1:8000/docs
```

You can use the Swagger UI to provide customer information and test predictions directly from the browser.

## Prediction Logic

The model produces a probability representing the likelihood that a customer will default.

This probability is then converted into a risk category:

```text
Model Probability
       ↓
Risk Thresholds
       ↓
LOW / MEDIUM / HIGH
```

The binary prediction is:

```text
0 → Customer is predicted not to default
1 → Customer is predicted to default
```

The probability and risk level provide more information than the binary prediction alone, making the output easier to interpret for potential financial risk assessment.

## Example Use Case

A financial institution can use this system to evaluate customers before extending or modifying credit.

For example:

```text
Customer Financial Data
        ↓
ML Model
        ↓
Default Probability: 23%
        ↓
Risk Level: MEDIUM
        ↓
Prediction: No Default
```

This could help financial institutions identify potentially high-risk customers and support data-driven credit risk decisions.

## Future Improvements

* Add a frontend dashboard for predictions
* Deploy the API to a cloud platform
* Add model performance monitoring
* Experiment with different classification algorithms
* Perform hyperparameter tuning
* Add explainable AI techniques such as SHAP
* Add authentication and authorization
* Containerize the application using Docker
* Add automated testing and CI/CD

## Disclaimer

This project is intended for **educational and demonstration purposes**. Predictions from the model should not be used as the sole basis for real-world financial or credit decisions.
