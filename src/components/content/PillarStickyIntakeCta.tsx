'use client'

import Link from 'next/link'
import IntakeLastSessionLink from '@/components/intake/IntakeLastSessionLink'
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from '@/lib/leefstijlcheck-inbody-cta'

const LEEFSTIJLCHECK_CTA_BUTTON = 'Doe de Leefstijlcheck — gratis →'

export default function PillarStickyIntakeCta() {
  return (
    <div
      {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: '' }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/80 bg-white/95 shadow-[0_-8px_32px_rgba(28,25,23,0.08)] backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto w-full max-w-md px-4 py-3 md:max-w-3xl md:px-6 md:py-4">
        <div className="md:flex md:items-center md:justify-between md:gap-6">
          <div className="mb-3 min-w-0 text-center md:mb-0 md:flex-1 md:text-left">
            <p className="font-display text-base font-semibold leading-snug text-stone-900">
              Niet zeker waar jij zou moeten beginnen?
            </p>
            <p className="mt-1 text-sm leading-snug text-stone-600">
              De Leefstijlcheck geeft je in 3 min inzicht op 6 leefstijl-domeinen — zodat je weet
              waar je aandacht het meeste oplevert.
            </p>
          </div>
          <div className="flex w-full flex-col items-center md:w-auto md:shrink-0 md:items-end">
            <Link
              href="/intake"
              className="flex w-full min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ps-green px-6 py-3 text-base font-semibold text-white shadow-sm shadow-ps-green/25 transition hover:bg-ps-green-hover active:scale-[0.98] md:w-auto md:max-w-fit"
            >
              {LEEFSTIJLCHECK_CTA_BUTTON}
            </Link>
            <IntakeLastSessionLink theme="light" className="mt-2 block text-center md:text-right" />
          </div>
        </div>
      </div>
    </div>
  )
}
