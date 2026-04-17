import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { forwardRef, useId, useState } from 'react'
import type { KaprekarRoutine, KaprekarStep } from '../lib/kaprekar'

interface SequenceStepCardProps {
  routine: KaprekarRoutine
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
  function SequenceStepCard({ routine, step, reducedMotion }: SequenceStepCardProps, ref) {
    const [isExpanded, setIsExpanded] = useState(false)
    const detailsId = useId()

    return (
      <motion.li
        aria-label={`Step ${step.stepNumber}: ${step.descending} minus ${step.ascending} equals ${step.result}`}
        className="list-none scroll-mt-24"
        ref={ref}
        initial={reducedMotion ? false : 'hidden'}
        animate="visible"
        variants={cardVariants}
      >
        <div className="sequence-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            <span className="rounded-full bg-[linear-gradient(135deg,var(--accent-soft),var(--accent-secondary-soft))] px-3 py-1 text-[var(--heading)]">
              Step {step.stepNumber}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                step.reachedConstant
                  ? 'bg-[linear-gradient(135deg,var(--accent-soft),var(--accent-tertiary-soft))] text-[var(--heading)]'
                  : 'bg-[var(--surface-soft)]'
              }`}
            >
              {step.reachedConstant ? routine.constant : step.input}
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
                <span
                  className={
                    step.reachedConstant
                      ? 'bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary),var(--accent-tertiary))] bg-clip-text text-transparent drop-shadow-[0_0_18px_var(--accent-soft)]'
                      : ''
                  }
                >
                  {step.result}
                </span>
              </motion.div>
            </div>

            <div className="mt-4 border-t border-[var(--paper-border)] pt-3">
              <div className="flex justify-center">
                <button
                  aria-controls={detailsId}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? 'Hide step details' : 'Show step details'}
                  className={`inline-flex size-10 items-center justify-center rounded-full border transition ${
                    isExpanded
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--paper-ink)]'
                      : 'border-[var(--paper-border)] bg-[var(--surface-soft)] text-[var(--paper-ink)]'
                  }`}
                  onClick={() => setIsExpanded((current) => !current)}
                  type="button"
                >
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' as const }}
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.24,
                      ease: 'easeOut' as const,
                    }}
                  >
                    <div
                      className="mt-3 rounded-[0.95rem] border border-[var(--paper-border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--paper-ink)]"
                      id={detailsId}
                    >
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                        How this step works
                      </p>
                      <div className="mt-3 space-y-2">
                        <p>
                          Start with{' '}
                          <span className="font-mono font-semibold text-[var(--paper-ink)]">
                            {step.input}
                          </span>
                          .
                        </p>
                        <p>
                          Sort the digits high to low to get{' '}
                          <span className="font-mono font-semibold text-[var(--paper-ink)]">
                            {step.descending}
                          </span>
                          .
                        </p>
                        <p>
                          Sort the same digits low to high to get{' '}
                          <span className="font-mono font-semibold text-[var(--paper-ink)]">
                            {step.ascending}
                          </span>
                          .
                        </p>
                        <p>
                          Subtract them:{' '}
                          <span className="font-mono font-semibold text-[var(--paper-ink)]">
                            {step.descending} - {step.ascending} = {step.result}
                          </span>
                          .
                        </p>
                        <p>
                          {step.reachedConstant
                            ? `That reaches ${routine.constant}, so the routine stops here.`
                            : `Use ${step.result} as the next ${routine.digitCount}-digit number and repeat.`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.li>
    )
  },
)

SequenceStepCard.displayName = 'SequenceStepCard'
