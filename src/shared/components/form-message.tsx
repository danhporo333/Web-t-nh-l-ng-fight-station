import type { ActionResult } from "@/lib/result";

type FormMessageProps = {
  state: ActionResult | undefined;
  successText: string;
};

export function FormMessage({ state, successText }: FormMessageProps) {
  if (!state) return null;
  if (state.success) {
    return (
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        {successText}
      </p>
    );
  }
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.error.message}
    </p>
  );
}
