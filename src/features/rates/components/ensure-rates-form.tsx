"use client";

import { useActionState } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { ensureMonthRates } from "../actions";

type EnsureRatesFormProps = {
  month: string;
  message: string;
  buttonText: string;
};

export function EnsureRatesForm({ month, message, buttonText }: EnsureRatesFormProps) {
  const [state, action, pending] = useActionState(ensureMonthRates, undefined);

  return (
    <form action={action} className="card flex flex-col gap-3">
      <input type="hidden" name="month" value={month} />
      <p className="text-sm text-stone-700">{message}</p>
      <FormMessage state={state} successText="Đã tạo mức lương." />
      <button type="submit" disabled={pending} className="btn-primary sm:w-auto">
        {pending ? "Đang tạo..." : buttonText}
      </button>
    </form>
  );
}
