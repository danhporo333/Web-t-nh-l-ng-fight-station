import { z } from "zod";

const MAX_RATE = 10_000_000;

// Ô lương mặc định: để trống là không đặt, có giá trị thì phải là số nguyên dương.
const defaultRateField = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) > 0 && Number(v) <= MAX_RATE), {
    message: "Lương mặc định phải là số nguyên dương",
  })
  .transform((v) => (v === "" ? null : Number(v)));

const idField = z.coerce.number().int().positive();
const passwordField = z
  .string()
  .min(6, "Mật khẩu tối thiểu 6 ký tự")
  .max(72, "Mật khẩu tối đa 72 ký tự");
const fullNameField = z.string().trim().min(1, "Nhập họ tên").max(100, "Họ tên tối đa 100 ký tự");

export const createStaffSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,50}$/, "Tên đăng nhập 3-50 ký tự: chữ thường, số, dấu . _ -"),
  fullName: fullNameField,
  password: passwordField,
  defaultRate: defaultRateField,
});

export const updateStaffSchema = z.object({
  id: idField,
  fullName: fullNameField,
  defaultRate: defaultRateField,
});

export const resetPasswordSchema = z.object({
  id: idField,
  newPassword: passwordField,
});

export const setStaffActiveSchema = z.object({
  id: idField,
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
});
