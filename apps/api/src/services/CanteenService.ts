import QRCode from "qrcode";
import { prisma } from "../lib/prisma";
import { memoryStore } from "../lib/memoryStore";
import {
  Canteen,
  CreateCanteenDto,
  UpdateCanteenDto,
} from "@kantinq/shared";

export class CanteenService {
  async getAll(): Promise<Canteen[]> {
    try {
      const records = await prisma.canteen.findMany({
        orderBy: { Id: "asc" },
      });
      return records;
    } catch {
      return memoryStore.canteens;
    }
  }

  async getById(id: number): Promise<Canteen | null> {
    try {
      const record = await prisma.canteen.findUnique({
        where: { Id: id },
      });
      return record;
    } catch {
      return memoryStore.canteens.find((c) => c.Id === id) || null;
    }
  }

  async create(dto: CreateCanteenDto): Promise<Canteen> {
    try {
      const record = await prisma.canteen.create({
        data: {
          Name: dto.Name,
          Location: dto.Location,
          Description: dto.Description ?? null,
          IsActive: dto.IsActive ?? true,
        },
      });
      return record;
    } catch {
      const newCanteen: Canteen = {
        Id: memoryStore.nextCanteenId++,
        Name: dto.Name,
        Location: dto.Location,
        Description: dto.Description ?? null,
        IsActive: dto.IsActive ?? true,
        CreatedAt: new Date(),
      };
      memoryStore.canteens.push(newCanteen);
      return newCanteen;
    }
  }

  async update(id: number, dto: UpdateCanteenDto): Promise<Canteen | null> {
    try {
      const record = await prisma.canteen.update({
        where: { Id: id },
        data: {
          ...(dto.Name !== undefined ? { Name: dto.Name } : {}),
          ...(dto.Location !== undefined ? { Location: dto.Location } : {}),
          ...(dto.Description !== undefined ? { Description: dto.Description } : {}),
          ...(dto.IsActive !== undefined ? { IsActive: dto.IsActive } : {}),
        },
      });
      return record;
    } catch {
      const index = memoryStore.canteens.findIndex((c) => c.Id === id);
      if (index === -1) return null;
      memoryStore.canteens[index] = {
        ...memoryStore.canteens[index],
        ...dto,
      };
      return memoryStore.canteens[index];
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.canteen.delete({
        where: { Id: id },
      });
      return true;
    } catch {
      const index = memoryStore.canteens.findIndex((c) => c.Id === id);
      if (index === -1) return false;
      memoryStore.canteens.splice(index, 1);
      return true;
    }
  }

  async generateQrCode(id: number, webOrigin?: string): Promise<{ TargetUrl: string; QrCodeDataUrl: string }> {
    const origin = webOrigin || process.env.WEB_URL || "http://localhost:5173";
    const targetUrl = `${origin}?canteenId=${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });

    return {
      TargetUrl: targetUrl,
      QrCodeDataUrl: qrCodeDataUrl,
    };
  }
}
