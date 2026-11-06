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
        className="input pr-16"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-stone-500 hover:text-stone-800"
      >
        {visible ? "Ẩn" : "Hiện"}
      </button>
    </div>
  );
}
