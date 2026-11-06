export type StaffItem = {
  id: number;
  username: string;
  fullName: string;
  isActive: boolean;
  defaultRate: number | null;
};

export type StaffFilter = "all" | "active" | "inactive";
