import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export function ProfilePage() {
  const { session, refreshUser } = useAuth();
  const user = session?.user;

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    matricNumber: user?.healthProfile?.matricNumber ?? "",
    ageRange: user?.healthProfile?.ageRange ?? "",
    sex: user?.healthProfile?.sex ?? "PREFER_NOT_TO_SAY",
    allergies: user?.healthProfile?.allergies ?? "",
    chronicConditions: user?.healthProfile?.chronicConditions ?? ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await api.updateProfile({
        name: profileForm.name,
        ...(user?.role === "STUDENT"
          ? {
              healthProfile: {
                matricNumber: profileForm.matricNumber || undefined,
                ageRange: profileForm.ageRange || undefined,
                sex: profileForm.sex as "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY",
                allergies: profileForm.allergies || undefined,
                chronicConditions: profileForm.chronicConditions || undefined
              }
            }
          : {})
      });
      await refreshUser();
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Account Settings</div>
          <h2>Your profile</h2>
          <p>Update your personal details and keep your account secure.</p>
        </div>
        <div className="profile-chip">
          <span>{user.role.toLowerCase()}</span>
          <strong>{user.email}</strong>
        </div>
      </section>

      {/* Profile form */}
      <form className="panel" onSubmit={handleProfileSave}>
        <h3>Personal details</h3>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          {user.role === "STUDENT" && (
            <>
              <label>
                Matric number
                <input
                  value={profileForm.matricNumber}
                  onChange={(e) => setProfileForm((f) => ({ ...f, matricNumber: e.target.value }))}
                  placeholder="Optional"
                />
              </label>

              <label>
                Age range
                <input
                  value={profileForm.ageRange}
                  onChange={(e) => setProfileForm((f) => ({ ...f, ageRange: e.target.value }))}
                  placeholder="e.g. 18-22"
                />
              </label>

              <label>
                Sex
                <select
                  value={profileForm.sex}
                  onChange={(e) => setProfileForm((f) => ({ ...f, sex: e.target.value }))}
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </label>

              <label>
                Allergies
                <textarea
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm((f) => ({ ...f, allergies: e.target.value }))}
                  placeholder="Optional"
                />
              </label>

              <label>
                Chronic conditions
                <textarea
                  value={profileForm.chronicConditions}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, chronicConditions: e.target.value }))
                  }
                  placeholder="Optional"
                />
              </label>
            </>
          )}
        </div>

        {profileError && <div className="form-error">{profileError}</div>}
        {profileSuccess && <div className="form-success">{profileSuccess}</div>}

        <button className="primary-button" type="submit" disabled={savingProfile}>
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Password form */}
      <form className="panel" onSubmit={handlePasswordChange}>
        <h3>Change password</h3>
        <div className="form-grid">
          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              required
            />
          </label>
        </div>

        {passwordError && <div className="form-error">{passwordError}</div>}
        {passwordSuccess && <div className="form-success">{passwordSuccess}</div>}

        <button className="primary-button" type="submit" disabled={savingPassword}>
          {savingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
