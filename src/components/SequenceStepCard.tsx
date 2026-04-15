import { motion } from 'framer-motion'
import type { KaprekarStep } from '../lib/kaprekar'

interface SequenceStepCardProps {
  step: KaprekarStep
  reducedMotion: boolean
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: 'easeOut' as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.08,
    },
  },
}

const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
}

const ruleVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.24, ease: 'easeOut' as const },
  },
}

export function SequenceStepCard({
  step,
  reducedMotion,
}: SequenceStepCardProps) {
  return (
    <motion.li
      aria-label={`Step ${step.stepNumber}: ${step.descending} minus ${step.ascending} equals ${step.result}`}
      className="list-none"
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      variants={cardVariants}
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

        <div className="math-sheet mt-4">
          <div className="mx-auto w-full max-w-[18rem] font-mono text-[clamp(2.4rem,9vw,4.4rem)] font-black leading-[0.92] tracking-[0.2em] text-[var(--heading)]">
            <motion.div className="flex justify-end" variants={lineVariants}>
              <span>{step.descending}</span>
            </motion.div>
            <motion.div
              className="mt-3 flex items-center justify-end gap-3"
              variants={lineVariants}
            >
              <span className="text-[0.72em] text-[var(--muted)]">-</span>
              <span>{step.ascending}</span>
            </motion.div>
            <motion.div
              className="mt-3 origin-right border-t-[3px] border-[var(--heading)]"
              variants={ruleVariants}
            />
            <motion.div className="mt-3 flex justify-end" variants={lineVariants}>
              <span className={step.reachedConstant ? 'text-[var(--accent-strong)]' : ''}>
                {step.result}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.li>
  )
}
