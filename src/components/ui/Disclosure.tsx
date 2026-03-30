export default function Disclosure() {
    return (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-500">
            Dit artikel bevat mogelijk affiliate links. Wanneer je via deze links
            een aankoop doet, ontvangen wij soms een commissie. Dit heeft geen
            invloed op onze beoordeling.
        </div>
    );
}

export function DisclosureSmall() {
    return (
        <p className="mt-4 text-sm leading-snug text-gray-500">
            Wij verdienen mogelijk een commissie zonder extra kosten voor jou.
        </p>
    );
}

export function DisclosureTable() {
    return (
        <p className="mt-3 w-full text-xs leading-5 text-stone-400">
            Deze tabel bevat affiliate links. Wij kunnen een commissie ontvangen
            als je via deze links een aankoop doet. Dit heeft geen invloed op de
            rangschikking.
        </p>
    );
}
