import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import { updateProfileSchema, changePasswordSchema } from "../schemas/user.schema";
import { asyncHandler } from "../utils/async-handler";

export const userRouter = Router();

userRouter.get("/me", authenticate, asyncHandler(userController.me));

userRouter.patch(
  "/me",
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile)
);

userRouter.patch(
  "/me/password",
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(userController.changePassword)
);

userRouter.get(
  "/search",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  asyncHandler(userController.searchStudents)
);
