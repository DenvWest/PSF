import Link from "next/link";

export default function ProfileUpdateLink() {
  return (
    <div className="mt-4">
      <Link
        href="/intake"
        className="text-sm text-stone-400 hover:text-[#5A8F6A] transition-colors"
      >
        Leefstijlcheck opnieuw doen →
      </Link>
    </div>
  );
}
