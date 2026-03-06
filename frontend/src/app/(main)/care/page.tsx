"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const sections = [
    {
        title: "Soins & Récupération",
        description: "Prenez soin de votre corps avec nos services dédiés aux danseurs.",
        href: "/care/soins",
        image: "https://images.unsplash.com/photo-1544126592-807daa2b565b?w=800&auto=format&fit=crop"
    },
    {
        title: "Nos Praticiens",
        description: "Découvrez l'équipe d'experts qui vous accompagne.",
        href: "/care/praticiens",
        image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop"
    },
    {
        title: "Réservation",
        description: "Prenez rendez-vous en ligne en quelques clics.",
        href: "/care/reservation",
        image: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&auto=format&fit=crop"
    }
];

export default function CareHubPage() {
    return (
        <div className="min-h-screen bg-black text-white py-32 px-8 md:px-16">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center"
                >
                    <span className="text-purple-500 font-black uppercase tracking-[0.3em] text-[10px]">Espace Bien-être</span>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mt-4 italic">CAPITAL <span className="text-purple-500">CARE</span></h1>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto mt-6 font-light">
                        Prévention, soin et performance. Un accompagnement holistique pour prolonger votre passion.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {sections.map((section, idx) => (
                        <Link key={idx} href={section.href}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative h-[500px] overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.01]"
                            >
                                <Image
                                    src={section.image}
                                    alt={section.title}
                                    fill
                                    className="object-cover transition-all duration-700 grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-10">
                                    <h2 className="text-3xl font-black italic tracking-tighter mb-4 italic uppercase">{section.title}</h2>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        {section.description}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
