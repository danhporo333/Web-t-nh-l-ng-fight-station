"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Tên đăng nhập
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base font-normal text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Mật khẩu
        <PasswordInput name="password" autoComplete="current-password" />
      </label>
      {state && !state.success && (
        <p role="alert" className="text-sm text-red-600">
          {state.error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-zinc-900 text-white disabled:opacity-60"
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
