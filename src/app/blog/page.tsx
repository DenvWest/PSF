import { Suspense } from "react";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import BlogOverzichtContent from "@/components/blog/BlogOverzichtContent";
import { alleArtikelen } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog — Inzichten voor mannen 40+",
  description:
    "Praktische artikelen over stress, slaap en energie. Inhoudelijk, zonder hype — specifiek voor mannen boven de 40.",
};

export default function BlogPage() {
  return (
    <Container>
      <div className="py-16 md:py-24">
        {/* Intro header */}
        <header className="max-w-[520px]">
          <p className="ps-eyebrow">Blog</p>
          <h1 className="ps-display mt-5 text-[3rem] leading-[1.06] text-stone-900 sm:text-[3.5rem]">
            Inzichten voor mannen&nbsp;40+
          </h1>
          <p className="mt-6 text-base leading-[1.85] text-stone-500">
            Gerichte artikelen over stress, slaap en energie. Inhoudelijk,
            zonder hype — op basis van wat de wetenschap zegt.
          </p>
        </header>

        <div className="ps-divider mt-14 md:mt-16" aria-hidden />

        {/* Filter + grid — client component */}
        <div className="mt-14 md:mt-16">
          <Suspense>
            <BlogOverzichtContent artikelen={alleArtikelen} />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
