import Link from "next/link";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { HOMEPAGE_GUIDES_PROMO } from "@/data/homepage";

function GuidesFanFallback() {
  const cards = [
    { label: "Slaap", rotate: "-8deg", x: "0%", z: 1 },
    { label: "Stress", rotate: "-3deg", x: "18%", z: 2 },
    { label: "Energie", rotate: "2deg", x: "36%", z: 3 },
    { label: "Herstel", rotate: "6deg", x: "54%", z: 4 },
    { label: "Testosteron", rotate: "10deg", x: "72%", z: 5 },
  ] as const;

  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-md lg:max-w-none"
      aria-hidden
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="absolute bottom-0 top-8 w-[42%] rounded-lg border border-stone-200/90 bg-gradient-to-br from-white to-stone-50 shadow-md"
          style={{
            left: card.x,
            zIndex: card.z,
            transform: `rotate(${card.rotate})`,
          }}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-ps-green">
              Gratis gids
            </span>
            <span className="font-serif text-lg font-semibold leading-tight text-stone-800">
              {card.label}
            </span>
            <span className="text-[0.625rem] text-stone-400">na 40</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeGuidesPromoSection() {
  const { title, body, secondaryLine, cta, ctaHref, footnote, imageSrc, imageAlt } =
    HOMEPAGE_GUIDES_PROMO;

  return (
    <section
      className="border-t border-stone-200/60 bg-[#FDFCFA] px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="gidsen-promo-heading"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-lg">
            <h2
              id="gidsen-promo-heading"
              className="font-serif text-2xl text-stone-900 sm:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
              {body}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">{secondaryLine}</p>
            <Link
              href={ctaHref}
              className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover"
            >
              {cta}
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">{footnote}</p>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={560}
                height={420}
                className="w-full max-w-md rounded-xl object-contain lg:max-w-lg"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            ) : (
              <GuidesFanFallback />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
