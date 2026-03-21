export default function Disclosure() {
    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Dit artikel bevat mogelijk affiliate links. Wanneer je via deze links een aankoop doet,
            ontvangen wij soms een commissie. Dit heeft geen invloed op onze beoordeling.
        </div>
    );
}

export function DisclosureSmall() {
    return (
        <p className="mt-2 text-xs leading-5 text-slate-500">
            * Wij kunnen een commissie ontvangen via deze link.
        </p>
    );
}

export function DisclosureTable() {
    return (
        <p className="mt-3 w-full text-xs leading-5 text-neutral-500">
            Deze tabel bevat affiliate links. Wij kunnen een commissie ontvangen als je via
            deze links een aankoop doet. Dit heeft geen invloed op de rangschikking.
        </p>
    );
}