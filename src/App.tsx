import {
  ArrowRight,
  Dice5,
  ExternalLink,
  Globe2,
  Hash,
  MoonStar,
  RefreshCcw,
  Share2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from 'react'
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
  'inline-flex items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_var(--accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

type FeatureCard = {
  title: string
  description: string
  icon: LucideIcon
}

const rules: FeatureCard[] = [
  {
    title: 'Exactly 4 digits',
    description: 'Type any four numerals. Leading zeroes count, so 0001 is fair game.',
    icon: Hash,
  },
  {
    title: 'At least two differ',
    description: 'All-four-the-same inputs freeze the routine, so the app blocks them.',
    icon: Sparkles,
  },
  {
    title: 'Random is built in',
    description: 'Tap the dice button for an instant valid seed and immediate animation.',
    icon: Dice5,
  },
]

const highlights: FeatureCard[] = [
  {
    title: 'Seven steps or fewer',
    description: 'Every valid 4-digit seed reaches 6174 quickly, so the reveal stays snappy.',
    icon: ArrowRight,
  },
  {
    title: 'Shareable by URL',
    description: 'Once a seed is active, the query string captures it for replay and sharing.',
    icon: Share2,
  },
  {
    title: 'Theme aware by default',
    description: 'The experience follows your system theme and lets you toggle light or dark.',
    icon: MoonStar,
  },
]

const externalLinks = [
  { label: 'GitHub', icon: ExternalLink, href: GITHUB_PROFILE_URL },
  { label: 'davidpine.dev', icon: Globe2, href: PERSONAL_SITE_URL },
] as const

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
      ? `Loaded a shared sequence for ${initialSeed}.`
      : initialError ?? 'Pick a four-digit seed to begin.',
  )
  const [visibleSteps, setVisibleSteps] = useState(initialSeed ? 1 : 0)
  const [animationNonce, setAnimationNonce] = useState(0)

  const reducedMotion = useReducedMotion() ?? false
  const { isFollowingSystem, theme, toggleTheme } = useTheme()
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)

  const rawParallaxX = useMotionValue(0)
  const rawParallaxY = useMotionValue(0)
  const parallaxX = useSpring(rawParallaxX, {
    stiffness: 120,
    damping: 18,
    mass: 0.5,
  })
  const parallaxY = useSpring(rawParallaxY, {
    stiffness: 120,
    damping: 18,
    mass: 0.5,
  })

  const orbPrimaryX = useTransform(parallaxX, (value) => value * 44)
  const orbPrimaryY = useTransform(parallaxY, (value) => value * 30)
  const orbSecondaryX = useTransform(parallaxX, (value) => value * -28)
  const orbSecondaryY = useTransform(parallaxY, (value) => value * -18)
  const digitsX = useTransform(parallaxX, (value) => value * -18)
  const digitsY = useTransform(parallaxY, (value) => value * 14)

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
    }, 850)

    return () => window.clearInterval(timer)
  }, [sequence, animationNonce, reducedMotion])

  useEffect(() => {
    if (!activeSeed || !resultsHeadingRef.current) {
      return
    }

    resultsHeadingRef.current.focus({ preventScroll: true })
    resultsHeadingRef.current.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [activeSeed, animationNonce, reducedMotion])

  const helperTextId = error ? 'seed-help seed-error' : 'seed-help'

  function runSequence(seed: string, source: 'manual' | 'random' | 'replay') {
    const nextSequence = generateKaprekarSequence(seed)

    setInput(seed)
    setActiveSeed(seed)
    setError(null)
    setVisibleSteps(reducedMotion ? nextSequence.length : 1)
    setAnimationNonce((current) => current + 1)
    writeSharedSeed(seed)

    if (source === 'random') {
      setAnnouncement(`Random seed ${seed} reaches ${KAPREKAR_CONSTANT} in ${formatStepCount(nextSequence.length)}.`)
      return
    }

    if (source === 'replay') {
      setAnnouncement(`Replaying ${seed}. ${formatStepCount(nextSequence.length)} until ${KAPREKAR_CONSTANT}.`)
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
    setInput('')
    setActiveSeed(null)
    setError(null)
    setVisibleSteps(0)
    setAnimationNonce((current) => current + 1)
    setAnnouncement('Reset the explorer.')
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
          title: '6174 — Kaprekar Constant Explorer',
          text: `Watch ${activeSeed} collapse into ${KAPREKAR_CONSTANT}.`,
          url: url.toString(),
        })
        setAnnouncement('Share sheet opened.')
        return
      }

      await navigator.clipboard.writeText(url.toString())
      setAnnouncement('Share link copied to the clipboard.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setAnnouncement('Share canceled.')
        return
      }

      setAnnouncement('Sharing failed. Copy the current URL from the address bar instead.')
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion) {
      return
    }

    const xOffset = (event.clientX / window.innerWidth - 0.5) * 2
    const yOffset = (event.clientY / window.innerHeight - 0.5) * 2

    rawParallaxX.set(xOffset)
    rawParallaxY.set(yOffset)
  }

  function handlePointerLeave() {
    rawParallaxX.set(0)
    rawParallaxY.set(0)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div
        className="relative isolate overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-7rem] top-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_68%)] blur-3xl sm:h-96 sm:w-96"
          style={reducedMotion ? undefined : { x: orbPrimaryX, y: orbPrimaryY }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-9rem] right-[-5rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_70%)] blur-3xl sm:h-[26rem] sm:w-[26rem]"
          style={reducedMotion ? undefined : { x: orbSecondaryX, y: orbSecondaryY }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-20 hidden font-mono text-[10rem] font-black tracking-[-0.1em] text-[var(--accent-soft)] opacity-70 lg:block"
          style={reducedMotion ? undefined : { x: digitsX, y: digitsY }}
        >
          6174
        </motion.div>

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>

          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 font-mono text-sm font-black tracking-[0.4em] text-[var(--heading)] shadow-[var(--shadow-lg)]">
                6174
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  Kaprekar constant explorer
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  A single-page ritual for the number that always wins.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {externalLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  className="button-shell"
                  href={href}
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

          <main className="grid flex-1 gap-10 pb-12 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <section className="space-y-8">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  <Sparkles className="size-4" />
                  Kaprekar's routine
                </span>

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-6xl font-black leading-none tracking-[-0.1em] text-[var(--heading)] sm:text-7xl lg:text-[8.5rem]">
                    Watch four digits collapse into 6174.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                    Sort your digits high-to-low and low-to-high, subtract the two
                    forms, then repeat. Every valid 4-digit starting point lands on
                    Kaprekar's constant in seven moves or fewer.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {rules.map(({ description, icon: Icon, title }) => (
                  <article key={title} className="glass-panel p-5">
                    <Icon className="size-5 text-[var(--accent)]" aria-hidden="true" />
                    <h2 className="mt-4 text-xl font-bold tracking-[-0.04em] text-[var(--heading)]">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {description}
                    </p>
                  </article>
                ))}
              </div>

              <section className="glass-panel p-6 sm:p-8">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  <ArrowRight className="size-4" />
                  Why this stays fun
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {highlights.map(({ description, icon: Icon, title }) => (
                    <article
                      key={title}
                      className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-soft)] p-5"
                    >
                      <Icon className="size-5 text-[var(--accent)]" aria-hidden="true" />
                      <h2 className="mt-4 text-lg font-bold tracking-[-0.04em] text-[var(--heading)]">
                        {title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {description}
                      </p>
                    </article>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Want the backstory behind the constant itself? The original write-up on{' '}
                  <a
                    className="font-semibold text-[var(--heading)] underline decoration-[var(--accent)] underline-offset-4"
                    href={WIKIPEDIA_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Wikipedia
                  </a>{' '}
                  is a great companion while you watch the subtraction cards unfold.
                </p>
              </section>
            </section>

            <section className="lg:sticky lg:top-6">
              <div className="glass-panel relative overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                      Start here
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-[var(--heading)] sm:text-4xl">
                      One giant input. One inevitable destination.
                    </h2>
                  </div>

                  <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                    <label className="sr-only" htmlFor="seed">
                      Four-digit starting value
                    </label>
                    <input
                      aria-describedby={helperTextId}
                      aria-invalid={Boolean(error)}
                      autoComplete="off"
                      className="w-full rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-strong)] px-6 py-5 text-center font-mono text-5xl font-black tracking-[0.32em] text-[var(--heading)] shadow-[var(--shadow-lg)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] sm:text-6xl"
                      enterKeyHint="go"
                      id="seed"
                      inputMode="numeric"
                      maxLength={4}
                      onChange={(event) => handleInputChange(event.target.value)}
                      pattern="[0-9]*"
                      placeholder="3524"
                      spellCheck={false}
                      type="text"
                      value={input}
                    />

                    <p id="seed-help" className="text-sm leading-6 text-[var(--muted)]">
                      Exactly 4 digits. Leading zeroes count. At least two digits must
                      differ.
                    </p>
                    {error ? (
                      <p
                        className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--heading)]"
                        id="seed-error"
                      >
                        {error}
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button className={primaryButtonClass} type="submit">
                        <ArrowRight className="size-4" />
                        Show the path
                      </button>
                      <button
                        className="button-shell"
                        onClick={handleRandomize}
                        type="button"
                      >
                        <Dice5 className="size-4" />
                        Random
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        className="button-shell"
                        onClick={handleReset}
                        type="button"
                      >
                        <RefreshCcw className="size-4" />
                        Reset
                      </button>
                      <button
                        className="button-shell"
                        disabled={!activeSeed}
                        onClick={() => void handleShare()}
                        type="button"
                      >
                        <Share2 className="size-4" />
                        Share link
                      </button>
                    </div>
                  </form>

                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                      Current state
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--heading)]">
                        {activeSeed
                          ? `${activeSeed} -> ${formatStepCount(sequence.length)}`
                          : 'No active seed yet'}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--heading)]">
                        {theme === 'dark' ? 'Dark theme' : 'Light theme'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <section aria-labelledby="results-heading" className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  Animated sequence
                </p>
                <h2
                  className="mt-2 text-4xl font-black tracking-[-0.06em] text-[var(--heading)] sm:text-5xl"
                  id="results-heading"
                  ref={resultsHeadingRef}
                  tabIndex={-1}
                >
                  {activeSeed
                    ? `${activeSeed} reaches ${KAPREKAR_CONSTANT} in ${formatStepCount(sequence.length)}.`
                    : 'Run a valid seed to reveal the subtraction ladder.'}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                  {activeSeed
                    ? 'Each card appears in order so the arithmetic feels tactile instead of abstract.'
                    : 'Try 3524, 2111, or hit Random and the app will animate every transformation until the constant appears.'}
                </p>
              </div>

              {activeSeed ? (
                <button
                  className="button-shell self-start lg:self-auto"
                  onClick={() => runSequence(activeSeed, 'replay')}
                  type="button"
                >
                  <RefreshCcw className="size-4" />
                  Replay
                </button>
              ) : null}
            </div>

            {activeSeed ? (
              <ol className="grid gap-4 lg:grid-cols-2">
                {revealedSequence.map((step) => (
                  <SequenceStepCard
                    key={`${animationNonce}-${step.stepNumber}`}
                    parallaxX={parallaxX}
                    parallaxY={parallaxY}
                    reducedMotion={reducedMotion}
                    step={step}
                  />
                ))}
              </ol>
            ) : (
              <div className="glass-panel p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  Nothing running yet
                </p>
                <p className="mt-3 max-w-3xl text-2xl font-bold tracking-[-0.05em] text-[var(--heading)] sm:text-3xl">
                  Use a fresh seed and the app will build the sequence card by card until
                  the inevitable 6174 reveal.
                </p>
              </div>
            )}
          </section>

          <footer className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Built as a GitHub Pages-ready SPA with React, Vite, Tailwind CSS, motion,
              and an obsession with Kaprekar's constant.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="inline-flex items-center gap-2 font-semibold text-[var(--heading)]"
                href={GITHUB_PROFILE_URL}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                GitHub
              </a>
              <a
                className="inline-flex items-center gap-2 font-semibold text-[var(--heading)]"
                href={PERSONAL_SITE_URL}
                rel="noreferrer"
                target="_blank"
              >
                <Globe2 className="size-4" />
                davidpine.dev
              </a>
              <a
                className="inline-flex items-center gap-2 font-semibold text-[var(--heading)]"
                href={WIKIPEDIA_URL}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                Wikipedia
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
