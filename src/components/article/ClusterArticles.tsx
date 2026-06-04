import Link from 'next/link'

interface ClusterArticlesProps {
  clusterTitle: string
  articles: { href: string; title: string }[]
  currentSlug: string
}

export default function ClusterArticles({
  clusterTitle,
  articles,
  currentSlug,
}: ClusterArticlesProps) {
  const items = articles
    .filter((a) => !a.href.endsWith(`/${currentSlug}`))
    .slice(0, 8)

  if (items.length === 0) return null

  return (
    <nav aria-label={`Meer in ${clusterTitle}`} className="mt-7 leading-[1.38] tracking-[-0.01em]">
      <p className="mb-3 font-display text-[0.62rem] font-medium uppercase tracking-[0.09em] text-stone-400">
        Meer in {clusterTitle}
      </p>
      <ul className="list-none">
        {items.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="block border-l-[1.5px] border-l-transparent py-[0.375rem] pl-3 text-[0.75rem] leading-[1.42] text-stone-500 outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 hover:border-l-stone-200/95 hover:bg-stone-50/50 hover:text-stone-700 focus-visible:bg-stone-50/90 focus-visible:ring-1 focus-visible:ring-stone-300/80"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
