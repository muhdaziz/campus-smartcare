import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

export function StaffAdminPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DOCTOR"
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("DOCTOR");

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.listUsers(roleFilter);
      setUsers(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [roleFilter]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const user = await api.createStaffAccount(form);
      setSuccess(`${user.name} created successfully as ${user.role.toLowerCase()}.`);
      setForm({ name: "", email: "", password: "", role: "DOCTOR" });
      await loadUsers();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create staff");
    }
  }

  async function handleDeactivate(user: User) {
    if (!confirm(`Deactivate ${user.name}? They will no longer be able to log in.`)) {
      return;
    }

    try {
      await api.deactivateUser(user.id);
      await loadUsers();
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "Failed to deactivate user");
    }
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Administrative Control</div>
          <h2>Provision staff accounts</h2>
          <p>Create doctor and admin accounts securely without public self-registration.</p>
        </div>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        <h3>Create staff account</h3>
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
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <button className="primary-button" type="submit">
          Create Staff Account
        </button>
      </form>

      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>User accounts</h3>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="DOCTOR">Doctors</option>
            <option value="ADMIN">Admins</option>
            <option value="STUDENT">Students</option>
          </select>
        </div>

        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : users.length ? (
          users.map((user) => (
            <div className="list-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>ID: {user.id}</span>
              </div>
              <div className="action-cluster">
                <button
                  className="ghost-button danger"
                  onClick={() => void handleDeactivate(user)}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No {roleFilter.toLowerCase()} accounts found.</p>
        )}
      </section>
    </div>
  );
}
