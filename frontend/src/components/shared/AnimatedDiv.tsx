"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface AnimatedDivProps {
    children: ReactNode;
    className?: string;
    /** Animation delay in seconds */
    delay?: number;
    /** Animation type */
    animation?: "fadeIn" | "fadeInUp" | "fadeInScale";
    /** Whether to trigger once when in view (default: true) */
    once?: boolean;
    /** Custom style */
    style?: CSSProperties;
}

/**
 * Lightweight CSS-based animation wrapper.
 * Replaces framer-motion for simple fade/slide animations.
 * ~0.5KB vs framer-motion's ~50KB.
 */
export function AnimatedDiv({
    children,
    className = "",
    delay = 0,
    animation = "fadeIn",
    once = true,
    style,
}: AnimatedDivProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [once]);

    const animationClass = isVisible ? `animate-${animation}` : "opacity-0";

    return (
        <div
            ref={ref}
            className={`${animationClass} ${className}`}
            style={{
                animationDelay: `${delay}s`,
                animationFillMode: "both",
                ...style,
            }}
        >
            {children}
        </div>
    );
}
