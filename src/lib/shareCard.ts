import type { KaprekarRoutine, KaprekarRoutineId, KaprekarStep } from './kaprekar'

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630

interface ShareCardPalette {
  backgroundStart: string
  backgroundEnd: string
  accentStart: string
  accentMid: string
  accentEnd: string
  glowOne: string
  glowTwo: string
  glowThree: string
  surface: string
  surfaceBorder: string
  text: string
  muted: string
  marks: readonly [string, string]
  markColors: readonly [string, string, string]
}

interface FloatingMark {
  valueIndex: 0 | 1
  x: number
  y: number
  size: number
  rotate: number
  colorIndex: 0 | 1 | 2
}

export interface ShareCardOptions {
  routine: KaprekarRoutine
  seed: string
  steps: KaprekarStep[]
}

const palettes: Record<KaprekarRoutineId, ShareCardPalette> = {
  '6174': {
    backgroundStart: '#090c16',
    backgroundEnd: '#1a1438',
    accentStart: '#8b5cf6',
    accentMid: '#22d3ee',
    accentEnd: '#fb7185',
    glowOne: 'rgba(139, 92, 246, 0.34)',
    glowTwo: 'rgba(34, 211, 238, 0.24)',
    glowThree: 'rgba(251, 113, 133, 0.18)',
    surface: 'rgba(13, 18, 34, 0.78)',
    surfaceBorder: 'rgba(255, 255, 255, 0.14)',
    text: '#f8faff',
    muted: '#b9c1d4',
    marks: ['67', '41'],
    markColors: ['rgba(139, 92, 246, 0.18)', 'rgba(34, 211, 238, 0.16)', 'rgba(251, 113, 133, 0.14)'],
  },
  '495': {
    backgroundStart: '#071412',
    backgroundEnd: '#12253d',
    accentStart: '#34d399',
    accentMid: '#38bdf8',
    accentEnd: '#fbbf24',
    glowOne: 'rgba(52, 211, 153, 0.28)',
    glowTwo: 'rgba(56, 189, 248, 0.22)',
    glowThree: 'rgba(251, 191, 36, 0.16)',
    surface: 'rgba(9, 22, 28, 0.8)',
    surfaceBorder: 'rgba(255, 255, 255, 0.12)',
    text: '#f5fffd',
    muted: '#b7ccc9',
    marks: ['49', '5'],
    markColors: ['rgba(52, 211, 153, 0.18)', 'rgba(56, 189, 248, 0.16)', 'rgba(251, 191, 36, 0.14)'],
  },
}

const floatingMarks: FloatingMark[] = [
  { valueIndex: 0, x: 64, y: 96, size: 30, rotate: -6, colorIndex: 0 },
  { valueIndex: 1, x: 152, y: 70, size: 34, rotate: 4, colorIndex: 1 },
  { valueIndex: 0, x: 292, y: 104, size: 26, rotate: -4, colorIndex: 2 },
  { valueIndex: 1, x: 996, y: 82, size: 30, rotate: 5, colorIndex: 0 },
  { valueIndex: 0, x: 1090, y: 118, size: 28, rotate: -5, colorIndex: 1 },
  { valueIndex: 1, x: 82, y: 300, size: 28, rotate: 7, colorIndex: 1 },
  { valueIndex: 0, x: 216, y: 356, size: 30, rotate: -4, colorIndex: 0 },
  { valueIndex: 1, x: 992, y: 310, size: 26, rotate: 4, colorIndex: 2 },
  { valueIndex: 0, x: 1080, y: 372, size: 32, rotate: -6, colorIndex: 1 },
  { valueIndex: 1, x: 116, y: 548, size: 28, rotate: -7, colorIndex: 2 },
  { valueIndex: 0, x: 314, y: 582, size: 30, rotate: 5, colorIndex: 1 },
  { valueIndex: 1, x: 942, y: 552, size: 30, rotate: -5, colorIndex: 0 },
  { valueIndex: 0, x: 1088, y: 586, size: 28, rotate: 7, colorIndex: 2 },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function createPill({
  text,
  x,
  y,
  width,
  background,
  border,
  foreground,
}: {
  text: string
  x: number
  y: number
  width: number
  background: string
  border: string
  foreground: string
}): string {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="52" rx="26" fill="${background}" stroke="${border}" />
    <text x="${x + width / 2}" y="${y + 33}" fill="${foreground}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle">${escapeXml(text)}</text>
  `
}

function buildJourney(seed: string, steps: KaprekarStep[], constant: string): string[] {
  const journey = [seed]
  const intermediateResults = steps.slice(0, 2).map((step) => step.result)
  const finalResult = steps.at(-1)?.result ?? constant

  for (const value of intermediateResults) {
    if (!journey.includes(value) && value !== finalResult) {
      journey.push(value)
    }
  }

  if (!journey.includes(finalResult)) {
    journey.push(finalResult)
  }

  return journey
}

function buildJourneyMarkup(journey: string[], palette: ShareCardPalette): string {
  const pillWidth = 128
  const arrowGap = 34
  const totalWidth = journey.length * pillWidth + (journey.length - 1) * arrowGap
  let currentX = Math.max(72, (CARD_WIDTH - totalWidth) / 2)

  return journey
    .map((value, index) => {
      const pill = createPill({
        text: value,
        x: currentX,
        y: 534,
        width: pillWidth,
        background: 'rgba(255,255,255,0.07)',
        border: palette.surfaceBorder,
        foreground: palette.text,
      })

      currentX += pillWidth

      if (index === journey.length - 1) {
        return pill
      }

      const arrow = `
        <text x="${currentX + arrowGap / 2}" y="568" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle">→</text>
      `

      currentX += arrowGap
      return `${pill}${arrow}`
    })
    .join('')
}

export function buildShareCardSvg({ routine, seed, steps }: ShareCardOptions): string {
  const palette = palettes[routine.id]
  const journey = buildJourney(seed, steps, routine.constant)
  const firstStep = steps[0]
  const digitsLabel = `${routine.digitCount} digits in`
  const modeLabel = `${routine.constant} mode`
  const stepCountLabel = `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`
  const equation = firstStep
    ? `${firstStep.descending} - ${firstStep.ascending} = ${firstStep.result}`
    : `${seed} -> ${routine.constant}`

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="${CARD_WIDTH}" y2="${CARD_HEIGHT}" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.backgroundStart}" />
          <stop offset="1" stop-color="${palette.backgroundEnd}" />
        </linearGradient>
        <linearGradient id="accent" x1="72" y1="180" x2="660" y2="460" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.accentStart}" />
          <stop offset="0.52" stop-color="${palette.accentMid}" />
          <stop offset="1" stop-color="${palette.accentEnd}" />
        </linearGradient>
        <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="80" />
        </filter>
      </defs>

      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="36" fill="url(#bg)" />

      <circle cx="196" cy="132" r="148" fill="${palette.glowOne}" filter="url(#blur)" />
      <circle cx="932" cy="136" r="128" fill="${palette.glowTwo}" filter="url(#blur)" />
      <circle cx="986" cy="500" r="156" fill="${palette.glowThree}" filter="url(#blur)" />

      ${floatingMarks
        .map(
          (mark) => `
            <text
              x="${mark.x}"
              y="${mark.y}"
              fill="${palette.markColors[mark.colorIndex]}"
              font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif"
              font-size="${mark.size}"
              font-weight="800"
              transform="rotate(${mark.rotate} ${mark.x} ${mark.y})"
            >${palette.marks[mark.valueIndex]}</text>
          `,
        )
        .join('')}

      <rect x="32" y="32" width="${CARD_WIDTH - 64}" height="${CARD_HEIGHT - 64}" rx="28" fill="none" stroke="${palette.surfaceBorder}" />

      <text x="72" y="88" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="20" font-weight="700" letter-spacing="5">KAPREKAR ROUTINE</text>

      ${createPill({
        text: modeLabel.toUpperCase(),
        x: 946,
        y: 52,
        width: 182,
        background: 'rgba(255,255,255,0.07)',
        border: palette.surfaceBorder,
        foreground: palette.text,
      })}

      <text x="72" y="236" fill="${palette.text}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="124" font-weight="880" letter-spacing="-7">${escapeXml(seed)}</text>
      <text x="76" y="282" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="24" font-weight="600">${escapeXml(digitsLabel)}</text>

      <text x="72" y="420" fill="url(#accent)" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="144" font-weight="900" letter-spacing="-9">${escapeXml(routine.constant)}</text>
      <text x="76" y="462" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="26" font-weight="600">Largest minus smallest. Repeat.</text>

      <rect x="702" y="138" width="426" height="268" rx="30" fill="${palette.surface}" stroke="${palette.surfaceBorder}" />
      <text x="740" y="188" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="18" font-weight="700" letter-spacing="4">SHARE PREVIEW</text>
      <text x="740" y="236" fill="${palette.text}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="42" font-weight="800">${escapeXml(stepCountLabel)}</text>
      <text x="740" y="286" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="20" font-weight="600">Seed journey</text>
      <text x="740" y="340" fill="${palette.text}" font-family="'Segoe UI Variable Text','Cascadia Code','Consolas',monospace" font-size="34" font-weight="700">${escapeXml(equation)}</text>
      <text x="740" y="386" fill="${palette.muted}" font-family="'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif" font-size="19" font-weight="600">ievangelist.github.io/6174</text>

      ${buildJourneyMarkup(journey, palette)}
    </svg>
  `.trim()
}

async function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to render the share card image.'))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
}

export async function createShareCardFile(options: ShareCardOptions): Promise<File | null> {
  if (typeof document === 'undefined') {
    return null
  }

  const svg = buildShareCardSvg(options)
  const image = await svgToImage(svg)
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT

  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  context.drawImage(image, 0, 0, CARD_WIDTH, CARD_HEIGHT)

  const blob = await canvasToBlob(canvas)

  if (!blob) {
    return null
  }

  return new File([blob], `kaprekar-${options.routine.id}-${options.seed}.png`, {
    type: 'image/png',
  })
}
