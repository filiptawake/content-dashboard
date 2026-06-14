"use client";

import * as React from "react";

import type { Account, Hook, ScheduledPost } from "@/lib/types";
import { accounts as seedAccounts, primaryAccount } from "@/data/accounts";
import { seedHooks } from "@/data/hooks";
import { seedSchedule } from "@/data/schedule";

interface DashboardContextValue {
  accounts: Account[];
  activeAccount: Account;
  setActiveAccountId: (id: string) => void;

  /** All hooks across accounts (stateful — grows as you save). */
  hooks: Hook[];
  /** Hooks belonging to the active account, newest first. */
  accountHooks: Hook[];
  addHook: (hook: Hook) => void;

  /** All scheduled posts across accounts (stateful — grows via /script). */
  scheduledPosts: ScheduledPost[];
  /** Scheduled posts for the active account. */
  accountPosts: ScheduledPost[];
  addScheduledPost: (post: ScheduledPost) => void;
}

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeAccountId, setActiveAccountId] = React.useState(
    primaryAccount.id,
  );
  const [hooks, setHooks] = React.useState<Hook[]>(seedHooks);
  const [scheduledPosts, setScheduledPosts] =
    React.useState<ScheduledPost[]>(seedSchedule);

  const activeAccount =
    seedAccounts.find((a) => a.id === activeAccountId) ?? primaryAccount;

  const addHook = React.useCallback((hook: Hook) => {
    setHooks((prev) =>
      prev.some((h) => h.id === hook.id) ? prev : [hook, ...prev],
    );
  }, []);

  const addScheduledPost = React.useCallback((post: ScheduledPost) => {
    setScheduledPosts((prev) => [...prev, post]);
  }, []);

  const accountHooks = React.useMemo(
    () =>
      hooks
        .filter((h) => h.accountId === activeAccountId)
        .sort((a, b) => +new Date(b.savedAt) - +new Date(a.savedAt)),
    [hooks, activeAccountId],
  );

  const accountPosts = React.useMemo(
    () => scheduledPosts.filter((p) => p.accountId === activeAccountId),
    [scheduledPosts, activeAccountId],
  );

  const value = React.useMemo<DashboardContextValue>(
    () => ({
      accounts: seedAccounts,
      activeAccount,
      setActiveAccountId,
      hooks,
      accountHooks,
      addHook,
      scheduledPosts,
      accountPosts,
      addScheduledPost,
    }),
    [
      activeAccount,
      hooks,
      accountHooks,
      addHook,
      scheduledPosts,
      accountPosts,
      addScheduledPost,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = React.useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
