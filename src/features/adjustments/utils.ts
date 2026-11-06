import type { AdjustmentItem } from "./types";

// Số tiền luôn dương, loại quyết định cộng hay trừ.
export function summarizeAdjustments(items: Pick<AdjustmentItem, "type" | "amount">[]) {
  let bonus = 0;
  let penalty = 0;
  let meal = 0;
  for (const item of items) {
    if (item.type === "BONUS") bonus += item.amount;
    else if (item.type === "PENALTY") penalty += item.amount;
    else meal += item.amount;
  }
  return { bonus, penalty, meal, net: bonus - penalty - meal };
}
