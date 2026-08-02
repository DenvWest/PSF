"use client";

import AgendaTimelineChip from "@/components/dashboard/agenda/AgendaTimelineChip";
import type { TimelineBlock } from "@/types/agenda";

type AgendaBlockCardProps = {
  block: TimelineBlock;
  compact?: boolean;
  onOpenDetail: () => void;
};

export default function AgendaBlockCard({
  block,
  compact,
  onOpenDetail,
}: AgendaBlockCardProps) {
  return (
    <AgendaTimelineChip block={block} compact={compact} onOpenDetail={onOpenDetail} />
  );
}
