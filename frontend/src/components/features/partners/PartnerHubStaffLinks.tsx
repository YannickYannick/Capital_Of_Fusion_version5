"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffOrSuperuser } from "@/lib/staffAccess";

export function PartnerHubStaffLinks() {
  const { user } = useAuth();
  const t = useTranslations("pages.partnerHub");
  const isStaff = isStaffOrSuperuser(user);
  if (!isStaff) return null;
  return (
    <p className="text-center text-sm text-amber-200/90 mb-10">
      <Link href="/partenaires/marques" className="underline underline-offset-2 hover:text-amber-100">
        {t("staffBrandsLink")}
      </Link>
    </p>
  );
}
