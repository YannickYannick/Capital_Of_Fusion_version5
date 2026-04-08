"use client";

import type { ProfileLinksFormState } from "@/types/profileLinks";

interface ProfileLinksFormFieldsProps {
  value: ProfileLinksFormState;
  onChange: (next: ProfileLinksFormState) => void;
  inputClass: string;
}

export function ProfileLinksFormFields({ value, onChange, inputClass }: ProfileLinksFormFieldsProps) {
  const setIg = (i: number, s: string) => {
    const ig: [string, string, string] = [...value.instagram] as [string, string, string];
    ig[i] = s;
    onChange({ ...value, instagram: ig });
  };
  const setWs = (i: number, s: string) => {
    const ws: [string, string, string] = [...value.websites] as [string, string, string];
    ws[i] = s;
    onChange({ ...value, websites: ws });
  };
  const setContact = (k: keyof ProfileLinksFormState["contact"], s: string) => {
    onChange({ ...value, contact: { ...value.contact, [k]: s } });
  };

  return (
    <div className="space-y-4 border border-white/10 rounded-xl p-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Liens & contact</p>
      <div className="space-y-2">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Instagram (jusqu&apos;à 3)</p>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="url"
            value={value.instagram[i]}
            onChange={(e) => setIg(i, e.target.value)}
            placeholder={`URL Instagram ${i + 1}`}
            className={inputClass}
          />
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Sites web (jusqu&apos;à 3)</p>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="url"
            value={value.websites[i]}
            onChange={(e) => setWs(i, e.target.value)}
            placeholder={`URL site ${i + 1}`}
            className={inputClass}
          />
        ))}
      </div>
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Facebook</p>
        <input
          type="url"
          value={value.facebook}
          onChange={(e) => onChange({ ...value, facebook: e.target.value })}
          placeholder="URL page Facebook"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">E-mail</p>
          <input
            type="email"
            value={value.contact.email}
            onChange={(e) => setContact("email", e.target.value)}
            placeholder="contact@…"
            className={inputClass}
          />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Téléphone</p>
          <input
            type="tel"
            value={value.contact.phone}
            onChange={(e) => setContact("phone", e.target.value)}
            placeholder="+33…"
            className={inputClass}
          />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">WhatsApp</p>
          <input
            type="tel"
            value={value.contact.whatsapp}
            onChange={(e) => setContact("whatsapp", e.target.value)}
            placeholder="Indicatif + numéro"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
