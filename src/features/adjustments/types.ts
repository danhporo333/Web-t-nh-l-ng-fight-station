export type AdjustmentType = "BONUS" | "PENALTY";

export type AdjustmentItem = {
  id: number;
  userId: number;
  fullName: string;
  date: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
};

export type StaffOption = { id: number; fullName: string };

export type AdjustmentInput = {
  userId: number;
  date: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
};
