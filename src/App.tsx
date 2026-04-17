import {
  ArrowRight,
  ArrowUp,
  Dice5,
  ExternalLink,
  Globe2,
  RefreshCcw,
  Share2,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type FormEvent,
} from 'react'
import { GitHubMarkIcon } from './components/GitHubMarkIcon'
import { SequenceStepCard } from './components/SequenceStepCard'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import {
  DEFAULT_KAPREKAR_ROUTINE_ID,
  KAPREKAR_ROUTINE_IDS,
  KAPREKAR_ROUTINES,
  generateKaprekarSequence,
  generateRandomValidSeed,
  getSeedError,
  isKaprekarRoutineId,
  isValidSeed,
  sanitizeSeed,
  type KaprekarRoutineId,
} from './lib/kaprekar'
import { createShareCardFile } from './lib/shareCard'

const QUERY_PARAM = 'seed'
const MODE_QUERY_PARAM = 'mode'
const GITHUB_REPOSITORY_URL = 'https://github.com/IEvangelist/6174'
const PERSONAL_SITE_URL = 'https://davidpine.dev'
const WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Kaprekar%27s_constant"

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_var(--accent-soft)] transition duration-200 hover:brightness-105 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

type TransitionDirection = -1 | 1

const quickRuleStyles = [
  {
    borderColor: 'var(--accent-soft)',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent-strong)',
  },
  {
    borderColor: 'var(--accent-secondary-soft)',
    backgroundColor: 'var(--accent-secondary-soft)',
    color: 'var(--accent-secondary)',
  },
  {
    borderColor: 'var(--accent-tertiary-soft)',
    backgroundColor: 'var(--accent-tertiary-soft)',
    color: 'var(--accent-tertiary)',
  },
] as const

const modeContentVariants = {
  hidden: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction * 32,
    scale: 0.985,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction * -24,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
}

type CSSVariableOverrides = CSSProperties & Record<`--${string}`, string>

interface FloatingMarkLayout {
  fragmentIndex: 0 | 1
  className: string
  style: CSSProperties
}

interface RoutineUiConfig {
  placeholderSeed: string
  quickRuleExample: string
  backgroundFragments: readonly [string, string]
  themeOverrides?: CSSVariableOverrides
}

const floatingMarkLayout: FloatingMarkLayout[] = [
  {
    fragmentIndex: 0,
    className: 'hidden md:block',
    style: {
      left: '4%',
      top: '12%',
      fontSize: '1.55rem',
      transform: 'rotate(-6deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden md:block',
    style: {
      left: '11%',
      top: '7%',
      fontSize: '1.7rem',
      transform: 'rotate(4deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden lg:block',
    style: {
      left: '18%',
      top: '18%',
      fontSize: '1.6rem',
      transform: 'rotate(-2deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden lg:block',
    style: {
      left: '27%',
      top: '10%',
      fontSize: '1.45rem',
      transform: 'rotate(7deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden xl:block',
    style: {
      left: '35%',
      top: '15%',
      fontSize: '1.7rem',
      transform: 'rotate(-4deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden md:block',
    style: {
      left: '44%',
      top: '6%',
      fontSize: '1.55rem',
      transform: 'rotate(3deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden lg:block',
    style: {
      left: '55%',
      top: '14%',
      fontSize: '1.65rem',
      transform: 'rotate(-7deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden xl:block',
    style: {
      right: '28%',
      top: '10%',
      fontSize: '1.5rem',
      transform: 'rotate(5deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden md:block',
    style: {
      right: '18%',
      top: '18%',
      fontSize: '1.8rem',
      transform: 'rotate(-6deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden lg:block',
    style: {
      right: '8%',
      top: '12%',
      fontSize: '1.6rem',
      transform: 'rotate(6deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden lg:block',
    style: {
      left: '6%',
      top: '38%',
      fontSize: '1.7rem',
      transform: 'rotate(-5deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden md:block',
    style: {
      left: '15%',
      top: '50%',
      fontSize: '1.45rem',
      transform: 'rotate(7deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden xl:block',
    style: {
      left: '26%',
      top: '43%',
      fontSize: '1.8rem',
      transform: 'rotate(-4deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden lg:block',
    style: {
      left: '37%',
      top: '54%',
      fontSize: '1.55rem',
      transform: 'rotate(5deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden md:block',
    style: {
      right: '35%',
      top: '46%',
      fontSize: '1.65rem',
      transform: 'rotate(-7deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden lg:block',
    style: {
      right: '18%',
      top: '56%',
      fontSize: '1.5rem',
      transform: 'rotate(4deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden xl:block',
    style: {
      right: '7%',
      top: '47%',
      fontSize: '1.75rem',
      transform: 'rotate(-5deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden md:block',
    style: {
      left: '10%',
      bottom: '12%',
      fontSize: '1.55rem',
      transform: 'rotate(-8deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden lg:block',
    style: {
      left: '22%',
      bottom: '8%',
      fontSize: '1.4rem',
      transform: 'rotate(4deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden xl:block',
    style: {
      left: '33%',
      bottom: '14%',
      fontSize: '1.6rem',
      transform: 'rotate(-6deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden md:block',
    style: {
      right: '28%',
      bottom: '11%',
      fontSize: '1.5rem',
      transform: 'rotate(5deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden lg:block',
    style: {
      right: '15%',
      bottom: '7%',
      fontSize: '1.45rem',
      transform: 'rotate(-5deg)',
      color: 'var(--accent-tertiary-soft)',
    },
  },
  {
    fragmentIndex: 0,
    className: 'hidden xl:block',
    style: {
      right: '5%',
      bottom: '15%',
      fontSize: '1.7rem',
      transform: 'rotate(7deg)',
      color: 'var(--accent-soft)',
    },
  },
  {
    fragmentIndex: 1,
    className: 'hidden 2xl:block',
    style: {
      left: '48%',
      bottom: '6%',
      fontSize: '1.5rem',
      transform: 'rotate(-4deg)',
      color: 'var(--accent-secondary-soft)',
    },
  },
]

const routineUi: Record<KaprekarRoutineId, RoutineUiConfig> = {
  '6174': {
    placeholderSeed: '3524',
    quickRuleExample: '0001',
    backgroundFragments: ['67', '41'],
  },
  '495': {
    placeholderSeed: '352',
    quickRuleExample: '001',
    backgroundFragments: ['49', '5'],
    themeOverrides: {
      '--bg-accent-1': 'rgba(16, 185, 129, 0.14)',
      '--bg-accent-2': 'rgba(14, 165, 233, 0.12)',
      '--bg-accent-3': 'rgba(245, 158, 11, 0.1)',
      '--accent': '#059669',
      '--accent-strong': '#047857',
      '--accent-soft': 'rgba(5, 150, 105, 0.12)',
      '--accent-secondary': '#0ea5e9',
      '--accent-secondary-soft': 'rgba(14, 165, 233, 0.12)',
      '--accent-tertiary': '#f59e0b',
      '--accent-tertiary-soft': 'rgba(245, 158, 11, 0.12)',
    },
  },
}

interface ExternalLinkItem {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
}

const externalLinks: ExternalLinkItem[] = [
  { label: 'GitHub', icon: GitHubMarkIcon, href: GITHUB_REPOSITORY_URL },
  { label: 'davidpine.dev', icon: Globe2, href: PERSONAL_SITE_URL },
]

function readSharedState(): { modeId: KaprekarRoutineId; seed: string } {
  if (typeof window === 'undefined') {
    return { modeId: DEFAULT_KAPREKAR_ROUTINE_ID, seed: '' }
  }

  const url = new URL(window.location.href)
  const rawModeId = url.searchParams.get(MODE_QUERY_PARAM)
  const modeId = isKaprekarRoutineId(rawModeId) ? rawModeId : DEFAULT_KAPREKAR_ROUTINE_ID

  return {
    modeId,
    seed: sanitizeSeed(
      url.searchParams.get(QUERY_PARAM) ?? '',
      KAPREKAR_ROUTINES[modeId].digitCount,
    ),
  }
}

function buildSharedUrl({
  modeId,
  seed,
}: {
  modeId: KaprekarRoutineId
  seed?: string
}): URL {
  const url = new URL(window.location.href)

  if (seed) {
    url.searchParams.set(QUERY_PARAM, seed)
  } else {
    url.searchParams.delete(QUERY_PARAM)
  }

  if (modeId === DEFAULT_KAPREKAR_ROUTINE_ID) {
    url.searchParams.delete(MODE_QUERY_PARAM)
  } else {
    url.searchParams.set(MODE_QUERY_PARAM, modeId)
  }

  return url
}

function writeSharedState({
  modeId,
  seed,
}: {
  modeId: KaprekarRoutineId
  seed?: string
}): void {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState({}, '', buildSharedUrl({ modeId, seed }))
}

function formatStepCount(stepCount: number): string {
  return `${stepCount} ${stepCount === 1 ? 'step' : 'steps'}`
}

function getDigitLabel(digitCount: number): string {
  if (digitCount === 4) {
    return 'Four-digit'
  }

  if (digitCount === 3) {
    return 'Three-digit'
  }

  return `${digitCount}-digit`
}

function getModeTransitionDirection(
  currentModeId: KaprekarRoutineId,
  nextModeId: KaprekarRoutineId,
): TransitionDirection {
  return KAPREKAR_ROUTINE_IDS.indexOf(nextModeId) > KAPREKAR_ROUTINE_IDS.indexOf(currentModeId)
    ? 1
    : -1
}

function App() {
  const sharedState = useMemo(() => readSharedState(), [])
  const initialRoutine = KAPREKAR_ROUTINES[sharedState.modeId]
  const initialSeed = isValidSeed(sharedState.seed, initialRoutine) ? sharedState.seed : null
  const initialError =
    sharedState.seed && !initialSeed ? getSeedError(sharedState.seed, initialRoutine) : null

  const [modeId, setModeId] = useState<KaprekarRoutineId>(sharedState.modeId)
  const [input, setInput] = useState(sharedState.seed)
  const [activeSeed, setActiveSeed] = useState<string | null>(initialSeed)
  const [error, setError] = useState<string | null>(initialError)
  const [announcement, setAnnouncement] = useState(
    initialSeed
      ? `Loaded ${initialSeed} for ${initialRoutine.constant}.`
      : initialError ?? `Enter ${initialRoutine.digitCount} digits to start.`,
  )
  const [modeTransitionDirection, setModeTransitionDirection] =
    useState<TransitionDirection>(1)
  const [visibleSteps, setVisibleSteps] = useState(initialSeed ? 1 : 0)
  const [animationNonce, setAnimationNonce] = useState(0)

  const reducedMotion = useReducedMotion() ?? false
  const { isFollowingSystem, theme, toggleTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const stepRefs = useRef<Record<number, HTMLLIElement | null>>({})

  const routine = KAPREKAR_ROUTINES[modeId]
  const selectedRoutineUi = routineUi[modeId]
  const quickRules = [
    `${routine.digitCount} digits`,
    'not all the same',
    `${selectedRoutineUi.quickRuleExample} works`,
  ]

  const sequence = useMemo(
    () => (activeSeed ? generateKaprekarSequence(activeSeed, routine) : []),
    [activeSeed, routine],
  )
  const revealedSequence = useMemo(
    () => (reducedMotion ? sequence : sequence.slice(0, visibleSteps)),
    [sequence, reducedMotion, visibleSteps],
  )

  useEffect(() => {
    document.title = `${routine.constant} | Kaprekar Explorer`
  }, [routine.constant])

  useEffect(() => {
    if (reducedMotion || sequence.length <= 1) {
      return
    }

    let currentStep = 1
    const timer = window.setInterval(() => {
      currentStep += 1
      setVisibleSteps(currentStep)

      if (currentStep >= sequence.length) {
        window.clearInterval(timer)
      }
    }, 950)

    return () => window.clearInterval(timer)
  }, [sequence, animationNonce, reducedMotion])

  useEffect(() => {
    if (!activeSeed || !resultsHeadingRef.current) {
      return
    }

    resultsHeadingRef.current.focus({ preventScroll: true })
  }, [activeSeed, animationNonce, reducedMotion])

  useEffect(() => {
    if (!activeSeed || !visibleSteps) {
      return
    }

    const latestStep = stepRefs.current[visibleSteps]

    if (!latestStep) {
      return
    }

    const timer = window.setTimeout(() => {
      const rect = latestStep.getBoundingClientRect()
      const topBoundary = 88
      const bottomBoundary = window.innerHeight - 104
      const isOutsideFocusBand = rect.top < topBoundary || rect.bottom > bottomBoundary

      if (!isOutsideFocusBand) {
        return
      }

      latestStep.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [activeSeed, visibleSteps, animationNonce, reducedMotion])

  const helperTextId = error ? 'seed-help seed-error' : 'seed-help'
  const resultText = activeSeed
    ? `${activeSeed} reaches ${routine.constant} in ${formatStepCount(sequence.length)}.`
    : 'The written math will appear here.'

  function runSequence(seed: string, source: 'manual' | 'random' | 'replay') {
    const nextSequence = generateKaprekarSequence(seed, routine)

    stepRefs.current = {}
    setInput(seed)
    setActiveSeed(seed)
    setError(null)
    setVisibleSteps(reducedMotion ? nextSequence.length : 1)
    setAnimationNonce((current) => current + 1)
    writeSharedState({ modeId, seed })
    inputRef.current?.blur()

    if (source === 'random') {
      setAnnouncement(
        `Random seed ${seed}. ${formatStepCount(nextSequence.length)} to ${routine.constant}.`,
      )
      return
    }

    if (source === 'replay') {
      setAnnouncement(`Replaying ${seed}.`)
      return
    }

    setAnnouncement(`${seed} reaches ${routine.constant} in ${formatStepCount(nextSequence.length)}.`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSeed = sanitizeSeed(input, routine.digitCount)
    const nextError = getSeedError(nextSeed, routine)

    if (nextError) {
      setError(nextError)
      setAnnouncement(nextError)
      return
    }

    runSequence(nextSeed, nextSeed === activeSeed ? 'replay' : 'manual')
  }

  function handleInputChange(nextValue: string) {
    const sanitized = sanitizeSeed(nextValue, routine.digitCount)
    setInput(sanitized)

    if (!error) {
      return
    }

    setError(sanitized.length === routine.digitCount ? getSeedError(sanitized, routine) : null)
  }

  function handleModeChange(nextModeId: KaprekarRoutineId) {
    if (nextModeId === modeId) {
      return
    }

    const nextRoutine = KAPREKAR_ROUTINES[nextModeId]

    stepRefs.current = {}
    setModeTransitionDirection(getModeTransitionDirection(modeId, nextModeId))
    setModeId(nextModeId)
    setInput('')
    setActiveSeed(null)
    setError(null)
    setVisibleSteps(0)
    setAnimationNonce((current) => current + 1)
    setAnnouncement(`${nextRoutine.constant} mode. Enter ${nextRoutine.digitCount} digits to start.`)
    writeSharedState({ modeId: nextModeId })
    resultsHeadingRef.current?.blur()
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  function handleRandomize() {
    runSequence(generateRandomValidSeed(routine), 'random')
  }

  function handleReset() {
    stepRefs.current = {}
    setInput('')
    setActiveSeed(null)
    setError(null)
    setVisibleSteps(0)
    setAnimationNonce((current) => current + 1)
    setAnnouncement('Reset.')
    writeSharedState({ modeId })
    resultsHeadingRef.current?.blur()
  }

  async function handleShare() {
    if (!activeSeed) {
      return
    }

    const url = buildSharedUrl({ modeId, seed: activeSeed })
    const shareTitle = `${routine.constant} - Kaprekar Constant Explorer`
    const shareText = `Watch ${activeSeed} fall into ${routine.constant}.`

    try {
      if (navigator.share) {
        const shareCardFile =
          typeof navigator.canShare === 'function'
            ? await createShareCardFile({
                routine,
                seed: activeSeed,
                steps: sequence,
              })
            : null

        if (shareCardFile && navigator.canShare({ files: [shareCardFile] })) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: url.toString(),
            files: [shareCardFile],
          })
          setAnnouncement('Share sheet opened with preview image.')
          return
        }

        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url.toString(),
        })
        setAnnouncement('Share sheet opened.')
        return
      }

      await navigator.clipboard.writeText(url.toString())
      setAnnouncement('Share link copied.')
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') {
        setAnnouncement('Share canceled.')
        return
      }

      setAnnouncement('Sharing failed.')
    }
  }

  function handleBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]"
      style={selectedRoutineUi.themeOverrides}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute left-[-10rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--bg-accent-1), transparent 68%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-12rem] right-[-9rem] h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--bg-accent-2), transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-[18%] top-[24%] h-48 w-48 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--bg-accent-3), transparent 68%)',
          }}
        />
        {floatingMarkLayout.map(({ className, fragmentIndex, style }, index) => (
          <div
            aria-hidden="true"
            className={`absolute select-none font-black tracking-[-0.04em] opacity-[0.12] ${className}`}
            key={`${modeId}-${index}`}
            style={style}
          >
            {selectedRoutineUi.backgroundFragments[fragmentIndex]}
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <header className="flex items-center justify-between gap-3">
          <div
            aria-label="Choose the Kaprekar routine"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-1 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
            role="group"
          >
            {KAPREKAR_ROUTINE_IDS.map((candidateId) => {
              const candidate = KAPREKAR_ROUTINES[candidateId]
              const isActive = candidateId === modeId

              return (
                <button
                  aria-label={`Switch to ${candidate.constant} mode`}
                  aria-pressed={isActive}
                  className={`rounded-full px-3 py-2 font-mono text-sm font-black tracking-[0.3em] transition sm:px-4 ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,var(--accent-soft),var(--accent-secondary-soft))] text-[var(--heading)]'
                      : 'text-[var(--muted)] hover:text-[var(--heading)]'
                  }`}
                  key={candidateId}
                  onClick={() => handleModeChange(candidateId)}
                  type="button"
                >
                  {candidate.constant}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {externalLinks.map(({ href, icon: Icon, label }) => (
              <a
                aria-label={label}
                className="button-shell"
                href={href}
                key={label}
                rel="noreferrer"
                target="_blank"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </a>
            ))}
            <ThemeToggle
              isFollowingSystem={isFollowingSystem}
              onToggle={toggleTheme}
              theme={theme}
            />
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence custom={modeTransitionDirection} initial={false} mode="wait">
            <motion.div
              animate={reducedMotion ? { opacity: 1, scale: 1, x: 0 } : 'visible'}
              className="pb-10 pt-10 sm:pt-14"
              custom={modeTransitionDirection}
              exit={reducedMotion ? { opacity: 1, scale: 1, x: 0 } : 'exit'}
              initial={reducedMotion ? false : 'hidden'}
              key={modeId}
              variants={modeContentVariants}
            >
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
              Kaprekar routine · {routine.constant} mode
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] text-[var(--heading)] sm:text-6xl md:text-7xl">
              <span className="block">{routine.digitCount} digits in.</span>
              <span className="bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary),var(--accent-tertiary))] bg-clip-text text-transparent">
                {routine.constant} out.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Largest minus smallest, repeated until {routine.constant} takes over.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickRules.map((rule, index) => (
                <span
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
                  key={rule}
                  style={quickRuleStyles[index]}
                >
                  {rule}
                </span>
              ))}
            </div>

            <form
              className="glass-panel mt-8 p-4 sm:p-6"
              noValidate
              onSubmit={handleSubmit}
            >
              <label className="sr-only" htmlFor="seed">
                {getDigitLabel(routine.digitCount)} starting value
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  aria-describedby={helperTextId}
                  aria-invalid={Boolean(error)}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-5 text-center font-mono text-5xl font-black tracking-[0.28em] text-[var(--heading)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] sm:text-6xl"
                  enterKeyHint="go"
                  id="seed"
                  inputMode="numeric"
                  maxLength={routine.digitCount}
                  onChange={(event) => handleInputChange(event.target.value)}
                  pattern="[0-9]*"
                  placeholder={selectedRoutineUi.placeholderSeed}
                  ref={inputRef}
                  spellCheck={false}
                  type="text"
                  value={input}
                />

                <button className={`${primaryButtonClass} sm:min-w-36`} type="submit">
                  <ArrowRight className="size-4" />
                  Solve
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <p className="text-sm leading-6 text-[var(--muted)]" id="seed-help">
                  Use any {routine.digitCount} digits except all the same.
                </p>
                <button className="button-shell !py-2" onClick={handleRandomize} type="button">
                  <Dice5 className="size-4" />
                  Random
                </button>
                <button className="button-shell !py-2" onClick={handleReset} type="button">
                  <RefreshCcw className="size-4" />
                  Reset
                </button>
                <button
                  className="button-shell !py-2"
                  disabled={!activeSeed}
                  onClick={() => void handleShare()}
                  type="button"
                >
                  <Share2 className="size-4" />
                  Share
                </button>
              </div>

              {error ? (
                <p
                  className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--heading)]"
                  id="seed-error"
                >
                  {error}
                </p>
              ) : null}
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {activeSeed ? (
                <>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--heading)]">
                    {activeSeed}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--heading)]">
                    {formatStepCount(sequence.length)}
                  </span>
                </>
              ) : null}
              <a
                className="button-shell !py-2"
                href={WIKIPEDIA_URL}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                Learn {routine.constant}
              </a>
            </div>
          </section>

          <section aria-labelledby="results-heading" className="mx-auto mt-12 max-w-3xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  Animated subtraction · {routine.constant}
                </p>
                <h2
                  className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--heading)] sm:text-4xl"
                  id="results-heading"
                  ref={resultsHeadingRef}
                  tabIndex={-1}
                >
                  {resultText}
                </h2>
              </div>

              {activeSeed ? (
                <button
                  className="button-shell self-start sm:self-auto"
                  onClick={() => runSequence(activeSeed, 'replay')}
                  type="button"
                >
                  <RefreshCcw className="size-4" />
                  Replay
                </button>
              ) : null}
            </div>

            {activeSeed ? (
              <>
                <ol className="mt-5 grid gap-3">
                  {revealedSequence.map((step) => (
                    <SequenceStepCard
                      key={`${modeId}-${animationNonce}-${step.stepNumber}`}
                      ref={(element) => {
                        stepRefs.current[step.stepNumber] = element
                      }}
                      reducedMotion={reducedMotion}
                      routine={routine}
                      step={step}
                    />
                  ))}
                </ol>
                {revealedSequence.length === sequence.length ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button className="button-shell" onClick={handleReset} type="button">
                      <RefreshCcw className="size-4" />
                      Reset
                    </button>
                    <button className="button-shell" onClick={() => void handleShare()} type="button">
                      <Share2 className="size-4" />
                      Share
                    </button>
                    <button className="button-shell" onClick={handleBackToTop} type="button">
                      <ArrowUp className="size-4" />
                      Back to top
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="glass-panel mt-5 p-6 text-center">
                <p className="text-lg font-semibold text-[var(--heading)]">
                  Try {selectedRoutineUi.placeholderSeed} or hit Random.
                </p>
              </div>
            )}
          </section>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-4 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
          <a
            className="inline-flex items-center gap-2"
            href={GITHUB_REPOSITORY_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMarkIcon className="size-4" />
            GitHub
          </a>
          <a
            className="inline-flex items-center gap-2"
            href={PERSONAL_SITE_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Globe2 className="size-4" />
            davidpine.dev
          </a>
          <a
            className="inline-flex items-center gap-2"
            href={WIKIPEDIA_URL}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
            Wikipedia
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App
