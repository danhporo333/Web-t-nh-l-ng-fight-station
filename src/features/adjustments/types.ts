// BONUS: thưởng (cộng). PENALTY: phạt (trừ). MEAL: tiền ăn uống tại quán (trừ).
export type AdjustmentType = "BONUS" | "PENALTY" | "MEAL";

export type AdjustmentItem = {
  id: number;
  userId: number;
  fullName: string;
  date: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
  category: string | null;
};

export type StaffOption = { id: number; fullName: string };

export type AdjustmentInput = {
  userId: number;
  date: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
  // Loại lỗi tự đặt, chỉ dùng cho khoản phạt
  category: string | null;
};

// Thống kê phạt của một nhân viên theo loại lỗi trong tháng (category null là chưa phân loại).
export type PenaltyBreakdown = {
  userId: number;
  category: string | null;
  count: number;
  amount: number;
};
