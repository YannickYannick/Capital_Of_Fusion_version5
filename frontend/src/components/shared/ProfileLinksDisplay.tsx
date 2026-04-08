"use client";

import type { ReactNode } from "react";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconWorld,
} from "@tabler/icons-react";
import type { ProfileExternalLinks } from "@/types/profileLinks";
import { instagramDisplayLabel, websiteDisplayLabel } from "@/lib/socialLinkLabels";

function linkOrNull(href: string, label: string, icon: ReactNode) {
  const h = href.trim();
  if (!h) return null;
  const url = h.startsWith("http") ? h : `https://${h}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-white/80 hover:text-amber-300 transition-colors break-words"
    >
      <span className="flex-shrink-0 opacity-70">{icon}</span>
      {label}
    </a>
  );
}

export function ProfileLinksDisplay({
  links,
  accent = "amber",
}: {
  links: ProfileExternalLinks;
  accent?: "amber" | "purple";
}) {
  const ring =
    accent === "purple"
      ? "border-purple-500/25 bg-purple-500/5"
      : "border-amber-500/25 bg-amber-500/5";
  const title =
    accent === "purple" ? "text-purple-300/90" : "text-amber-200/90";

  const ig = links.instagram.filter(Boolean);
  const ws = links.websites.filter(Boolean);
  const fb = links.facebook.trim();
  const { email, phone, whatsapp } = links.contact;
  const hasContact = email || phone || whatsapp;

  if (ig.length === 0 && ws.length === 0 && !fb && !hasContact) return null;

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-sm ${ring}`}>
      <h3 className={`text-xs uppercase tracking-[0.25em] font-black mb-4 ${title}`}>
        Liens & contact
      </h3>
      <div className="space-y-4">
        {ig.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Instagram</p>
            <ul className="space-y-2">
              {ig.map((u, i) => (
                <li key={`ig-${i}`}>
                  {linkOrNull(u, instagramDisplayLabel(u), <IconBrandInstagram size={18} />)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ws.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Sites web</p>
            <ul className="space-y-2">
              {ws.map((u, i) => (
                <li key={`w-${i}`}>
                  {linkOrNull(u, websiteDisplayLabel(u), <IconWorld size={18} />)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {fb &&
          linkOrNull(
            fb,
            "Facebook",
            <IconBrandFacebook size={18} />
          )}
        {hasContact && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Contact</p>
            <ul className="space-y-2">
              {email ? (
                <li>{linkOrNull(`mailto:${email}`, email, <IconMail size={18} />)}</li>
              ) : null}
              {phone ? (
                <li>{linkOrNull(`tel:${phone.replace(/\s/g, "")}`, phone, <IconPhone size={18} />)}</li>
              ) : null}
              {whatsapp ? (
                <li>
                  {linkOrNull(
                    `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
                    "WhatsApp",
                    <IconBrandWhatsapp size={18} />
                  )}
                </li>
              ) : null}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
