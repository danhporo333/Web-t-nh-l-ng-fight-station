type PayInput = {
  morningHours: number;
  afternoonHours: number;
  // Phần giờ đã nằm trong morningHours/afternoonHours nhưng rơi vào ngày lễ, được tính thêm một lần (×2)
  morningHolidayHours: number;
  afternoonHolidayHours: number;
  morningRate: number;
  afternoonRate: number;
  bonus: number;
  penalty: number;
  meal: number;
};

// Công thức lương tháng (DATABASE..md). Làm tròn một lần ở cuối, tiền là số nguyên đồng.
//   shiftPay = round((giờ sáng + giờ sáng ngày lễ) × mức sáng + (giờ chiều + giờ chiều ngày lễ) × mức chiều)
//   netPay   = shiftPay + thưởng − phạt − tiền ăn uống
// Ngày lễ chỉ nhân đôi lương ca, không ảnh hưởng thưởng, phạt, ăn uống.
export function calculatePay(input: PayInput): { shiftPay: number; netPay: number } {
  const shiftPay = Math.round(
    (input.morningHours + input.morningHolidayHours) * input.morningRate +
      (input.afternoonHours + input.afternoonHolidayHours) * input.afternoonRate,
  );
  return { shiftPay, netPay: shiftPay + input.bonus - input.penalty - input.meal };
}

// Tiền của một ca trong một ngày, chỉ để hiển thị chi tiết. Ngày lễ nhân đôi (HOLIDAY_MULTIPLIER).
// Tổng tháng tính bằng calculatePay trên tổng giờ nên có thể lệch vài đồng so với tổng các dòng ngày nếu mức lương không tròn trăm.
export const HOLIDAY_MULTIPLIER = 2;

export function calculateShiftPay(hours: number, rate: number, isHoliday = false): number {
  return Math.round(hours * rate * (isHoliday ? HOLIDAY_MULTIPLIER : 1));
}
