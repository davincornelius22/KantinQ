import { describe, it, expect } from "vitest";
import {
  validateCustomerName,
  validateCartNotEmpty,
  validateCartAvailability,
  validateMenuPrice,
  validateMenuName,
  formatRupiah,
  formatTime,
  formatDate,
} from "../utils/validation";

describe("Validation Utilities", () => {
  describe("validateCustomerName", () => {
    it("should reject empty or whitespace-only name", () => {
      expect(validateCustomerName("").valid).toBe(false);
      expect(validateCustomerName("   ").valid).toBe(false);
      expect(validateCustomerName("").message).toBe("Nama pemesan wajib diisi");
    });

    it("should reject names with less than 2 characters", () => {
      const res = validateCustomerName("A");
      expect(res.valid).toBe(false);
      expect(res.message).toBe("Nama pemesan minimal 2 karakter");
    });

    it("should reject names longer than 50 characters", () => {
      const longName = "A".repeat(51);
      const res = validateCustomerName(longName);
      expect(res.valid).toBe(false);
      expect(res.message).toBe("Nama pemesan maksimal 50 karakter");
    });

    it("should reject names without any letters", () => {
      expect(validateCustomerName("12345").valid).toBe(false);
      expect(validateCustomerName("---").valid).toBe(false);
      expect(validateCustomerName("12345").message).toBe(
        "Nama pemesan harus mengandung huruf alfabet"
      );
    });

    it("should accept valid student names with notes or student ID", () => {
      expect(validateCustomerName("Budi").valid).toBe(true);
      expect(validateCustomerName("Siti Rahma (Meja 04)").valid).toBe(true);
      expect(validateCustomerName("Davin - NIM 2024").valid).toBe(true);
    });
  });

  describe("validateCartNotEmpty", () => {
    it("should return invalid for 0 items", () => {
      const res = validateCartNotEmpty(0);
      expect(res.valid).toBe(false);
      expect(res.message).toContain("Keranjang pesanan masih kosong");
    });

    it("should return valid when cart has items", () => {
      expect(validateCartNotEmpty(1).valid).toBe(true);
      expect(validateCartNotEmpty(5).valid).toBe(true);
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

    it("should fail when any item in cart is unavailable", () => {
      const cart = [
        { menu: { Name: "Nasi Goreng", IsAvailable: true }, quantity: 1 },
        { menu: { Name: "Ayam Geprek", IsAvailable: false }, quantity: 1 },
      ];
      const res = validateCartAvailability(cart);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('Menu "Ayam Geprek" sedang habis stok');
    });
  });

  describe("validateMenuPrice", () => {
    it("should reject non-positive prices", () => {
      expect(validateMenuPrice(0).valid).toBe(false);
      expect(validateMenuPrice(-5000).valid).toBe(false);
      expect(validateMenuPrice(NaN).valid).toBe(false);
    });

    it("should reject excessively high prices", () => {
      expect(validateMenuPrice(15000000).valid).toBe(false);
    });

    it("should accept reasonable prices", () => {
      expect(validateMenuPrice(15000).valid).toBe(true);
      expect(validateMenuPrice(5000).valid).toBe(true);
    });
  });

  describe("validateMenuName", () => {
    it("should reject empty or very short names", () => {
      expect(validateMenuName("").valid).toBe(false);
      expect(validateMenuName("Mi").valid).toBe(false);
    });

    it("should reject names over 100 characters", () => {
      expect(validateMenuName("Nasi ".repeat(25)).valid).toBe(false);
    });

    it("should accept valid menu names", () => {
      expect(validateMenuName("Mie Goreng Spesial").valid).toBe(true);
    });
  });

  describe("Formatters", () => {
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
