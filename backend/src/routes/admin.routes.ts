import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import { createStaffSchema } from "../schemas/admin.schema";
import { asyncHandler } from "../utils/async-handler";

export const adminRouter = Router();

adminRouter.get(
  "/users",
  authenticate,
  requireRole("ADMIN", "DOCTOR"),
  asyncHandler(adminController.listUsers)
);

adminRouter.post(
  "/users",
  authenticate,
  requireRole("ADMIN"),
  validateRequest({ body: createStaffSchema }),
  asyncHandler(adminController.createStaffAccount)
);

adminRouter.patch(
  "/users/:id/deactivate",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(adminController.deactivateUser)
);
