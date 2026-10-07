import { Request, Response } from "express";
import { CanteenService } from "../services/CanteenService";

export class CanteenController {
  constructor(private service = new CanteenService()) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const canteens = await this.service.getAll();
      res.json(canteens);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data kantin" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const canteen = await this.service.getById(id);
      if (!canteen) {
        res.status(404).json({ Message: "Kantin tidak ditemukan" });
        return;
      }

      res.json(canteen);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data kantin" });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Name, Location, Description, IsActive } = req.body;
      if (!Name || !Location) {
        res.status(400).json({ Message: "Nama dan lokasi kantin wajib diisi" });
        return;
      }

      const canteen = await this.service.create({
        Name,
        Location,
        Description,
        IsActive,
      });

      res.status(201).json(canteen);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal menambahkan kantin" });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const canteen = await this.service.update(id, req.body);
      if (!canteen) {
        res.status(404).json({ Message: "Kantin tidak ditemukan" });
        return;
      }

      res.json(canteen);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal memperbarui kantin" });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const success = await this.service.delete(id);
      if (!success) {
        res.status(404).json({ Message: "Kantin tidak ditemukan" });
        return;
      }

      res.json({ Message: "Kantin berhasil dihapus" });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal menghapus kantin" });
    }
  };

  getQr = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.CanteenId || req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const canteen = await this.service.getById(id);
      if (!canteen) {
        res.status(404).json({ Message: "Kantin tidak ditemukan" });
        return;
      }

      const webOrigin = (req.query.origin as string) || req.get("origin") || undefined;
      const qrData = await this.service.generateQrCode(id, webOrigin);
      res.json(qrData);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal membuat QR Code" });
    }
  };
}
