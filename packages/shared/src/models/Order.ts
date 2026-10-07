import { OrderStatus } from "../enums/OrderStatus";
import { OrderItem } from "./OrderItem";

export interface Order {
  Id: number;
  CanteenId: number;
  QueueNumber: string;
  CustomerName: string;
  TotalAmount: number;
  Status: OrderStatus;
  CreatedAt: string | Date;
  CompletedAt: string | Date | null;
  OrderItems?: OrderItem[];
}
