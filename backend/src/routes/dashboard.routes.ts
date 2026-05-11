import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  authenticate,
  asyncHandler(dashboardController.summary)
);
