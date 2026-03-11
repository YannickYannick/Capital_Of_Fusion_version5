"use client";

import type { ReactNode } from "react";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const opts = usePlanetsOptions();
  
  return (
    <main className={`pt-16 ${opts.enableTextShadow ? "text-shadow-contrast" : ""}`}>
      {children}
    </main>
  );
}
