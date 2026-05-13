import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { userRepository } from "../repositories/user.repository";
import { auditService } from "./audit.service";
import { toSafeUser } from "./user.service";

export const adminService = {
  async createStaffAccount(
    actorId: string,
    input: { name: string; email: string; password: string; role: Role }
  ) {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(409, "A user with that email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.createStaff({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role
    });

    await auditService.log({
      actorId,
      action: "admin.user_created",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role }
    });

    return toSafeUser(user);
  },

  async listUsers(role?: string) {
    const validRoles: Role[] = ["STUDENT", "DOCTOR", "ADMIN"];
    const roleFilter = role && validRoles.includes(role as Role) ? (role as Role) : undefined;
    const users = await userRepository.findByRole(roleFilter);
    return users.map((user) => toSafeUser(user));
  },

  async deactivateUser(actorId: string, targetId: string) {
    if (actorId === targetId) {
      throw new AppError(400, "You cannot deactivate your own account");
    }

    const user = await userRepository.updateStatus(targetId, "INACTIVE");

    await auditService.log({
      actorId,
      action: "admin.user_deactivated",
      entityType: "User",
      entityId: targetId
    });

    return toSafeUser(user);
  }
};
