"use client";

/**
 * Carte membre staff pour la page /organisation/staff.
 * Même style que ArtistCard : photo, nom, rôle et pôle.
 */
import Image from "next/image";
import type { StaffMemberApi } from "@/types/organization";
import { getApiBaseUrl } from "@/lib/api";

function staffPhotoUrl(member: StaffMemberApi): string {
  const pic = member.profile_picture;
  if (pic) {
    if (pic.startsWith("http")) return pic;
    const base = getApiBaseUrl();
    return `${base}${pic.startsWith("/") ? "" : "/"}${pic}`;
  }
  return "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop";
}

export function StaffCard({ member }: { member: StaffMemberApi }) {
  const fullName =
    `${member.first_name || ""} ${member.last_name || ""}`.trim() || member.username;
  const photoUrl = staffPhotoUrl(member);

  return (
    <div className="group bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block">
      <div className="relative aspect-[4/5]">
        <Image
          src={photoUrl}
          alt={fullName}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 to-transparent">
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition-colors uppercase italic tracking-tighter line-clamp-2">
            {fullName}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-[10px] font-bold uppercase tracking-widest">
            {member.staff_role_display && (
              <span className="text-purple-400/90">{member.staff_role_display}</span>
            )}
            {member.staff_role_display && member.pole && (
              <span className="text-white/30">·</span>
            )}
            {member.pole && (
              <span className="text-white/70 line-clamp-1">{member.pole.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
