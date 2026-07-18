"use client";

import AgendaTimelineChip from "@/components/dashboard/agenda/AgendaTimelineChip";
import type { TimelineBlock } from "@/types/agenda";

type AgendaBlockCardProps = {
  block: TimelineBlock;
  onOpenDetail: () => void;
};

export default function AgendaBlockCard({ block, onOpenDetail }: AgendaBlockCardProps) {
  return <AgendaTimelineChip block={block} onOpenDetail={onOpenDetail} />;
}
