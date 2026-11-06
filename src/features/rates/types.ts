export type RateRow = {
  userId: number;
  fullName: string;
  username: string;
  // null khi nhân viên chưa có dòng lương của tháng này
  morningRate: number | null;
  afternoonRate: number | null;
};

export type RatePair = { morningRate: number; afternoonRate: number };
