import { useCallback } from "react";
import { OrderResponse } from "@kantinq/shared";
import { useLocalStorage } from "./useLocalStorage";

const ORDER_HISTORY_KEY = "kantinq_my_orders";
const MAX_SAVED_ORDERS = 50;

export function useOrderHistory() {
  const [myOrders, setMyOrders] = useLocalStorage<OrderResponse[]>(
    ORDER_HISTORY_KEY,
    []
  );

  const saveOrder = useCallback(
    (order: OrderResponse) => {
      setMyOrders((prev) => {
        const exists = prev.some((o) => o.Id === order.Id);
        if (exists) {
          return prev.map((o) => (o.Id === order.Id ? order : o));
        }
        const next = [order, ...prev];
        return next.slice(0, MAX_SAVED_ORDERS);
      });
    },
    [setMyOrders]
  );

  const clearHistory = useCallback(() => {
    setMyOrders([]);
  }, [setMyOrders]);

  return { myOrders, saveOrder, clearHistory };
}
