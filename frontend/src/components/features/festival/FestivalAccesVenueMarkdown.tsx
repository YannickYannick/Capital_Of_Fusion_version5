"use client";

import { EditableConfigMarkdownPage } from "@/components/shared/EditableConfigMarkdownPage";
import { SiteEntryPlanMedia } from "@/components/features/festival/SiteEntryPlanMedia";
import {
  ACCES_VENUE_SITE_ENTRY_ASPECT,
  ACCES_VENUE_SITE_ENTRY_IMAGE_SRC,
  ACCES_VENUE_SITE_ENTRY_VIDEO_SRC,
  FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC,
  SITE_ENTRY_PLAN_MARKDOWN_TOKEN,
} from "@/data/festivalAccesVenueFallback";

export type FestivalAccesVenueMarkdownProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  initialValue: string;
  emptyText: string;
  siteEntryPlanImageAlt: string;
  siteEntryPlanVideoAria: string;
  siteEntryPlanShowVideo: string;
  siteEntryPlanShowPhoto: string;
};

/**
 * Page Accès & Venue — wrapper client pour injecter SiteEntryPlanMedia
 * au token [SITE_ENTRY_PLAN] (non sérialisable depuis un Server Component).
 */
export function FestivalAccesVenueMarkdown({
  eyebrow,
  title,
  subtitle,
  initialValue,
  emptyText,
  siteEntryPlanImageAlt,
  siteEntryPlanVideoAria,
  siteEntryPlanShowVideo,
  siteEntryPlanShowPhoto,
}: FestivalAccesVenueMarkdownProps) {
  return (
    <EditableConfigMarkdownPage
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      initialValue={initialValue}
      field="festival_acces_venue_markdown"
      emptyText={emptyText}
      titleBeforeVideo
      heroVideo={{
        src: FESTIVAL_ACCES_VENUE_TEASER_VIDEO_SRC,
        ariaLabel: title,
        controls: false,
      }}
      markdownEmbed={{
        token: SITE_ENTRY_PLAN_MARKDOWN_TOKEN,
        node: (
          <SiteEntryPlanMedia
            imageSrc={ACCES_VENUE_SITE_ENTRY_IMAGE_SRC}
            videoSrc={ACCES_VENUE_SITE_ENTRY_VIDEO_SRC}
            imageAlt={siteEntryPlanImageAlt}
            videoAriaLabel={siteEntryPlanVideoAria}
            showVideoLabel={siteEntryPlanShowVideo}
            showPhotoLabel={siteEntryPlanShowPhoto}
            aspectWidth={ACCES_VENUE_SITE_ENTRY_ASPECT.width}
            aspectHeight={ACCES_VENUE_SITE_ENTRY_ASPECT.height}
          />
        ),
      }}
    />
  );
}
