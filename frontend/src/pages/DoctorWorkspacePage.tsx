import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Appointment, RecordBundle, User } from "../types";
import { StatusPill } from "../components/StatusPill";

type Tab = "queue" | "patients";

export function DoctorWorkspacePage() {
  const [tab, setTab] = useState<Tab>("queue");

  // ── Queue state ────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState("");

  // Per-appointment note + response state (keyed by appointment id)
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Patient search state ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<RecordBundle | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState("");

  // Inline note form for patient record tab
  const [noteForm, setNoteForm] = useState({ type: "CLINICAL_NOTE", title: "", note: "" });
  const [noteSuccess, setNoteSuccess] = useState("");
  const [noteError, setNoteError] = useState("");

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load queue ─────────────────────────────────────────────────────────────
  async function loadQueue() {
    setQueueLoading(true);
    setQueueError("");
    try {
      const data = await api.getAppointmentQueue();
      setAppointments(data);
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setQueueLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  // ── Appointment actions ────────────────────────────────────────────────────
  async function handleStatus(id: string, status: string) {
    try {
      await api.updateAppointmentStatus(id, {
        status,
        clinicianResponse: responses[id] || undefined
      });

      // If completing, also save a note if one was written
      if (status === "COMPLETED" && notes[id]?.trim()) {
        const appt = appointments.find((a) => a.id === id);
        if (appt?.student?.id) {
          await api.createRecordEntry(appt.student.id, {
            type: "APPOINTMENT_NOTE",
            title: `Consultation — ${new Date().toLocaleDateString()}`,
            note: notes[id]
          });
        }
      }

      setNotes((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setResponses((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setExpanded(null);
      await loadQueue();
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : "Action failed");
    }
  }

  // ── Patient search ─────────────────────────────────────────────────────────
  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await api.searchStudents(value.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }

  async function loadPatientRecord(studentId: string) {
    setPatientLoading(true);
    setPatientError("");
    setSelectedPatient(null);
    setNoteSuccess("");
    setNoteError("");
    try {
      const data = await api.getStudentRecords(studentId);
      setSelectedPatient(data);
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      setPatientError(err instanceof Error ? err.message : "Failed to load record");
    } finally {
      setPatientLoading(false);
    }
  }

  async function submitNote(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPatient) return;
    setNoteError("");
    setNoteSuccess("");
    try {
      await api.createRecordEntry(selectedPatient.profile.id, noteForm);
      setNoteForm({ type: "CLINICAL_NOTE", title: "", note: "" });
      setNoteSuccess("Note saved successfully.");
      const refreshed = await api.getStudentRecords(selectedPatient.profile.id);
      setSelectedPatient(refreshed);
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Failed to save note");
    }
  }

  // ── My assigned appointments (filter) ────────────────────────────────────
  const myAssigned   = appointments.filter((a) => a.assignedDoctor !== null);
  const unassigned   = appointments.filter((a) => a.assignedDoctor === null && a.status === "pending");
  const activeQueue  = [...myAssigned, ...unassigned];

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Doctor Workspace</div>
          <h2>Clinical console</h2>
          <p>Manage your appointment queue, complete consultations with inline notes, and look up patient records.</p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          className={tab === "queue" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("queue")}
        >
          Appointment Queue
          {activeQueue.length > 0 && (
            <span className="badge">{activeQueue.length}</span>
          )}
        </button>
        <button
          className={tab === "patients" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("patients")}
        >
          Patient Records
        </button>
      </div>

      {/* ── Queue tab ──────────────────────────────────────────────────────── */}
      {tab === "queue" && (
        <>
          {queueError && <div className="form-error">{queueError}</div>}

          {queueLoading ? (
            <div className="loading-card"><p>Loading appointments...</p></div>
          ) : activeQueue.length === 0 ? (
            <div className="panel"><p className="empty-state">No active appointments in your queue.</p></div>
          ) : (
            activeQueue.map((appt) => (
              <div className="panel queue-card-full" key={appt.id}>
                {/* Header row */}
                <div className="queue-card-header">
                  <div>
                    <strong>{appt.student.name}</strong>
                    <span className="muted">{appt.student.email}</span>
                  </div>
                  <div className="queue-meta">
                    <StatusPill value={appt.status} />
                    {appt.assignedDoctor && (
                      <span className="assigned-badge">Assigned to you</span>
                    )}
                    <span className="muted">{new Date(appt.preferredDateTime).toLocaleString()}</span>
                  </div>
                </div>

                {/* Reason + triage */}
                <p className="queue-reason">{appt.reason}</p>
                {appt.triageLevel && (
                  <div className="triage-chip">Triage: {appt.triageLevel}</div>
                )}

                {/* Expand for actions */}
                <button
                  className="ghost-button slim"
                  onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}
                >
                  {expanded === appt.id ? "Hide actions" : "Actions"}
                </button>

                {expanded === appt.id && (
                  <div className="action-panel">
                    <label>
                      Clinician response (sent to student)
                      <textarea
                        value={responses[appt.id] ?? ""}
                        onChange={(e) =>
                          setResponses((prev) => ({ ...prev, [appt.id]: e.target.value }))
                        }
                        placeholder="Optional message to student"
                      />
                    </label>

                    {appt.status === "pending" || appt.status === "rescheduled" ? (
                      <label>
                        Consultation note (saved to patient record on approval)
                        <textarea
                          value={notes[appt.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [appt.id]: e.target.value }))
                          }
                          placeholder="Optional clinical note"
                        />
                      </label>
                    ) : null}

                    {appt.status === "approved" && (
                      <label>
                        Consultation note (saved to patient record on completion)
                        <textarea
                          value={notes[appt.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [appt.id]: e.target.value }))
                          }
                          placeholder="Write your consultation findings here"
                        />
                      </label>
                    )}

                    <div className="action-cluster">
                      {(appt.status === "pending" || appt.status === "rescheduled") && (
                        <button
                          className="ghost-button"
                          onClick={() => void handleStatus(appt.id, "APPROVED")}
                        >
                          Approve
                        </button>
                      )}
                      {appt.status === "approved" && (
                        <button
                          className="ghost-button"
                          onClick={() => void handleStatus(appt.id, "COMPLETED")}
                        >
                          Complete + Save Note
                        </button>
                      )}
                      {appt.status !== "completed" &&
                        appt.status !== "cancelled" &&
                        appt.status !== "rejected" && (
                          <>
                            <button
                              className="ghost-button"
                              onClick={() => void handleStatus(appt.id, "RESCHEDULED")}
                            >
                              Reschedule
                            </button>
                            <button
                              className="ghost-button danger"
                              onClick={() => void handleStatus(appt.id, "REJECTED")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ── Patient records tab ────────────────────────────────────────────── */}
      {tab === "patients" && (
        <>
          {/* Search bar */}
          <div className="panel">
            <label>
              Search patients by name, email, or matric number
              <input
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="e.g. Amaka, CSC/2021/001, student@uni.edu"
                autoComplete="off"
              />
            </label>

            {searchLoading && <p className="muted">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    className="search-result-row"
                    onClick={() => void loadPatientRecord(student.id)}
                  >
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                    {student.healthProfile?.matricNumber && (
                      <span className="muted">{student.healthProfile.matricNumber}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {patientError && <div className="form-error">{patientError}</div>}
          {patientLoading && <div className="loading-card"><p>Loading patient record...</p></div>}

          {selectedPatient && (
            <>
              {/* Profile summary */}
              <section className="panel">
                <h3>Patient profile</h3>
                <div className="info-grid">
                  <div><span className="label">Name</span><strong>{selectedPatient.profile.name}</strong></div>
                  <div><span className="label">Email</span><strong>{selectedPatient.profile.email}</strong></div>
                  <div>
                    <span className="label">Matric number</span>
                    <strong>{selectedPatient.profile.healthProfile?.matricNumber ?? "Not provided"}</strong>
                  </div>
                  <div>
                    <span className="label">Age range</span>
                    <strong>{selectedPatient.profile.healthProfile?.ageRange ?? "Not provided"}</strong>
                  </div>
                  <div>
                    <span className="label">Sex</span>
                    <strong>{selectedPatient.profile.healthProfile?.sex ?? "Not provided"}</strong>
                  </div>
                  <div>
                    <span className="label">Allergies</span>
                    <strong>{selectedPatient.profile.healthProfile?.allergies ?? "None recorded"}</strong>
                  </div>
                  <div>
                    <span className="label">Chronic conditions</span>
                    <strong>{selectedPatient.profile.healthProfile?.chronicConditions ?? "None recorded"}</strong>
                  </div>
                </div>
              </section>

              {/* Add clinical note */}
              <form className="panel" onSubmit={submitNote}>
                <h3>Add clinical note</h3>
                <div className="form-grid">
                  <label>
                    Note type
                    <select
                      value={noteForm.type}
                      onChange={(e) => setNoteForm((f) => ({ ...f, type: e.target.value }))}
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
                      onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Note
                    <textarea
                      value={noteForm.note}
                      onChange={(e) => setNoteForm((f) => ({ ...f, note: e.target.value }))}
                      required
                    />
                  </label>
                </div>
                {noteError && <div className="form-error">{noteError}</div>}
                {noteSuccess && <div className="form-success">{noteSuccess}</div>}
                <button className="primary-button" type="submit">Save Note</button>
              </form>

              {/* History grid */}
              <section className="two-column-grid">
                <article className="panel">
                  <h3>Assessments</h3>
                  {selectedPatient.assessments.length ? (
                    selectedPatient.assessments.map((a) => (
                      <div className="list-row stacked" key={a.id}>
                        <strong>{a.condition}</strong>
                        <span>{a.triageLevel}</span>
                        <p>{a.recommendation}</p>
                        <span className="muted">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No assessments yet.</p>
                  )}
                </article>

                <article className="panel">
                  <h3>Clinical notes</h3>
                  {selectedPatient.clinicalNotes.length ? (
                    selectedPatient.clinicalNotes.map((note) => (
                      <div className="list-row stacked" key={note.id}>
                        <strong>{note.title}</strong>
                        <span>{note.type} — Dr. {note.doctor.name}</span>
                        <p>{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No clinical notes yet.</p>
                  )}
                </article>
              </section>

              <section className="panel">
                <h3>Appointment history</h3>
                {selectedPatient.appointments.length ? (
                  selectedPatient.appointments.map((a) => (
                    <div className="list-row" key={a.id}>
                      <div>
                        <strong>{a.reason}</strong>
                        <span>{new Date(a.preferredDateTime).toLocaleString()}</span>
                      </div>
                      <StatusPill value={a.status} />
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No appointments yet.</p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
