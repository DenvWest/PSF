import Link from 'next/link'
import { LIB_EYEBROW } from '@/components/library/library-tokens'

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
    <nav aria-label={`Meer in ${clusterTitle}`} className="mt-7 border-t border-stone-200/70 pt-5 leading-[1.38] tracking-[-0.01em]">
      <p className={`mb-2.5 ${LIB_EYEBROW}`}>Meer in {clusterTitle}</p>
      <ul className="list-none">
        {items.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="block border-l-[1.5px] border-l-stone-200/70 py-[0.4rem] pl-3 text-[0.78rem] leading-[1.45] text-stone-500 outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 hover:border-l-ps-green hover:bg-stone-50/60 hover:text-stone-800 focus-visible:bg-stone-50/90 focus-visible:ring-1 focus-visible:ring-stone-300/80"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
