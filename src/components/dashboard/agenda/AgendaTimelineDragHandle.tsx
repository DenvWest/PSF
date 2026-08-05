type AgendaTimelineDragHandleProps = {
  label?: string;
};

export default function AgendaTimelineDragHandle({
  label = "Versleep",
}: AgendaTimelineDragHandleProps) {
  return (
    <span
      className="inline-flex min-h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 text-[#7E8C82]"
      aria-hidden
    >
      <span className="flex gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
      <span className="flex gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
      <span className="flex gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
