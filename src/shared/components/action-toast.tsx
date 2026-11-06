"use client";

import { useEffect, useState } from "react";
import type { ActionResult } from "@/lib/result";

const VISIBLE_MS = 3500;
const LEAVE_MS = 300;

type ToastItemProps = { ok: boolean; text: string };

function ToastItem({ ok, text }: ToastItemProps) {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");

  useEffect(() => {
    const leave = setTimeout(() => setPhase("out"), VISIBLE_MS);
    const remove = setTimeout(() => setPhase("gone"), VISIBLE_MS + LEAVE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className="pointer-events-none fixed top-4 right-4 left-4 z-50 flex justify-end">
      <div
        role={ok ? "status" : "alert"}
        className={`${phase === "in" ? "toast-in" : "toast-out"} pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-white shadow-lg ${
          ok ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <span aria-hidden className="text-xl">
          {ok ? "✓" : "!"}
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
}

type ActionToastProps = {
  state: ActionResult | undefined;
  successText: string;
};

// Hiện thông báo trượt từ phải sang mỗi lần Server Action trả kết quả mới (thành công hoặc lỗi).
export function ActionToast({ state, successText }: ActionToastProps) {
  const [prev, setPrev] = useState(state);
  const [toast, setToast] = useState<{ id: number; ok: boolean; text: string } | null>(null);

  // Cập nhật state ngay khi render (không dùng effect) mỗi khi có kết quả mới từ action.
  if (state !== prev) {
    setPrev(state);
    if (state) {
      setToast({
        id: (toast?.id ?? 0) + 1,
        ok: state.success,
        text: state.success ? successText : state.error.message,
      });
    }
  }

  return toast ? <ToastItem key={toast.id} ok={toast.ok} text={toast.text} /> : null;
}
