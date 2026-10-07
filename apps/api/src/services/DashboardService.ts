import { prisma } from "../lib/prisma";
import { memoryStore } from "../lib/memoryStore";
import { OrderService } from "./OrderService";
import {
  DashboardResponse,
  getQueueCondition,
  OrderStatus,
} from "@kantinq/shared";

export class DashboardService {
  constructor(private orderService = new OrderService()) {}

  private getTodayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  async getDashboard(canteenId: number): Promise<DashboardResponse> {
    const { start, end } = this.getTodayRange();
    const activeOrders = await this.orderService.getActiveOrders(canteenId);

    const activeCount = activeOrders.length;
    const condition = getQueueCondition(activeCount);

    const waitingOrders = activeOrders.filter(
      (o) => o.Status === OrderStatus.WAITING
    ).length;
    const processingOrders = activeOrders.filter(
      (o) => o.Status === OrderStatus.PROCESSING
    ).length;
    const readyOrders = activeOrders.filter(
      (o) => o.Status === OrderStatus.READY
    ).length;

    try {
      const todayOrders = await prisma.order.findMany({
        where: {
          CanteenId: canteenId,
          CreatedAt: {
            gte: start,
            lte: end,
          },
        },
      });

      const totalOrdersToday = todayOrders.length;
      const completedOrdersToday = todayOrders.filter(
        (o) => o.Status === OrderStatus.COMPLETED
      );
      const completedOrders = completedOrdersToday.length;

      const totalRevenueToday = completedOrdersToday.reduce(
        (sum, o) => sum + o.TotalAmount,
        0
      );

      return {
        TotalOrdersToday: totalOrdersToday,
        WaitingOrders: waitingOrders,
        ProcessingOrders: processingOrders,
        ReadyOrders: readyOrders,
        CompletedOrders: completedOrders,
        TotalRevenueToday: totalRevenueToday,
        QueueCondition: condition,
        ActiveOrders: activeOrders,
      };
    } catch {
      const todayOrders = memoryStore.orders.filter(
        (o) =>
          o.CanteenId === canteenId &&
          new Date(o.CreatedAt) >= start &&
          new Date(o.CreatedAt) <= end
      );

      const totalOrdersToday = todayOrders.length;
      const completedOrdersToday = todayOrders.filter(
        (o) => o.Status === OrderStatus.COMPLETED
      );
      const completedOrders = completedOrdersToday.length;
      const totalRevenueToday = completedOrdersToday.reduce(
        (sum, o) => sum + o.TotalAmount,
        0
      );

      return {
        TotalOrdersToday: totalOrdersToday,
        WaitingOrders: waitingOrders,
        ProcessingOrders: processingOrders,
        ReadyOrders: readyOrders,
        CompletedOrders: completedOrders,
        TotalRevenueToday: totalRevenueToday,
        QueueCondition: condition,
        ActiveOrders: activeOrders,
      };
    }
  }
}
