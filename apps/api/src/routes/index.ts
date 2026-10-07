import { Router } from "express";
import canteenRoutes from "./canteenRoutes";
import menuRoutes from "./menuRoutes";
import orderRoutes from "./orderRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    Status: "OK",
    Message: "KantinQ API server berjalan dengan baik",
    Timestamp: new Date(),
  });
});

router.use("/canteens", canteenRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);

export default router;
