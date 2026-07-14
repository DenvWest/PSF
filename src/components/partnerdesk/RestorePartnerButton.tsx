"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { restorePartnerAction } from "@/lib/partnerdesk/actions";

export function RestorePartnerButton({
  partnerId,
  slug,
}: {
  partnerId: string;
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await restorePartnerAction({ partnerId, slug });
          router.refresh();
        })
      }
      className="text-xs text-[var(--ps-body)] hover:underline"
    >
      Herstel
    </button>
  );
}
