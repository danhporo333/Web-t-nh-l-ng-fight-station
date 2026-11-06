import { describe, expect, it } from "vitest";
import { resolveInitialRates } from "../utils";

const shiftDefaults = { morningRate: 24000, afternoonRate: 26000 };

describe("resolveInitialRates", () => {
  it("ưu tiên dòng của tháng trước", () => {
    const r = resolveInitialRates({
      previous: { morningRate: 26000, afternoonRate: 28000 },
      userDefaultRate: 27000,
      shiftDefaults,
    });
    expect(r).toEqual({ morningRate: 26000, afternoonRate: 28000 });
  });
  it("không có tháng trước thì dùng lương mặc định mọi ca của nhân viên cho cả hai ca", () => {
    const r = resolveInitialRates({ previous: null, userDefaultRate: 27000, shiftDefaults });
    expect(r).toEqual({ morningRate: 27000, afternoonRate: 27000 });
  });
  it("không có cả hai thì dùng mức mặc định của từng ca", () => {
    const r = resolveInitialRates({ previous: null, userDefaultRate: null, shiftDefaults });
    expect(r).toEqual({ morningRate: 24000, afternoonRate: 26000 });
  });
});
