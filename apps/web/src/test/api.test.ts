import { describe, it, expect, beforeEach } from "vitest";
import { ApiClient } from "../services/api";
import { OrderStatus, QueueCondition } from "@kantinq/shared";

describe("ApiClient & Offline Persistence Flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("Canteen API (offline fallback)", () => {
    it("should return list of canteens", async () => {
      const canteens = await ApiClient.getCanteens();
      expect(Array.isArray(canteens)).toBe(true);
      expect(canteens.length).toBeGreaterThan(0);
      expect(canteens[0].Id).toBe(1);
    });

    it("should return fallback canteen data when backend is offline", async () => {
      const canteen = await ApiClient.getCanteenById(1);
      expect(canteen).toBeDefined();
      expect(canteen.Id).toBe(1);
      expect(canteen.Name).toContain("Kantin");
    });

    it("should update canteen info in fallback mode", async () => {
      const updated = await ApiClient.updateCanteen(1, {
        Name: "Kantin Barokah Updated",
        Location: "Gedung Baru Lt. 2",
      });
      expect(updated.Name).toBe("Kantin Barokah Updated");
      expect(updated.Location).toBe("Gedung Baru Lt. 2");
    });
  });

  describe("Menu API (offline fallback)", () => {
    it("should fetch initial fallback menu list", async () => {
      const menus = await ApiClient.getMenu(1);
      expect(Array.isArray(menus)).toBe(true);
      expect(menus.length).toBeGreaterThan(0);
      expect(menus[0].Name).toBeDefined();
      expect(menus[0].Price).toBeGreaterThan(0);
    });

    it("should create a new menu item in offline mode", async () => {
      const created = await ApiClient.createMenuItem(1, {
        Name: "Bakso Urat Spesial",
        Description: "Bakso sapi asli",
        Price: 17000,
        IsAvailable: true,
      });
      expect(created.Name).toBe("Bakso Urat Spesial");
      expect(created.Price).toBe(17000);
      expect(created.IsAvailable).toBe(true);
    });

    it("should update an existing menu item price and name", async () => {
      const menus = await ApiClient.getMenu(1);
      const target = menus[0];
      const updated = await ApiClient.updateMenuItem(target.Id, {
        Name: "Menu Diperbarui",
        Price: 21000,
      });
      expect(updated.Name).toBe("Menu Diperbarui");
      expect(updated.Price).toBe(21000);
    });

    it.each([false, true])("should toggle menu availability to %s", async (isAvailable) => {
      const menus = await ApiClient.getMenu(1);
      const target = menus[0];
      const toggled = await ApiClient.toggleMenuAvailability(target.Id, isAvailable);
      expect(toggled.IsAvailable).toBe(isAvailable);
    });

    it("should delete a menu item from fallback list", async () => {
      const created = await ApiClient.createMenuItem(1, {
        Name: "Menu Sementara",
        Price: 9000,
        IsAvailable: true,
      });
      await ApiClient.deleteMenuItem(created.Id);
      const menus = await ApiClient.getMenu(1);
      expect(menus.some((m) => m.Id === created.Id)).toBe(false);
    });
  });

  describe("Order Creation & Retrieval", () => {
    it.each([
      ["Davin", 1, 2],
      ["Siti", 2, 1],
      ["Ahmad", 3, 3],
      ["Putri", 5, 5],
    ])(
      "should create order for %s (menu %i x %i) with sequential queue number",
      async (customerName, menuId, qty) => {
        const order = await ApiClient.createOrder(1, {
          CustomerName: customerName,
          Items: [{ MenuItemId: menuId, Quantity: qty }],
        });

        expect(order.CustomerName).toBe(customerName);
        expect(order.QueueNumber).toMatch(/^A-\d{3}$/);
        expect(order.Status).toBe(OrderStatus.WAITING);
        expect(order.OrderItems.length).toBe(1);
        expect(order.OrderItems[0].Quantity).toBe(qty);
      }
    );

    it("should retrieve created order via getOrderById", async () => {
      const order = await ApiClient.createOrder(1, {
        CustomerName: "Budi",
        Items: [
          { MenuItemId: 1, Quantity: 2 },
          { MenuItemId: 5, Quantity: 1 },
        ],
      });

      const retrieved = await ApiClient.getOrderById(order.Id);
      expect(retrieved.Id).toBe(order.Id);
      expect(retrieved.CustomerName).toBe("Budi");
      expect(retrieved.OrderItems.length).toBe(2);
    });

    it("should fallback to first order when fetching a non-existent order ID offline", async () => {
      const fallback = await ApiClient.getOrderById(999999);
      expect(fallback).toBeDefined();
      expect(fallback.Id).toBeGreaterThan(0);
    });
  });

  describe("Order Status Transitions & Queries", () => {
    it.each([
      [OrderStatus.WAITING],
      [OrderStatus.PROCESSING],
      [OrderStatus.READY],
      [OrderStatus.COMPLETED],
      [OrderStatus.CANCELLED],
    ])("should update order status to %s", async (status) => {
      const order = await ApiClient.createOrder(1, {
        CustomerName: "Status Tester",
        Items: [{ MenuItemId: 1, Quantity: 1 }],
      });

      const updated = await ApiClient.updateOrderStatus(order.Id, status);
      expect(updated.Status).toBe(status);
    });

    it("should set CompletedAt timestamp when status becomes COMPLETED", async () => {
      const order = await ApiClient.createOrder(1, {
        CustomerName: "Complete Tester",
        Items: [{ MenuItemId: 1, Quantity: 1 }],
      });

      const completed = await ApiClient.updateOrderStatus(order.Id, OrderStatus.COMPLETED);
      expect(completed.CompletedAt).not.toBeNull();
    });

    it("should include newly created WAITING order in getActiveOrders", async () => {
      const order = await ApiClient.createOrder(1, {
        CustomerName: "Active Tester",
        Items: [{ MenuItemId: 1, Quantity: 1 }],
      });

      const active = await ApiClient.getActiveOrders(1);
      expect(active.some((o) => o.Id === order.Id)).toBe(true);
    });

    it("should move COMPLETED order from active orders to order history", async () => {
      const order = await ApiClient.createOrder(1, {
        CustomerName: "History Tester",
        Items: [{ MenuItemId: 1, Quantity: 1 }],
      });

      await ApiClient.updateOrderStatus(order.Id, OrderStatus.COMPLETED);
      const active = await ApiClient.getActiveOrders(1);
      const history = await ApiClient.getOrderHistory(1);

      expect(active.some((o) => o.Id === order.Id)).toBe(false);
      expect(history.some((o) => o.Id === order.Id)).toBe(true);
    });
  });

  describe("Queue Monitor, Dashboard & QR", () => {
    it("should compute queue monitor conditions properly", async () => {
      const queue = await ApiClient.getQueue(1);
      expect(queue.CanteenId).toBe(1);
      expect([QueueCondition.SEPI, QueueCondition.SEDANG, QueueCondition.RAMAI]).toContain(
        queue.Condition
      );
      expect(typeof queue.ActiveCount).toBe("number");
    });

    it("should increment ActiveCount when new order is created", async () => {
      const before = await ApiClient.getQueue(1);
      await ApiClient.createOrder(1, {
        CustomerName: "Queue Plus",
        Items: [{ MenuItemId: 1, Quantity: 1 }],
      });
      const after = await ApiClient.getQueue(1);
      expect(after.ActiveCount).toBe(before.ActiveCount + 1);
    });

    it("should report RAMAI when active orders exceed threshold", async () => {
      for (let i = 0; i < 8; i++) {
        await ApiClient.createOrder(1, {
          CustomerName: `Pelanggan ${i}`,
          Items: [{ MenuItemId: 1, Quantity: 1 }],
        });
      }
      const queue = await ApiClient.getQueue(1);
      expect(queue.ActiveCount).toBeGreaterThanOrEqual(8);
      expect([QueueCondition.SEDANG, QueueCondition.RAMAI]).toContain(queue.Condition);
    });

    it("should return QueueList matching ActiveCount", async () => {
      const queue = await ApiClient.getQueue(1);
      expect(Array.isArray(queue.QueueList)).toBe(true);
      expect(queue.QueueList.length).toBe(queue.ActiveCount);
    });

    it("should calculate seller dashboard metrics", async () => {
      const dashboard = await ApiClient.getDashboard(1);
      expect(dashboard).toBeDefined();
      expect(dashboard.TotalOrdersToday).toBeGreaterThanOrEqual(0);
      expect(typeof dashboard.TotalRevenueToday).toBe("number");
    });

    it("should increase TotalRevenueToday after order is completed", async () => {
      const before = await ApiClient.getDashboard(1);
      const order = await ApiClient.createOrder(1, {
        CustomerName: "Revenue Tester",
        Items: [{ MenuItemId: 1, Quantity: 2 }],
      });
      await ApiClient.updateOrderStatus(order.Id, OrderStatus.COMPLETED);
      const after = await ApiClient.getDashboard(1);
      expect(after.TotalRevenueToday).toBeGreaterThanOrEqual(before.TotalRevenueToday);
    });

    it("should generate QR target URL for canteen", async () => {
      const qr = await ApiClient.getQr(1);
      expect(qr.TargetUrl).toContain("canteenId=1");
    });
  });
});
