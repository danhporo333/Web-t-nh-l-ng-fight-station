type PayInput = {
  morningHours: number;
  afternoonHours: number;
  morningRate: number;
  afternoonRate: number;
  bonus: number;
  penalty: number;
};

// Công thức lương tháng (DATABASE..md). Làm tròn một lần ở cuối, tiền là số nguyên đồng.
//   shiftPay = round(giờ sáng × mức sáng + giờ chiều × mức chiều)
//   netPay   = shiftPay + thưởng − phạt
export function calculatePay(input: PayInput): { shiftPay: number; netPay: number } {
  const shiftPay = Math.round(
    input.morningHours * input.morningRate + input.afternoonHours * input.afternoonRate,
  );
  return { shiftPay, netPay: shiftPay + input.bonus - input.penalty };
}

// Tiền của một ca trong một ngày, chỉ để hiển thị chi tiết. Tổng tháng tính bằng calculatePay
// trên tổng giờ nên có thể lệch vài đồng so với tổng các dòng ngày nếu mức lương không tròn trăm.
export function calculateShiftPay(hours: number, rate: number): number {
  return Math.round(hours * rate);
}
