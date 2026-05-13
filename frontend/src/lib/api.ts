import type {
  Appointment,
  Assessment,
  DashboardSummary,
  EmergencyAlert,
  RecordBundle,
  Session,
  User
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const STORAGE_KEY = "campus-smartcare-session";

function getStoredSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function loadSession() {
  return getStoredSession();
}

export function saveSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function refreshSession() {
  const session = getStoredSession();
  if (!session?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });

  if (!response.ok) {
    saveSession(null);
    return null;
  }

  const refreshed = (await response.json()) as Session;
  saveSession(refreshed);
  return refreshed;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, init, false);
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  async registerStudent(payload: {
    name: string;
    email: string;
    password: string;
    healthProfile?: {
      matricNumber?: string;
      ageRange?: string;
      sex?: string;
      allergies?: string;
      chronicConditions?: string;
    };
  }) {
    return request<Session>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },

  async login(payload: { email: string; password: string }) {
    return request<Session>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  },

  async logout() {
    const session = getStoredSession();
    if (session?.refreshToken) {
      await request<{ success: boolean }>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken })
      }).catch(() => undefined);
    }
    saveSession(null);
  },

  async me() {
    return request<User>("/users/me");
  },

  async updateProfile(payload: {
    name?: string;
    healthProfile?: {
      matricNumber?: string;
      ageRange?: string;
      sex?: string;
      allergies?: string;
      chronicConditions?: string;
    };
  }) {
    return request<User>("/users/me", { method: "PATCH", body: JSON.stringify(payload) });
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return request<{ success: boolean }>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async createAssessment(payload: { symptoms: string[]; contextNotes?: string }) {
    return request<Assessment>("/assessments", { method: "POST", body: JSON.stringify(payload) });
  },

  async getMyAssessments() {
    return request<Assessment[]>("/assessments/me");
  },

  async createAppointment(payload: {
    preferredDateTime: string;
    reason: string;
    triageReferenceId?: string;
  }) {
    return request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(payload) });
  },

  async getMyAppointments() {
    return request<Appointment[]>("/appointments/me");
  },

  async getAppointmentQueue() {
    return request<Appointment[]>("/appointments");
  },

  async updateAppointmentStatus(id: string, payload: { status: string; clinicianResponse?: string }) {
    return request<Appointment>(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async assignAppointment(id: string, assignedDoctorId: string) {
    return request<Appointment>(`/appointments/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assignedDoctorId })
    });
  },

  async createEmergency(payload: {
    message: string;
    linkedAssessmentId?: string;
    severity?: string;
  }) {
    return request<EmergencyAlert>("/emergencies", { method: "POST", body: JSON.stringify(payload) });
  },

  async getEmergencies() {
    return request<EmergencyAlert[]>("/emergencies");
  },

  async acknowledgeEmergency(id: string) {
    return request<EmergencyAlert>(`/emergencies/${id}/acknowledge`, { method: "PATCH" });
  },

  async resolveEmergency(id: string) {
    return request<EmergencyAlert>(`/emergencies/${id}/resolve`, { method: "PATCH" });
  },

  async getMyRecords() {
    return request<RecordBundle>("/records/me");
  },

  async getStudentRecords(studentId: string) {
    return request<RecordBundle>(`/records/${studentId}`);
  },

  async createRecordEntry(studentId: string, payload: { type: string; title: string; note: string }) {
    return request(`/records/${studentId}/entries`, { method: "POST", body: JSON.stringify(payload) });
  },

  async getDashboardSummary() {
    return request<DashboardSummary>("/dashboard/summary");
  },

  async listUsers(role?: string) {
    const query = role ? `?role=${role}` : "";
    return request<User[]>(`/admin/users${query}`);
  },

  async createStaffAccount(payload: { name: string; email: string; password: string; role: string }) {
    return request<User>("/admin/users", { method: "POST", body: JSON.stringify(payload) });
  },

  async searchStudents(query: string) {
    return request<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async deactivateUser(id: string) {
    return request<User>(`/admin/users/${id}/deactivate`, { method: "PATCH" });
  }
};
