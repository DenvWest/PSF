"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  archivePartnerAction,
  removePartnerLogoAction,
  uploadPartnerLogoAction,
} from "@/lib/partnerdesk/actions";

export function PartnerAdminActions({
  partnerId,
  slug,
  hasLogo,
}: {
  partnerId: string;
  slug: string;
  hasLogo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("partnerId", partnerId);
    fd.set("slug", slug);
    setError(null);
    startTransition(async () => {
      const result = await uploadPartnerLogoAction(fd);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--ps-body)]">
      <label className="cursor-pointer hover:underline">
        {hasLogo ? "Logo vervangen" : "Logo toevoegen"}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogo} disabled={pending} className="hidden" />
      </label>
      {hasLogo && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await removePartnerLogoAction({ partnerId, slug });
              router.refresh();
            })
          }
          className="hover:underline"
        >
          Logo weg
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Partner archiveren? Open taken vervallen en signalen sluiten.")) {
            startTransition(async () => {
              const result = await archivePartnerAction({ partnerId });
              if (!result.ok) setError(result.error);
              else router.push("/admin/partners");
            });
          }
        }}
        className="hover:underline"
      >
        Archiveer
      </button>
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}
