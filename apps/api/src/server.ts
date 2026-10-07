import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes from "./routes";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    Name: "KantinQ API",
    Version: "1.0.0",
    Status: "Running",
    Documentation: "Akses endpoint di /api",
  });
});

app.use("/api", apiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    Message: "Endpoint tidak ditemukan",
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    Message: "Terjadi kesalahan pada server",
    Error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`=========================================`);
  console.log(` KantinQ API Server aktif di port ${port}`);
  console.log(` Health check: http://localhost:${port}/api/health`);
  console.log(`=========================================`);
});
