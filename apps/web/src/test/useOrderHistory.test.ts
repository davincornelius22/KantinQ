import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderHistory } from "../hooks/useOrderHistory";
import { OrderResponse, OrderStatus } from "@kantinq/shared";

const makeOrder = (id: number, status: OrderStatus = OrderStatus.WAITING): OrderResponse => ({
  Id: id,
  CanteenId: 1,
  QueueNumber: `A-${String(id).padStart(3, "0")}`,
  CustomerName: `Pelanggan ${id}`,
  TotalAmount: 18000,
  Status: status,
  CreatedAt: new Date().toISOString(),
  CompletedAt: status === OrderStatus.COMPLETED ? new Date().toISOString() : null,
  OrderItems: [],
});

describe("useOrderHistory Hook", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with an empty history", () => {
    const { result } = renderHook(() => useOrderHistory());
    expect(result.current.myOrders).toEqual([]);
  });

  it("should hydrate existing order history from localStorage", () => {
    window.localStorage.setItem(
      "kantinq_my_orders",
      JSON.stringify([makeOrder(10)])
    );
    const { result } = renderHook(() => useOrderHistory());
    expect(result.current.myOrders.length).toBe(1);
    expect(result.current.myOrders[0].Id).toBe(10);
  });

  it("should save a new order to history", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(makeOrder(1));
    });

    expect(result.current.myOrders.length).toBe(1);
    expect(result.current.myOrders[0].QueueNumber).toBe("A-001");
  });

  it("should prepend newer orders to the front of history", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(makeOrder(1));
    });
    act(() => {
      result.current.saveOrder(makeOrder(2));
    });

    expect(result.current.myOrders.length).toBe(2);
    expect(result.current.myOrders[0].Id).toBe(2);
    expect(result.current.myOrders[1].Id).toBe(1);
  });

  it("should persist distinct orders with unique IDs", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(makeOrder(1));
      result.current.saveOrder(makeOrder(2));
      result.current.saveOrder(makeOrder(3));
    });

    expect(result.current.myOrders.map((o) => o.Id)).toEqual([3, 2, 1]);
  });

  it.each([
    [OrderStatus.WAITING],
    [OrderStatus.PROCESSING],
    [OrderStatus.READY],
    [OrderStatus.COMPLETED],
    [OrderStatus.CANCELLED],
  ])("should update existing order in history to status %s", (nextStatus) => {
    const { result } = renderHook(() => useOrderHistory());
    const initial = makeOrder(1, OrderStatus.WAITING);

    act(() => {
      result.current.saveOrder(initial);
    });
    act(() => {
      result.current.saveOrder({ ...initial, Status: nextStatus });
    });

    expect(result.current.myOrders.length).toBe(1);
    expect(result.current.myOrders[0].Status).toBe(nextStatus);
  });

  describe("MAX_SAVED_ORDERS (50) cap", () => {
    it("should cap saved orders at 50 when saving sequentially", () => {
      const { result } = renderHook(() => useOrderHistory());

      act(() => {
        for (let i = 1; i <= 55; i++) {
          result.current.saveOrder(makeOrder(i));
        }
      });

      expect(result.current.myOrders.length).toBe(50);
      expect(result.current.myOrders[0].Id).toBe(55);
    });

    it("should keep all 50 orders when exactly 50 are saved", () => {
      const { result } = renderHook(() => useOrderHistory());

      act(() => {
        for (let i = 1; i <= 50; i++) {
          result.current.saveOrder(makeOrder(i));
        }
      });

      expect(result.current.myOrders.length).toBe(50);
    });

    it("should slice updateOrders to 50 when given more than 50 orders", () => {
      const { result } = renderHook(() => useOrderHistory());
      const orders = Array.from({ length: 60 }, (_, idx) => makeOrder(idx + 1));

      act(() => {
        result.current.updateOrders(orders);
      });

      expect(result.current.myOrders.length).toBe(50);
      expect(result.current.myOrders[0].Id).toBe(1);
      expect(result.current.myOrders[49].Id).toBe(50);
    });
  });

  describe("updateOrders bulk sizes", () => {
    it.each([0, 1, 5, 25])("should replace history with %i orders", (count) => {
      const { result } = renderHook(() => useOrderHistory());
      const orders = Array.from({ length: count }, (_, idx) => makeOrder(idx + 1));

      act(() => {
        result.current.updateOrders(orders);
      });

      expect(result.current.myOrders.length).toBe(count);
    });
  });

  describe("clearHistory & persistence", () => {
    it("should clear order history", () => {
      const { result } = renderHook(() => useOrderHistory());

      act(() => {
        result.current.saveOrder(makeOrder(1));
        result.current.saveOrder(makeOrder(2));
        result.current.clearHistory();
      });

      expect(result.current.myOrders.length).toBe(0);
    });

    it("should clear localStorage entry when clearHistory is called", () => {
      const { result } = renderHook(() => useOrderHistory());

      act(() => {
        result.current.saveOrder(makeOrder(1));
      });
      act(() => {
        result.current.clearHistory();
      });

      expect(window.localStorage.getItem("kantinq_my_orders")).toBe("[]");
    });

    it("should persist saved orders to localStorage", () => {
      const { result } = renderHook(() => useOrderHistory());

      act(() => {
        result.current.saveOrder(makeOrder(7));
      });

      const raw = window.localStorage.getItem("kantinq_my_orders");
      expect(raw).toContain("A-007");
    });

    it("should retain order history across hook re-mounts", () => {
      const { result: first, unmount } = renderHook(() => useOrderHistory());

      act(() => {
        first.current.saveOrder(makeOrder(99));
      });
      unmount();

      const { result: second } = renderHook(() => useOrderHistory());
      expect(second.current.myOrders.length).toBe(1);
      expect(second.current.myOrders[0].Id).toBe(99);
    });
  });
});
