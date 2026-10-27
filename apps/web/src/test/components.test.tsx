import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatusBadge, QueueConditionBadge } from "../components/Badge";
import { MenuList } from "../components/MenuList";
import { OrderStatus, QueueCondition, MenuItem } from "@kantinq/shared";

describe("Component Unit Tests", () => {
  describe("StatusBadge", () => {
    it("renders WAITING status label correctly", () => {
      render(<StatusBadge status={OrderStatus.WAITING} />);
      expect(screen.getByText("Menunggu")).toBeInTheDocument();
    });

    it("renders PROCESSING status label correctly", () => {
      render(<StatusBadge status={OrderStatus.PROCESSING} />);
      expect(screen.getByText("Diproses")).toBeInTheDocument();
    });

    it("renders READY status label correctly", () => {
      render(<StatusBadge status={OrderStatus.READY} />);
      expect(screen.getByText("Siap Diambil")).toBeInTheDocument();
    });

    it("renders COMPLETED status label correctly", () => {
      render(<StatusBadge status={OrderStatus.COMPLETED} />);
      expect(screen.getByText("Selesai")).toBeInTheDocument();
    });
  });

  describe("QueueConditionBadge", () => {
    it("renders SEPI condition", () => {
      render(<QueueConditionBadge condition={QueueCondition.SEPI} />);
      expect(screen.getByText("Antrean Sepi")).toBeInTheDocument();
    });

    it("renders SEDANG condition", () => {
      render(<QueueConditionBadge condition={QueueCondition.SEDANG} />);
      expect(screen.getByText("Antrean Sedang")).toBeInTheDocument();
    });

    it("renders RAMAI condition", () => {
      render(<QueueConditionBadge condition={QueueCondition.RAMAI} />);
      expect(screen.getByText("Antrean Ramai")).toBeInTheDocument();
    });
  });

  describe("MenuList", () => {
    const mockMenus: MenuItem[] = [
      {
        Id: 1,
        CanteenId: 1,
        Name: "Nasi Uduk Spesial",
        Description: "Harum dan gurih",
        Price: 15000,
        IsAvailable: true,
        CreatedAt: new Date().toISOString(),
      },
      {
        Id: 2,
        CanteenId: 1,
        Name: "Es Jeruk",
        Description: "Manis segar",
        Price: 5000,
        IsAvailable: false,
        CreatedAt: new Date().toISOString(),
      },
    ];

    it("renders menu items with name, price, and availability badge", () => {
      render(<MenuList menus={mockMenus} />);
      expect(screen.getByText("Nasi Uduk Spesial")).toBeInTheDocument();
      expect(screen.getByText("Tersedia")).toBeInTheDocument();
      expect(screen.getByText("Es Jeruk")).toBeInTheDocument();
      expect(screen.getByText("Habis")).toBeInTheDocument();
      expect(screen.getByText("Stok Habis")).toBeInTheDocument();
    });

    it("triggers onAddToCart when add button is clicked for available menu", () => {
      const handleAdd = vi.fn();
      render(<MenuList menus={mockMenus} onAddToCart={handleAdd} />);

      const addBtn = screen.getByRole("button", { name: /Pilih Nasi Uduk Spesial/i });
      fireEvent.click(addBtn);

      expect(handleAdd).toHaveBeenCalledTimes(1);
      expect(handleAdd).toHaveBeenCalledWith(mockMenus[0]);
    });

    it("renders empty state and reset button when menus array is empty", () => {
      const handleReset = vi.fn();
      render(<MenuList menus={[]} onResetSearch={handleReset} />);

      expect(screen.getByText("Tidak ada menu yang sesuai")).toBeInTheDocument();
      const resetBtn = screen.getByRole("button", { name: /Reset Pencarian & Filter/i });
      fireEvent.click(resetBtn);

      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });
});
