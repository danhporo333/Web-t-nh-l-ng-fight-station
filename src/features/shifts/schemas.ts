import { z } from "zod";

const MAX_RATE = 10_000_000;

const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ phải có dạng HH:MM, ví dụ 07:30");

// Chấp nhận "8,5" hoặc "8.5", tối đa 2 chữ số thập phân, lớn hơn 0 và không quá 24.
const hoursField = z
  .string()
  .trim()
  .transform((v) => v.replace(",", "."))
  .refine((v) => /^\d{1,2}(\.\d{1,2})?$/.test(v) && Number(v) > 0 && Number(v) <= 24, {
    message: "Số giờ phải lớn hơn 0 và không quá 24",
  })
  .transform(Number);

const rateField = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= MAX_RATE, {
    message: "Mức mặc định phải là số nguyên dương",
  })
  .transform(Number);

export const updateShiftSchema = z.object({
  id: z.coerce.number().int().positive(),
  startTime: timeField,
  endTime: timeField,
  defaultHours: hoursField,
  defaultRate: rateField,
});
