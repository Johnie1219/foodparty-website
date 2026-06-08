"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "검색" },
  { href: "/catalog", label: "카탈로그" },
  { href: "/admin", label: "관리자" },
];

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="global-nav sticky top-0 z-30">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight text-white">
          헬스픽
        </Link>
        <div className="flex items-center gap-5">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[12px] transition-colors ${
                  active ? "text-white" : "text-[var(--color-body-muted)] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
