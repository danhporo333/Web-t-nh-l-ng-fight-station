import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findActiveStaff: vi.fn(),
  findRatesByMonth: vi.fn(),
  findShiftDefaultRates: vi.fn(),
  insertRates: vi.fn(),
  updateRates: vi.fn(),
}));

import * as queries from "../queries";
import { autoEnsureMonthRates, ensureMonthRatesFor, getMonthlyRates, saveRatesFor } from "../service";

const staff = (id: number, defaultRate: number | null = null) => ({
  id,
  username: `u${id}`,
  fullName: `NV ${id}`,
  defaultRate,
});

function mockMonths(byMonth: Record<string, { userId: number; morningRate: number; afternoonRate: number }[]>) {
  vi.mocked(queries.findRatesByMonth).mockImplementation(((m: string) => Promise.resolve(byMonth[m] ?? [])) as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(queries.findShiftDefaultRates).mockResolvedValue({ morning: 24000, afternoon: 26000 });
  vi.mocked(queries.insertRates).mockImplementation(((rows: unknown[]) => Promise.resolve({ count: rows.length })) as never);
});

describe("ensureMonthRatesFor", () => {
  it("chép từ tháng trước, rồi lương mặc định nhân viên, rồi mức mặc định ca", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1), staff(2, 27000), staff(3)]);
    mockMonths({ "2026-10": [{ userId: 1, morningRate: 26000, afternoonRate: 28000 }] });

    const r = await ensureMonthRatesFor("2026-11");

    expect(r).toEqual({ success: true, data: { created: 3 } });
    expect(queries.insertRates).toHaveBeenCalledWith([
      { userId: 1, month: "2026-11", morningRate: 26000, afternoonRate: 28000 },
      { userId: 2, month: "2026-11", morningRate: 27000, afternoonRate: 27000 },
      { userId: 3, month: "2026-11", morningRate: 24000, afternoonRate: 26000 },
    ]);
  });

  it("không ghi đè dòng đã có của tháng", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1), staff(2)]);
    mockMonths({
      "2026-11": [{ userId: 1, morningRate: 30000, afternoonRate: 32000 }],
      "2026-10": [{ userId: 1, morningRate: 26000, afternoonRate: 28000 }],
    });

    await ensureMonthRatesFor("2026-11");

    const rows = vi.mocked(queries.insertRates).mock.calls[0][0];
    expect(rows.map((x) => x.userId)).toEqual([2]);
  });

  it("chạy lại khi đã đủ dòng thì không ghi gì", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1)]);
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });

    const r = await ensureMonthRatesFor("2026-11");

    expect(r).toEqual({ success: true, data: { created: 0 } });
    expect(queries.insertRates).not.toHaveBeenCalled();
  });

  it("tháng đầu năm lấy tháng 12 năm trước", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1)]);
    mockMonths({ "2025-12": [{ userId: 1, morningRate: 25000, afternoonRate: 27000 }] });

    await ensureMonthRatesFor("2026-01");

    expect(vi.mocked(queries.insertRates).mock.calls[0][0][0]).toMatchObject({
      morningRate: 25000,
      afternoonRate: 27000,
    });
  });
});

describe("getMonthlyRates", () => {
  it("người chưa có dòng của tháng có mức null", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1), staff(2)]);
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });

    const rows = await getMonthlyRates("2026-11");

    expect(rows[0]).toMatchObject({ userId: 1, morningRate: 24000, afternoonRate: 26000 });
    expect(rows[1]).toMatchObject({ userId: 2, morningRate: null, afternoonRate: null });
  });
});

describe("saveRatesFor", () => {
  it("người chưa có dòng của tháng trả RATE_002, không ghi DB", async () => {
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });
    const r = await saveRatesFor("2026-11", [{ userId: 2, morningRate: 1, afternoonRate: 1 }]);
    expect(r.success === false && r.error.code).toBe("RATE_002");
    expect(queries.updateRates).not.toHaveBeenCalled();
  });

  it("lưu thành công", async () => {
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });
    vi.mocked(queries.updateRates).mockResolvedValue([] as never);
    const r = await saveRatesFor("2026-11", [{ userId: 1, morningRate: 27000, afternoonRate: 29000 }]);
    expect(r).toEqual({ success: true, data: { saved: 1 } });
  });

  it("dòng bị xóa giữa chừng (P2025) trả RATE_002", async () => {
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });
    vi.mocked(queries.updateRates).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("x", { code: "P2025", clientVersion: "6" }),
    );
    const r = await saveRatesFor("2026-11", [{ userId: 1, morningRate: 27000, afternoonRate: 29000 }]);
    expect(r.success === false && r.error.code).toBe("RATE_002");
  });
});

describe("autoEnsureMonthRates", () => {
  // 05/11/2026 giờ Việt Nam
  const now = new Date("2026-11-05T03:00:00Z");

  it("tháng hiện tại: tự tạo mức còn thiếu", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1), staff(2)]);
    mockMonths({ "2026-10": [{ userId: 1, morningRate: 26000, afternoonRate: 28000 }] });

    const r = await autoEnsureMonthRates("2026-11", now);

    expect(r).toEqual({ created: 2 });
    expect(queries.insertRates).toHaveBeenCalledTimes(1);
  });

  it("tháng đã qua hoặc chưa tới: không tự tạo, không đọc DB", async () => {
    expect(await autoEnsureMonthRates("2026-10", now)).toEqual({ created: 0 });
    expect(await autoEnsureMonthRates("2026-12", now)).toEqual({ created: 0 });
    expect(queries.findActiveStaff).not.toHaveBeenCalled();
    expect(queries.insertRates).not.toHaveBeenCalled();
  });

  it("đã đủ mức thì không ghi gì, gọi lại nhiều lần vẫn an toàn", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1)]);
    mockMonths({ "2026-11": [{ userId: 1, morningRate: 24000, afternoonRate: 26000 }] });

    expect(await autoEnsureMonthRates("2026-11", now)).toEqual({ created: 0 });
    expect(await autoEnsureMonthRates("2026-11", now)).toEqual({ created: 0 });
    expect(queries.insertRates).not.toHaveBeenCalled();
  });

  it("thiếu cấu hình ca thì không ném lỗi, trả 0", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1)]);
    vi.mocked(queries.findShiftDefaultRates).mockResolvedValue({ morning: undefined, afternoon: undefined });
    mockMonths({});

    expect(await autoEnsureMonthRates("2026-11", now)).toEqual({ created: 0 });
  });

  it("tháng 31/10 giờ UTC đã sang 01/11 giờ Việt Nam: tính theo giờ Việt Nam", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([staff(1)]);
    mockMonths({});
    const lateOct = new Date("2026-10-31T20:00:00Z");

    expect((await autoEnsureMonthRates("2026-11", lateOct)).created).toBe(1);
    expect(await autoEnsureMonthRates("2026-10", lateOct)).toEqual({ created: 0 });
  });
});
