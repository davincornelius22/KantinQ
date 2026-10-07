import { Order } from "../models/Order";
import { QueueCondition } from "../enums/OrderStatus";

export interface DashboardResponse {
  TotalOrdersToday: number;
  WaitingOrders: number;
  ProcessingOrders: number;
  ReadyOrders: number;
  CompletedOrders: number;
  TotalRevenueToday: number;
  QueueCondition: QueueCondition;
  ActiveOrders: Order[];
}
