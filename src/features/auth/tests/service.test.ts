import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findUserForLogin: vi.fn(),
  findPasswordHash: vi.fn(),
  updatePasswordHash: vi.fn(),
}));

import * as queries from "../queries";
import { changeUserPassword, verifyLogin } from "../service";

const hash = bcrypt.hashSync("dung123", 4);

beforeEach(() => vi.clearAllMocks());

function errorCode(r: { success: boolean; error?: { code: string } }) {
  return r.success ? null : r.error?.code;
}

describe("verifyLogin", () => {
  it("đúng mật khẩu trả userId và role", async () => {
    vi.mocked(queries.findUserForLogin).mockResolvedValue({ id: 1, passwordHash: hash, role: "OWNER", isActive: true });
    const r = await verifyLogin("admin", "dung123");
    expect(r).toEqual({ success: true, data: { userId: 1, role: "OWNER" } });
  });
  it("sai mật khẩu trả AUTH_001", async () => {
    vi.mocked(queries.findUserForLogin).mockResolvedValue({ id: 1, passwordHash: hash, role: "STAFF", isActive: true });
    expect(errorCode(await verifyLogin("a", "sai"))).toBe("AUTH_001");
  });
  it("tài khoản đã khóa trả AUTH_001", async () => {
    vi.mocked(queries.findUserForLogin).mockResolvedValue({ id: 2, passwordHash: hash, role: "STAFF", isActive: false });
    expect(errorCode(await verifyLogin("a", "dung123"))).toBe("AUTH_001");
  });
  it("tên không tồn tại trả AUTH_001", async () => {
    vi.mocked(queries.findUserForLogin).mockResolvedValue(null);
    expect(errorCode(await verifyLogin("khong-co", "x"))).toBe("AUTH_001");
  });
});

describe("changeUserPassword", () => {
  it("mật khẩu cũ sai trả AUTH_004, không ghi DB", async () => {
    vi.mocked(queries.findPasswordHash).mockResolvedValue({ passwordHash: hash });
    expect(errorCode(await changeUserPassword(1, "sai", "moi12345"))).toBe("AUTH_004");
    expect(queries.updatePasswordHash).not.toHaveBeenCalled();
  });
  it("đúng mật khẩu cũ thì lưu hash mới", async () => {
    vi.mocked(queries.findPasswordHash).mockResolvedValue({ passwordHash: hash });
    const r = await changeUserPassword(1, "dung123", "moi12345");
    expect(r.success).toBe(true);
    const saved = vi.mocked(queries.updatePasswordHash).mock.calls[0][1];
    expect(saved).not.toBe("moi12345");
    expect(await bcrypt.compare("moi12345", saved)).toBe(true);
  });
});
