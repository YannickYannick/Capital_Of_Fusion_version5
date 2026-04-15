"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePlanetsOptions } from "@/contexts/PlanetsOptionsContext";
import { prefetchExploreModules, usePrefetchExplore } from "@/hooks/usePrefetchExplore";

export default function LandingPageClient() {
    const router = useRouter();
    const t = useTranslations("landing");
    const opts = usePlanetsOptions();
    const [isTransitioning, setIsTransitioning] = useState(false);

    usePrefetchExplore(3000);

    const handleStartPushed = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsTransitioning(true);
        opts.setBatch({
            isTransitioningToExplore: true,
            showExploreLoadingModal: true,
        });
        window.setTimeout(() => {
            router.push("/explore");
        }, 120);
    };

    return (
        <div
          className="flex flex-col items-center justify-center px-6 py-16 relative"
          style={{ minHeight: "calc(100vh - var(--app-header-height, 4rem))" }}
        >
            {!isTransitioning ? (
                <section className="relative z-10 max-w-3xl mx-auto text-center">
                    <p className="text-sm uppercase tracking-widest text-purple-300/90 mb-4">
                        {t("badge")}
                    </p>
                    <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                        {t("title")}
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed">
                        {t("subtitle1")}
                        <br />
                        {t("subtitle2")}
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-4 justify-center">
                        <a
                            href="/explore"
                            onClick={handleStartPushed}
                            onMouseEnter={prefetchExploreModules}
                            onFocus={prefetchExploreModules}
                            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition cursor-pointer relative overflow-hidden group"
                        >
                            <span className="relative z-10">{t("ctaExplore")}</span>
                        </a>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                            <a
                                href="https://www.goandance.com/en/event/8924/paris-bachata-vibe-festival-2026?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnprgCFDBKaBIcXNxli3o4eSeZW2PkudBsk3Noz0zPCH1myeSa1TemsZFcRKo_aem_IPghO3-MUFniUMOa5ucZUg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-lg border border-white/30 hover:bg-white/10 text-white font-medium transition text-center"
                            >
                                Book your pass
                            </a>
                            <a
                                href="https://all.accor.com/a/fr.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-lg border border-white/30 hover:bg-white/10 text-white font-medium transition text-center"
                            >
                                Book your hôtel
                            </a>
                            <a
                                href="https://bachatagenevafestival.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-lg border border-white/30 hover:bg-white/10 text-white font-medium transition text-center"
                            >
                                Notre programme
                            </a>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-white/50">
                        {t("footerLine")}
                    </p>

                    <div className="mt-5 flex justify-center">
                        <Image
                            src="/pbv-logo.png"
                            alt="Paris Bachata Vibe Festival"
                            width={260}
                            height={260}
                            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 220px, 240px"
                            className="h-auto w-[min(42vw,240px)] max-h-[18vh] object-contain opacity-95 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
                            priority
                        />
                    </div>
                </section>
            ) : null}
        </div>
    );
}
