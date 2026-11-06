import { z } from "zod";
import { isValidDate } from "@/shared/utils/date";

const MAX_AMOUNT = 100_000_000;

const dateField = z.string().refine(isValidDate, { message: "Ngày phải có dạng YYYY-MM-DD" });
const idField = z.coerce.number().int().positive();

const amountField = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= MAX_AMOUNT, {
    message: "Số tiền phải là số nguyên dương",
  })
  .transform(Number);

const reasonField = z
  .string()
  .trim()
  .min(1, "Thiếu lý do")
  .max(255, "Lý do tối đa 255 ký tự");

// Loại lỗi tự đặt: để trống là không phân loại.
const categoryField = z
  .string()
  .trim()
  .max(50, "Loại lỗi tối đa 50 ký tự")
  .optional()
  .transform((v) => (v ? v : null));

const typeField = z.enum(["BONUS", "PENALTY"], { message: "Chọn thưởng hoặc phạt" });

export const createAdjustmentSchema = z.object({
  userId: idField,
  date: dateField,
  type: typeField,
  amount: amountField,
  reason: reasonField,
  category: categoryField,
});

export const updateAdjustmentSchema = z.object({
  id: idField,
  date: dateField,
  type: typeField,
  amount: amountField,
  reason: reasonField,
  category: categoryField,
});

export const deleteAdjustmentSchema = z.object({ id: idField });
