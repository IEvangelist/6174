import { motion } from 'framer-motion'
import type { KaprekarStep } from '../lib/kaprekar'

interface SequenceStepCardProps {
  step: KaprekarStep
  reducedMotion: boolean
}

interface NumberPanelProps {
  label: string
  value: string
  accent?: boolean
}

function NumberPanel({ accent = false, label, value }: NumberPanelProps) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
        {label}
      </p>
      <p
        className={`mt-3 font-mono text-3xl font-black tracking-[0.18em] ${
          accent ? 'text-[var(--accent-strong)]' : 'text-[var(--heading)]'
        } sm:text-4xl`}
      >
        {value}
      </p>
    </div>
  )
}

export function SequenceStepCard({
  step,
  reducedMotion,
}: SequenceStepCardProps) {
  return (
    <motion.li
      className="list-none"
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          <span>Step {step.stepNumber}</span>
          <span
            className={`rounded-full px-3 py-1 ${
              step.reachedConstant ? 'bg-[var(--accent-soft)] text-[var(--heading)]' : ''
            }`}
          >
            {step.reachedConstant ? '6174' : step.input}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NumberPanel label="High" value={step.descending} />
          <NumberPanel label="Low" value={step.ascending} />
          <NumberPanel accent={step.reachedConstant} label="Next" value={step.result} />
        </div>

        <p className="mt-4 font-mono text-sm font-semibold tracking-[0.15em] text-[var(--muted)] sm:text-base">
          {step.descending} - {step.ascending} = {step.result}
        </p>
      </div>
    </motion.li>
  )
}
