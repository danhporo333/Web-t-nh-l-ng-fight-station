// Ngày dạng "YYYY-MM-DD", múi giờ Asia/Ho_Chi_Minh.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function todayVN(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Giá trị cho cột DATE của MySQL (Prisma dùng phần ngày theo UTC).
export function dateToDb(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function monthOfDate(date: string): string {
  return date.slice(0, 7);
}

export function formatDateLabel(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  const [year, month, day] = date.split("-");
  return `${WEEKDAYS[d.getUTCDay()]}, ${day}/${month}/${year}`;
}
