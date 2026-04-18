"use client";

import { useState } from "react";
import type { FaqItemApi } from "@/lib/api";

interface FaqAccordionProps {
  items: FaqItemApi[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/15 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/5"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-transparent hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] pr-2">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 text-white/90 flex-shrink-0 transition-transform duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden={true}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/95 whitespace-pre-wrap">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
