interface ArticleReadingProgressBarProps {
  progress: number
}

export default function ArticleReadingProgressBar({
  progress,
}: ArticleReadingProgressBarProps) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60]"
      aria-hidden="true"
    >
      <div className="h-px bg-stone-200/95" />
      <div className="h-[2px] w-full bg-stone-200/95">
        <div
          className="motion-safe:ease-linear h-full w-full origin-left bg-ps-green/80 motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  )
}
