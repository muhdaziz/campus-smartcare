import bcrypt from "bcryptjs";
import { decryptSensitiveValue, encryptSensitiveValue } from "../utils/crypto";
import { AppError } from "../utils/app-error";
import { userRepository } from "../repositories/user.repository";
import { auditService } from "./audit.service";
import type { SafeUser } from "../types/auth";

export function toSafeUser(user: Awaited<ReturnType<typeof userRepository.findById>>): SafeUser {
  if (!user) throw new AppError(404, "User not found");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    healthProfile: user.healthProfile
      ? {
          matricNumber: user.healthProfile.matricNumber,
          ageRange: user.healthProfile.ageRange,
          sex: user.healthProfile.sex,
          allergies: decryptSensitiveValue(user.healthProfile.allergiesEncrypted),
          chronicConditions: decryptSensitiveValue(user.healthProfile.chronicConditionsEncrypted)
        }
      : null
  };
}

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    return toSafeUser(user);
  },

  async searchStudents(query: string) {
    const users = await userRepository.searchStudents(query);
    return users.map((u) => toSafeUser(u));
  },

  async updateProfile(
    userId: string,
    input: {
      name?: string;
      healthProfile?: {
        matricNumber?: string;
        ageRange?: string;
        sex?: "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
        allergies?: string;
        chronicConditions?: string;
      };
    }
  ) {
    const user = await userRepository.updateProfile(userId, {
      name: input.name,
      healthProfile: input.healthProfile
        ? {
            matricNumber: input.healthProfile.matricNumber,
            ageRange: input.healthProfile.ageRange,
            sex: input.healthProfile.sex,
            allergiesEncrypted: encryptSensitiveValue(input.healthProfile.allergies),
            chronicConditionsEncrypted: encryptSensitiveValue(input.healthProfile.chronicConditions)
          }
        : undefined
    });

    await auditService.log({
      actorId: userId,
      action: "user.profile_updated",
      entityType: "User",
      entityId: userId
    });

    return toSafeUser(user);
  },

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matches) throw new AppError(400, "Current password is incorrect");

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await userRepository.updateProfile(userId, { passwordHash });

    await auditService.log({
      actorId: userId,
      action: "user.password_changed",
      entityType: "User",
      entityId: userId
    });

    return { success: true };
  }
};
