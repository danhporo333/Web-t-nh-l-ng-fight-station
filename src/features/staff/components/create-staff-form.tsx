"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaff } from "../actions";
import { FormMessage } from "@/shared/components/form-message";

type CreateStaffFormProps = {
  onDone: () => void;
  onCancel: () => void;
};

export function CreateStaffForm({ onDone, onCancel }: CreateStaffFormProps) {
  const [state, action, pending] = useActionState(createStaff, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onDone();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <h2 className="font-semibold text-stone-900">Thêm nhân viên</h2>
      <label className="field-label">
        Họ tên
        <input name="fullName" required maxLength={100} autoFocus className="input" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Tên đăng nhập
          <input name="username" required autoCapitalize="none" autoComplete="off" className="input" />
        </label>
        <label className="field-label">
          Mật khẩu ban đầu
          <input name="password" required autoComplete="off" className="input" />
        </label>
      </div>
      <label className="field-label">
        Lương mặc định mọi ca (đ/giờ, có thể để trống)
        <input name="defaultRate" inputMode="numeric" placeholder="Ví dụ 27000" className="input" />
      </label>
      <FormMessage state={state} successText="Đã tạo nhân viên." />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Đang tạo..." : "Tạo nhân viên"}
        </button>
      </div>
    </form>
  );
}
