import { describe, it, expect } from "vitest";
import {
  validateCustomerName,
  validateCartNotEmpty,
  validateCartAvailability,
  validateMenuPrice,
  validateMenuName,
  validateMenuDescription,
  sanitizeOrderNote,
  validateOrderNote,
  validateItemQuantity,
  MAX_ORDER_NOTE_LENGTH,
  MAX_ITEM_QUANTITY,
  formatRupiah,
  formatTime,
  formatDate,
} from "../utils/validation";

describe("Validation Utilities", () => {
  describe("validateCustomerName - valid cases", () => {
    it.each([
      ["Budi"],
      ["Al"],
      ["Siti Rahma (Meja 04)"],
      ["Davin - NIM 2024"],
      ["  Andi Pratama  "],
      ["Ahmad_Fauzi"],
      ["Putri-123"],
      ["Dr. Hendra"],
      ["Mahasiswa KantinQ"],
      ["A".repeat(50)],
    ])("should accept valid customer name: %s", (name) => {
      const res = validateCustomerName(name);
      expect(res.valid).toBe(true);
      expect(res.message).toBe("");
    });
  });

  describe("validateCustomerName - invalid cases", () => {
    it.each([
      ["", "Nama pemesan wajib diisi"],
      ["   ", "Nama pemesan wajib diisi"],
      ["\t\n", "Nama pemesan wajib diisi"],
      ["A", "Nama pemesan minimal 2 karakter"],
      ["X", "Nama pemesan minimal 2 karakter"],
      ["A".repeat(51), "Nama pemesan maksimal 50 karakter"],
      ["B".repeat(100), "Nama pemesan maksimal 50 karakter"],
      ["12345", "Nama pemesan harus mengandung huruf alfabet"],
      ["---", "Nama pemesan harus mengandung huruf alfabet"],
      ["!@#$%", "Nama pemesan harus mengandung huruf alfabet"],
    ])("should reject invalid customer name %j with %s", (name, expectedMsg) => {
      const res = validateCustomerName(name);
      expect(res.valid).toBe(false);
      expect(res.message).toBe(expectedMsg);
    });
  });

  describe("sanitizeOrderNote", () => {
    it.each([
      ["Tidak pedas", "Tidak pedas"],
      ["  Tanpa bawang  ", "Tanpa bawang"],
      ["<b>Pedas</b> sekali", "Pedas sekali"],
      ["<script>alert(1)</script>Tanpa kecap", "alert(1)Tanpa kecap"],
      ["<img src=x onerror=alert(1)>Kuah dipisah", "Kuah dipisah"],
      ["Es batu <br/> sedikit", "Es batu  sedikit"],
      ["<div><span>Sambal terpisah</span></div>", "Sambal terpisah"],
      ["<script></script>", ""],
      ["Normal <2 sendok", "Normal 2 sendok"],
      ["", ""],
    ])("should sanitize %j to %j", (input, expected) => {
      expect(sanitizeOrderNote(input)).toBe(expected);
    });
  });

  describe("validateOrderNote", () => {
    it.each([
      [undefined, true, ""],
      [null, true, ""],
      ["", true, ""],
      ["   ", true, ""],
      ["Tidak pedas, tanpa bawang", true, ""],
      ["<b>Pedas</b>", true, ""],
      ["A".repeat(MAX_ORDER_NOTE_LENGTH), true, ""],
      [`<b>${"A".repeat(MAX_ORDER_NOTE_LENGTH)}</b>`, true, ""],
      ["A".repeat(MAX_ORDER_NOTE_LENGTH + 1), false, "Catatan pesanan maksimal 100 karakter"],
      ["B".repeat(150), false, "Catatan pesanan maksimal 100 karakter"],
    ])("should validate order note %j -> valid=%s", (note, expectedValid, expectedMsg) => {
      const res = validateOrderNote(note);
      expect(res.valid).toBe(expectedValid);
      expect(res.message).toBe(expectedMsg);
    });
  });

  describe("validateItemQuantity", () => {
    it.each([
      [1, true, ""],
      [5, true, ""],
      [MAX_ITEM_QUANTITY, true, ""],
      [0, false, "Jumlah porsi minimal 1"],
      [-1, false, "Jumlah porsi minimal 1"],
      [1.5, false, "Jumlah porsi minimal 1"],
      [NaN, false, "Jumlah porsi minimal 1"],
      [MAX_ITEM_QUANTITY + 1, false, "Maksimal 20 porsi per menu"],
      [100, false, "Maksimal 20 porsi per menu"],
    ])("should validate item quantity %s -> valid=%s", (qty, expectedValid, expectedMsg) => {
      const res = validateItemQuantity(qty);
      expect(res.valid).toBe(expectedValid);
      expect(res.message).toBe(expectedMsg);
    });
  });

  describe("validateCartNotEmpty", () => {
    it.each([
      [0, false],
      [1, true],
      [5, true],
      [20, true],
    ])("should validate cart length %i -> valid=%s", (len, expectedValid) => {
      expect(validateCartNotEmpty(len).valid).toBe(expectedValid);
    });
  });

  describe("validateCartAvailability", () => {
    it("should pass when all items are available", () => {
      const cart = [
        { menu: { Name: "Nasi Goreng", IsAvailable: true }, quantity: 1 },
        { menu: { Name: "Es Teh", IsAvailable: true }, quantity: 2 },
      ];
      expect(validateCartAvailability(cart).valid).toBe(true);
    });

    it("should fail when first item in cart is unavailable", () => {
      const cart = [
        { menu: { Name: "Soto Ayam", IsAvailable: false }, quantity: 1 },
        { menu: { Name: "Es Teh", IsAvailable: true }, quantity: 1 },
      ];
      const res = validateCartAvailability(cart);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('Menu "Soto Ayam" sedang habis stok');
    });

    it("should fail when second item in cart is unavailable", () => {
      const cart = [
        { menu: { Name: "Nasi Goreng", IsAvailable: true }, quantity: 1 },
        { menu: { Name: "Ayam Geprek", IsAvailable: false }, quantity: 1 },
      ];
      const res = validateCartAvailability(cart);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('Menu "Ayam Geprek" sedang habis stok');
    });

    it("should pass for empty array", () => {
      expect(validateCartAvailability([]).valid).toBe(true);
    });
  });

  describe("validateMenuPrice", () => {
    it.each([
      [0, false],
      [-5000, false],
      [15000000, false],
      [15000, true],
    ])("should validate price %i -> valid=%s", (price, expectedValid) => {
      expect(validateMenuPrice(price).valid).toBe(expectedValid);
    });
  });

  describe("validateMenuName, validateMenuDescription & Formatters", () => {
    it("should validate menu names properly", () => {
      expect(validateMenuName("").valid).toBe(false);
      expect(validateMenuName("Mi").valid).toBe(false);
      expect(validateMenuName("Nasi ".repeat(25)).valid).toBe(false);
      expect(validateMenuName("Mie Goreng Spesial").valid).toBe(true);
    });

    it("should validate menu descriptions properly", () => {
      expect(validateMenuDescription("").valid).toBe(true);
      expect(validateMenuDescription(undefined).valid).toBe(true);
      expect(validateMenuDescription("   \t  ").valid).toBe(false);
      expect(validateMenuDescription("A".repeat(301)).valid).toBe(false);
      expect(validateMenuDescription("Nasi goreng lezat").valid).toBe(true);
    });

    it("should format rupiah properly", () => {
      const formatted = formatRupiah(15000);
      expect(formatted).toContain("15.000");
      expect(formatted).toContain("Rp");
    });

    it("should format time and date without crashing", () => {
      const date = new Date("2026-10-27T10:30:00Z");
      expect(formatTime(date)).toBeDefined();
      expect(formatDate(date)).toBeDefined();
    });
  });
});
