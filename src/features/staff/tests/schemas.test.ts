import { describe, expect, it } from "vitest";
import { createStaffSchema, setStaffActiveSchema, updateStaffSchema } from "../schemas";

const base = { username: "Hoang01", fullName: " Hoàng ", password: "mk1234", defaultRate: "" };

describe("createStaffSchema", () => {
  it("chuẩn hóa tên đăng nhập và họ tên, lương trống thành null", () => {
    const r = createStaffSchema.parse(base);
    expect(r.username).toBe("hoang01");
    expect(r.fullName).toBe("Hoàng");
    expect(r.defaultRate).toBeNull();
  });
  it("đọc lương mặc định là số nguyên", () => {
    expect(createStaffSchema.parse({ ...base, defaultRate: "27000" }).defaultRate).toBe(27000);
  });
  it.each(["0", "-5", "abc", "12.5", "99999999999"])("từ chối lương mặc định %s", (v) => {
    expect(createStaffSchema.safeParse({ ...base, defaultRate: v }).success).toBe(false);
  });
  it("từ chối tên đăng nhập có khoảng trắng hoặc quá ngắn", () => {
    expect(createStaffSchema.safeParse({ ...base, username: "a b" }).success).toBe(false);
    expect(createStaffSchema.safeParse({ ...base, username: "ab" }).success).toBe(false);
  });
  it("từ chối mật khẩu dưới 6 ký tự", () => {
    expect(createStaffSchema.safeParse({ ...base, password: "12345" }).success).toBe(false);
  });
});

describe("updateStaffSchema", () => {
  it("từ chối id không hợp lệ", () => {
    expect(updateStaffSchema.safeParse({ id: "abc", fullName: "A", defaultRate: "" }).success).toBe(false);
  });
});

describe("setStaffActiveSchema", () => {
  it("đổi chuỗi true/false thành boolean", () => {
    expect(setStaffActiveSchema.parse({ id: "3", isActive: "false" })).toEqual({ id: 3, isActive: false });
  });
});
