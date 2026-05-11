import { appointmentRepository } from "../repositories/appointment.repository";
import { assessmentRepository } from "../repositories/assessment.repository";
import { emergencyRepository } from "../repositories/emergency.repository";
import { userRepository } from "../repositories/user.repository";

export const dashboardService = {
  async getSummary(role: "DOCTOR" | "ADMIN" | "STUDENT", userId: string) {
    if (role === "STUDENT") {
      const [assessments, appointments, alerts] = await Promise.all([
        assessmentRepository.findManyByStudent(userId),
        appointmentRepository.findMine(userId),
        emergencyRepository.findForUser("STUDENT", userId)
      ]);

      const lastAssessment = assessments[0] ?? null;
      const pendingAppointments = appointments.filter((a) => a.status === "PENDING").length;
      const activeAlerts = alerts.filter(
        (a) => a.status === "ACTIVE" || a.status === "ACKNOWLEDGED"
      ).length;

      return {
        role: "STUDENT" as const,
        metrics: {
          totalAssessments: assessments.length,
          pendingAppointments,
          activeAlerts,
          totalAppointments: appointments.length
        },
        lastAssessment: lastAssessment
          ? {
              condition: lastAssessment.condition,
              triageLevel: lastAssessment.triageLevel,
              recommendation: lastAssessment.recommendation,
              createdAt: lastAssessment.createdAt.toISOString()
            }
          : null,
        recentAppointments: appointments.slice(0, 5).map((a) => ({
          id: a.id,
          reason: a.reason,
          status: a.status.toLowerCase(),
          preferredDateTime: a.preferredDateTime.toISOString(),
          assignedDoctor: a.assignedDoctor?.name ?? null
        }))
      };
    }

    const [
      activeEmergencies,
      pendingAppointments,
      recentAssessments,
      recentAppointments,
      recentEmergencies
    ] = await Promise.all([
      emergencyRepository.countActive(),
      appointmentRepository.countByStatus("PENDING"),
      assessmentRepository.countRecent(24),
      appointmentRepository.findRecent(5),
      emergencyRepository.findRecent(5)
    ]);

    if (role === "ADMIN") {
      const [studentCount, doctorCount, adminCount] = await Promise.all([
        userRepository.countByRole("STUDENT"),
        userRepository.countByRole("DOCTOR"),
        userRepository.countByRole("ADMIN")
      ]);

      return {
        role: "ADMIN" as const,
        metrics: {
          students: studentCount,
          doctors: doctorCount,
          admins: adminCount,
          activeEmergencies,
          pendingAppointments,
          assessmentsInLast24Hours: recentAssessments
        },
        recentAppointments: recentAppointments.map((a) => ({
          id: a.id,
          studentName: a.student.name,
          status: a.status.toLowerCase(),
          preferredDateTime: a.preferredDateTime.toISOString()
        })),
        recentEmergencies: recentEmergencies.map((a) => ({
          id: a.id,
          studentName: a.student.name,
          severity: a.severity.toLowerCase(),
          status: a.status.toLowerCase()
        }))
      };
    }

    const doctorAssignments = await appointmentRepository.countAssignedToDoctor(userId);

    return {
      role: "DOCTOR" as const,
      metrics: {
        activeEmergencies,
        pendingAppointments,
        doctorAssignments,
        assessmentsInLast24Hours: recentAssessments
      },
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        studentName: a.student.name,
        status: a.status.toLowerCase(),
        preferredDateTime: a.preferredDateTime.toISOString(),
        assignedDoctor: a.assignedDoctor?.name ?? null
      })),
      recentEmergencies: recentEmergencies.map((a) => ({
        id: a.id,
        studentName: a.student.name,
        severity: a.severity.toLowerCase(),
        status: a.status.toLowerCase()
      }))
    };
  }
};
