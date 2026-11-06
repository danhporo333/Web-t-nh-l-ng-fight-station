"use client";

import { useState } from "react";

type PasswordInputProps = {
  name: string;
  autoComplete: "current-password" | "new-password";
};

export function PasswordInput({ name, autoComplete }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-3 pr-16 text-base font-normal text-zinc-900"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 px-3 text-sm font-normal text-zinc-600"
      >
        {visible ? "Ẩn" : "Hiện"}
      </button>
    </div>
  );
}
