import React from 'react';
import Link from 'next/link';

interface SkeletonPageProps {
    title: string;
    description: string;
}

export function SkeletonPage({ title, description }: SkeletonPageProps) {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center animate-in fade-in duration-500 shadow-2xl">
                <div className="text-6xl mb-6 opacity-80">🚧</div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6 uppercase tracking-wider">
                    {title}
                </h1>
                <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-8">
                    {description}
                </p>
                <Link
                    href="/explore"
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition border border-white/20"
                >
                    Retourner à l'Exploration 3D
                </Link>
            </div>
        </div>
    );
}
