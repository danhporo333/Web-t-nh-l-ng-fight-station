// Nơi duy nhất feature adjustments export ra ngoài.
export { listAdjustments, getStaffOptions, getAdjustmentTotals } from "./service";
export { AdjustmentList } from "./components/adjustment-list";
export { AdjustmentSummary } from "./components/adjustment-summary";
export { AddAdjustmentPanel } from "./components/add-adjustment-panel";
export { summarizeAdjustments } from "./utils";
export type { AdjustmentItem, StaffOption } from "./types";
