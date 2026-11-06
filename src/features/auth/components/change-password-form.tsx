"use client";

import { useActionState } from "react";
import { changePassword } from "../actions";
import { PasswordInput } from "./password-input";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Mật khẩu cũ
        <PasswordInput name="oldPassword" autoComplete="current-password" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Mật khẩu mới
        <PasswordInput name="newPassword" autoComplete="new-password" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Nhập lại mật khẩu mới
        <PasswordInput name="confirmPassword" autoComplete="new-password" />
      </label>
      {state && !state.success && (
        <p role="alert" className="text-sm text-red-600">
          {state.error.message}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm text-green-700">
          Đã đổi mật khẩu.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-zinc-900 text-white disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
