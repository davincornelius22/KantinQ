export const MAX_ORDER_NOTE_LENGTH = 100;
export const MAX_ITEM_QUANTITY = 20;

export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Strips HTML tags and angle brackets from an order note and trims whitespace.
 */
export function sanitizeOrderNote(note: string): string {
  return note.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
}

/**
 * Validates an optional order note after HTML sanitization (max 100 chars).
 */
export function validateOrderNote(note?: string | null): ValidationResult {
  if (!note) {
    return { valid: true, message: "" };
  }
  const sanitized = sanitizeOrderNote(note);
  if (sanitized.length > MAX_ORDER_NOTE_LENGTH) {
    return {
      valid: false,
      message: `Catatan pesanan maksimal ${MAX_ORDER_NOTE_LENGTH} karakter`,
    };
  }
  return { valid: true, message: "" };
}

/**
 * Validates per-item portion quantity (1 to 20 portions).
 */
export function validateItemQuantity(quantity: number): ValidationResult {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { valid: false, message: "Jumlah porsi minimal 1" };
  }
  if (quantity > MAX_ITEM_QUANTITY) {
    return {
      valid: false,
      message: `Maksimal ${MAX_ITEM_QUANTITY} porsi per menu`,
    };
  }
  return { valid: true, message: "" };
}

export function validateCustomerName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: "Nama pemesan wajib diisi" };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: "Nama pemesan minimal 2 karakter" };
  }
  if (trimmed.length > 50) {
    return { valid: false, message: "Nama pemesan maksimal 50 karakter" };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, message: "Nama pemesan harus mengandung huruf alfabet" };
  }
  return { valid: true, message: "" };
}

export function validateCartNotEmpty(cartLength: number): ValidationResult {
  if (cartLength === 0) {
    return { valid: false, message: "Keranjang pesanan masih kosong. Pilih minimal 1 menu." };
  }
  return { valid: true, message: "" };
}

export function validateCartAvailability(
  items: { menu: { Name: string; IsAvailable: boolean } }[]
): ValidationResult {
  const unavailable = items.find((item) => !item.menu.IsAvailable);
  if (unavailable) {
    return {
      valid: false,
      message: `Menu "${unavailable.menu.Name}" sedang habis stok. Silakan kurangi atau hapus dari keranjang.`,
    };
  }
  return { valid: true, message: "" };
}

export function validateMenuPrice(price: number): ValidationResult {
  if (isNaN(price) || price <= 0) {
    return { valid: false, message: "Harga harus lebih dari Rp 0" };
  }
  if (price > 10000000) {
    return { valid: false, message: "Harga terlalu besar (maks Rp 10.000.000)" };
  }
  return { valid: true, message: "" };
}

export function validateMenuName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: "Nama menu wajib diisi" };
  }
  if (trimmed.length < 3) {
    return { valid: false, message: "Nama menu minimal 3 karakter" };
  }
  if (trimmed.length > 100) {
    return { valid: false, message: "Nama menu maksimal 100 karakter" };
  }
  return { valid: true, message: "" };
}

export function validateMenuDescription(desc?: string | null): ValidationResult {
  if (!desc) {
    return { valid: true, message: "" };
  }
  const trimmed = desc.trim();
  if (desc.length > 0 && trimmed.length === 0) {
    return { valid: false, message: "Deskripsi menu tidak boleh hanya berisi spasi kosong" };
  }
  if (trimmed.length > 300) {
    return { valid: false, message: "Deskripsi menu maksimal 300 karakter" };
  }
  return { valid: true, message: "" };
}

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatTime(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
