export type Role = "STUDENT" | "DOCTOR" | "ADMIN";

export interface HealthProfile {
  matricNumber: string | null;
  ageRange: string | null;
  sex: string | null;
  allergies: string | null;
  chronicConditions: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  createdAt: string;
  healthProfile?: HealthProfile | null;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  submittedSymptoms: string[];
  normalizedSymptoms: string[];
  contextNotes?: string;
  triageLevel: string;
  confidence: number;
  confidenceBand: string;
  condition: string;
  matchedSignals: string[];
  explanation: string;
  recommendation: string;
  engineVersion: string;
  emergencyFlag: boolean;
  createdAt: string;
  analytics?: {
    previousAssessmentCount: number;
    previousEmergencyCount: number;
    repeatedConditionCount: number;
    recurringSymptoms: string[];
    trend: string;
  };
}

export interface Appointment {
  id: string;
  student: { id: string; name: string; email: string };
  assignedDoctor: { id: string; name: string; email: string } | null;
  preferredDateTime: string;
  reason: string;
  status: string;
  clinicianResponse?: string | null;
  triageReferenceId?: string | null;
  triageLevel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAlert {
  id: string;
  student: { id: string; name: string; email: string };
  linkedAssessmentId?: string | null;
  severity: string;
  status: string;
  message: string;
  acknowledgedBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface RecordBundle {
  profile: User;
  assessments: Array<{
    id: string;
    triageLevel: string;
    condition: string;
    createdAt: string;
    recommendation: string;
  }>;
  appointments: Array<{
    id: string;
    status: string;
    preferredDateTime: string;
    reason: string;
    assignedDoctor: string | null;
  }>;
  emergencies: Array<{
    id: string;
    severity: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
  clinicalNotes: Array<{
    id: string;
    doctor: { id: string; name: string; email: string };
    type: string;
    title: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface DashboardSummary {
  metrics: Record<string, number>;
  recentAppointments: Array<{
    id: string;
    studentName: string;
    status: string;
    preferredDateTime: string;
    assignedDoctor?: string | null;
  }>;
  recentEmergencies: Array<{
    id: string;
    studentName: string;
    severity: string;
    status: string;
  }>;
}
