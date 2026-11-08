import { z } from "zod";
import { isValidDate } from "@/shared/utils/date";

export const dateSchema = z.string().refine(isValidDate, { message: "Ngày phải có dạng YYYY-MM-DD" });

// Chấp nhận "8,5" hoặc "8.5", tối đa 2 chữ số thập phân, lớn hơn 0 và không quá 24.
const hoursField = z
  .string()
  .trim()
  .transform((v) => v.replace(",", "."))
  .refine((v) => /^\d{1,2}(\.\d{1,2})?$/.test(v) && Number(v) > 0 && Number(v) <= 24, {
    message: "Số giờ phải lớn hơn 0 và không quá 24",
  })
  .transform(Number);

const noteField = z
  .string()
  .trim()
  .max(255, "Ghi chú tối đa 255 ký tự")
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const shiftSchema = z.object({ hours: hoursField, note: noteField });

export const dayEntrySchema = z.object({
  userId: z.coerce.number().int().positive(),
  off: z.boolean(),
  morning: shiftSchema.optional(),
  afternoon: shiftSchema.optional(),
});

// Ngày lễ: null nếu không tích, { note } nếu tích. Bắt buộc ghi tên lễ khi đã tích.
export const holidaySchema = z
  .object({
    note: z
      .string()
      .trim()
      .min(1, "Hãy ghi tên ngày lễ")
      .max(255, "Tên ngày lễ tối đa 255 ký tự"),
  })
  .nullable();

export const saveDayEntriesSchema = z.object({
  date: dateSchema,
  entries: z.array(dayEntrySchema).min(1, "Không có nhân viên nào để lưu"),
  holiday: holidaySchema.optional(),
});
