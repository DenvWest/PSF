export const GA4_EVENTS = {
  QUIZ_GESTART: 'quiz_gestart',
  QUIZ_VOLTOOID: 'quiz_voltooid',
  AFFILIATE_KLIK: 'affiliate_klik',
  EMAIL_INGESCHREVEN: 'email_ingeschreven',
  PAGINA_TYPE: 'pagina_type',
  INTAKE_CTA_CLICKED: 'intake_cta_clicked',
  INTAKE_LOGIN_BRIDGE_VIEWED: 'intake_login_bridge_viewed',
  INTAKE_FEEDBACK_SUBMITTED: 'intake_feedback_submitted',
  DASHBOARD_UNLOCK_VIEWED: 'dashboard_unlock_viewed',
  DASHBOARD_UNLOCK_CTA_CLICKED: 'dashboard_unlock_cta_clicked',
  ONDERBOUWING_LINK_CLICKED: 'onderbouwing_link_clicked',
  METHODOLOGIE_DASHBOARD_TAB: 'methodologie_dashboard_tab',
  HOME_PROFILE_CLICK: 'home_profile_click',
  REMEASURE_OPTIN_SHOWN: 'remeasure_optin_shown',
  REMEASURE_OPTIN_SUBMITTED: 'remeasure_optin_submitted',
  NURTURE_DASHBOARD_CTA_CLICKED: 'nurture_dashboard_cta_clicked',
  COOKIE_MARKETING_GATE: 'cookie_marketing_gate',
  NUTRITION_EVIDENCE_EXPANDED: 'nutrition_evidence_expanded',
  NUTRITION_BREADTH_SKIPPED: 'nutrition_breadth_skipped',
  NUTRITION_DIET_SKIPPED: 'nutrition_diet_skipped',
  NUTRITION_SLIDER_OPT_OUT: 'nutrition_slider_opt_out',
  NUTRITION_ONDERBOUWING_RETURN_CLICK: 'nutrition_onderbouwing_return_click',
  NUTRITION_RESULT_REOPEN_CLICK: 'nutrition_result_reopen_click',
} as const;

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', eventName, params ?? {});
}

export function trackAffiliateKlik(params: {
  product_naam: string;
  merk: string;
  positie_op_pagina: number;
}) {
  trackEvent(GA4_EVENTS.AFFILIATE_KLIK, params);
}

export function trackQuizVoltooid(params: {
  doelgroep: string;
  hoofd_symptoom: string;
}) {
  trackEvent(GA4_EVENTS.QUIZ_VOLTOOID, params);
}

export function trackPaginaType(type:
  'vergelijking' | 'blog' | 'supplement'
) {
  trackEvent(GA4_EVENTS.PAGINA_TYPE, { type });
}

export function trackOnderbouwingLinkClick(params: {
  surface:
    | "dashboard_footer"
    | "login_help"
    | "vandaag_card"
    | "agenda_today"
    | "agenda_preview";
  tab?: string;
  screen?: string;
  domain?: string;
}) {
  trackEvent(GA4_EVENTS.ONDERBOUWING_LINK_CLICKED, params);
}

export function trackDashboardTabSelected(tab: string) {
  trackEvent("dashboard_tab_selected", { tab });
}

export function trackAgendaDaySelected(params: {
  day_offset: number;
  is_today: boolean;
  domain: string;
}) {
  trackEvent("agenda_day_selected", params);
}
