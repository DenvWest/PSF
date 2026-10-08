import FoodIllustration, { type FoodMotif } from "@/components/dashboard/voortgang/FoodIllustration";

/**
 * Tegel met het lijnicoon van een voedselgroep of -categorie, voor een
 * voedingsmiddel zonder foto. Zelfde afmetingen en afronding als een foto,
 * zodat een lijst met en zonder foto's er gelijk uitziet. Decoratief (de naam
 * staat ernaast), `title` geeft de groep als tooltip.
 */
export default function FoodGroupTile({
  motief,
  label,
  size = 40,
}: {
  motief: FoodMotif;
  label: string;
  size?: 40 | 48;
}) {
  const box = size === 48 ? "h-12 w-12" : "h-10 w-10";
  const art = size === 48 ? "h-6 w-6" : "h-5 w-5";
  return (
    <span
      aria-hidden="true"
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10 ${box}`}
    >
      <FoodIllustration motief={motief} className={art} />
    </span>
  );
}
