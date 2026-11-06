import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findStaffList: vi.fn(),
  findUserRole: vi.fn(),
  insertStaff: vi.fn(),
  updateStaffById: vi.fn(),
  updateStaffPassword: vi.fn(),
  updateStaffActive: vi.fn(),
}));

import * as queries from "../queries";
import {
  changeStaffActive,
  createStaffAccount,
  resetStaffPassword,
  updateStaffAccount,
} from "../service";

const item = { id: 2, username: "hoang", fullName: "Hoàng", isActive: true, defaultRate: 27000 };

function errorCode(r: { success: boolean; error?: { code: string } }) {
  return r.success ? null : r.error?.code;
}

beforeEach(() => vi.clearAllMocks());

describe("createStaffAccount", () => {
  it("băm mật khẩu trước khi lưu", async () => {
    vi.mocked(queries.insertStaff).mockResolvedValue(item);
    const r = await createStaffAccount({ username: "hoang", fullName: "Hoàng", password: "mk1234", defaultRate: 27000 });
    expect(r.success).toBe(true);
    const saved = vi.mocked(queries.insertStaff).mock.calls[0][0];
    expect(saved.passwordHash).not.toBe("mk1234");
    expect(await bcrypt.compare("mk1234", saved.passwordHash)).toBe(true);
  });
  it("trùng tên đăng nhập trả STAFF_001", async () => {
    const err = new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "6" });
    vi.mocked(queries.insertStaff).mockRejectedValue(err);
    const r = await createStaffAccount({ username: "hoang", fullName: "H", password: "mk1234", defaultRate: null });
    expect(errorCode(r)).toBe("STAFF_001");
  });
});

describe("updateStaffAccount và resetStaffPassword", () => {
  it("không tìm thấy trả STAFF_002", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue(null);
    expect(errorCode(await updateStaffAccount(9, { fullName: "A", defaultRate: null }))).toBe("STAFF_002");
    expect(errorCode(await resetStaffPassword(9, "mk1234"))).toBe("STAFF_002");
  });
  it("tài khoản chủ quán coi như không tồn tại, không ghi DB", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 1, role: "OWNER" });
    expect(errorCode(await resetStaffPassword(1, "mk1234"))).toBe("STAFF_002");
    expect(queries.updateStaffPassword).not.toHaveBeenCalled();
    expect(queries.updateStaffById).not.toHaveBeenCalled();
  });
  it("đặt lại mật khẩu lưu hash mới", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 2, role: "STAFF" });
    vi.mocked(queries.updateStaffPassword).mockResolvedValue({ id: 2 });
    expect((await resetStaffPassword(2, "mkmoi123")).success).toBe(true);
    const hash = vi.mocked(queries.updateStaffPassword).mock.calls[0][1];
    expect(await bcrypt.compare("mkmoi123", hash)).toBe(true);
  });
});

describe("changeStaffActive", () => {
  it("không khóa được chủ quán: STAFF_003", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 1, role: "OWNER" });
    expect(errorCode(await changeStaffActive(1, false))).toBe("STAFF_003");
    expect(queries.updateStaffActive).not.toHaveBeenCalled();
  });
  it("không tìm thấy: STAFF_002", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue(null);
    expect(errorCode(await changeStaffActive(9, false))).toBe("STAFF_002");
  });
  it("cho nghỉ việc nhân viên", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 2, role: "STAFF" });
    vi.mocked(queries.updateStaffActive).mockResolvedValue({ ...item, isActive: false });
    expect((await changeStaffActive(2, false)).success).toBe(true);
    expect(queries.updateStaffActive).toHaveBeenCalledWith(2, false);
  });
});
