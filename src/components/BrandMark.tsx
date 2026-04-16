interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div
      aria-label="67 41 mark"
      className={`inline-flex h-12 w-12 flex-col items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--accent-soft),var(--accent-secondary-soft),var(--accent-tertiary-soft))] shadow-[var(--shadow-lg)] ${className ?? ''}`}
    >
      <span className="font-mono text-[0.72rem] font-black leading-none tracking-[0.18em] text-[var(--accent-secondary)]">
        67
      </span>
      <span className="mt-0.5 font-mono text-[0.72rem] font-black leading-none tracking-[0.18em] text-[var(--accent-tertiary)]">
        41
      </span>
    </div>
  )
}
