import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  healthProfile: z
    .object({
      matricNumber: z.string().min(2).optional(),
      ageRange: z.string().min(2).optional(),
      sex: z.enum(["FEMALE", "MALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
      allergies: z.string().optional(),
      chronicConditions: z.string().optional()
    })
    .optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
});
