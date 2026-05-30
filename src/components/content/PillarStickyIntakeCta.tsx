'use client'

import Link from 'next/link'
import IntakeLastSessionLink from '@/components/intake/IntakeLastSessionLink'
import { INTAKE_PROMO } from '@/data/homepage'

export default function PillarStickyIntakeCta() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/80 bg-white/95 shadow-[0_-8px_32px_rgba(28,25,23,0.08)] backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-md px-4 py-3 md:flex md:max-w-3xl md:items-center md:justify-between md:gap-4 md:px-6 md:py-3.5">
        <p className="mb-2.5 text-center text-sm leading-snug text-stone-600 md:mb-0 md:min-w-0 md:flex-1 md:text-left">
          {INTAKE_PROMO.sublineShort}
        </p>
        <div className="flex w-full flex-col items-center md:w-auto md:items-end">
          <Link
            href="/intake"
            className="flex w-full min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ps-green px-6 py-3 text-base font-semibold text-white shadow-sm shadow-ps-green/25 transition hover:bg-ps-green-hover active:scale-[0.98] md:w-auto md:max-w-fit md:shrink-0"
          >
            {INTAKE_PROMO.heroCta} →
          </Link>
          <IntakeLastSessionLink theme="light" className="mt-2 block text-center md:text-right" />
        </div>
      </div>
    </div>
  )
}
