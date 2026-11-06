"use client";

import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { Spinner } from "@/shared/components/spinner";

// Phải là con của Link thì useLinkStatus mới biết Link đang chuyển trang.
function PendingOverlay() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span
      // Chặn bấm thêm lần nữa trong lúc đang mở trang chi tiết
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute inset-0 z-10 flex cursor-wait items-center justify-center gap-2 rounded-2xl bg-white/75 text-sm font-medium text-stone-700"
    >
      <Spinner label="Đang mở chi tiết" />
      Đang mở...
    </span>
  );
}

type PayrollCardLinkProps = {
  href: string;
  children: ReactNode;
};

export function PayrollCardLink({ href, children }: PayrollCardLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="card relative block transition hover:border-red-300 hover:shadow-md"
    >
      {children}
      <PendingOverlay />
    </Link>
  );
}
