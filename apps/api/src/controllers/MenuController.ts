import { Request, Response } from "express";
import { MenuService } from "../services/MenuService";

export class MenuController {
  constructor(private service = new MenuService()) {}

  getByCanteen = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const items = await this.service.getByCanteen(canteenId);
      res.json(items);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil data menu" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID menu tidak valid" });
        return;
      }

      const item = await this.service.getById(id);
      if (!item) {
        res.status(404).json({ Message: "Menu tidak ditemukan" });
        return;
      }

      res.json(item);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengambil detail menu" });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const canteenId = parseInt(req.params.CanteenId, 10);
      if (isNaN(canteenId)) {
        res.status(400).json({ Message: "ID kantin tidak valid" });
        return;
      }

      const { Name, Description, Price, IsAvailable } = req.body;
      if (!Name || Price === undefined) {
        res.status(400).json({ Message: "Nama dan harga menu wajib diisi" });
        return;
      }

      if (Number(Price) < 0) {
        res.status(400).json({ Message: "Harga menu tidak boleh negatif" });
        return;
      }

      const item = await this.service.create(canteenId, {
        Name,
        Description,
        Price: Number(Price),
        IsAvailable,
      });

      res.status(201).json(item);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal menambahkan menu" });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID menu tidak valid" });
        return;
      }

      const item = await this.service.update(id, req.body);
      if (!item) {
        res.status(404).json({ Message: "Menu tidak ditemukan" });
        return;
      }

      res.json(item);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal memperbarui menu" });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID menu tidak valid" });
        return;
      }

      const success = await this.service.delete(id);
      if (!success) {
        res.status(404).json({ Message: "Menu tidak ditemukan" });
        return;
      }

      res.json({ Message: "Menu berhasil dihapus" });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal menghapus menu" });
    }
  };

  updateAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.Id, 10);
      if (isNaN(id)) {
        res.status(400).json({ Message: "ID menu tidak valid" });
        return;
      }

      const { IsAvailable } = req.body;
      if (typeof IsAvailable !== "boolean") {
        res.status(400).json({ Message: "Field IsAvailable wajib bertipe boolean" });
        return;
      }

      const item = await this.service.updateAvailability(id, IsAvailable);
      if (!item) {
        res.status(404).json({ Message: "Menu tidak ditemukan" });
        return;
      }

      res.json(item);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ Message: error.message || "Gagal mengubah ketersediaan menu" });
    }
  };
}
