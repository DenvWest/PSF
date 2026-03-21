type CardProps = {
    title: string;
    text: string;
};

export default function Card({ title, text }: CardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
        </div>
    );
}
