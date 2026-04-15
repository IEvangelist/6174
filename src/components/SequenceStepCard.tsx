import { motion } from 'framer-motion'
import { forwardRef } from 'react'
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
      duration: 0.4,
      ease: 'easeOut' as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.12,
    },
  },
}

const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

const ruleVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.34, ease: 'easeOut' as const },
  },
}

export const SequenceStepCard = forwardRef<HTMLLIElement, SequenceStepCardProps>(
  function SequenceStepCard({ step, reducedMotion }: SequenceStepCardProps, ref) {
    return (
      <motion.li
        aria-label={`Step ${step.stepNumber}: ${step.descending} minus ${step.ascending} equals ${step.result}`}
        className="list-none scroll-mt-24"
        ref={ref}
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
            <div className="mx-auto w-full max-w-[15rem] font-mono text-[clamp(2rem,8vw,3.6rem)] font-black leading-[0.94] tracking-[0.18em] text-[var(--paper-ink)]">
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
                className="mt-3 origin-right border-t-[3px] border-[var(--paper-ink)]"
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
  },
)

SequenceStepCard.displayName = 'SequenceStepCard'
