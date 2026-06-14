"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { useDashboard } from "@/components/providers";
import { GradientAvatar } from "@/components/gradient-avatar";
import { formatCompact } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccountId } = useDashboard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-sidebar-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-colors focus-visible:ring-2">
        <GradientAvatar
          seed={activeAccount.handle}
          gradient={activeAccount.gradient}
          className="size-9"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {activeAccount.handle}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {formatCompact(activeAccount.followers)} followers
          </p>
        </div>
        <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Switch account
        </DropdownMenuLabel>
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => setActiveAccountId(account.id)}
            className="gap-3 py-2"
          >
            <GradientAvatar
              seed={account.handle}
              gradient={account.gradient}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{account.handle}</p>
              <p className="text-muted-foreground truncate text-xs">
                {formatCompact(account.followers)} followers
              </p>
            </div>
            {account.id === activeAccount.id && (
              <Check className="text-primary size-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs">
          + Connect another account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
