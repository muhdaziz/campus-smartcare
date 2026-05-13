import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { RecordBundle } from "../types";

export function RecordsPage() {
  const { session } = useAuth();
  const [bundle, setBundle] = useState<RecordBundle | null>(null);
  const [studentId, setStudentId] = useState("");
  const [noteForm, setNoteForm] = useState({
    type: "CLINICAL_NOTE",
    title: "",
    note: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOwnRecords() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMyRecords();
      setBundle(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentRecords() {
    if (!studentId) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.getStudentRecords(studentId);
      setBundle(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load student record");
    } finally {
      setLoading(false);
    }
  }

  async function createNote(event: React.FormEvent) {
    event.preventDefault();
    if (!studentId) {
      setError("Enter a student ID before adding a note");
      return;
    }

    try {
      await api.createRecordEntry(studentId, noteForm);
      setNoteForm({ type: "CLINICAL_NOTE", title: "", note: "" });
      await loadStudentRecords();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create note");
    }
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Health Records</div>
          <h2>{session?.user.role === "STUDENT" ? "My health history" : "Student clinical records"}</h2>
          <p>
            {session?.user.role === "STUDENT"
              ? "Review your symptom history, appointments, alerts, and clinician notes."
              : "Load a student profile by ID and add secured clinician notes to the record."}
          </p>
        </div>
      </section>

      {session?.user.role === "STUDENT" ? (
        <button className="primary-button slim" onClick={() => void loadOwnRecords()}>
          Load My Records
        </button>
      ) : (
        <>
          <section className="panel">
            <div className="form-grid compact-grid">
              <label>
                Student ID
                <input value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="Paste student UUID" />
              </label>
              <button className="primary-button" onClick={() => void loadStudentRecords()}>
                Load Student Record
              </button>
            </div>
          </section>

          <form className="panel" onSubmit={createNote}>
            <h3>Add clinician note</h3>
            <div className="form-grid">
              <label>
                Note type
                <select
                  value={noteForm.type}
                  onChange={(event) =>
                    setNoteForm((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  <option value="CLINICAL_NOTE">Clinical note</option>
                  <option value="TRIAGE_SUMMARY">Triage summary</option>
                  <option value="APPOINTMENT_NOTE">Appointment note</option>
                  <option value="EMERGENCY_NOTE">Emergency note</option>
                </select>
              </label>
              <label>
                Title
                <input
                  value={noteForm.title}
                  onChange={(event) =>
                    setNoteForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Note
                <textarea
                  value={noteForm.note}
                  onChange={(event) =>
                    setNoteForm((current) => ({ ...current, note: event.target.value }))
                  }
                />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save Note
            </button>
          </form>
        </>
      )}

      {error && <div className="form-error">{error}</div>}

      {loading && (
        <div className="loading-card">
          <p>Loading records...</p>
        </div>
      )}

      {!loading && bundle && (
        <>
          <section className="panel">
            <h3>Profile</h3>
            <div className="info-grid">
              <div>
                <span className="label">Student</span>
                <strong>{bundle.profile.name}</strong>
              </div>
              <div>
                <span className="label">Email</span>
                <strong>{bundle.profile.email}</strong>
              </div>
              <div>
                <span className="label">Matric number</span>
                <strong>{bundle.profile.healthProfile?.matricNumber ?? "Not provided"}</strong>
              </div>
              <div>
                <span className="label">Allergies</span>
                <strong>{bundle.profile.healthProfile?.allergies ?? "Not provided"}</strong>
              </div>
            </div>
          </section>

          <section className="two-column-grid">
            <article className="panel">
              <h3>Assessments</h3>
              {bundle.assessments.length ? (
                bundle.assessments.map((assessment) => (
                  <div className="list-row stacked" key={assessment.id}>
                    <div>
                      <strong>{assessment.condition}</strong>
                      <span>{assessment.triageLevel}</span>
                      <p>{assessment.recommendation}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No assessments available.</p>
              )}
            </article>

            <article className="panel">
              <h3>Clinical notes</h3>
              {bundle.clinicalNotes.length ? (
                bundle.clinicalNotes.map((note) => (
                  <div className="list-row stacked" key={note.id}>
                    <div>
                      <strong>{note.title}</strong>
                      <span>
                        {note.type} by {note.doctor.name}
                      </span>
                      <p>{note.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No clinician notes yet.</p>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
