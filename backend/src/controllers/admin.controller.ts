import type { Request, Response } from "express";
import { adminService } from "../services/admin.service";

export const adminController = {
  async createStaffAccount(req: Request, res: Response) {
    const payload = await adminService.createStaffAccount(req.user!.sub, req.body);
    res.status(201).json(payload);
  },

  async listUsers(req: Request, res: Response) {
    const role = req.query.role as string | undefined;
    const payload = await adminService.listUsers(role);
    res.status(200).json(payload);
  },

  async deactivateUser(req: Request, res: Response) {
    const payload = await adminService.deactivateUser(req.user!.sub, req.params.id as string);
    res.status(200).json(payload);
  }
};
