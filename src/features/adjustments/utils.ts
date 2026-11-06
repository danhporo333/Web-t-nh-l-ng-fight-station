import type { AdjustmentItem } from "./types";

// Số tiền luôn dương, loại quyết định cộng hay trừ.
export function summarizeAdjustments(items: Pick<AdjustmentItem, "type" | "amount">[]) {
  let bonus = 0;
  let penalty = 0;
  for (const item of items) {
    if (item.type === "BONUS") bonus += item.amount;
    else penalty += item.amount;
  }
  return { bonus, penalty, net: bonus - penalty };
}
