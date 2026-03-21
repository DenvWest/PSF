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
            ? "bg-green-700 text-white hover:bg-green-800"
            : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300";

    return (
        <Link
            href={href}
            className={`inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium transition ${classes}`}
        >
            {children}
        </Link>
    );
}
