export type CategoryStat = {
  // null là khoản phạt chưa phân loại
  category: string | null;
  count: number;
  amount: number;
};

export type StaffStat = {
  userId: number;
  fullName: string;
  username: string;
  isActive: boolean;
  offDates: string[];
  penaltyCount: number;
  penaltyAmount: number;
  byCategory: CategoryStat[];
};

export type MonthStats = {
  month: string;
  rows: StaffStat[];
  totals: { offDays: number; penaltyCount: number; penaltyAmount: number };
  categories: CategoryStat[];
};
