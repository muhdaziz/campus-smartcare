import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async summary(req: Request, res: Response) {
    const payload = await dashboardService.getSummary(
      req.user!.role as "DOCTOR" | "ADMIN" | "STUDENT",
      req.user!.sub
    );
    res.status(200).json(payload);
  }
};
