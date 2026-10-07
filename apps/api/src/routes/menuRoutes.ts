import { Router } from "express";
import { MenuController } from "../controllers/MenuController";

const router = Router();
const menuController = new MenuController();

router.get("/:Id", menuController.getById);
router.put("/:Id", menuController.update);
router.delete("/:Id", menuController.delete);
router.put("/:Id/availability", menuController.updateAvailability);

export default router;
