import { prisma } from "../lib/prisma";
import { memoryStore } from "../lib/memoryStore";
import {
  CreateOrderDto,
  Order,
  OrderItem,
  OrderResponse,
  OrderStatus,
  ValidTransitions,
} from "@kantinq/shared";

export class OrderService {
  private formatQueueNumber(sequence: number): string {
    return `A-${String(sequence).padStart(3, "0")}`;
  }

  private getTodayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  async create(canteenId: number, dto: CreateOrderDto): Promise<OrderResponse> {
    if (!dto.CustomerName || dto.CustomerName.trim().length === 0) {
      throw new Error("Nama pemesan tidak boleh kosong");
    }

    if (!dto.Items || dto.Items.length === 0) {
      throw new Error("Pesanan harus memiliki minimal satu item");
    }

    for (const item of dto.Items) {
      if (!item.Quantity || item.Quantity <= 0) {
        throw new Error("Jumlah pesanan tidak boleh nol atau negatif");
      }
    }

    try {
      const menuItemIds = dto.Items.map((i) => i.MenuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: {
          Id: { in: menuItemIds },
          CanteenId: canteenId,
        },
      });

      if (menuItems.length !== menuItemIds.length) {
        throw new Error("Satu atau lebih menu tidak ditemukan di kantin ini");
      }

      for (const item of dto.Items) {
        const found = menuItems.find((m) => m.Id === item.MenuItemId);
        if (!found) {
          throw new Error(`Menu dengan ID ${item.MenuItemId} tidak ditemukan`);
        }
        if (!found.IsAvailable) {
          throw new Error(`Menu "${found.Name}" sedang tidak tersedia`);
        }
      }

      const { start, end } = this.getTodayRange();
      const todayOrderCount = await prisma.order.count({
        where: {
          CanteenId: canteenId,
          CreatedAt: {
            gte: start,
            lte: end,
          },
        },
      });

      const queueNumber = this.formatQueueNumber(todayOrderCount + 1);

      let totalAmount = 0;
      const orderItemsData = dto.Items.map((item) => {
        const menu = menuItems.find((m) => m.Id === item.MenuItemId)!;
        const subtotal = menu.Price * item.Quantity;
        totalAmount += subtotal;
        return {
          MenuItemId: menu.Id,
          MenuItemName: menu.Name,
          Price: menu.Price,
          Quantity: item.Quantity,
          Subtotal: subtotal,
        };
      });

      const createdOrder = await prisma.order.create({
        data: {
          CanteenId: canteenId,
          QueueNumber: queueNumber,
          CustomerName: dto.CustomerName.trim(),
          TotalAmount: totalAmount,
          Status: OrderStatus.WAITING,
          OrderItems: {
            create: orderItemsData,
          },
        },
        include: {
          OrderItems: true,
        },
      });

      return createdOrder as OrderResponse;
    } catch (err: unknown) {
      const error = err as Error;
      if (
        error.message?.includes("tidak boleh") ||
        error.message?.includes("tidak tersedia") ||
        error.message?.includes("tidak ditemukan")
      ) {
        throw error;
      }

      // In-memory fallback
      const menuItemIds = dto.Items.map((i) => i.MenuItemId);
      const menuItems = memoryStore.menuItems.filter(
        (m) => menuItemIds.includes(m.Id) && m.CanteenId === canteenId
      );

      if (menuItems.length !== menuItemIds.length) {
        throw new Error("Satu atau lebih menu tidak ditemukan di kantin ini");
      }

      for (const item of dto.Items) {
        const found = menuItems.find((m) => m.Id === item.MenuItemId);
        if (!found) {
          throw new Error(`Menu dengan ID ${item.MenuItemId} tidak ditemukan`);
        }
        if (!found.IsAvailable) {
          throw new Error(`Menu "${found.Name}" sedang tidak tersedia`);
        }
      }

      const { start, end } = this.getTodayRange();
      const todayOrders = memoryStore.orders.filter(
        (o) =>
          o.CanteenId === canteenId &&
          new Date(o.CreatedAt) >= start &&
          new Date(o.CreatedAt) <= end
      );

      const queueNumber = this.formatQueueNumber(todayOrders.length + 1);

      let totalAmount = 0;
      const newOrderId = memoryStore.nextOrderId++;
      const createdItems: OrderItem[] = [];

      for (const item of dto.Items) {
        const menu = menuItems.find((m) => m.Id === item.MenuItemId)!;
        const subtotal = menu.Price * item.Quantity;
        totalAmount += subtotal;

        const orderItem: OrderItem = {
          Id: memoryStore.nextOrderItemId++,
          OrderId: newOrderId,
          MenuItemId: menu.Id,
          MenuItemName: menu.Name,
          Price: menu.Price,
          Quantity: item.Quantity,
          Subtotal: subtotal,
        };

        memoryStore.orderItems.push(orderItem);
        createdItems.push(orderItem);
      }

      const order: Order = {
        Id: newOrderId,
        CanteenId: canteenId,
        QueueNumber: queueNumber,
        CustomerName: dto.CustomerName.trim(),
        TotalAmount: totalAmount,
        Status: OrderStatus.WAITING,
        CreatedAt: new Date(),
        CompletedAt: null,
      };

      memoryStore.orders.push(order);

      return {
        ...order,
        OrderItems: createdItems,
      };
    }
  }

  async getById(id: number): Promise<OrderResponse | null> {
    try {
      const record = await prisma.order.findUnique({
        where: { Id: id },
        include: {
          OrderItems: true,
        },
      });
      return record as OrderResponse | null;
    } catch {
      const order = memoryStore.orders.find((o) => o.Id === id);
      if (!order) return null;
      const items = memoryStore.orderItems.filter((i) => i.OrderId === id);
      return {
        ...order,
        OrderItems: items,
      };
    }
  }

  async getActiveOrders(canteenId: number): Promise<OrderResponse[]> {
    const activeStatuses: OrderStatus[] = [
      OrderStatus.WAITING,
      OrderStatus.PROCESSING,
      OrderStatus.READY,
    ];

    try {
      const records = await prisma.order.findMany({
        where: {
          CanteenId: canteenId,
          Status: { in: activeStatuses },
        },
        include: {
          OrderItems: true,
        },
        orderBy: { Id: "asc" },
      });
      return records as OrderResponse[];
    } catch {
      return memoryStore.orders
        .filter(
          (o) =>
            o.CanteenId === canteenId && activeStatuses.includes(o.Status)
        )
        .map((o) => ({
          ...o,
          OrderItems: memoryStore.orderItems.filter((i) => i.OrderId === o.Id),
        }));
    }
  }

  async getOrderHistory(canteenId: number): Promise<OrderResponse[]> {
    const historyStatuses: OrderStatus[] = [
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ];

    try {
      const records = await prisma.order.findMany({
        where: {
          CanteenId: canteenId,
          Status: { in: historyStatuses },
        },
        include: {
          OrderItems: true,
        },
        orderBy: { Id: "desc" },
      });
      return records as OrderResponse[];
    } catch {
      return memoryStore.orders
        .filter(
          (o) =>
            o.CanteenId === canteenId && historyStatuses.includes(o.Status)
        )
        .map((o) => ({
          ...o,
          OrderItems: memoryStore.orderItems.filter((i) => i.OrderId === o.Id),
        }))
        .sort((a, b) => b.Id - a.Id);
    }
  }

  async updateStatus(id: number, nextStatus: OrderStatus): Promise<OrderResponse | null> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Pesanan dengan ID ${id} tidak ditemukan`);
    }

    const allowed = ValidTransitions[existing.Status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(
        `Perubahan status dari ${existing.Status} ke ${nextStatus} tidak diperbolehkan`
      );
    }

    const completedAt = nextStatus === OrderStatus.COMPLETED ? new Date() : null;

    try {
      const updated = await prisma.order.update({
        where: { Id: id },
        data: {
          Status: nextStatus,
          CompletedAt: completedAt,
        },
        include: {
          OrderItems: true,
        },
      });
      return updated as OrderResponse;
    } catch {
      const order = memoryStore.orders.find((o) => o.Id === id);
      if (!order) return null;

      order.Status = nextStatus;
      if (completedAt) {
        order.CompletedAt = completedAt;
      }

      return {
        ...order,
        OrderItems: memoryStore.orderItems.filter((i) => i.OrderId === id),
      };
    }
  }
}
