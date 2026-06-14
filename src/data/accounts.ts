import type { Account } from "@/lib/types";

// The brand at the top of the sidebar is the FIRST account here.
export const accounts: Account[] = [
  {
    id: "tenfoldmarc",
    handle: "@tenfoldmarc",
    name: "Marc — Tenfold",
    niche: "ai",
    followers: 184200,
    gradient: ["#E2725B", "#9A3F2B"],
  },
  {
    id: "marcbuilds",
    handle: "@marcbuilds",
    name: "Marc Builds",
    niche: "business",
    followers: 42800,
    gradient: ["#C9823B", "#7A4A1E"],
  },
  {
    id: "clipsbymarc",
    handle: "@clipsbymarc",
    name: "Clips by Marc",
    niche: "marketing",
    followers: 11500,
    gradient: ["#5B8FE2", "#2B4F9A"],
  },
];

export const primaryAccount = accounts[0];

export function getAccount(id: string): Account {
  return accounts.find((a) => a.id === id) ?? primaryAccount;
}
