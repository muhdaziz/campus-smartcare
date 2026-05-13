import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    matricNumber: "",
    ageRange: "",
    sex: "PREFER_NOT_TO_SAY",
    allergies: "",
    chronicConditions: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registerStudent({
        name: form.name,
        email: form.email,
        password: form.password,
        healthProfile: {
          matricNumber: form.matricNumber || undefined,
          ageRange: form.ageRange || undefined,
          sex: form.sex,
          allergies: form.allergies || undefined,
          chronicConditions: form.chronicConditions || undefined
        }
      });
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card wide" onSubmit={handleSubmit}>
        <div className="eyebrow">Student Registration</div>
        <h1>Create your SmartPLus account</h1>
        <p>
          Students self-register here. Doctor and admin accounts are provisioned by the clinic
          administrator.
        </p>

        <div className="form-grid">
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Email
            <input
              value={form.email}
              type="email"
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Password
            <input
              value={form.password}
              type="password"
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Matric number
            <input
              value={form.matricNumber}
              onChange={(event) =>
                setForm((current) => ({ ...current, matricNumber: event.target.value }))
              }
            />
          </label>

          <label>
            Age range
            <input
              value={form.ageRange}
              onChange={(event) =>
                setForm((current) => ({ ...current, ageRange: event.target.value }))
              }
              placeholder="16-20"
            />
          </label>

          <label>
            Sex
            <select
              value={form.sex}
              onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value }))}
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
          </label>

          <label>
            Allergies
            <textarea
              value={form.allergies}
              onChange={(event) =>
                setForm((current) => ({ ...current, allergies: event.target.value }))
              }
              placeholder="Optional"
            />
          </label>

          <label>
            Chronic conditions
            <textarea
              value={form.chronicConditions}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  chronicConditions: event.target.value
                }))
              }
              placeholder="Optional"
            />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="inline-note">
          Already registered? <Link to="/login">Go to login</Link>.
        </p>
      </form>
    </div>
  );
}
