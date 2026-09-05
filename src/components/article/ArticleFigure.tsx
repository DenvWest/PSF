import Image from "next/image";

export const ARTICLE_FIGURE_WIDTH = 1600;
export const ARTICLE_FIGURE_HEIGHT = 900;

interface ArticleFigureProps {
  src: string;
  alt: string;
  caption: string;
  priority?: boolean;
  className?: string;
}

export default function ArticleFigure({
  src,
  alt,
  caption,
  priority = false,
  className = "",
}: ArticleFigureProps) {
  return (
    <figure className={className}>
      <Image
        src={src}
        alt={alt}
        width={ARTICLE_FIGURE_WIDTH}
        height={ARTICLE_FIGURE_HEIGHT}
        priority={priority}
        className="h-auto w-full rounded-xl bg-stone-100 object-cover"
        sizes="(max-width: 1024px) 100vw, 720px"
      />
      <figcaption className="mt-3 max-w-[72ch] text-[0.8125rem] leading-relaxed text-stone-500">
        {caption}
      </figcaption>
    </figure>
  );
}
