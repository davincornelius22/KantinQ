import { prisma } from "../lib/prisma";
import { memoryStore } from "../lib/memoryStore";
import {
  MenuItem,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from "@kantinq/shared";

export class MenuService {
  async getByCanteen(canteenId: number): Promise<MenuItem[]> {
    try {
      const records = await prisma.menuItem.findMany({
        where: { CanteenId: canteenId },
        orderBy: { Id: "asc" },
      });
      return records;
    } catch {
      return memoryStore.menuItems.filter((m) => m.CanteenId === canteenId);
    }
  }

  async getById(id: number): Promise<MenuItem | null> {
    try {
      const record = await prisma.menuItem.findUnique({
        where: { Id: id },
      });
      return record;
    } catch {
      return memoryStore.menuItems.find((m) => m.Id === id) || null;
    }
  }

  async create(canteenId: number, dto: CreateMenuItemDto): Promise<MenuItem> {
    try {
      const record = await prisma.menuItem.create({
        data: {
          CanteenId: canteenId,
          Name: dto.Name,
          Description: dto.Description ?? null,
          Price: Number(dto.Price),
          IsAvailable: dto.IsAvailable ?? true,
        },
      });
      return record;
    } catch {
      const newMenu: MenuItem = {
        Id: memoryStore.nextMenuItemId++,
        CanteenId: canteenId,
        Name: dto.Name,
        Description: dto.Description ?? null,
        Price: Number(dto.Price),
        IsAvailable: dto.IsAvailable ?? true,
        CreatedAt: new Date(),
      };
      memoryStore.menuItems.push(newMenu);
      return newMenu;
    }
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem | null> {
    try {
      const record = await prisma.menuItem.update({
        where: { Id: id },
        data: {
          ...(dto.Name !== undefined ? { Name: dto.Name } : {}),
          ...(dto.Description !== undefined ? { Description: dto.Description } : {}),
          ...(dto.Price !== undefined ? { Price: Number(dto.Price) } : {}),
          ...(dto.IsAvailable !== undefined ? { IsAvailable: dto.IsAvailable } : {}),
        },
      });
      return record;
    } catch {
      const index = memoryStore.menuItems.findIndex((m) => m.Id === id);
      if (index === -1) return null;
      memoryStore.menuItems[index] = {
        ...memoryStore.menuItems[index],
        ...dto,
        ...(dto.Price !== undefined ? { Price: Number(dto.Price) } : {}),
      };
      return memoryStore.menuItems[index];
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.menuItem.delete({
        where: { Id: id },
      });
      return true;
    } catch {
      const index = memoryStore.menuItems.findIndex((m) => m.Id === id);
      if (index === -1) return false;
      memoryStore.menuItems.splice(index, 1);
      return true;
    }
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<MenuItem | null> {
    return this.update(id, { IsAvailable: isAvailable });
  }
}
