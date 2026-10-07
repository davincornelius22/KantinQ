import { Router } from "express";
import { CanteenController } from "../controllers/CanteenController";
import { MenuController } from "../controllers/MenuController";
import { OrderController } from "../controllers/OrderController";
import { QueueController } from "../controllers/QueueController";
import { DashboardController } from "../controllers/DashboardController";

const router = Router();
const canteenController = new CanteenController();
const menuController = new MenuController();
const orderController = new OrderController();
const queueController = new QueueController();
const dashboardController = new DashboardController();

// Canteen CRUD
router.get("/", canteenController.getAll);
router.post("/", canteenController.create);
router.get("/:Id", canteenController.getById);
router.put("/:Id", canteenController.update);
router.delete("/:Id", canteenController.delete);

// Canteen-nested routes
router.get("/:CanteenId/qr", canteenController.getQr);

// Menu under Canteen
router.get("/:CanteenId/menu", menuController.getByCanteen);
router.post("/:CanteenId/menu", menuController.create);

// Orders under Canteen
router.post("/:CanteenId/orders", orderController.create);
router.get("/:CanteenId/orders", orderController.getActiveOrders);
router.get("/:CanteenId/order-history", orderController.getOrderHistory);

// Queue and Dashboard
router.get("/:CanteenId/queue", queueController.getQueue);
router.get("/:CanteenId/dashboard", dashboardController.getDashboard);

export default router;
