import { OrderStatus } from "../enums/OrderStatus";

export interface OrderItemInputDto {
  MenuItemId: number;
  Quantity: number;
}

export interface CreateOrderDto {
  CustomerName: string;
  Items: OrderItemInputDto[];
}

export interface UpdateOrderStatusDto {
  Status: OrderStatus;
}
