import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Assessment } from "../types";
import { StatusPill } from "../components/StatusPill";

export function SymptomCheckerPage() {
  const [symptomText, setSymptomText] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [currentResult, setCurrentResult] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadHistory() {
    try {
      const items = await api.getMyAssessments();
      setHistory(items);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Failed to load history");
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await api.createAssessment({
        symptoms: symptomText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        contextNotes: contextNotes || undefined
      });
      setCurrentResult(result);
      setSymptomText("");
      setContextNotes("");
      await loadHistory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assessment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Explainable AI Triage</div>
          <h2>Symptom Checker</h2>
          <p>
            Enter symptoms as a comma-separated list and receive a transparent triage result,
            matched signals, and practical next-step guidance.
          </p>
        </div>
      </section>

      <section className="two-column-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h3>Run a new assessment</h3>
          <label>
            Symptoms
            <textarea
              value={symptomText}
              onChange={(event) => setSymptomText(event.target.value)}
              placeholder="fever, chills, headache"
              required
            />
          </label>
          <label>
            Extra context
            <textarea
              value={contextNotes}
              onChange={(event) => setContextNotes(event.target.value)}
              placeholder="How long you have felt this way, anything that made it worse, recent exposure..."
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Analyzing..." : "Analyze Symptoms"}
          </button>
        </form>

        <article className="panel emphasis-panel">
          <h3>Latest result</h3>
          {currentResult ? (
            <>
              <div className="result-headline">
                <div>
                  <strong>{currentResult.condition}</strong>
                  <span>
                    Confidence {Math.round(currentResult.confidence * 100)}% (
                    {currentResult.confidenceBand})
                  </span>
                </div>
                <StatusPill value={currentResult.triageLevel} />
              </div>
              <p>{currentResult.explanation}</p>
              <div className="tag-row">
                {currentResult.matchedSignals.map((signal) => (
                  <span className="tag" key={signal}>
                    {signal}
                  </span>
                ))}
              </div>
              <div className="callout">
                <strong>Recommendation</strong>
                <p>{currentResult.recommendation}</p>
              </div>
              {currentResult.analytics && (
                <div className="callout">
                  <strong>Assessment analytics</strong>
                  <p>
                    Trend: {currentResult.analytics.trend}. Previous assessments:{" "}
                    {currentResult.analytics.previousAssessmentCount}. Previous emergency
                    cases: {currentResult.analytics.previousEmergencyCount}. Repeated
                    condition matches: {currentResult.analytics.repeatedConditionCount}.
                  </p>
                  {currentResult.analytics.recurringSymptoms.length > 0 && (
                    <div className="tag-row">
                      {currentResult.analytics.recurringSymptoms.map((symptom) => (
                        <span className="tag" key={symptom}>
                          recurring: {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="empty-state">Your most recent assessment will appear here after analysis.</p>
          )}
        </article>
      </section>

      <section className="panel">
        <h3>Assessment history</h3>
        {history.length ? (
          history.map((item) => (
            <div className="list-row stacked" key={item.id}>
              <div>
                <strong>{item.condition}</strong>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span>Confidence band: {item.confidenceBand}</span>
                <p>{item.recommendation}</p>
              </div>
              <StatusPill value={item.triageLevel} />
            </div>
          ))
        ) : (
          <p className="empty-state">No symptom assessments yet.</p>
        )}
      </section>
    </div>
  );
}
