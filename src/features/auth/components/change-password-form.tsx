"use client";

import { useActionState } from "react";
import { changePassword } from "../actions";
import { PasswordInput } from "./password-input";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="field-label">
        Mật khẩu cũ
        <PasswordInput name="oldPassword" autoComplete="current-password" />
      </label>
      <label className="field-label">
        Mật khẩu mới
        <PasswordInput name="newPassword" autoComplete="new-password" />
      </label>
      <label className="field-label">
        Nhập lại mật khẩu mới
        <PasswordInput name="confirmPassword" autoComplete="new-password" />
      </label>
      {state && !state.success && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error.message}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Đã đổi mật khẩu.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
