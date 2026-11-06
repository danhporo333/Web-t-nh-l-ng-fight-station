export type ShiftItem = {
  id: number;
  code: "MORNING" | "AFTERNOON";
  name: string;
  startTime: string;
  endTime: string;
  defaultHours: number;
  defaultRate: number;
};
