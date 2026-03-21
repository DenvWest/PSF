import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Hero() {
  return (
    <section className="overflow-x-hidden py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-sm">
            Onafhankelijke supplement gids
          </p>

          <h1 className="mt-4 max-w-[10ch] text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:max-w-none sm:text-5xl lg:text-6xl">
            Begrijp supplementen beter en maak slimmere keuzes
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
            Praktische analyses van ingrediënten, doseringen, kwaliteit en
            toepasbaarheid. Rustig opgebouwd, duidelijk uitgelegd en ontworpen
            om later door te groeien.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/supplementen"
              className="inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Bekijk supplementen
            </Link>

            <Link
              href="/methodologie"
              className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-400"
            >
              Bekijk methodologie
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
