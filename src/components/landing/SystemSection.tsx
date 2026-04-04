"use client";

import { motion } from "framer-motion";
import SectionShell from "./ui/SectionShell";
import SectionHeading from "./ui/SectionHeading";

const pillars = [
  {
    name: "Fundament",
    text: "Consistente ondersteuning voor cellen, cognitie en dagelijkse capaciteit—de rustige laag onder zichtbare inspanning.",
  },
  {
    name: "Herstel",
    text: "Slaap, balans in het zenuwstelsel en ruimte om belasting op te nemen zonder structureel uitgeput te blijven.",
  },
  {
    name: "Veerkracht",
    text: "Sneller terug naar baseline: stabieler ritme, minder broze dagen en een langere horizon voor vitaliteit.",
  },
];

export default function SystemSection() {
  return (
    <section
      id="foundation"
      className="border-b border-[var(--ps-border)]/50 py-[var(--ps-section-y)]"
      aria-labelledby="foundation-heading"
    >
      <SectionShell>
        <SectionHeading
          eyebrow="Preventie & systeem"
          title="Gezondheid als samenhang—niet als losse optimalisatie"
          titleId="foundation-heading"
          description="Optimalisatie is geen enkel product. Het is een herhaalbaar systeem: eerst fundamenten, dan verfijning. De basis is een beperkte set essentials die past bij fysiologie en een druk bestaan—met oog voor preventie en lange termijn."
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col rounded-[1.35rem] bg-gradient-to-b from-white to-[var(--ps-cream)]/90 px-9 py-11 shadow-[0_20px_40px_-24px_rgba(20,20,20,0.07)] sm:px-10 sm:py-12"
            >
              <h3 className="font-display text-2xl font-light tracking-wide text-[var(--ps-ink)]">
                {pillar.name}
              </h3>
              <p className="mt-6 text-[1rem] leading-[1.75] text-[var(--ps-body)] sm:text-[1.0625rem]">
                {pillar.text}
              </p>
            </motion.article>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
