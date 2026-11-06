export type ShiftEntry = { hours: number; note: string | null };

export type DayEntryRow = {
  userId: number;
  fullName: string;
  username: string;
  off: boolean;
  morning: ShiftEntry | null;
  afternoon: ShiftEntry | null;
};

export type DayView = {
  date: string;
  defaultHours: { morning: number; afternoon: number };
  rows: DayEntryRow[];
};

export type ShiftInput = { hours: number; note?: string };

export type DayEntryInput = {
  userId: number;
  off: boolean;
  morning?: ShiftInput;
  afternoon?: ShiftInput;
};

// Tổng giờ của một nhân viên trong tháng, không tính ngày Off.
export type MonthHours = { userId: number; morningHours: number; afternoonHours: number };

// Một dòng chấm công của một ngày (ca hoặc Off).
export type DayRecord = {
  date: string;
  off: boolean;
  shift: "MORNING" | "AFTERNOON" | null;
  hours: number;
  note: string | null;
};

// Các ngày Off của một nhân viên trong tháng, tăng dần theo ngày.
export type OffDays = { userId: number; dates: string[] };
