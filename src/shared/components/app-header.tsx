import Link from "next/link";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string };

type AppHeaderProps = {
  homeHref: string;
  userName: string;
  nav: NavItem[];
  actions?: ReactNode;
};

export function AppHeader({ homeHref, userName, nav, actions }: AppHeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
              FS
            </span>
            <span className="font-bold tracking-tight text-stone-900">Fight Station</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-600 sm:inline">{userName}</span>
            {actions}
          </div>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
