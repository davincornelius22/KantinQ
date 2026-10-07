import { Order } from "../models/Order";
import { QueueCondition } from "../enums/OrderStatus";

export interface QueueResponse {
  CanteenId: number;
  CanteenName: string;
  Condition: QueueCondition;
  ActiveCount: number;
  WaitingCount: number;
  ProcessingCount: number;
  ReadyCount: number;
  QueueList: Order[];
}
