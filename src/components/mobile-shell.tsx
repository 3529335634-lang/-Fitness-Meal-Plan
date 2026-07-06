"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "今日", icon: "◎" },
  { href: "/goal", label: "目标", icon: "◇" },
  { href: "/plan", label: "计划", icon: "□" },
  { href: "/actual", label: "实际", icon: "●" },
  { href: "/stats", label: "统计", icon: "⌁" },
  { href: "/cycles", label: "周期", icon: "↺" },
];

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
        <main className="flex-1 pb-24">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-zinc-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
          <div className="grid grid-cols-6 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-14 flex-col items-center justify-center rounded-lg text-xs ${
                    active ? "bg-zinc-950 text-white" : "text-zinc-500"
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
