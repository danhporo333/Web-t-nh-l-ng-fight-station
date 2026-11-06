// Tiền là số nguyên đồng. Chỉ để hiển thị, không dùng để tính.
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}
