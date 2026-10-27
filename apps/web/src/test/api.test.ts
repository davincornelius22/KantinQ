import { describe, it, expect, beforeEach } from "vitest";
import { ApiClient } from "../services/api";
import { OrderStatus, QueueCondition } from "@kantinq/shared";

describe("ApiClient & Persistence Flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should return fallback canteen data when backend is offline", async () => {
    const canteen = await ApiClient.getCanteenById(1);
    expect(canteen).toBeDefined();
    expect(canteen.Id).toBe(1);
    expect(canteen.Name).toContain("Kantin");
  });

  it("should fetch initial fallback menu list", async () => {
    const menus = await ApiClient.getMenu(1);
    expect(Array.isArray(menus)).toBe(true);
    expect(menus.length).toBeGreaterThan(0);
    expect(menus[0].Name).toBeDefined();
    expect(menus[0].Price).toBeGreaterThan(0);
  });

  it("should create order and generate automated sequential queue number", async () => {
    const order = await ApiClient.createOrder(1, {
      CustomerName: "Davin",
      Items: [
        { MenuItemId: 1, Quantity: 2 },
        { MenuItemId: 5, Quantity: 1 },
      ],
    });

    expect(order).toBeDefined();
    expect(order.CustomerName).toBe("Davin");
    expect(order.QueueNumber).toMatch(/^A-\d{3}$/);
    expect(order.Status).toBe(OrderStatus.WAITING);
    expect(order.TotalAmount).toBeGreaterThan(0);
    expect(order.OrderItems.length).toBe(2);

    const retrieved = await ApiClient.getOrderById(order.Id);
    expect(retrieved.Id).toBe(order.Id);
    expect(retrieved.CustomerName).toBe("Davin");
  });

  it("should transition order status from WAITING to PROCESSING and READY", async () => {
    const order = await ApiClient.createOrder(1, {
      CustomerName: "Test Status",
      Items: [{ MenuItemId: 1, Quantity: 1 }],
    });

    const updatedProcessing = await ApiClient.updateOrderStatus(
      order.Id,
      OrderStatus.PROCESSING
    );
    expect(updatedProcessing.Status).toBe(OrderStatus.PROCESSING);

    const updatedReady = await ApiClient.updateOrderStatus(
      order.Id,
      OrderStatus.READY
    );
    expect(updatedReady.Status).toBe(OrderStatus.READY);

    const updatedCompleted = await ApiClient.updateOrderStatus(
      order.Id,
      OrderStatus.COMPLETED
    );
    expect(updatedCompleted.Status).toBe(OrderStatus.COMPLETED);
    expect(updatedCompleted.CompletedAt).toBeDefined();
  });

  it("should compute queue monitor conditions properly", async () => {
    const queue = await ApiClient.getQueue(1);
    expect(queue.CanteenId).toBe(1);
    expect([QueueCondition.SEPI, QueueCondition.SEDANG, QueueCondition.RAMAI]).toContain(
      queue.Condition
    );
    expect(typeof queue.ActiveCount).toBe("number");
  });

  it("should calculate seller dashboard metrics", async () => {
    const dashboard = await ApiClient.getDashboard(1);
    expect(dashboard).toBeDefined();
    expect(dashboard.TotalOrdersToday).toBeGreaterThanOrEqual(0);
    expect(typeof dashboard.TotalRevenueToday).toBe("number");
  });
});
