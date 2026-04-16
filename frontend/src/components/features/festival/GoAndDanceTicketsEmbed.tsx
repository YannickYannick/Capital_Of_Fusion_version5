"use client";

import { useEffect, useRef } from "react";

/**
 * Intégration Go&dance — widget billetterie en iframe.
 * Utilisé sur la page /festival/book-your-hotel.
 */
export function GoAndDanceTicketsEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.id = "goandance-tickets-73c5a8cb-15a5-41bf-8903-6c76f3cc0bfa";
    wrapper.className = "goandance-tickets";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://www.goandance.com/en/event/73c5a8cb-15a5-41bf-8903-6c76f3cc0bfa/tickets.js";
    script.async = true;

    const iframeMount = document.createElement("div");
    iframeMount.id =
      "goandance-tickets-73c5a8cb-15a5-41bf-8903-6c76f3cc0bfa-iframe";

    wrapper.appendChild(script);
    wrapper.appendChild(iframeMount);
    container.appendChild(wrapper);

    // Ajuster visuellement l'iframe une fois que Go&dance l'a injectée.
    const start = performance.now();
    const maxMs = 8000;
    const tick = () => {
      if (!container.isConnected) return;
      const iframe = container.querySelector("iframe");
      if (iframe) {
        const style = (iframe as HTMLIFrameElement).style;
        style.width = "100%";
        style.maxWidth = "960px";
        style.border = "none";
        style.borderRadius = "18px";
        style.backgroundColor = "#ffffff";
        style.height = "640px";
        return;
      }
      if (performance.now() - start < maxMs) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="w-full max-w-4xl rounded-3xl bg-white/5 border border-white/10 px-4 py-4 sm:px-6 sm:py-5"
      />
    </div>
  );
}

