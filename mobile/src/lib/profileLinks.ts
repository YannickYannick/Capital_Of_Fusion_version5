/** Liens & contact — aligné backend `profile_external_links`. */

export type ProfileExternalLinks = {
  instagram: string[];
  websites: string[];
  facebook: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
};

export type ArtistLinkRow = {
  key: string;
  label: string;
  url: string;
};

function emptyLinks(): ProfileExternalLinks {
  return {
    instagram: [],
    websites: [],
    facebook: '',
    contact: { email: '', phone: '', whatsapp: '' },
  };
}

/** Normalise la réponse API (tableaux Instagram/sites, contact imbriqué). */
export function profileLinksFromApi(raw: unknown): ProfileExternalLinks {
  const links = emptyLinks();
  if (!raw || typeof raw !== 'object') return links;

  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.instagram)) {
    links.instagram = o.instagram.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3);
  }
  if (Array.isArray(o.websites)) {
    links.websites = o.websites.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3);
  }
  if (typeof o.facebook === 'string') links.facebook = o.facebook.trim();

  const contact = o.contact;
  if (contact && typeof contact === 'object') {
    const c = contact as Record<string, unknown>;
    links.contact = {
      email: String(c.email || '').trim(),
      phone: String(c.phone || '').trim(),
      whatsapp: String(c.whatsapp || '').trim(),
    };
  }

  return links;
}

function httpUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
}

/** Lignes cliquables pour l'écran artiste mobile. */
export function artistLinkRows(raw: unknown): ArtistLinkRow[] {
  const links = profileLinksFromApi(raw);
  const rows: ArtistLinkRow[] = [];

  links.instagram.forEach((url, index) => {
    rows.push({
      key: `instagram-${index}`,
      label: links.instagram.length > 1 ? `Instagram ${index + 1}` : 'Instagram',
      url: httpUrl(url),
    });
  });

  links.websites.forEach((url, index) => {
    rows.push({
      key: `website-${index}`,
      label: links.websites.length > 1 ? `Site web ${index + 1}` : 'Site web',
      url: httpUrl(url),
    });
  });

  if (links.facebook) {
    rows.push({ key: 'facebook', label: 'Facebook', url: httpUrl(links.facebook) });
  }

  const { email, phone, whatsapp } = links.contact;
  if (email) rows.push({ key: 'email', label: 'Email', url: `mailto:${email}` });
  if (phone) rows.push({ key: 'phone', label: 'Téléphone', url: `tel:${phone.replace(/\s/g, '')}` });
  if (whatsapp) {
    rows.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      url: `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
    });
  }

  return rows.filter((row) => Boolean(row.url));
}
