"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Quote,
  LayoutTemplate,
  ChartNoAxesColumn,
  Radar,
  Send,
  CalendarDays,
  Flame,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";
import { useScriptComposer } from "@/components/providers";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/hook-vault", label: "Hook Vault", icon: Quote },
  { href: "/materials", label: "Materials", icon: LayoutTemplate },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesColumn },
  { href: "/competitors", label: "Competitor Tracker", icon: Radar },
  { href: "/scheduler", label: "Scheduler", icon: Send },
  { href: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/trending", label: "What's Trending", icon: Flame },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { openScript } = useScriptComposer();

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col gap-4 p-3">
      <AccountSwitcher />

      <Button
        className="w-full justify-start gap-2"
        onClick={() => {
          openScript();
          onNavigate?.();
        }}
      >
        <Plus />
        New script
      </Button>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="text-muted-foreground border-t px-2 pt-3 text-xs">
        <p className="font-medium">Tenfold Content OS</p>
        <p>Demo data · v1</p>
      </div>
    </div>
  );
}
