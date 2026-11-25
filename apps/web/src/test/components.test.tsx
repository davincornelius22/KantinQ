import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatusBadge, QueueConditionBadge } from "../components/Badge";
import { MenuList } from "../components/MenuList";
import { CustomerOrderingPage } from "../pages/CustomerOrderingPage";
import { OrderStatus, QueueCondition, MenuItem, Canteen } from "@kantinq/shared";

const mockCanteen: Canteen = {
  Id: 1,
  Name: "Kantin Barokah",
  Location: "Gedung A Lt. 1",
  Description: "Aneka makanan dan minuman mahasiswa",
  IsActive: true,
  CreatedAt: new Date().toISOString(),
};

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

describe("Component Unit Tests", () => {
  describe("StatusBadge", () => {
    it.each([
      [OrderStatus.WAITING, "Menunggu"],
      [OrderStatus.PROCESSING, "Diproses"],
      [OrderStatus.READY, "Siap Diambil"],
      [OrderStatus.COMPLETED, "Selesai"],
      [OrderStatus.CANCELLED, "Dibatalkan"],
    ])("renders %s status label as %s", (status, label) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it.each(["sm", "md", "lg"] as const)("renders with size %s", (size) => {
      const { container } = render(
        <StatusBadge status={OrderStatus.WAITING} size={size} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("QueueConditionBadge", () => {
    it.each([
      [QueueCondition.SEPI, "Antrean Sepi"],
      [QueueCondition.SEDANG, "Antrean Sedang"],
      [QueueCondition.RAMAI, "Antrean Ramai"],
    ])("renders %s condition as %s", (condition, label) => {
      render(<QueueConditionBadge condition={condition} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it.each(["sm", "md", "lg"] as const)("renders with size %s", (size) => {
      const { container } = render(
        <QueueConditionBadge condition={QueueCondition.SEPI} size={size} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("MenuList", () => {
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

    it("renders quantity stepper when item is already in cart", () => {
      const handleUpdate = vi.fn();
      render(
        <MenuList
          menus={mockMenus}
          cartQuantities={{ 1: 3 }}
          onUpdateQuantity={handleUpdate}
        />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Tambah Nasi Uduk Spesial/i }));
      expect(handleUpdate).toHaveBeenCalledWith(1, 1);
    });

    it("calls onUpdateQuantity with -1 when minus button is clicked", () => {
      const handleUpdate = vi.fn();
      render(
        <MenuList
          menus={mockMenus}
          cartQuantities={{ 1: 2 }}
          onUpdateQuantity={handleUpdate}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Kurangi Nasi Uduk Spesial/i }));
      expect(handleUpdate).toHaveBeenCalledWith(1, -1);
    });

    it("disables Stok Habis button for unavailable items", () => {
      render(<MenuList menus={mockMenus} />);
      const disabledBtn = screen.getByRole("button", { name: "Stok Habis" });
      expect(disabledBtn).toBeDisabled();
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

  describe("CustomerOrderingPage", () => {
    const baseProps = {
      canteen: mockCanteen,
      menus: mockMenus,
      queueCondition: QueueCondition.SEPI,
      onOrderSuccess: vi.fn(),
      cart: [{ menu: mockMenus[0], quantity: 1 }],
      cartQuantities: { 1: 1 },
      totalAmount: 15000,
      totalItemsCount: 1,
      onAddToCart: vi.fn(),
      onUpdateQuantity: vi.fn(),
      onRemoveFromCart: vi.fn(),
      onClearCart: vi.fn(),
    };

    it("renders canteen name, location, and order note input", () => {
      render(<CustomerOrderingPage {...baseProps} />);
      expect(screen.getByText("Kantin Barokah")).toBeInTheDocument();
      expect(screen.getByText("Gedung A Lt. 1")).toBeInTheDocument();
      expect(screen.getByLabelText(/Catatan Pesanan/i)).toBeInTheDocument();
    });

    it("filters menus by search query", () => {
      render(<CustomerOrderingPage {...baseProps} cart={[]} cartQuantities={{}} />);
      const searchInput = screen.getByPlaceholderText("Cari makanan atau minuman...");
      fireEvent.change(searchInput, { target: { value: "Jeruk" } });
      expect(screen.getByText("Es Jeruk")).toBeInTheDocument();
      expect(screen.queryByText("Nasi Uduk Spesial")).not.toBeInTheDocument();
    });

    it.each([
      [/^Semua/i, "Nasi Uduk Spesial", true],
      [/^Makanan/i, "Nasi Uduk Spesial", true],
      [/^Minuman/i, "Es Jeruk", true],
      [/^Tersedia/i, "Es Jeruk", false],
    ])(
      "filters menus when category pill %s is clicked",
      (pillRegex, targetMenu, shouldBeVisible) => {
        render(<CustomerOrderingPage {...baseProps} cart={[]} cartQuantities={{}} />);
        fireEvent.click(screen.getByRole("button", { name: pillRegex }));
        if (shouldBeVisible) {
          expect(screen.getByText(targetMenu)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(targetMenu)).not.toBeInTheDocument();
        }
      }
    );

    it("shows validation error when order note exceeds 100 sanitized chars", () => {
      render(<CustomerOrderingPage {...baseProps} />);
      const noteInput = screen.getByLabelText(/Catatan Pesanan/i);
      fireEvent.change(noteInput, { target: { value: "A".repeat(101) } });
      expect(
        screen.getByText("Catatan pesanan maksimal 100 karakter")
      ).toBeInTheDocument();
    });

    it("updates sanitized character counter when HTML tags are entered in order note", () => {
      render(<CustomerOrderingPage {...baseProps} />);
      const noteInput = screen.getByLabelText(/Catatan Pesanan/i);
      fireEvent.change(noteInput, { target: { value: "<b>Pedas</b>" } });
      expect(screen.getByText("5/100")).toBeInTheDocument();
    });

    it("disables increment button in cart when item quantity reaches 20", () => {
      render(
        <CustomerOrderingPage
          {...baseProps}
          cart={[{ menu: mockMenus[0], quantity: 20 }]}
          cartQuantities={{ 1: 20 }}
          totalItemsCount={20}
          totalAmount={300000}
        />
      );
      const plusButtons = screen.getAllByRole("button", {
        name: /Tambah Nasi Uduk Spesial/i,
      });
      // The cart item increment button is disabled at 20
      const cartPlusBtn = plusButtons[plusButtons.length - 1];
      expect(cartPlusBtn).toBeDisabled();
    });

    it("shows customer name validation error on submit with empty name", () => {
      render(<CustomerOrderingPage {...baseProps} />);
      const submitBtn = screen.getByRole("button", { name: /Buat Pesanan/i });
      fireEvent.click(submitBtn);
      expect(screen.getByText("Nama pemesan wajib diisi")).toBeInTheDocument();
    });
  });
});
