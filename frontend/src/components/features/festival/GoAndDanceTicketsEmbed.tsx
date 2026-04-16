"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Billetterie Go&dance — équivalent à tickets.js (iframe + postMessage hauteur).
 * - L'iframe est rendue en JSX avec `src` fixé au montage (comme une page HTML statique).
 * - On n'utilise pas tickets.js : il s'abonne à `window "load"`, déjà passé en navigation client.
 */
const GOANDANCE_EVENT_ID = "73c5a8cb-15a5-41bf-8903-6c76f3cc0bfa";
const GOANDANCE_WRAPPER_ID = `goandance-tickets-${GOANDANCE_EVENT_ID}`;
const GOANDANCE_TICKETS_PAGE = `https://www.goandance.com/en/event-tickets/${GOANDANCE_EVENT_ID}`;

interface GoAndDanceTicketsEmbedProps {
  compact?: boolean;
}

export function GoAndDanceTicketsEmbed({ compact = false }: GoAndDanceTicketsEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(GOANDANCE_TICKETS_PAGE);
    url.searchParams.set("referer", window.location.href);
    setIframeSrc(url.toString());
  }, []);

  useEffect(() => {
    if (!iframeSrc) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const goandanceIframeResize = (event: MessageEvent) => {
      if (event.origin === "https://www.goandance.com") {
        iframe.style.height = `${event.data}px`;
      }
    };
    window.addEventListener("message", goandanceIframeResize, false);
    return () => window.removeEventListener("message", goandanceIframeResize, false);
  }, [iframeSrc]);

  const containerClass = compact
    ? "w-full max-w-2xl rounded-2xl bg-white/5 border border-white/10 px-3 py-3 sm:px-4 sm:py-4"
    : "w-full max-w-4xl rounded-3xl bg-white/5 border border-white/10 px-4 py-4 sm:px-6 sm:py-5";
  
  const iframeClass = compact
    ? "w-full min-h-[375px] border-0 rounded-lg bg-white"
    : "w-full min-h-[500px] border-0 rounded-xl bg-white";
  
  const placeholderClass = compact
    ? "w-full min-h-[375px] rounded-lg bg-white/5 border border-white/10 animate-pulse"
    : "w-full min-h-[500px] rounded-xl bg-white/5 border border-white/10 animate-pulse";

  return (
    <>
      {/* START GOANDANCE INTEGRATION CODE */}
      <div className="w-full flex justify-center">
        <div className={containerClass}>
          <div id={GOANDANCE_WRAPPER_ID} className="goandance-tickets">
            {iframeSrc ? (
              <iframe
                ref={iframeRef}
                title="Billetterie Go&dance"
                src={iframeSrc}
                height={100}
                width="100%"
                frameBorder={0}
                scrolling="auto"
                className={iframeClass}
              />
            ) : (
              <div
                className={placeholderClass}
                aria-hidden
              />
            )}
            <div className={compact ? "mt-3 text-center text-xs text-white/50" : "mt-4 text-center text-sm text-white/50"}>
              Powered by{" "}
              <a
                href="https://www.goandance.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                go&dance
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* END GOANDANCE INTEGRATION CODE */}
    </>
  );
}
