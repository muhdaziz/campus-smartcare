import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { EmergencyAlert } from "../types";
import { StatusPill } from "../components/StatusPill";

export function EmergencyPage() {
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [form, setForm] = useState({ message: "", linkedAssessmentId: "", severity: "EMERGENCY" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAlerts() {
    try {
      const data = await api.getEmergencies();
      setAlerts(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.createEmergency({
        message: form.message,
        linkedAssessmentId: form.linkedAssessmentId || undefined,
        severity: form.severity
      });
      setForm({ message: "", linkedAssessmentId: "", severity: "EMERGENCY" });
      await loadAlerts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Emergency alert failed");
    }
  }

  async function acknowledge(id: string) {
    await api.acknowledgeEmergency(id);
    await loadAlerts();
  }

  async function resolve(id: string) {
    await api.resolveEmergency(id);
    await loadAlerts();
  }

  if (loading) {
    return (
      <div className="loading-card">
        <p>Loading emergency alerts...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Emergency Desk</div>
          <h2>
            {session?.user.role === "STUDENT"
              ? "Raise an emergency alert"
              : "Monitor and resolve emergency alerts"}
          </h2>
          <p>
            Emergency alerts are treated as top priority and appear immediately in the clinic
            dashboard workflow.
          </p>
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}

      {session?.user.role === "STUDENT" && (
        <form className="panel" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Severity
              <select
                value={form.severity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, severity: event.target.value }))
                }
              >
                <option value="MODERATE">Moderate — needs attention soon</option>
                <option value="EMERGENCY">Emergency — urgent / life-threatening</option>
              </select>
            </label>

            <label>
              Emergency message
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Describe what is happening and where you are"
                required
              />
            </label>

            <label>
              Linked assessment ID
              <input
                value={form.linkedAssessmentId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkedAssessmentId: event.target.value }))
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <button className="primary-button danger" type="submit">
            Send Emergency Alert
          </button>
        </form>
      )}

      <section className="panel">
        <h3>{session?.user.role === "STUDENT" ? "My emergency alerts" : "Emergency queue"}</h3>
        {alerts.length ? (
          alerts.map((alert) => (
            <div className="queue-card" key={alert.id}>
              <div>
                <div className="queue-title">
                  <strong>{alert.student.name}</strong>
                  <StatusPill value={alert.status} />
                </div>
                <p>{alert.message}</p>
                <span>Severity: {alert.severity}</span>
                <span>Student ID: {alert.student.id}</span>
                <span>Raised: {new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              {session?.user.role !== "STUDENT" && (
                <div className="action-cluster">
                  <button className="ghost-button" onClick={() => void acknowledge(alert.id)}>
                    Acknowledge
                  </button>
                  <button className="ghost-button danger" onClick={() => void resolve(alert.id)}>
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="empty-state">No emergency alerts at the moment.</p>
        )}
      </section>
    </div>
  );
}
