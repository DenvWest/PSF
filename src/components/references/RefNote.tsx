interface RefNoteProps {
  number: number
}

export function RefNote({ number }: RefNoteProps) {
  return (
    <a
      href={`#ref-${number}`}
      className="ml-[1px] align-super text-[10px] text-ps-green no-underline hover:underline"
      aria-label={`Bron ${number}`}
    >
      [{number}]
    </a>
  )
}
