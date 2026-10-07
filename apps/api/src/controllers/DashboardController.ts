import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
  constructor(private service = new DashboardService()) {}

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const dashboard = await this.service.getDashboard(canteenId);
      res.json(dashboard);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data dashboard" });
    }
  };
}
