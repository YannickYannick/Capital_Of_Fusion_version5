"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/api";
import { createEvent, updateEvent, deleteEvent } from "@/lib/adminApi";
import type { EventApi } from "@/types/event";
import { AdminAddButton, AdminEditButton } from "@/components/admin/AdminEditButton";
import { AdminModal, AdminField, adminInputClass, adminTextareaClass, adminSelectClass } from "@/components/admin/AdminModal";

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "PARTY", label: "Soirée" },
  { value: "WORKSHOP", label: "Atelier" },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toDateTimeLocal(isoString: string | undefined): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  // remove trailing Z and adjust for timezone if needed, simple slice works for UTC approximation in inputs
  return d.toISOString().slice(0, 16);
}

function EventModal({
  event,
  onClose,
  onSuccess,
}: {
  event: EventApi | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!event;

  const [name, setName] = useState(event?.name || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [type, setType] = useState(event?.type || "PARTY");
  const [startDate, setStartDate] = useState(toDateTimeLocal(event?.start_date));
  const [endDate, setEndDate] = useState(toDateTimeLocal(event?.end_date));
  const [locationName, setLocationName] = useState(event?.location_name || "");
  const [description, setDescription] = useState(event?.description || "");

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      name,
      slug,
      type,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      location_name: locationName,
      description,
    };

    try {
      if (isEditing) {
        await updateEvent(event!.slug, payload);
      } else {
        await createEvent(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm("Supprimer cet événement ?")) return;
    setLoading(true);
    try {
      await deleteEvent(event!.slug);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={isEditing ? "Modifier l'événement" : "Nouvel événement"}
      onClose={onClose}
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      loading={loading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Nom" required>
            <input value={name} onChange={e => {
              setName(e.target.value);
              if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }} className={adminInputClass} />
          </AdminField>
          <AdminField label="Slug URL" required>
            <input value={slug} onChange={e => setSlug(e.target.value)} className={adminInputClass} />
          </AdminField>
        </div>

        <AdminField label="Type" required>
          <select value={type} onChange={e => setType(e.target.value)} className={adminSelectClass}>
            <option value="FESTIVAL">Festival</option>
            <option value="PARTY">Soirée</option>
            <option value="WORKSHOP">Atelier</option>
          </select>
        </AdminField>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Début" required>
            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={adminInputClass} />
          </AdminField>
          <AdminField label="Fin" required>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={adminInputClass} />
          </AdminField>
        </div>

        <AdminField label="Lieu">
          <input value={locationName} onChange={e => setLocationName(e.target.value)} className={adminInputClass} />
        </AdminField>

        <AdminField label="Description">
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={adminTextareaClass} rows={4} />
        </AdminField>
      </div>
    </AdminModal>
  );
}

export default function EvenementsPage() {
  const [events, setEvents] = useState<EventApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [upcoming, setUpcoming] = useState(true);

  // Admin state
  const [editingEvent, setEditingEvent] = useState<EventApi | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    getEvents({
      type: type || undefined,
      upcoming: upcoming,
    })
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [type, upcoming]);

  return (
    <div className="min-h-screen pt-64 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <AdminAddButton onAdd={() => setIsAdding(true)} label="Nouvel événement" />
        </div>

        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Agenda</p>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Nos <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Événements</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Festivals, soirées et stages intensifs. Ne manquez aucun rendez-vous de la communauté Bachata.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto mb-12">
          <label className="flex flex-col gap-2 text-sm text-white/80 font-medium flex-1 min-w-[200px]">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
            />
            À venir uniquement
          </label>
        </div>

        {error && <p className="mt-4 text-red-400" role="alert">{error}</p>}

        {loading ? (
          <p className="mt-8 text-white/60">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="mt-8 text-white/60">Aucun événement pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-200">
            {events.map((ev) => (
              <div key={ev.id} className="group relative h-full">
                <AdminEditButton onEdit={() => setEditingEvent(ev)} />
                <Link
                  href={`/evenements/${ev.slug}`}
                  className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1 block relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ev.type}
                    </span>
                    <span className="text-xs font-semibold text-white/50 bg-black/30 px-2 py-1 rounded-md text-right">
                      {formatDate(ev.start_date)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors w-11/12">{ev.name}</h2>

                  {ev.location_name && (
                    <p className="mt-auto pt-4 flex items-center gap-2 text-sm text-white/50 border-t border-white/5">
                      <span>📍</span> {ev.location_name}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}

        {(isAdding || editingEvent) && (
          <EventModal
            event={editingEvent}
            onClose={() => { setIsAdding(false); setEditingEvent(null); }}
            onSuccess={() => { setIsAdding(false); setEditingEvent(null); fetchEvents(); }}
          />
        )}
      </div>
    </div>
  );
}
