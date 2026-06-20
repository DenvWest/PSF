export const GA4_EVENTS = {
  QUIZ_GESTART: 'quiz_gestart',
  QUIZ_VOLTOOID: 'quiz_voltooid',
  AFFILIATE_KLIK: 'affiliate_klik',
  EMAIL_INGESCHREVEN: 'email_ingeschreven',
  PAGINA_TYPE: 'pagina_type',
  INTAKE_CTA_CLICKED: 'intake_cta_clicked',
  INTAKE_FEEDBACK_SUBMITTED: 'intake_feedback_submitted',
  DASHBOARD_UNLOCK_VIEWED: 'dashboard_unlock_viewed',
  DASHBOARD_UNLOCK_CTA_CLICKED: 'dashboard_unlock_cta_clicked',
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
