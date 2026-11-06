// Nơi duy nhất feature payroll export ra ngoài.
export { getMonthlyPayroll, getStaffMonthDetail } from "./service";
export { PayrollTotalsCard } from "./components/payroll-totals";
export { PayrollList } from "./components/payroll-list";
export { StaffMonthDetailView } from "./components/staff-month-detail";
export { PayrollFigures } from "./components/payroll-figures";
export { calculatePay } from "./utils";
export type { MonthlyPayroll, PayrollRow, StaffMonthDetail } from "./types";
