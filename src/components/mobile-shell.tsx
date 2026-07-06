"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "今日", icon: "◉" },
  { href: "/goal", label: "目标", icon: "◆" },
  { href: "/plan", label: "计划", icon: "▣" },
  { href: "/actual", label: "实际", icon: "●" },
  { href: "/stats", label: "统计", icon: "⌁" },
  { href: "/cycles", label: "周期", icon: "↻" },
];

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#effaf6_0%,#f8faf5_42%,#f3f4f6_100%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fbfcf8] shadow-[0_0_40px_rgba(15,23,42,0.08)]">
        <main className="flex-1 pb-24">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-teal-100 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid grid-cols-6 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-14 flex-col items-center justify-center rounded-lg text-xs ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-zinc-500 hover:bg-teal-50 hover:text-teal-700"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
