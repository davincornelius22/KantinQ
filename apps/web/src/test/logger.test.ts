import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  logger,
  maskSensitiveData,
  maskString,
  maskName,
  maskNim,
} from "../utils/logger";

describe("Secure Logger & Sensitive Data Masking", () => {
  describe("maskString", () => {
    it("masks student name and NIM in parentheses (e.g. 'Budi S*** (NIM 210***)')", () => {
      const input = "Budi Santoso (NIM 21012345)";
      const expected = "Budi S*** (NIM 210***)";
      expect(maskString(input)).toBe(expected);
    });

    it("masks student name and NIM with multi-word names", () => {
      const input = "Budi Santoso Wijaya (NIM 21098765)";
      expect(maskString(input)).toBe("Budi S*** (NIM 210***)");
    });

    it("masks standalone NIM patterns", () => {
      expect(maskString("Pemesanan oleh mahasiswa NIM 21012345 berhasil")).toBe(
        "Pemesanan oleh mahasiswa NIM 210*** berhasil"
      );
      expect(maskString("NIM: 21054321")).toBe("NIM: 210***");
      expect(maskString("NIM-21099999")).toBe("NIM-210***");
    });

    it("masks email addresses", () => {
      expect(maskString("Kontak admin: budi@kampus.ac.id")).toBe(
        "Kontak admin: b***@kampus.ac.id"
      );
    });
  });

  describe("maskName & maskNim", () => {
    it("masks multi-word names correctly", () => {
      expect(maskName("Budi Santoso")).toBe("Budi S***");
      expect(maskName("Siti Aminah")).toBe("Siti A***");
    });

    it("masks single-word names if length > 2", () => {
      expect(maskName("Budi")).toBe("Bu***");
      expect(maskName("Al")).toBe("Al");
    });

    it("masks NIM retaining first 3 digits", () => {
      expect(maskNim("21012345")).toBe("210***");
      expect(maskNim(21012345)).toBe("210***");
      expect(maskNim("12")).toBe("12");
    });
  });

  describe("maskSensitiveData", () => {
    it("masks objects containing CustomerName and NIM", () => {
      const payload = {
        CustomerName: "Budi Santoso (NIM 21012345)",
        nim: "21012345",
        orderId: 42,
      };

      const masked = maskSensitiveData(payload) as Record<string, unknown>;
      expect(masked.CustomerName).toBe("Budi S*** (NIM 210***)");
      expect(masked.nim).toBe("210***");
      expect(masked.orderId).toBe(42);
    });

    it("redacts sensitive authentication keys like password and token", () => {
      const authData = {
        username: "budi",
        password: "supersecretpassword",
        token: "bearer-token-123",
      };

      const masked = maskSensitiveData(authData) as Record<string, unknown>;
      expect(masked.password).toBe("[REDACTED]");
      expect(masked.token).toBe("[REDACTED]");
    });

    it("masks arrays containing student info", () => {
      const list = [
        { customerName: "Budi Santoso (NIM 21012345)" },
        { customerName: "Ahmad Fauzi (NIM 22055555)" },
      ];

      const masked = maskSensitiveData(list) as Array<Record<string, unknown>>;
      expect(masked[0].customerName).toBe("Budi S*** (NIM 210***)");
      expect(masked[1].customerName).toBe("Ahmad F*** (NIM 220***)");
    });

    it("masks Error message and preserves Error object", () => {
      const err = new Error("Gagal membuat pesanan Budi Santoso (NIM 21012345)");
      const masked = maskSensitiveData(err) as Error;
      expect(masked).toBeInstanceOf(Error);
      expect(masked.message).toBe("Gagal membuat pesanan Budi S*** (NIM 210***)");
    });

    it("handles null and undefined gracefully", () => {
      expect(maskSensitiveData(null)).toBeNull();
      expect(maskSensitiveData(undefined)).toBeUndefined();
    });
  });

  describe("logger wrapper methods", () => {
    let logSpy: ReturnType<typeof vi.spyOn>;
    let infoSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;
    let debugSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("logger.info masks student name and NIM before calling console.info", () => {
      logger.info("Pesanan baru:", "Budi Santoso (NIM 21012345)");
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledWith("Pesanan baru:", "Budi S*** (NIM 210***)");
    });

    it("logger.error masks sensitive object payload before calling console.error", () => {
      logger.error("Checkout gagal untuk:", {
        CustomerName: "Budi Santoso (NIM 21012345)",
      });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith("Checkout gagal untuk:", {
        CustomerName: "Budi S*** (NIM 210***)",
      });
    });

    it("logger.warn calls console.warn with masked data", () => {
      logger.warn("Perhatian mahasiswa NIM 21099999");
      expect(warnSpy).toHaveBeenCalledWith("Perhatian mahasiswa NIM 210***");
    });

    it("logger.log and logger.debug forward properly", () => {
      logger.log("Log test");
      expect(logSpy).toHaveBeenCalledWith("Log test");
      logger.debug("Debug test");
      expect(debugSpy).toHaveBeenCalledWith("Debug test");
    });
  });
});

