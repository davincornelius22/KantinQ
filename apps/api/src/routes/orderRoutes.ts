import { Router } from "express";
import { OrderController } from "../controllers/OrderController";

const router = Router();
const orderController = new OrderController();

router.get("/:Id", orderController.getById);
router.put("/:Id/status", orderController.updateStatus);

export default router;
