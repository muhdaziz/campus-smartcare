import { analyzeSymptoms, preprocessSymptoms } from "../modules/ai/triage-engine";
import { assessmentRepository } from "../repositories/assessment.repository";
import { emergencyRepository } from "../repositories/emergency.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";

function getConfidenceBand(confidence: number) {
  if (confidence >= 0.75) {
    return "high";
  }

  if (confidence >= 0.45) {
    return "medium";
  }

  return "low";
}

function buildAssessmentAnalytics(
  previousAssessments: Awaited<ReturnType<typeof assessmentRepository.findRecentByStudent>>,
  condition: string,
  normalizedSymptoms: string[],
  triageLevel: "MILD" | "MODERATE" | "EMERGENCY"
) {
  const priorCount = previousAssessments.length;
  const priorEmergencyCount = previousAssessments.filter(
    (assessment) => assessment.triageLevel === "EMERGENCY"
  ).length;
  const repeatedConditionCount = previousAssessments.filter(
    (assessment) => assessment.condition === condition
  ).length;
  const recurringSymptoms = normalizedSymptoms.filter((symptom) =>
    previousAssessments.some((assessment) => assessment.normalizedSymptoms.includes(symptom))
  );

  return {
    previousAssessmentCount: priorCount,
    previousEmergencyCount: priorEmergencyCount,
    repeatedConditionCount,
    recurringSymptoms,
    trend:
      triageLevel === "EMERGENCY"
        ? "high-risk"
        : repeatedConditionCount >= 2
          ? "recurring-pattern"
          : priorCount === 0
            ? "new-case"
            : "stable-monitoring"
  };
}

function serializeAssessment(
  assessment: Awaited<ReturnType<typeof assessmentRepository.findById>>,
  analytics?: ReturnType<typeof buildAssessmentAnalytics>
) {
  if (!assessment) {
    throw new AppError(404, "Assessment not found");
  }

  return {
    id: assessment.id,
    studentId: assessment.studentId,
    submittedSymptoms: assessment.submittedSymptoms,
    normalizedSymptoms: assessment.normalizedSymptoms,
    contextNotes: assessment.contextNotes,
    triageLevel: assessment.triageLevel.toLowerCase(),
    confidence: assessment.confidence,
    confidenceBand: getConfidenceBand(assessment.confidence),
    condition: assessment.condition,
    matchedSignals: assessment.matchedSignals,
    explanation: assessment.explanation,
    recommendation: assessment.recommendation,
    engineVersion: assessment.engineVersion,
    emergencyFlag: assessment.emergencyFlag,
    createdAt: assessment.createdAt.toISOString(),
    analytics
  };
}

export const assessmentService = {
  async createAssessment(
    studentId: string,
    input: { symptoms: string[]; contextNotes?: string }
  ) {
    const previousAssessments = await assessmentRepository.findRecentByStudent(studentId);
    const normalizedSymptoms = preprocessSymptoms(input.symptoms);
    const engineResult = analyzeSymptoms(input.symptoms);
    const analytics = buildAssessmentAnalytics(
      previousAssessments,
      engineResult.condition,
      normalizedSymptoms,
      engineResult.triageLevel
    );

    const assessment = await assessmentRepository.create({
      studentId,
      submittedSymptoms: input.symptoms,
      normalizedSymptoms,
      contextNotes: input.contextNotes,
      triageLevel: engineResult.triageLevel,
      confidence: engineResult.confidence,
      condition: engineResult.condition,
      matchedSignals: engineResult.matchedSignals,
      explanation: engineResult.explanation,
      recommendation: engineResult.recommendation,
      engineVersion: engineResult.engineVersion,
      emergencyFlag: engineResult.emergencyFlag
    });

    if (engineResult.emergencyFlag) {
      await emergencyRepository.create({
        studentId,
        linkedAssessmentId: assessment.id,
        severity: "EMERGENCY",
        message: `Emergency triage generated automatically for ${engineResult.condition}.`
      });
    }

    await auditService.log({
      actorId: studentId,
      action: "assessment.created",
      entityType: "SymptomAssessment",
      entityId: assessment.id,
      metadata: {
        triageLevel: assessment.triageLevel,
        emergencyFlag: assessment.emergencyFlag,
        confidence: assessment.confidence,
        confidenceBand: engineResult.confidenceBand,
        analytics
      }
    });

    return serializeAssessment(assessment, analytics);
  },

  async getMyAssessments(studentId: string) {
    const assessments = await assessmentRepository.findManyByStudent(studentId);
    return assessments.map((assessment) => serializeAssessment(assessment));
  },

  async getAssessmentById(requester: { userId: string; role: "STUDENT" | "DOCTOR" | "ADMIN" }, id: string) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new AppError(404, "Assessment not found");
    }

    if (requester.role === "STUDENT" && assessment.studentId !== requester.userId) {
      throw new AppError(403, "You do not have access to this assessment");
    }

    return serializeAssessment(assessment);
  }
};
