import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderHistory } from "../hooks/useOrderHistory";
import { OrderResponse, OrderStatus } from "@kantinq/shared";

const sampleOrder1: OrderResponse = {
  Id: 1,
  CanteenId: 1,
  QueueNumber: "A-001",
  CustomerName: "Budi",
  TotalAmount: 18000,
  Status: OrderStatus.WAITING,
  CreatedAt: new Date().toISOString(),
  CompletedAt: null,
  OrderItems: [],
};

const sampleOrder2: OrderResponse = {
  Id: 2,
  CanteenId: 1,
  QueueNumber: "A-002",
  CustomerName: "Siti",
  TotalAmount: 22000,
  Status: OrderStatus.PROCESSING,
  CreatedAt: new Date().toISOString(),
  CompletedAt: null,
  OrderItems: [],
};

describe("useOrderHistory Hook", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with an empty history", () => {
    const { result } = renderHook(() => useOrderHistory());
    expect(result.current.myOrders).toEqual([]);
  });

  it("should save a new order to history", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(sampleOrder1);
    });

    expect(result.current.myOrders.length).toBe(1);
    expect(result.current.myOrders[0].QueueNumber).toBe("A-001");
  });

  it("should update existing order in history if ID already exists", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(sampleOrder1);
    });

    const updatedOrder = {
      ...sampleOrder1,
      Status: OrderStatus.READY,
    };

    act(() => {
      result.current.saveOrder(updatedOrder);
    });

    expect(result.current.myOrders.length).toBe(1);
    expect(result.current.myOrders[0].Status).toBe(OrderStatus.READY);
  });

  it("should support bulk updateOrders", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.updateOrders([sampleOrder1, sampleOrder2]);
    });

    expect(result.current.myOrders.length).toBe(2);
    expect(result.current.myOrders[0].Id).toBe(1);
    expect(result.current.myOrders[1].Id).toBe(2);
  });

  it("should clear order history", () => {
    const { result } = renderHook(() => useOrderHistory());

    act(() => {
      result.current.saveOrder(sampleOrder1);
      result.current.saveOrder(sampleOrder2);
      result.current.clearHistory();
    });

    expect(result.current.myOrders.length).toBe(0);
  });
});
