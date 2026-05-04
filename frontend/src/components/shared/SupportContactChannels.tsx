/** Liens de contact directs (WhatsApp, e-mail), présentation type carte modale claire sur fond sombre. */

const WHATSAPP_WA_ME = "33629059644";
export const SUPPORT_CONTACT_EMAIL = "cofmovement.france@gmail.com";
export const SUPPORT_WHATSAPP_DISPLAY = "+33 6 29 05 96 44";

type SupportContactChannelsProps = {
  headerTitle: string;
  introBefore: string;
  introHighlight: string;
  introAfter: string;
  whatsappLabel: string;
  emailLabel: string;
  whatsappLinkLabel: string;
  emailLinkLabel: string;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width={28} height={28}>
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      width={28}
      height={28}
    >
      <rect x={2} y={4} width={20} height={16} rx={2} />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SupportContactChannels({
  headerTitle,
  introBefore,
  introHighlight,
  introAfter,
  whatsappLabel,
  emailLabel,
  whatsappLinkLabel,
  emailLinkLabel,
}: SupportContactChannelsProps) {
  const waUrl = `https://wa.me/${WHATSAPP_WA_ME}`;
  const mailUrl = `mailto:${SUPPORT_CONTACT_EMAIL}`;

  return (
    <div
      className="mt-8 rounded-2xl overflow-hidden border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)] max-w-2xl mx-auto"
      data-testid="support-contact-channels"
    >
      <div className="bg-gradient-to-r from-[#f97316] to-[#e11d8c] px-4 py-3 md:px-5 md:py-3.5 flex items-center justify-between gap-3">
        <h2 className="text-sm md:text-base font-bold text-white truncate min-w-0">{headerTitle}</h2>
      </div>
      <div className="bg-white text-gray-900 px-5 py-6 md:px-8 md:py-8">
        <p className="text-center text-gray-800 text-sm md:text-base leading-relaxed">
          {introBefore}
          <strong className="font-semibold text-gray-950">{introHighlight}</strong>
          {introAfter}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-14">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d8c] focus-visible:ring-offset-2 rounded-lg"
            aria-label={whatsappLinkLabel}
          >
            <WhatsAppIcon className="text-[#f97316] w-8 h-8 md:w-9 md:h-9 transition group-hover:scale-105" />
            <span className="font-bold text-[#d9469a] md:text-lg">{whatsappLabel}</span>
            <span className="text-xs text-gray-600 max-w-[14rem]">{SUPPORT_WHATSAPP_DISPLAY}</span>
          </a>
          <a
            href={mailUrl}
            className="group flex flex-col items-center gap-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e11d8c] focus-visible:ring-offset-2 rounded-lg"
            aria-label={emailLinkLabel}
          >
            <MailIcon className="text-[#f97316] w-8 h-8 md:w-9 md:h-9 transition group-hover:scale-105" />
            <span className="font-bold text-[#d9469a] md:text-lg">{emailLabel}</span>
            <span className="text-xs text-gray-600 break-all max-w-[14rem]">{SUPPORT_CONTACT_EMAIL}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
