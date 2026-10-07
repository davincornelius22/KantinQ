import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { OrderStatus } from "@kantinq/shared";

export class OrderController {
  constructor(private service = new OrderService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const { CustomerName, Items } = req.body;
      const order = await this.service.create(canteenId, {
        CustomerName,
        Items,
      });

      res.status(201).json(order);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(400).json({ Message: error.message || "Gagal membuat pesanan" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID pesanan tidak valid" });
        return;
      }

      const order = await this.service.getById(id);
      if (!order) {
        res.status(404).json({ Message: "Pesanan tidak ditemukan" });
        return;
      }

      res.json(order);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data pesanan" });
    }
  };

  getActiveOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const orders = await this.service.getActiveOrders(canteenId);
      res.json(orders);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil pesanan aktif" });
    }
  };

  getOrderHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const history = await this.service.getOrderHistory(canteenId);
      res.json(history);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil riwayat pesanan" });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID pesanan tidak valid" });
        return;
      }

      const { Status } = req.body;
      if (!Status || !Object.values(OrderStatus).includes(Status)) {
        res.status(400).json({ Message: "Status pesanan tidak valid" });
        return;
      }

      const updated = await this.service.updateStatus(id, Status);
      if (!updated) {
        res.status(404).json({ Message: "Pesanan tidak ditemukan" });
        return;
      }

      res.json(updated);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(400).json({ Message: error.message || "Gagal mengubah status pesanan" });
    }
  };
}
