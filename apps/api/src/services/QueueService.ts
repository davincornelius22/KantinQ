import { CanteenService } from "./CanteenService";
import { OrderService } from "./OrderService";
import {
  getQueueCondition,
  OrderStatus,
  QueueResponse,
} from "@kantinq/shared";

export class QueueService {
  constructor(
    private canteenService = new CanteenService(),
    private orderService = new OrderService()
  ) {}

  async getQueue(canteenId: number): Promise<QueueResponse> {
    const canteen = await this.canteenService.getById(canteenId);
    if (!canteen) {
      throw new Error(`Kantin dengan ID ${canteenId} tidak ditemukan`);
    }

    const activeOrders = await this.orderService.getActiveOrders(canteenId);

    const waitingCount = activeOrders.filter(
      (o) => o.Status === OrderStatus.WAITING
    ).length;
    const processingCount = activeOrders.filter(
      (o) => o.Status === OrderStatus.PROCESSING
    ).length;
    const readyCount = activeOrders.filter(
      (o) => o.Status === OrderStatus.READY
    ).length;

    const activeCount = activeOrders.length;
    const condition = getQueueCondition(activeCount);

    return {
      CanteenId: canteen.Id,
      CanteenName: canteen.Name,
      Condition: condition,
      ActiveCount: activeCount,
      WaitingCount: waitingCount,
      ProcessingCount: processingCount,
      ReadyCount: readyCount,
      QueueList: activeOrders,
    };
  }
}
