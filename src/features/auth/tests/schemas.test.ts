import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema } from "../schemas";

describe("loginSchema", () => {
  it("cắt khoảng trắng tên đăng nhập", () => {
    const r = loginSchema.parse({ username: "  admin ", password: "x" });
    expect(r.username).toBe("admin");
  });
  it("từ chối mật khẩu rỗng", () => {
    expect(loginSchema.safeParse({ username: "a", password: "" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const base = { oldPassword: "old123", newPassword: "new1234", confirmPassword: "new1234" };
  it("chấp nhận dữ liệu hợp lệ", () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });
  it("từ chối mật khẩu mới quá ngắn", () => {
    expect(changePasswordSchema.safeParse({ ...base, newPassword: "abc", confirmPassword: "abc" }).success).toBe(false);
  });
  it("từ chối nhập lại không khớp", () => {
    expect(changePasswordSchema.safeParse({ ...base, confirmPassword: "khac1234" }).success).toBe(false);
  });
  it("từ chối mật khẩu mới trùng mật khẩu cũ", () => {
    expect(changePasswordSchema.safeParse({ ...base, newPassword: "old123", confirmPassword: "old123" }).success).toBe(false);
  });
});
