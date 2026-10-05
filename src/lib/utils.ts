import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}${rand}`;
}

export function safeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && !looksLikeSecret(error.message)) {
    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("unavailable")
    ) {
      return "Database connection unavailable.";
    }
    if (error.message.toLowerCase().includes("permission")) {
      return "Database permission denied.";
    }
  }
  return fallback;
}

function looksLikeSecret(message: string) {
  return /BEGIN PRIVATE KEY|private_key|client_email|ya29\.|AIza/i.test(
    message,
  );
}
