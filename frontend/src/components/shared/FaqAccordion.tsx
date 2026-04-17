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
            className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white">{item.question}</span>
              <svg
                className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
              <div className="px-5 pb-4 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
