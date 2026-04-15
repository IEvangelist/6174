export const KAPREKAR_CONSTANT = '6174'

const MAX_ITERATIONS = 8

export interface KaprekarStep {
  stepNumber: number
  input: string
  descending: string
  ascending: string
  result: string
  reachedConstant: boolean
}

export function sanitizeSeed(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

function isCompleteSeed(value: string): boolean {
  return /^\d{4}$/.test(value)
}

export function isValidSeed(value: string): boolean {
  return isCompleteSeed(value) && new Set(value).size > 1
}

export function getSeedError(value: string): string | null {
  if (!value) {
    return 'Enter exactly four digits to start the routine.'
  }

  if (!isCompleteSeed(value)) {
    return 'Use exactly four digits. Leading zeroes count.'
  }

  if (new Set(value).size < 2) {
    return 'Use at least two different digits so the routine can move.'
  }

  return null
}

function padToFourDigits(value: number): string {
  return value.toString().padStart(4, '0')
}

function sortDigits(value: string, direction: 'asc' | 'desc'): string {
  return value
    .split('')
    .sort((left, right) =>
      direction === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left),
    )
    .join('')
}

export function generateKaprekarSequence(seed: string): KaprekarStep[] {
  if (!isValidSeed(seed)) {
    return []
  }

  const steps: KaprekarStep[] = []
  const seen = new Set<string>()
  let current = seed

  for (
    let stepNumber = 1;
    stepNumber <= MAX_ITERATIONS && !seen.has(current);
    stepNumber += 1
  ) {
    seen.add(current)

    const descending = sortDigits(current, 'desc')
    const ascending = sortDigits(current, 'asc')
    const result = padToFourDigits(Number(descending) - Number(ascending))
    const reachedConstant = result === KAPREKAR_CONSTANT

    steps.push({
      stepNumber,
      input: current,
      descending,
      ascending,
      result,
      reachedConstant,
    })

    if (reachedConstant) {
      break
    }

    current = result
  }

  return steps
}

export function generateRandomValidSeed(): string {
  let candidate = ''

  while (!isValidSeed(candidate)) {
    candidate = padToFourDigits(Math.floor(Math.random() * 10_000))
  }

  return candidate
}
