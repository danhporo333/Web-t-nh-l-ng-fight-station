import type { RatePair } from "./types";

type InitialRateInput = {
  previous: RatePair | null;
  userDefaultRate: number | null;
  shiftDefaults: RatePair;
};

// Thứ tự: dòng tháng trước, rồi lương mặc định mọi ca của nhân viên, rồi mức mặc định từng ca.
export function resolveInitialRates({ previous, userDefaultRate, shiftDefaults }: InitialRateInput): RatePair {
  if (previous) return { morningRate: previous.morningRate, afternoonRate: previous.afternoonRate };
  if (userDefaultRate !== null) {
    return { morningRate: userDefaultRate, afternoonRate: userDefaultRate };
  }
  return { morningRate: shiftDefaults.morningRate, afternoonRate: shiftDefaults.afternoonRate };
}
