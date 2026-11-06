"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

type NavLinksProps = {
  items: NavItem[];
  // Đường dẫn trang chủ của khu vực (ví dụ /admin), chỉ sáng khi đúng trang đó, không sáng ở trang con
  homeHref: string;
};

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, homeHref }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = isActive(pathname, item.href, homeHref);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "whitespace-nowrap rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                : "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
