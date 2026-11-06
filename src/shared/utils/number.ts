// Số giờ để hiển thị, tối đa 2 chữ số thập phân. Ví dụ 8.5 thành "8,5".
export function formatHours(hours: number): string {
  return hours.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
