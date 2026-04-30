import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function redactToken(token: string | null) {
  if (!token) {
    return "Belum dihubungkan";
  }

  if (token.length <= 8) {
    return "********";
  }

  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}
