import TableOfContents from '@/components/article/TableOfContents'
import ClusterArticles from '@/components/article/ClusterArticles'

interface ArticleSidebarProps {
  headings: { id: string; text: string }[]
  clusterTitle: string
  clusterArticles: { href: string; title: string }[]
  currentSlug: string
}

export default function ArticleSidebar({
  headings,
  clusterTitle,
  clusterArticles,
  currentSlug,
}: ArticleSidebarProps) {
  return (
    <div>
      <TableOfContents headings={headings} />
      <ClusterArticles
        clusterTitle={clusterTitle}
        articles={clusterArticles}
        currentSlug={currentSlug}
      />
    </div>
  )
}
