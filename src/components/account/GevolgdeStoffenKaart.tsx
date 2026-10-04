import { Card } from "@/components/app/primitives";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";

/**
 * "Wat je volgt" op Je doelen: welke informatieve stoffen naast de vijf
 * kernstoffen in Je patroon staan. Zelfde kiezer als de "+" daar.
 */
export default function GevolgdeStoffenKaart() {
  return (
    <section id="volgen" aria-labelledby="volgen-titel" className="scroll-mt-6">
      <Card>
        <div className="grid gap-4 text-[var(--text)]">
          <div className="grid gap-1.5">
            <h2 id="volgen-titel" className="m-0 text-[17px] font-semibold">
              Wat je volgt
            </h2>
            <p className="m-0 text-[13.5px] leading-normal text-[var(--text-muted)]">
              Naast magnesium, eiwit, omega-3, zink en vitamine D. Gekozen stoffen staan in Je
              patroon met hun gemiddelde en het deel van de referentie-inname, zonder oordeel.
            </p>
          </div>
          <GevolgdeStoffenKiezer surface="doelen" />
        </div>
      </Card>
    </section>
  );
}
