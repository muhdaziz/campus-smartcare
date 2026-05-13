import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/symptom-checker", label: "Symptom Checker" },
  { to: "/appointments", label: "Appointments" },
  { to: "/records", label: "Records" },
  { to: "/emergency", label: "Emergency" }
];

const doctorLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workspace", label: "My Workspace" },
  { to: "/appointments", label: "Full Queue" },
  { to: "/records", label: "Student Records" },
  { to: "/emergency", label: "Emergency Desk" }
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/appointments", label: "Appointment Queue" },
  { to: "/records", label: "Student Records" },
  { to: "/emergency", label: "Emergency Desk" },
  { to: "/staff", label: "Staff Admin" }
];

export function AppShell() {
  const { session, logout } = useAuth();

  const baseLinks =
    session?.user.role === "STUDENT"
      ? studentLinks
      : session?.user.role === "DOCTOR"
        ? doctorLinks
        : adminLinks;

  const links = [...baseLinks, { to: "/profile", label: "Profile" }];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">CS</div>
          <h1>Campus SmartCare</h1>
          <p>AI-assisted campus health coordination</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <strong>{session?.user.name}</strong>
          <span>{session?.user.role.toLowerCase()}</span>
          <button className="ghost-button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}
