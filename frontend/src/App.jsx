import { useState } from "react";
import "./App.css";

/* ============================================================
   CONFIG — field labels, sections, dropdown options
   ============================================================ */

const PAYMENT_STATUS_OPTIONS = [
  { value: 0, label: "On time" },
  { value: 1, label: "1 month late" },
  { value: 2, label: "2 months late" },
  { value: 3, label: "3 months late" },
  { value: 4, label: "4 months late" },
  { value: 5, label: "5 months late" },
  { value: 6, label: "6+ months late" },
];

const PERSONAL_FIELDS = [
  { name: "AGE", label: "Age", placeholder: "e.g. 34", min: 18, max: 100, step: 1 },
  { name: "LIMIT_BAL", label: "Credit limit", placeholder: "e.g. 200000", min: 0, step: 1000, prefix: "₹" },
];

const PAYMENT_STATUS_FIELDS = [
  { name: "PAY_0", label: "Most recent payment status" },
  { name: "PAY_2", label: "Payment status 2 months ago" },
  { name: "PAY_3", label: "Payment status 3 months ago" },
  { name: "PAY_4", label: "Payment status 4 months ago" },
  { name: "PAY_5", label: "Payment status 5 months ago" },
  { name: "PAY_6", label: "Payment status 6 months ago" },
];

const BILL_AMOUNT_FIELDS = [
  { name: "BILL_AMT1", label: "Most recent bill amount" },
  { name: "BILL_AMT2", label: "Bill amount 2 months ago" },
  { name: "BILL_AMT3", label: "Bill amount 3 months ago" },
  { name: "BILL_AMT4", label: "Bill amount 4 months ago" },
  { name: "BILL_AMT5", label: "Bill amount 5 months ago" },
  { name: "BILL_AMT6", label: "Bill amount 6 months ago" },
].map((f) => ({ ...f, placeholder: "e.g. 15000", prefix: "₹" }));

const PAYMENT_AMOUNT_FIELDS = [
  { name: "PAY_AMT1", label: "Most recent payment amount" },
  { name: "PAY_AMT2", label: "Payment amount 2 months ago" },
  { name: "PAY_AMT3", label: "Payment amount 3 months ago" },
  { name: "PAY_AMT4", label: "Payment amount 4 months ago" },
  { name: "PAY_AMT5", label: "Payment amount 5 months ago" },
  { name: "PAY_AMT6", label: "Payment amount 6 months ago" },
].map((f) => ({ ...f, placeholder: "e.g. 5000", prefix: "₹" }));

const ALL_NUMBER_FIELDS = [...PERSONAL_FIELDS, ...BILL_AMOUNT_FIELDS, ...PAYMENT_AMOUNT_FIELDS];

const INTEGER_FIELDS = new Set(["AGE", "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"]);

const PREDICT_URL = "http://127.0.0.1:8000/predict";

/* ============================================================
   HELPERS
   ============================================================ */

function buildInitialFormData() {
  const initial = {};
  ALL_NUMBER_FIELDS.forEach((f) => (initial[f.name] = ""));
  PAYMENT_STATUS_FIELDS.forEach((f) => (initial[f.name] = ""));
  return initial;
}

function mapFormDataToApiPayload(formData) {
  const payload = {};
  Object.entries(formData).forEach(([key, rawValue]) => {
    const numericValue = Number(rawValue);
    payload[key] = INTEGER_FIELDS.has(key) ? parseInt(numericValue, 10) : parseFloat(numericValue);
  });
  return payload;
}

function validateFormData(formData) {
  const errors = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      errors[key] = "Required";
    } else if (Number.isNaN(Number(value))) {
      errors[key] = "Must be a number";
    }
  });
  return errors;
}

async function getPrediction(payload) {
  let response;
  try {
    response = await fetch(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach the prediction service. Is the backend running on http://127.0.0.1:8000?");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody?.detail ? ` (${JSON.stringify(errorBody.detail)})` : "";
    } catch {
      /* ignore */
    }
    throw new Error(`Prediction request failed with status ${response.status}${detail}`);
  }

  return response.json();
}

/* ============================================================
   SMALL PRESENTATIONAL COMPONENTS
   ============================================================ */

function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">◆</span>
          <span className="app-header__title">Credit Risk Assessment</span>
        </div>
        <span className="app-header__tag">ML-Powered Underwriting Tool</span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Credit Risk Assessment. For internal / demonstration use.</p>
    </footer>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="form-section">
      <h2 className="form-section__title">{title}</h2>
      <div className="form-section__grid">{children}</div>
    </section>
  );
}

function NumberField({ field, value, onChange, error }) {
  const { name, label, placeholder, min, max, step, prefix } = field;
  const inputId = `field-${name}`;

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-field__label">{label}</label>
      <div className={`form-field__input-wrap ${prefix ? "has-prefix" : ""}`}>
        {prefix && <span className="form-field__prefix">{prefix}</span>}
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          className={`form-field__input ${error ? "is-invalid" : ""}`}
          placeholder={placeholder}
          value={value}
          min={min}
          max={max}
          step={step || "any"}
          onChange={(e) => onChange(name, e.target.value)}
        />
      </div>
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}

function PaymentStatusSelect({ field, value, onChange, error }) {
  const { name, label } = field;
  const inputId = `field-${name}`;

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-field__label">{label}</label>
      <select
        id={inputId}
        className={`form-field__select ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <option value="" disabled>Select status…</option>
        {PAYMENT_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}

function RiskBadge({ riskLevel }) {
  const level = (riskLevel || "").toUpperCase();
  const cls =
    level === "HIGH" ? "risk-badge risk-badge--high" :
    level === "MEDIUM" ? "risk-badge risk-badge--medium" :
    "risk-badge risk-badge--low";
  return <span className={cls}>{level} RISK</span>;
}

function ProbabilityDisplay({ percentage }) {
  return (
    <div className="probability-display">
      <span className="probability-display__value">{percentage.toFixed(2)}%</span>
      <span className="probability-display__label">Default Probability</span>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="disclaimer">
      This assessment is an ML-based estimate and does not guarantee future repayment behavior.
    </p>
  );
}

function ResultCard({ result }) {
  return (
    <section className="result-card" aria-live="polite">
      <ProbabilityDisplay percentage={result.default_percentage} />
      <RiskBadge riskLevel={result.risk_level} />
      <p className="result-card__prediction-label">{result.prediction_label}</p>
      <Disclaimer />
    </section>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

function App() {
  const [formData, setFormData] = useState(buildInitialFormData());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  function handleFieldChange(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = mapFormDataToApiPayload(formData);
    setLoading(true);
    setResult(null);

    try {
      const data = await getPrediction(payload);
      setResult(data);
    } catch (err) {
      setApiError(err.message || "Something went wrong while assessing risk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <form className="risk-form" onSubmit={handleSubmit} noValidate>
          <FormSection title="Personal Information">
            {PERSONAL_FIELDS.map((field) => (
              <NumberField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
              />
            ))}
          </FormSection>

          <FormSection title="Payment History">
            {PAYMENT_STATUS_FIELDS.map((field) => (
              <PaymentStatusSelect
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
              />
            ))}
          </FormSection>

          <FormSection title="Bill Amounts">
            {BILL_AMOUNT_FIELDS.map((field) => (
              <NumberField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
              />
            ))}
          </FormSection>

          <FormSection title="Payment Amounts">
            {PAYMENT_AMOUNT_FIELDS.map((field) => (
              <NumberField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
              />
            ))}
          </FormSection>

          {apiError && <p className="api-error" role="alert">{apiError}</p>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="submit-button__spinner" aria-hidden="true" />
                Assessing…
              </>
            ) : (
              "Assess Credit Risk"
            )}
          </button>
        </form>

        {result && <ResultCard result={result} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;