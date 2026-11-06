// Tháng dạng "YYYY-MM", múi giờ Asia/Ho_Chi_Minh.
import { dateToDb } from "./date";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonth(value: unknown): value is string {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split("-").map(Number);
  const index = year * 12 + (mon - 1) + delta;
  const newYear = Math.floor(index / 12);
  const newMonth = (index % 12) + 1;
  return `${String(newYear).padStart(4, "0")}-${String(newMonth).padStart(2, "0")}`;
}

export function previousMonth(month: string): string {
  return shiftMonth(month, -1);
}

export function nextMonth(month: string): string {
  return shiftMonth(month, 1);
}

export function currentMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-");
  return `Tháng ${Number(mon)}/${year}`;
}

// Khoảng của một tháng: >= start và < end (end là đầu tháng sau, không gồm).
export function monthRange(month: string): { start: Date; end: Date } {
  return { start: dateToDb(`${month}-01`), end: dateToDb(`${nextMonth(month)}-01`) };
}
