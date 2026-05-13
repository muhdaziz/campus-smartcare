import type { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async me(req: Request, res: Response) {
    const payload = await userService.getCurrentUser(req.user!.sub);
    res.status(200).json(payload);
  },

  async updateProfile(req: Request, res: Response) {
    const payload = await userService.updateProfile(req.user!.sub, req.body);
    res.status(200).json(payload);
  },

  async changePassword(req: Request, res: Response) {
    const payload = await userService.changePassword(req.user!.sub, req.body);
    res.status(200).json(payload);
  },

  async searchStudents(req: Request, res: Response) {
    const query = (req.query.q as string) ?? "";
    if (!query || query.trim().length < 2) {
      res.status(400).json({ message: "Search query must be at least 2 characters" });
      return;
    }
    const payload = await userService.searchStudents(query.trim());
    res.status(200).json(payload);
  }
};
