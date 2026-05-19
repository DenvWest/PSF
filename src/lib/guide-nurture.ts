import { Resend } from "resend";
import { guideSourceForThema } from "@/data/gids";
import { getGuideNurtureEmailContent } from "@/lib/email-templates/guide-nurture";
import { GUIDE_SEQUENCE_DAYS } from "@/lib/email-templates/guide-nurture/types";
import { guideTemplateKey } from "@/lib/guide-consent";
import { buildGuideUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import type { GuideThema } from "@/types/guide-opt-in";

export async function hasActiveGuideSequence(
  email: string,
  thema: GuideThema,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const source = guideSourceForThema(thema);
  const { data, error } = await supabase
    .from("nurture_emails")
    .select("id")
    .eq("email", email)
    .eq("source", source)
    .in("status", ["pending", "sent"])
    .limit(1);

  if (error) {
    console.error("[guide-nurture] active check:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function scheduleGuideNurtureSequence(input: {
  email: string;
  thema: GuideThema;
}): Promise<number> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const source = guideSourceForThema(input.thema);
  const now = new Date();
  const siteUrl = getPublicSiteUrl();
  const unsubscribeUrl = buildGuideUnsubscribeUrl(
    input.email,
    input.thema,
    siteUrl,
  );

  const day0Content = getGuideNurtureEmailContent(
    input.thema,
    0,
    unsubscribeUrl,
  );
  if (!day0Content) {
    throw new Error("GUIDE_TEMPLATE_DAY0");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let resendId: string | undefined;
  let day0ErrorMessage: string | null = null;

  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: input.email,
      subject: day0Content.subject,
      html: day0Content.html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (sendError) {
      day0ErrorMessage =
        typeof sendError === "object" &&
        sendError !== null &&
        "message" in sendError
          ? String((sendError as { message?: unknown }).message)
          : "Resend send failed";
    } else {
      resendId = sendData?.id;
    }
  } catch (err) {
    day0ErrorMessage =
      err instanceof Error ? err.message : "Unknown error";
  }

  const day0Row = {
    email: input.email,
    session_id: null,
    source,
    thema: input.thema,
    template_key: guideTemplateKey(input.thema, 0),
    sequence_day: 0,
    scheduled_at: now.toISOString(),
    status: resendId ? ("sent" as const) : ("failed" as const),
    sent_at: resendId ? now.toISOString() : null,
    resend_id: resendId ?? null,
    error_message: resendId ? null : day0ErrorMessage,
  };

  const laterDays = GUIDE_SEQUENCE_DAYS.filter((d) => d > 0);
  const pendingRows = laterDays.map((day) => ({
    email: input.email,
    session_id: null,
    source,
    thema: input.thema,
    template_key: guideTemplateKey(input.thema, day),
    sequence_day: day,
    scheduled_at: new Date(
      now.getTime() + day * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: "pending" as const,
  }));

  const { error } = await supabase
    .from("nurture_emails")
    .insert([day0Row, ...pendingRows]);

  if (error) {
    console.error("[guide-nurture] insert failed:", error);
    throw error;
  }

  return 1 + pendingRows.length;
}
