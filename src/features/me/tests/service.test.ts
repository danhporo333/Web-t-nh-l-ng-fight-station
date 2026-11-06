import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/payroll", () => ({ getStaffMonthDetail: vi.fn() }));

import { getStaffMonthDetail } from "@/features/payroll";
import { getMyPayroll } from "../service";

beforeEach(() => vi.clearAllMocks());

describe("getMyPayroll", () => {
  it("chỉ đọc dữ liệu của đúng userId được truyền vào", async () => {
    vi.mocked(getStaffMonthDetail).mockResolvedValue(null);
    await getMyPayroll(7, "2026-11");
    expect(getStaffMonthDetail).toHaveBeenCalledTimes(1);
    expect(getStaffMonthDetail).toHaveBeenCalledWith(7, "2026-11");
  });

  it("tài khoản không phải nhân viên (chủ quán) nhận null", async () => {
    vi.mocked(getStaffMonthDetail).mockResolvedValue(null);
    expect(await getMyPayroll(1, "2026-11")).toBeNull();
  });

  it("trả nguyên chi tiết lương của chính mình", async () => {
    const detail = { summary: { userId: 7 }, days: [], adjustments: [] } as never;
    vi.mocked(getStaffMonthDetail).mockResolvedValue(detail);
    expect(await getMyPayroll(7, "2026-11")).toBe(detail);
  });
});
