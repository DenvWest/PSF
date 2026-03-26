import { ReactNode } from "react";

type CardProps = {
    title: string;
    text: string;
    children?: ReactNode;
};

export default function Card({ title, text, children }: CardProps) {
    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 transition duration-200 hover:border-stone-300">
            <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-stone-500">{text}</p>
            {children}
        </div>
    );
}
