import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
    href: string;
    children: ReactNode;
    variant?: "primary" | "secondary";
};

export default function Button({
    href,
    children,
    variant = "primary",
}: ButtonProps) {
    const classes =
        variant === "primary"
            ? "bg-stone-900 text-white hover:bg-stone-800"
            : "border border-stone-200 bg-white text-stone-900 hover:border-stone-300 hover:bg-stone-50";

    return (
        <Link
            href={href}
            className={`inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium transition ${classes}`}
        >
            {children}
        </Link>
    );
}
