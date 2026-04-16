import {
  ArrowRight,
  Dice5,
  ExternalLink,
  Globe2,
  RefreshCcw,
  Share2,
} from 'lucide-react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type FormEvent,
  type PointerEvent,
} from 'react'
import { GitHubMarkIcon } from './components/GitHubMarkIcon'
import { SequenceStepCard } from './components/SequenceStepCard'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import {
  KAPREKAR_CONSTANT,
  generateKaprekarSequence,
  generateRandomValidSeed,
  getSeedError,
  isValidSeed,
  sanitizeSeed,
} from './lib/kaprekar'

const QUERY_PARAM = 'seed'
const GITHUB_PROFILE_URL = 'https://github.com/IEvangelist'
const PERSONAL_SITE_URL = 'https://davidpine.dev'
const WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/6174'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_var(--accent-soft)] transition duration-200 hover:brightness-105 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

const quickRules = ['4 digits', 'not all the same', '0001 works'] as const
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

type FloatingMarkStyle = CSSProperties & {
  '--float-delay': string
  '--float-duration': string
  '--float-rotate': string
  '--float-x': string
  '--float-y': string
}

const floatingMarks = [
  {
    value: '67',
    className:
      'left-[6%] top-[18%] hidden text-[clamp(4rem,9vw,7rem)] text-[var(--accent-secondary-soft)] lg:block',
    style: {
      '--float-delay': '0s',
      '--float-duration': '18s',
      '--float-rotate': '-7deg',
      '--float-x': '10px',
      '--float-y': '-16px',
    } as FloatingMarkStyle,
  },
  {
    value: '41',
    className:
      'right-[10%] top-[24%] hidden text-[clamp(4.25rem,9.5vw,7.5rem)] text-[var(--accent-tertiary-soft)] xl:block',
    style: {
      '--float-delay': '1.6s',
      '--float-duration': '20s',
      '--float-rotate': '5deg',
      '--float-x': '-12px',
      '--float-y': '-18px',
    } as FloatingMarkStyle,
  },
  {
    value: '67',
    className:
      'left-[12%] bottom-[14%] hidden text-[clamp(3.5rem,8vw,6.5rem)] text-[var(--accent-soft)] xl:block',
    style: {
      '--float-delay': '0.8s',
      '--float-duration': '22s',
      '--float-rotate': '-10deg',
      '--float-x': '12px',
      '--float-y': '-14px',
    } as FloatingMarkStyle,
  },
  {
    value: '41',
    className:
      'right-[18%] bottom-[10%] hidden text-[clamp(3.75rem,8.5vw,6.75rem)] text-[var(--accent-secondary-soft)] lg:block',
    style: {
      '--float-delay': '2.4s',
      '--float-duration': '19s',
      '--float-rotate': '8deg',
      '--float-x': '-10px',
      '--float-y': '-15px',
    } as FloatingMarkStyle,
  },
] as const

interface ExternalLinkItem {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
}

const externalLinks: ExternalLinkItem[] = [
  { label: 'GitHub', icon: GitHubMarkIcon, href: GITHUB_PROFILE_URL },
  { label: 'davidpine.dev', icon: Globe2, href: PERSONAL_SITE_URL },
]

function readSharedSeed(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return sanitizeSeed(new URL(window.location.href).searchParams.get(QUERY_PARAM) ?? '')
}

function writeSharedSeed(seed?: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (seed) {
    url.searchParams.set(QUERY_PARAM, seed)
  } else {
    url.searchParams.delete(QUERY_PARAM)
  }

  window.history.replaceState({}, '', url)
}

function formatStepCount(stepCount: number): string {
  return `${stepCount} ${stepCount === 1 ? 'step' : 'steps'}`
}

function App() {
  const sharedSeed = useMemo(() => readSharedSeed(), [])
  const initialSeed = isValidSeed(sharedSeed) ? sharedSeed : null
  const initialError = sharedSeed && !initialSeed ? getSeedError(sharedSeed) : null

  const [input, setInput] = useState(sharedSeed)
  const [activeSeed, setActiveSeed] = useState<string | null>(initialSeed)
  const [error, setError] = useState<string | null>(initialError)
  const [announcement, setAnnouncement] = useState(
    initialSeed
      ? `Loaded ${initialSeed}.`
      : initialError ?? 'Enter four digits to start.',
  )
  const [visibleSteps, setVisibleSteps] = useState(initialSeed ? 1 : 0)
  const [animationNonce, setAnimationNonce] = useState(0)

  const reducedMotion = useReducedMotion() ?? false
  const { isFollowingSystem, theme, toggleTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const stepRefs = useRef<Record<number, HTMLLIElement | null>>({})

  const rawParallaxX = useMotionValue(0)
  const rawParallaxY = useMotionValue(0)
  const parallaxX = useSpring(rawParallaxX, {
    stiffness: 42,
    damping: 20,
    mass: 1,
  })
  const parallaxY = useSpring(rawParallaxY, {
    stiffness: 42,
    damping: 20,
    mass: 1,
  })
  const orbPrimaryX = useTransform(parallaxX, (value) => value * 24)
  const orbPrimaryY = useTransform(parallaxY, (value) => value * 18)
  const orbSecondaryX = useTransform(parallaxX, (value) => value * -18)
  const orbSecondaryY = useTransform(parallaxY, (value) => value * -14)

  const sequence = useMemo(
    () => (activeSeed ? generateKaprekarSequence(activeSeed) : []),
    [activeSeed],
  )
  const revealedSequence = useMemo(
    () => (reducedMotion ? sequence : sequence.slice(0, visibleSteps)),
    [sequence, reducedMotion, visibleSteps],
  )

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
    ? `${activeSeed} reaches ${KAPREKAR_CONSTANT} in ${formatStepCount(sequence.length)}.`
    : 'The written math will appear here.'

  function runSequence(seed: string, source: 'manual' | 'random' | 'replay') {
    const nextSequence = generateKaprekarSequence(seed)

    stepRefs.current = {}
    setInput(seed)
    setActiveSeed(seed)
    setError(null)
    setVisibleSteps(reducedMotion ? nextSequence.length : 1)
    setAnimationNonce((current) => current + 1)
    writeSharedSeed(seed)
    inputRef.current?.blur()

    if (source === 'random') {
      setAnnouncement(`Random seed ${seed}. ${formatStepCount(nextSequence.length)} to ${KAPREKAR_CONSTANT}.`)
      return
    }

    if (source === 'replay') {
      setAnnouncement(`Replaying ${seed}.`)
      return
    }

    setAnnouncement(`${seed} reaches ${KAPREKAR_CONSTANT} in ${formatStepCount(nextSequence.length)}.`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSeed = sanitizeSeed(input)
    const nextError = getSeedError(nextSeed)

    if (nextError) {
      setError(nextError)
      setAnnouncement(nextError)
      return
    }

    runSequence(nextSeed, nextSeed === activeSeed ? 'replay' : 'manual')
  }

  function handleInputChange(nextValue: string) {
    const sanitized = sanitizeSeed(nextValue)
    setInput(sanitized)

    if (!error) {
      return
    }

    setError(sanitized.length === 4 ? getSeedError(sanitized) : null)
  }

  function handleRandomize() {
    runSequence(generateRandomValidSeed(), 'random')
  }

  function handleReset() {
    stepRefs.current = {}
    setInput('')
    setActiveSeed(null)
    setError(null)
    setVisibleSteps(0)
    setAnimationNonce((current) => current + 1)
    setAnnouncement('Reset.')
    writeSharedSeed()
    resultsHeadingRef.current?.blur()
  }

  async function handleShare() {
    if (!activeSeed) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set(QUERY_PARAM, activeSeed)

    try {
      if (navigator.share) {
        await navigator.share({
          title: '6174 - Kaprekar Constant Explorer',
          text: `Watch ${activeSeed} fall into ${KAPREKAR_CONSTANT}.`,
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

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion) {
      return
    }

    rawParallaxX.set((event.clientX / window.innerWidth - 0.5) * 2)
    rawParallaxY.set((event.clientY / window.innerHeight - 0.5) * 2)
  }

  function handlePointerLeave() {
    rawParallaxX.set(0)
    rawParallaxY.set(0)
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
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <motion.div
        aria-hidden="true"
          className="pointer-events-none absolute left-[-10rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.18),transparent_68%)] blur-3xl"
          style={reducedMotion ? undefined : { x: orbPrimaryX, y: orbPrimaryY }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-12rem] right-[-9rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.16),transparent_70%)] blur-3xl"
          style={reducedMotion ? undefined : { x: orbSecondaryX, y: orbSecondaryY }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[18%] top-[24%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.12),transparent_68%)] blur-3xl"
        />
        {floatingMarks.map(({ className, style, value }) => (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute select-none font-black tracking-[-0.04em] opacity-35 ${reducedMotion ? '' : 'floating-mark'} ${className}`}
            key={`${value}-${className}`}
            style={style}
          >
            {value}
          </div>
        ))}

        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <header className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[linear-gradient(135deg,var(--accent-soft),var(--accent-secondary-soft))] px-4 py-2 font-mono text-sm font-black tracking-[0.35em] text-[var(--heading)]">
            6174
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

        <main className="flex-1 pb-10 pt-10 sm:pt-14">
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
              Kaprekar routine
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] text-[var(--heading)] sm:text-6xl md:text-7xl">
              4 digits in. 6174 out.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Largest minus smallest, repeated until Kaprekar's constant takes over.
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
                Four-digit starting value
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
                  maxLength={4}
                  onChange={(event) => handleInputChange(event.target.value)}
                  pattern="[0-9]*"
                  placeholder="3524"
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
                <p
                  className="text-sm leading-6 text-[var(--muted)]"
                  id="seed-help"
                >
                  Use any 4 digits except all the same.
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
                What is 6174?
              </a>
            </div>
          </section>

          <section aria-labelledby="results-heading" className="mx-auto mt-12 max-w-3xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  Animated subtraction
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
                      key={`${animationNonce}-${step.stepNumber}`}
                      ref={(element) => {
                        stepRefs.current[step.stepNumber] = element
                      }}
                      reducedMotion={reducedMotion}
                      step={step}
                    />
                  ))}
                </ol>
                {revealedSequence.length === sequence.length ? (
                  <div className="mt-4 flex justify-center">
                    <button className="button-shell" onClick={handleBackToTop} type="button">
                      Back to top
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="glass-panel mt-5 p-6 text-center">
                <p className="text-lg font-semibold text-[var(--heading)]">
                  Try 3524 or hit Random.
                </p>
              </div>
            )}
          </section>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-4 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
          <a
            className="inline-flex items-center gap-2"
            href={GITHUB_PROFILE_URL}
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
