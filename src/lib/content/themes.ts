import type { PillarId } from "@/data/foundation-pyramid";
import { LIFESTYLE_PILLARS } from "@/data/foundation-pyramid";
import {
  pickRecognitionLines,
  type RecognitionLineCandidate,
} from "@/lib/content/match-recognition";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type ThemeSlug = PillarId;

export type ThemeContent = {
  slug: ThemeSlug;
  label: string;
  sublabel: string;
  isMeasured: boolean;
  hefboomText?: string | null;
  disclaimerKey?: string | null;
};

export type RecognitionContent = {
  theme: ThemeContent;
  lines: string[];
};

export type FocusContent = {
  theme: ThemeContent;
  hefboomText: string;
  disclaimerText: string;
};

type ThemeRow = {
  id: string;
  slug: string;
  label: string;
  sublabel: string;
  is_measured: boolean;
  hefboom_text: string | null;
  disclaimer_key: string | null;
};

type DisclaimerRow = {
  body_text: string;
};

type RecognitionLineRow = {
  body_text: string;
  match_question_id: string;
  match_operator: RecognitionLineCandidate["match_operator"];
  match_value: unknown;
  priority: number;
};

const GENERIC_OPENING: Record<ThemeSlug, string> = {
  sleep:
    "Op basis van je antwoorden lijkt slaap nu je grootste hefboom — dat herkennen veel mannen 40+ met drukke werkweken.",
  stress:
    "Op basis van je antwoorden lijkt stress nu je grootste hefboom — dat herkennen veel mannen 40+ met drukke werkweken.",
  nutrition:
    "Op basis van je antwoorden lijkt voeding nu je grootste hefboom — dat herkennen veel mannen 40+ met drukke werkweken.",
  movement:
    "Op basis van je antwoorden lijkt beweging nu je grootste hefboom — dat herkennen veel mannen 40+ met drukke werkweken.",
  connection:
    "Verbinding meten we niet in deze intake — wel relevant voor veerkracht op lange termijn.",
};

const STATIC_HEFBOOM: Record<ThemeSlug, string> = {
  sleep:
    "Slaap is vaak de **snelste hefboom** als je overdag wazig bent of 's nachts vaak wakker ligt. Verbeter je ritme en je omgeving eerst — supplementen vullen pas aan waar gewoonten niet rondkomen.",
  stress:
    "Stress bepaalt hoe snel je lichaam kan schakelen tussen alert zijn en herstellen. Kleine, vaste rustmomenten hebben vaak **meer effect** dan nog een product.",
  nutrition:
    "Voeding beïnvloedt energie, herstel en hoe je reageert op druk. Structurele keuzes (eiwit, vetzuren, regelmaat) zijn meestal de **eerste stap** vóór supplementen.",
  movement:
    "Beweging en kracht houden spieren en stofwisseling op peil — vooral na 40. Te veel zonder herstel kan averechts werken; **balans** is hier de hefboom.",
  connection:
    "Verbinding meten we niet in deze intake — sociaal contact en doel dragen wel bij aan veerkracht op lange termijn.",
};

const FOCUS_SCREEN_DISCLAIMER =
  "Geen medisch advies. Bij aanhoudende klachten: huisarts.";

const STATIC_RECOGNITION_LINES: Partial<
  Record<ThemeSlug, RecognitionLineCandidate[]>
> = {
  sleep: [
    {
      body_text: "Je wordt 's nachts wakker en je hoofd start meteen op.",
      match_question_id: "SLP_WAKE",
      match_operator: "<=",
      match_value: 2,
      priority: 1,
    },
    {
      body_text: "Je ligt lang wakker voordat je in slaap valt.",
      match_question_id: "SLP_ONSET",
      match_operator: "<=",
      match_value: 2,
      priority: 2,
    },
    {
      body_text: "Je wordt wakker alsof je niet echt geslapen hebt.",
      match_question_id: "SLP_QUAL",
      match_operator: "<=",
      match_value: 2,
      priority: 3,
    },
    {
      body_text: "Je slaapritme wisselt — vaste tijden lukken niet altijd.",
      match_question_id: "SLP_CONS",
      match_operator: "<=",
      match_value: 1,
      priority: 4,
    },
  ],
  stress: [
    {
      body_text: "Je voelt spanning alsof je schouders nooit echt zakken.",
      match_question_id: "STR_FREQ",
      match_operator: "<=",
      match_value: 2,
      priority: 1,
    },
    {
      body_text: "Herstelmomenten blijven op een drukke dag achterwege.",
      match_question_id: "STR_RCV",
      match_operator: "<=",
      match_value: 2,
      priority: 2,
    },
  ],
};

function themeFromPillar(slug: ThemeSlug): ThemeContent {
  const pillar = LIFESTYLE_PILLARS.find((entry) => entry.id === slug);
  return {
    slug,
    label: pillar?.label ?? slug,
    sublabel: pillar?.sublabel ?? "",
    isMeasured: slug !== "connection",
    hefboomText: STATIC_HEFBOOM[slug],
    disclaimerKey: "focus_screen",
  };
}

function withGenericFallback(
  slug: ThemeSlug,
  matched: string[],
): string[] {
  if (matched.length > 0) {
    return matched;
  }
  return [GENERIC_OPENING[slug]];
}

export async function getTheme(
  slug: ThemeSlug,
  orgId?: string,
): Promise<ThemeContent | null> {
  const organizationId = orgId ?? getDefaultOrganizationId();
  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return themeFromPillar(slug);
  }

  const { data, error } = await supabase
    .from("themes")
    .select("slug, label, sublabel, is_measured, hefboom_text, disclaimer_key")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle<
      Pick<
        ThemeRow,
        | "slug"
        | "label"
        | "sublabel"
        | "is_measured"
        | "hefboom_text"
        | "disclaimer_key"
      >
    >();

  if (error || !data) {
    return themeFromPillar(slug);
  }

  return {
    slug: data.slug as ThemeSlug,
    label: data.label,
    sublabel: data.sublabel,
    isMeasured: data.is_measured,
    hefboomText: data.hefboom_text ?? STATIC_HEFBOOM[slug],
    disclaimerKey: data.disclaimer_key ?? "focus_screen",
  };
}

export async function getDisclaimer(
  key: string,
  orgId?: string,
): Promise<string> {
  if (key === "focus_screen") {
    const organizationId = orgId ?? getDefaultOrganizationId();
    const supabase = createSupabaseAdmin();
    if (!supabase) {
      return FOCUS_SCREEN_DISCLAIMER;
    }

    const { data, error } = await supabase
      .from("disclaimers")
      .select("body_text")
      .eq("organization_id", organizationId)
      .eq("key", key)
      .maybeSingle<DisclaimerRow>();

    if (error || !data?.body_text) {
      return FOCUS_SCREEN_DISCLAIMER;
    }
    return data.body_text;
  }

  return FOCUS_SCREEN_DISCLAIMER;
}

export async function getFocusContent(
  themeSlug: ThemeSlug,
  orgId?: string,
): Promise<FocusContent> {
  const theme = (await getTheme(themeSlug, orgId)) ?? themeFromPillar(themeSlug);
  const disclaimerKey = theme.disclaimerKey ?? "focus_screen";
  const hefboomText =
    theme.hefboomText?.trim() || STATIC_HEFBOOM[themeSlug];
  const disclaimerText = await getDisclaimer(disclaimerKey, orgId);

  return {
    theme: { ...theme, hefboomText, disclaimerKey },
    hefboomText,
    disclaimerText,
  };
}

export async function getRecognitionLines(
  themeSlug: ThemeSlug,
  answers: Record<string, number>,
  orgId?: string,
): Promise<string[]> {
  const organizationId = orgId ?? getDefaultOrganizationId();
  const supabase = createSupabaseAdmin();

  if (!supabase) {
    const staticLines = STATIC_RECOGNITION_LINES[themeSlug] ?? [];
    return withGenericFallback(
      themeSlug,
      pickRecognitionLines(staticLines, answers),
    );
  }

  const { data: themeRow, error: themeError } = await supabase
    .from("themes")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", themeSlug)
    .maybeSingle<Pick<ThemeRow, "id">>();

  if (themeError || !themeRow) {
    const staticLines = STATIC_RECOGNITION_LINES[themeSlug] ?? [];
    return withGenericFallback(
      themeSlug,
      pickRecognitionLines(staticLines, answers),
    );
  }

  const { data: lineRows, error: linesError } = await supabase
    .from("recognition_lines")
    .select(
      "body_text, match_question_id, match_operator, match_value, priority",
    )
    .eq("organization_id", organizationId)
    .eq("theme_id", themeRow.id)
    .order("priority", { ascending: true });

  if (linesError || !lineRows?.length) {
    const staticLines = STATIC_RECOGNITION_LINES[themeSlug] ?? [];
    return withGenericFallback(
      themeSlug,
      pickRecognitionLines(staticLines, answers),
    );
  }

  const candidates: RecognitionLineCandidate[] = lineRows.map(
    (row: RecognitionLineRow) => ({
      body_text: row.body_text,
      match_question_id: row.match_question_id,
      match_operator: row.match_operator,
      match_value: row.match_value,
      priority: row.priority,
    }),
  );

  return withGenericFallback(
    themeSlug,
    pickRecognitionLines(candidates, answers),
  );
}

export async function getRecognitionContent(
  themeSlug: ThemeSlug,
  answers: Record<string, number>,
  orgId?: string,
): Promise<RecognitionContent> {
  const theme = (await getTheme(themeSlug, orgId)) ?? themeFromPillar(themeSlug);
  const lines = await getRecognitionLines(themeSlug, answers, orgId);
  return { theme, lines };
}
