"use client";

import { useRouter } from "next/navigation";
import { isValidDate } from "@/shared/utils/date";

type DateJumpInputProps = {
  basePath: string;
  date: string;
};

// Chọn ngày xong là chuyển ngay tới ngày đó, không cần bấm nút.
export function DateJumpInput({ basePath, date }: DateJumpInputProps) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={date}
      aria-label="Chọn ngày"
      onChange={(e) => {
        const value = e.target.value;
        if (isValidDate(value) && value !== date) router.push(`${basePath}?date=${value}`);
      }}
      className="input"
    />
  );
}
