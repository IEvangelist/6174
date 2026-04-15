import { motion, type MotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { KaprekarStep } from '../lib/kaprekar'

interface SequenceStepCardProps {
  step: KaprekarStep
  parallaxX: MotionValue<number>
  parallaxY: MotionValue<number>
  reducedMotion: boolean
}

interface NumberPanelProps {
  label: string
  value: string
}

function NumberPanel({ label, value }: NumberPanelProps) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 font-mono text-4xl font-black tracking-[0.18em] text-[var(--heading)]">
        {value}
      </p>
    </div>
  )
}

export function SequenceStepCard({
  step,
  parallaxX,
  parallaxY,
  reducedMotion,
}: SequenceStepCardProps) {
  const depth = 8 + step.stepNumber * 3
  const x = useTransform(parallaxX, (value) => value * depth)
  const y = useTransform(parallaxY, (value) => value * depth)

  return (
    <motion.li
      className="list-none"
      initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
    >
      <motion.div
        className="glass-panel h-full p-5 sm:p-6"
        style={reducedMotion ? undefined : { x, y }}
      >
        <div className="flex items-center justify-between gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
          <span>Step {step.stepNumber}</span>
          <span>{step.reachedConstant ? 'Constant reached' : `From ${step.input}`}</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <NumberPanel label="High -> low" value={step.descending} />
          <div className="hidden items-center justify-center pb-5 text-[var(--muted)] md:flex">
            <ArrowRight className="size-5" />
          </div>
          <NumberPanel label="Low -> high" value={step.ascending} />
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            {step.reachedConstant ? (
              <Sparkles className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            <span>{step.reachedConstant ? 'Kaprekar lock-in' : 'Subtract the two forms'}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-2xl font-black tracking-[0.12em] text-[var(--heading)] sm:text-3xl">
            <span>{step.descending}</span>
            <span className="text-[var(--muted)]">-</span>
            <span>{step.ascending}</span>
            <span className="text-[var(--muted)]">=</span>
            <span className={step.reachedConstant ? 'text-[var(--accent-strong)]' : ''}>
              {step.result}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.li>
  )
}
