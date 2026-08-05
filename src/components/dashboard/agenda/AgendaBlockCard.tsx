"use client";

import AgendaTimelineChip from "@/components/dashboard/agenda/AgendaTimelineChip";
import type { AgendaTimelineDragHandleProps } from "@/lib/use-agenda-timeline-drag";
import type { TimelineBlock } from "@/types/agenda";

type AgendaBlockCardProps = {
  block: TimelineBlock;
  compact?: boolean;
  onOpenDetail: () => void;
  dragHandleProps?: AgendaTimelineDragHandleProps;
};

export default function AgendaBlockCard({
  block,
  compact,
  onOpenDetail,
  dragHandleProps,
}: AgendaBlockCardProps) {
  return (
    <AgendaTimelineChip
      block={block}
      compact={compact}
      onOpenDetail={onOpenDetail}
      dragHandleProps={dragHandleProps}
    />
  );
}
