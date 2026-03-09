"use client";

import { motion } from "framer-motion";
import { IconFileText, IconCloudDownload, IconSearch } from "@tabler/icons-react";
import { StandardPageShell, StandardPageHero } from "@/components/shared/StandardPage";

const documents = [
  { id: 1, title: "Statuts de l'association", category: "Administratif", date: "2024-01-15", size: "1.2 MB" },
  { id: 2, title: "Règlement intérieur", category: "Administratif", date: "2024-01-20", size: "850 KB" },
  { id: 3, title: "Planning annuel des cours", category: "Planning", date: "2024-02-01", size: "2.4 MB" },
  { id: 4, title: "Charte graphique CoF", category: "Design", date: "2023-11-10", size: "5.1 MB" },
];

export default function FichiersPage() {
  return (
    <StandardPageShell>
      <div className="max-w-7xl mx-auto text-white">
        <StandardPageHero
          eyebrow="Ressources"
          title="Bibliothèque"
          highlight="fichiers"
          description="Consultez et téléchargez les documents officiels, plannings et ressources de Capital of Fusion."
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-12 max-w-md mx-auto"
        >
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                  <IconFileText size={24} />
                </div>
                <button className="text-white/20 hover:text-purple-400 transition-colors" aria-label="Télécharger">
                  <IconCloudDownload size={20} />
                </button>
              </div>
              <h3 className="text-lg font-bold mb-1 truncate group-hover:text-purple-300 transition-colors">
                {doc.title}
              </h3>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-white/30">
                <span>{doc.category}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span>{doc.size}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 sm:p-12 rounded-[3rem] bg-gradient-to-br from-purple-900/20 to-transparent border border-white/5 text-center"
        >
          <p className="text-white/40 text-sm font-medium italic">
            Besoin d'un document spécifique non répertorié ?
          </p>
          <p className="text-white/20 text-xs mt-1">
            Contactez le pôle administratif via le <span className="text-purple-500/50">staff CoF</span>.
          </p>
        </motion.div>
      </div>
    </StandardPageShell>
  );
}
