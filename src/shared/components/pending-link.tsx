"use client";

import Link, { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Spinner } from "./spinner";

type PendingIndicatorProps = {
  // true khi đang chờ hết thời gian trễ trước khi chuyển trang
  waiting: boolean;
};

// Phải là con của Link thì useLinkStatus mới biết Link đang chuyển trang.
function PendingIndicator({ waiting }: PendingIndicatorProps) {
  const { pending } = useLinkStatus();
  if (!pending && !waiting) return null;

  return (
    // Phủ toàn màn hình, vòng xoay ở giữa, và chặn mọi cú bấm trong lúc đang chuyển trang
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed inset-0 z-50 flex cursor-wait flex-col items-center justify-center gap-3 bg-white/70 text-sm font-medium text-stone-700"
    >
      <Spinner label="Đang chuyển trang" sizeClass="size-12" />
      Đang chuyển trang...
    </span>
  );
}

type PendingLinkProps = {
  href: string;
  className?: string;
  // Chờ bấy nhiêu mili giây (hiện vòng xoay) rồi mới chuyển trang. Mặc định chuyển ngay.
  delayMs?: number;
  children: ReactNode;
};

// Liên kết có vòng xoay giữa màn hình và chặn bấm lặp trong lúc chuyển trang.
export function PendingLink({ href, className = "", delayMs = 0, children }: PendingLinkProps) {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (delayMs <= 0) return;
    // Giữ nguyên hành vi mở tab mới (Ctrl, Cmd, Shift hoặc chuột giữa)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    if (waiting) return;
    setWaiting(true);
    timer.current = setTimeout(() => router.push(href), delayMs);
  }

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={handleClick}
      className={`relative inline-flex items-center gap-2 ${className}`}
    >
      {children}
      <PendingIndicator waiting={waiting} />
    </Link>
  );
}
