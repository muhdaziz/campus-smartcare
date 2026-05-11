import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { StatusPill } from "../components/StatusPill";

type StudentSummary = {
  role: "STUDENT";
  metrics: {
    totalAssessments: number;
    pendingAppointments: number;
    activeAlerts: number;
    totalAppointments: number;
  };
  lastAssessment: {
    condition: string;
    triageLevel: string;
    recommendation: string;
    createdAt: string;
  } | null;
  recentAppointments: {
    id: string;
    reason: string;
    status: string;
    preferredDateTime: string;
    assignedDoctor: string | null;
  }[];
};

type StaffSummary = {
  role: "ADMIN" | "DOCTOR";
  metrics: Record<string, number>;
  recentAppointments: {
    id: string;
    studentName: string;
    status: string;
    preferredDateTime: string;
  }[];
  recentEmergencies: {
    id: string;
    studentName: string;
    severity: string;
    status: string;
  }[];
};

type DashboardSummary = StudentSummary | StaffSummary;

export function DashboardPage() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboardSummary()
      .then((data) => setSummary(data as DashboardSummary))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!session) return null;

  return (
    <div className="page-shell">
      <section className="panel hero-panel">
        <div>
          <div className="eyebrow">Operational overview</div>
          <h2>{session.user.name}</h2>
          <p>
            {session.user.role === "STUDENT"
              ? "Manage your healthcare requests, run symptom checks, and keep your medical history organized."
              : "Monitor clinic flow, respond to emergencies, and keep campus healthcare operations moving."}
          </p>
        </div>
        <div className="profile-chip">
          <span>{session.user.role.toLowerCase()}</span>
          <strong>{session.user.email}</strong>
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}

      {loading && (
        <div className="loading-card">
          <p>Loading dashboard...</p>
        </div>
      )}

      {!loading && summary?.role === "STUDENT" && (
        <>
          {/* Metrics */}
          <section className="stat-grid">
            <article className="metric-card">
              <span>Assessments run</span>
              <strong>{summary.metrics.totalAssessments}</strong>
            </article>
            <article className="metric-card">
              <span>Pending appointments</span>
              <strong>{summary.metrics.pendingAppointments}</strong>
            </article>
            <article className="metric-card">
              <span>Total appointments</span>
              <strong>{summary.metrics.totalAppointments}</strong>
            </article>
            <article className={`metric-card${summary.metrics.activeAlerts > 0 ? " alert-card" : ""}`}>
              <span>Active alerts</span>
              <strong>{summary.metrics.activeAlerts}</strong>
            </article>
          </section>

          {/* Last assessment */}
          {summary.lastAssessment && (
            <section className="panel">
              <h3>Last assessment result</h3>
              <div className="info-grid">
                <div>
                  <span className="label">Condition</span>
                  <strong>{summary.lastAssessment.condition}</strong>
                </div>
                <div>
                  <span className="label">Triage level</span>
                  <strong>{summary.lastAssessment.triageLevel}</strong>
                </div>
                <div>
                  <span className="label">Date</span>
                  <strong>{new Date(summary.lastAssessment.createdAt).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="label">Recommendation</span>
                  <strong>{summary.lastAssessment.recommendation}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Recent appointments */}
          <section className="panel">
            <h3>Recent appointments</h3>
            {summary.recentAppointments.length ? (
              summary.recentAppointments.map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <strong>{a.reason}</strong>
                    <span>{new Date(a.preferredDateTime).toLocaleString()}</span>
                    {a.assignedDoctor && <span>Dr. {a.assignedDoctor}</span>}
                  </div>
                  <StatusPill value={a.status} />
                </div>
              ))
            ) : (
              <p className="empty-state">No appointments yet.</p>
            )}
          </section>

          {/* Quick actions */}
          <section className="stat-grid">
            <Link className="action-card" to="/symptom-checker">
              <strong>AI Symptom Checker</strong>
              <span>Explainable triage with matched symptoms and next-step guidance.</span>
            </Link>
            <Link className="action-card" to="/appointments">
              <strong>Appointment Booking</strong>
              <span>Send appointment requests and track clinic responses in one place.</span>
            </Link>
            <Link className="action-card" to="/records">
              <strong>Health Records</strong>
              <span>View your profile, visit history, emergency alerts, and clinician notes.</span>
            </Link>
            <Link className="action-card alert-card" to="/emergency">
              <strong>Emergency Alert</strong>
              <span>Raise a high-priority alert when urgent campus medical attention is needed.</span>
            </Link>
          </section>
        </>
      )}

      {!loading && summary && summary.role !== "STUDENT" && (
        <>
          <section className="stat-grid">
            {Object.entries(summary.metrics).map(([label, value]) => (
              <article className="metric-card" key={label}>
                <span>{label.replace(/([A-Z])/g, " $1")}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <section className="two-column-grid">
            <article className="panel">
              <h3>Recent appointments</h3>
              {summary.recentAppointments.length ? (
                summary.recentAppointments.map((a) => (
                  <div className="list-row" key={a.id}>
                    <div>
                      <strong>{a.studentName}</strong>
                      <span>{new Date(a.preferredDateTime).toLocaleString()}</span>
                    </div>
                    <StatusPill value={a.status} />
                  </div>
                ))
              ) : (
                <p className="empty-state">No appointment data yet.</p>
              )}
            </article>

            <article className="panel">
              <h3>Recent emergency alerts</h3>
              {summary.recentEmergencies.length ? (
                summary.recentEmergencies.map((alert) => (
                  <div className="list-row" key={alert.id}>
                    <div>
                      <strong>{alert.studentName}</strong>
                      <span>{alert.severity}</span>
                    </div>
                    <StatusPill value={alert.status} />
                  </div>
                ))
              ) : (
                <p className="empty-state">No emergency alerts yet.</p>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
