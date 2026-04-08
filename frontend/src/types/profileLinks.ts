/**
 * Liens & contact (aligné backend apps.core.profile_external_links).
 */

export interface ProfileExternalLinks {
  instagram: string[];
  websites: string[];
  facebook: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
}

export function emptyProfileExternalLinks(): ProfileExternalLinks {
  return {
    instagram: [],
    websites: [],
    facebook: "",
    contact: { email: "", phone: "", whatsapp: "" },
  };
}

/** Normalise la réponse API (max 3 / max 3 / 1 FB). */
export function profileLinksFromApi(raw: unknown): ProfileExternalLinks {
  const e = emptyProfileExternalLinks();
  if (!raw || typeof raw !== "object") return e;
  const o = raw as Record<string, unknown>;
  const ig = o.instagram;
  if (Array.isArray(ig)) {
    e.instagram = ig.map((x) => String(x || "").trim()).filter(Boolean).slice(0, 3);
  }
  const ws = o.websites;
  if (Array.isArray(ws)) {
    e.websites = ws.map((x) => String(x || "").trim()).filter(Boolean).slice(0, 3);
  }
  if (typeof o.facebook === "string") e.facebook = o.facebook.trim();
  const c = o.contact;
  if (c && typeof c === "object") {
    const cx = c as Record<string, unknown>;
    e.contact = {
      email: String(cx.email || "").trim(),
      phone: String(cx.phone || "").trim(),
      whatsapp: String(cx.whatsapp || "").trim(),
    };
  }
  return e;
}

/** Pour formulaires : 3 champs Instagram + 3 sites (souvent vides). */
export type ProfileLinksFormState = {
  instagram: [string, string, string];
  websites: [string, string, string];
  facebook: string;
  contact: ProfileExternalLinks["contact"];
};

export function profileLinksToFormState(links: ProfileExternalLinks): ProfileLinksFormState {
  const pad = (arr: string[], n: number) => {
    const out = [...arr];
    while (out.length < n) out.push("");
    return out.slice(0, n) as [string, string, string];
  };
  return {
    instagram: pad(links.instagram, 3),
    websites: pad(links.websites, 3),
    facebook: links.facebook,
    contact: { ...links.contact },
  };
}

export function formStateToProfilePayload(form: ProfileLinksFormState): ProfileExternalLinks {
  return {
    instagram: form.instagram.map((s) => s.trim()).filter(Boolean).slice(0, 3),
    websites: form.websites.map((s) => s.trim()).filter(Boolean).slice(0, 3),
    facebook: form.facebook.trim(),
    contact: {
      email: form.contact.email.trim(),
      phone: form.contact.phone.trim(),
      whatsapp: form.contact.whatsapp.trim(),
    },
  };
}
