/**
 * KantinQ Secure Logger Utility
 * Provides automatic data masking for sensitive customer & student data
 * (e.g. Student Names, NIM, Authentication tokens, Passwords) before console output.
 */

const STANDALONE_NIM_REGEX = /\b(NIM\s*[:#=-]?\s*)(\d{3})\d+\b/gi;

const NIM_KEY_VALUE_REGEX =
  /\b((?:nim|student_?id)\s*[:=]\s*["']?)(\d{3})\d+(["']?)/gi;

const EMAIL_REGEX =
  /\b([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g;

/**
 * Mask a string containing sensitive data (e.g., student name with NIM, standalone NIM, emails)
 * Example:
 * "Budi Santoso (NIM 21012345)" -> "Budi S*** (NIM 210***)"
 */
export function maskString(str: string): string {
  if (typeof str !== "string") return str;

  let masked = str;

  // 1. Name with NIM in parenthesis
  const capitalizedParenthesisRegex =
    /\b([A-Z][a-zA-Z]*)\s+([A-Z])[a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s*\(\s*(NIM\s*[:#]?\s*)(\d{3})\d+\s*\)/g;
  const twoWordParenthesisRegex =
    /\b([a-zA-Z]+)\s+([a-zA-Z])[a-zA-Z]*\s*\(\s*(NIM\s*[:#]?\s*)(\d{3})\d+\s*\)/g;
  const singleWordParenthesisRegex =
    /\b([a-zA-Z]+)\s*\(\s*(NIM\s*[:#]?\s*)(\d{3})\d+\s*\)/g;

  if (capitalizedParenthesisRegex.test(masked)) {
    capitalizedParenthesisRegex.lastIndex = 0;
    masked = masked.replace(
      capitalizedParenthesisRegex,
      (_match, first, secondInit, nimPrefix, nimDigits) => {
        return `${first} ${secondInit}*** (${nimPrefix}${nimDigits}***)`;
      }
    );
  } else if (twoWordParenthesisRegex.test(masked)) {
    twoWordParenthesisRegex.lastIndex = 0;
    masked = masked.replace(
      twoWordParenthesisRegex,
      (_match, first, secondInit, nimPrefix, nimDigits) => {
        return `${first} ${secondInit}*** (${nimPrefix}${nimDigits}***)`;
      }
    );
  } else if (singleWordParenthesisRegex.test(masked)) {
    singleWordParenthesisRegex.lastIndex = 0;
    masked = masked.replace(
      singleWordParenthesisRegex,
      (_match, first, nimPrefix, nimDigits) => {
        return `${maskName(first)} (${nimPrefix}${nimDigits}***)`;
      }
    );
  }

  // 2. Name with NIM separated by dash
  const capitalizedDashRegex =
    /\b([A-Z][a-zA-Z]*)\s+([A-Z])[a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s*[-–—:]\s*(NIM\s*[:#]?\s*)(\d{3})\d+/g;
  const twoWordDashRegex =
    /\b([a-zA-Z]+)\s+([a-zA-Z])[a-zA-Z]*\s*[-–—:]\s*(NIM\s*[:#]?\s*)(\d{3})\d+/g;

  if (capitalizedDashRegex.test(masked)) {
    capitalizedDashRegex.lastIndex = 0;
    masked = masked.replace(
      capitalizedDashRegex,
      (_match, first, secondInit, nimPrefix, nimDigits) => {
        return `${first} ${secondInit}*** - ${nimPrefix}${nimDigits}***`;
      }
    );
  } else if (twoWordDashRegex.test(masked)) {
    twoWordDashRegex.lastIndex = 0;
    masked = masked.replace(
      twoWordDashRegex,
      (_match, first, secondInit, nimPrefix, nimDigits) => {
        return `${first} ${secondInit}*** - ${nimPrefix}${nimDigits}***`;
      }
    );
  }

  // 3. Standalone NIM: "NIM 21012345" -> "NIM 210***"
  masked = masked.replace(STANDALONE_NIM_REGEX, (_match, prefix, digits) => {
    return `${prefix}${digits}***`;
  });

  // 4. Key-value style NIM: "nim=21012345" or "student_id: 21012345"
  masked = masked.replace(
    NIM_KEY_VALUE_REGEX,
    (_match, prefix, digits, suffix) => {
      return `${prefix}${digits}***${suffix || ""}`;
    }
  );

  // 5. Email masking: "budi.santoso@kampus.ac.id" -> "b***@kampus.ac.id"
  masked = masked.replace(EMAIL_REGEX, "$1***@$2");

  return masked;
}

/**
 * Mask a standalone student / customer name
 * Example:
 * "Budi Santoso" -> "Budi S***"
 * "Budi Santoso (NIM 21012345)" -> "Budi S*** (NIM 210***)"
 */
export function maskName(name: string): string {
  if (!name || typeof name !== "string") return name;
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  // If it already contains NIM, use the string masking pipeline
  if (/NIM/i.test(trimmed)) {
    return maskString(trimmed);
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    if (parts[0].length <= 2) return parts[0];
    return parts[0].slice(0, 2) + "***";
  }

  // Multi-word name: Keep first name, mask subsequent parts to initial + ***
  const firstName = parts[0];
  const secondInitial = parts[1][0] || "";
  return `${firstName} ${secondInitial}***`;
}

/**
 * Mask a NIM (Student Identification Number)
 * Example:
 * "21012345" -> "210***"
 */
export function maskNim(nim: string | number): string {
  const str = String(nim).trim();
  if (str.length <= 3) return str;
  return str.slice(0, 3) + "***";
}

/**
 * Deeply mask any JavaScript value before logging (strings, objects, arrays, errors)
 */
export function maskSensitiveData(
  data: unknown,
  visited = new WeakSet()
): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return maskString(data);
  }

  if (
    typeof data === "number" ||
    typeof data === "boolean" ||
    typeof data === "function"
  ) {
    return data;
  }

  if (data instanceof Error) {
    const maskedError = new Error(maskString(data.message));
    maskedError.name = data.name;
    if (data.stack) {
      maskedError.stack = maskString(data.stack);
    }
    return maskedError;
  }

  if (typeof data === "object") {
    if (visited.has(data as object)) {
      return "[Circular]";
    }
    visited.add(data as object);

    if (Array.isArray(data)) {
      return data.map((item) => maskSensitiveData(item, visited));
    }

    const maskedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Passwords, Tokens, Secrets
      if (/password|token|secret|authorization|auth|pin|cvv/i.test(lowerKey)) {
        maskedObj[key] = "[REDACTED]";
      }
      // NIM / Student ID fields
      else if (/nim|student_?id/i.test(lowerKey)) {
        if (typeof value === "string" || typeof value === "number") {
          maskedObj[key] = maskNim(value);
        } else {
          maskedObj[key] = maskSensitiveData(value, visited);
        }
      }
      // Customer / Student names
      else if (
        /customer_?name|student_?name/i.test(lowerKey) ||
        (lowerKey === "name" && typeof value === "string")
      ) {
        if (typeof value === "string") {
          maskedObj[key] = maskName(value);
        } else {
          maskedObj[key] = maskSensitiveData(value, visited);
        }
      }
      // General recursive masking
      else {
        maskedObj[key] = maskSensitiveData(value, visited);
      }
    }
    return maskedObj;
  }

  return data;
}

export interface ILogger {
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

export const logger: ILogger = {
  log: (...args: unknown[]) => {
    console.log(...args.map((arg) => maskSensitiveData(arg)));
  },
  info: (...args: unknown[]) => {
    console.info(...args.map((arg) => maskSensitiveData(arg)));
  },
  warn: (...args: unknown[]) => {
    console.warn(...args.map((arg) => maskSensitiveData(arg)));
  },
  error: (...args: unknown[]) => {
    console.error(...args.map((arg) => maskSensitiveData(arg)));
  },
  debug: (...args: unknown[]) => {
    console.debug(...args.map((arg) => maskSensitiveData(arg)));
  },
};

export default logger;
