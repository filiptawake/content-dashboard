"use client";

import { DashboardProvider } from "./dashboard-provider";
import { ScriptComposerProvider } from "./script-composer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <TooltipProvider delayDuration={150}>
        <ScriptComposerProvider>{children}</ScriptComposerProvider>
      </TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
    </DashboardProvider>
  );
}

export { useDashboard } from "./dashboard-provider";
export { useScriptComposer } from "./script-composer";
