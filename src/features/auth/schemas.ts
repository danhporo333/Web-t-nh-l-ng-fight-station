import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 6;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Nhập tên đăng nhập").max(50),
  password: z.string().min(1, "Nhập mật khẩu").max(100),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Nhập mật khẩu cũ").max(100),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Mật khẩu mới tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`)
      .max(72, "Mật khẩu mới tối đa 72 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  })
  .refine((v) => v.newPassword !== v.oldPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới phải khác mật khẩu cũ",
  });
