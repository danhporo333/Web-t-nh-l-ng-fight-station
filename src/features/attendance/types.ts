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
