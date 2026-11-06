"use client";

import { useActionState, useEffect, useRef } from "react";
import { resetPassword } from "../actions";
import { FormMessage } from "@/shared/components/form-message";

type ResetPasswordFormProps = { staffId: number };

export function ResetPasswordForm({ staffId }: ResetPasswordFormProps) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={staffId} />
      <label className="field-label">
        Mật khẩu mới
        <input name="newPassword" required autoComplete="off" className="input" />
      </label>
      <FormMessage state={state} successText="Đã đặt lại mật khẩu. Hãy báo cho nhân viên." />
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Đang lưu..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}
