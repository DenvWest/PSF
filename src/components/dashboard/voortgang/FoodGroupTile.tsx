/**
 * Tegel met het icoon van een voedselgroep, voor een voedingsmiddel zonder foto.
 * Zelfde afmetingen en afronding als een foto, zodat een lijst met en zonder
 * foto's er gelijk uitziet. Decoratief (de naam staat ernaast), `title` geeft de
 * groep als tooltip.
 */
export default function FoodGroupTile({
  icoon,
  label,
  size = 40,
}: {
  icoon: string;
  label: string;
  size?: 40 | 48 | 72;
}) {
  const box = size === 72 ? "h-[72px] w-[72px] text-[32px]" : size === 48 ? "h-12 w-12 text-[22px]" : "h-10 w-10 text-[19px]";
  return (
    <span
      aria-hidden="true"
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-[#5A8F6A]/20 ${box}`}
    >
      {icoon}
    </span>
  );
}
