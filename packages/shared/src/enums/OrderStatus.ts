export enum OrderStatus {
  WAITING = "WAITING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.WAITING]: "Menunggu",
  [OrderStatus.PROCESSING]: "Diproses",
  [OrderStatus.READY]: "Siap Diambil",
  [OrderStatus.COMPLETED]: "Selesai",
  [OrderStatus.CANCELLED]: "Dibatalkan",
};

export const ValidTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.WAITING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};
