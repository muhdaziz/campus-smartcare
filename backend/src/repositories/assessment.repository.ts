import { prisma } from "../lib/prisma";

export const assessmentRepository = {
  create(input: {
    studentId: string;
    submittedSymptoms: string[];
    normalizedSymptoms: string[];
    contextNotes?: string;
    triageLevel: "MILD" | "MODERATE" | "EMERGENCY";
    confidence: number;
    condition: string;
    matchedSignals: string[];
    explanation: string;
    recommendation: string;
    engineVersion: string;
    emergencyFlag: boolean;
  }) {
    return prisma.symptomAssessment.create({
      data: input
    });
  },

  findManyByStudent(studentId: string) {
    return prisma.symptomAssessment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }
    });
  },

  findRecentByStudent(studentId: string, take = 10) {
    return prisma.symptomAssessment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take
    });
  },

  findById(id: string) {
    return prisma.symptomAssessment.findUnique({
      where: { id }
    });
  },

  countRecent(hours: number) {
    return prisma.symptomAssessment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      }
    });
  }
};
