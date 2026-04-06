export const GA4_EVENTS = {
  QUIZ_GESTART: 'quiz_gestart',
  QUIZ_VOLTOOID: 'quiz_voltooid',
  AFFILIATE_KLIK: 'affiliate_klik',
  EMAIL_INGESCHREVEN: 'email_ingeschreven',
  PAGINA_TYPE: 'pagina_type',
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
