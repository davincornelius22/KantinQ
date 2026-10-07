import { Request, Response } from "express";
import { QueueService } from "../services/QueueService";

export class QueueController {
  constructor(private service = new QueueService()) {}

  getQueue = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const queue = await this.service.getQueue(canteenId);
      res.json(queue);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data antrean" });
    }
  };
}
