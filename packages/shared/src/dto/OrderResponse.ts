import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

export interface OrderResponse extends Order {
  OrderItems: OrderItem[];
}
