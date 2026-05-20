'use client'

import Link from 'next/link'
import { INTAKE_PROMO } from '@/data/homepage'

export default function PillarStickyIntakeCta() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 shadow-lg backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <p className="hidden min-w-0 text-sm leading-snug text-gray-600 sm:block">
          {INTAKE_PROMO.sublineShort}
        </p>
        <Link
          href="/intake"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-ps-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover sm:px-5"
        >
          {INTAKE_PROMO.heroCta} →
        </Link>
      </div>
    </div>
  )
}
