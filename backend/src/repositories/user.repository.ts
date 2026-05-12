import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

const profileInclude = {
  healthProfile: true
} satisfies Prisma.UserInclude;

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: profileInclude });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: profileInclude });
  },

  findByRole(role?: Role) {
    return prisma.user.findMany({
      where: role ? { role, status: "ACTIVE" } : { status: "ACTIVE" },
      include: profileInclude,
      orderBy: { createdAt: "desc" }
    });
  },

  searchStudents(query: string) {
    return prisma.user.findMany({
      where: {
        role: "STUDENT",
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { healthProfile: { matricNumber: { contains: query, mode: "insensitive" } } }
        ]
      },
      include: profileInclude,
      take: 20,
      orderBy: { name: "asc" }
    });
  },

  createStudent(input: {
    name: string;
    email: string;
    passwordHash: string;
    healthProfile?: {
      matricNumber?: string;
      ageRange?: string;
      sex?: "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
      allergiesEncrypted?: string | null;
      chronicConditionsEncrypted?: string | null;
    };
  }) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: "STUDENT",
        healthProfile: input.healthProfile ? { create: input.healthProfile } : undefined
      },
      include: profileInclude
    });
  },

  createStaff(input: { name: string; email: string; passwordHash: string; role: Role }) {
    return prisma.user.create({ data: input, include: profileInclude });
  },

  updateProfile(
    id: string,
    data: {
      name?: string;
      passwordHash?: string;
      healthProfile?: {
        matricNumber?: string;
        ageRange?: string;
        sex?: "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
        allergiesEncrypted?: string | null;
        chronicConditionsEncrypted?: string | null;
      };
    }
  ) {
    const { healthProfile, ...userFields } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...userFields,
        ...(healthProfile
          ? { healthProfile: { upsert: { create: healthProfile, update: healthProfile } } }
          : {})
      },
      include: profileInclude
    });
  },

  updateStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    return prisma.user.update({ where: { id }, data: { status }, include: profileInclude });
  },

  findDoctorById(id: string) {
    return prisma.user.findFirst({ where: { id, role: "DOCTOR", status: "ACTIVE" } });
  },

  countByRole(role: Role) {
    return prisma.user.count({ where: { role } });
  }
};
