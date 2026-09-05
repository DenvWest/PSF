import type { ReactNode } from 'react'
import TableOfContents from '@/components/article/TableOfContents'
import ClusterArticles from '@/components/article/ClusterArticles'
import ArticleSidebarHeader, {
  type ArticleSidebarBackLink,
} from '@/components/article/ArticleSidebarHeader'

interface ArticleSidebarProps {
  headings: { id: string; text: string }[]
  clusterTitle: string
  clusterArticles: { href: string; title: string }[]
  currentSlug: string
  back: ArticleSidebarBackLink
  sectionIcon?: ReactNode
}

export default function ArticleSidebar({
  headings,
  clusterTitle,
  clusterArticles,
  currentSlug,
  back,
  sectionIcon,
}: ArticleSidebarProps) {
  return (
    <div>
      <ArticleSidebarHeader
        back={back}
        sectionLabel={clusterTitle}
        sectionIcon={sectionIcon}
      />
      <TableOfContents headings={headings} />
      <ClusterArticles
        clusterTitle={clusterTitle}
        articles={clusterArticles}
        currentSlug={currentSlug}
      />
    </div>
  )
}
