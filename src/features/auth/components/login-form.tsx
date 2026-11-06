"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="field-label">
        Tên đăng nhập
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="input"
        />
      </label>
      <label className="field-label">
        Mật khẩu
        <PasswordInput name="password" autoComplete="current-password" />
      </label>
      {state && !state.success && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
