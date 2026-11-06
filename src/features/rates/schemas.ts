import { z } from "zod";
import { isValidMonth } from "@/shared/utils/month";

const MAX_RATE = 10_000_000;

export const monthSchema = z.string().refine(isValidMonth, { message: "Tháng phải có dạng YYYY-MM" });

export const rateValueSchema = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= MAX_RATE, {
    message: "Mức lương phải là số nguyên dương",
  })
  .transform(Number);

export const rateEntrySchema = z.object({
  userId: z.coerce.number().int().positive(),
  morningRate: rateValueSchema,
  afternoonRate: rateValueSchema,
});

export const saveRatesSchema = z.object({
  month: monthSchema,
  entries: z.array(rateEntrySchema).min(1, "Không có mức lương nào để lưu"),
});
