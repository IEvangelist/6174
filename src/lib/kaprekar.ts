export type KaprekarRoutineId = '6174' | '495'

export interface KaprekarRoutine {
  id: KaprekarRoutineId
  constant: string
  digitCount: number
  maxIterations: number
}

export interface KaprekarStep {
  stepNumber: number
  input: string
  descending: string
  ascending: string
  result: string
  reachedConstant: boolean
}

export const DEFAULT_KAPREKAR_ROUTINE_ID: KaprekarRoutineId = '6174'

export const KAPREKAR_ROUTINES: Record<KaprekarRoutineId, KaprekarRoutine> = {
  '6174': {
    id: '6174',
    constant: '6174',
    digitCount: 4,
    maxIterations: 8,
  },
  '495': {
    id: '495',
    constant: '495',
    digitCount: 3,
    maxIterations: 6,
  },
}

export const KAPREKAR_ROUTINE_IDS = Object.keys(KAPREKAR_ROUTINES) as KaprekarRoutineId[]
export const KAPREKAR_CONSTANT =
  KAPREKAR_ROUTINES[DEFAULT_KAPREKAR_ROUTINE_ID].constant

function resolveRoutine(
  routine: KaprekarRoutine | KaprekarRoutineId = DEFAULT_KAPREKAR_ROUTINE_ID,
): KaprekarRoutine {
  return typeof routine === 'string' ? KAPREKAR_ROUTINES[routine] : routine
}

function isCompleteSeed(value: string, digitCount: number): boolean {
  return new RegExp(`^\\d{${digitCount}}$`).test(value)
}

function padToDigits(value: number, digitCount: number): string {
  return value.toString().padStart(digitCount, '0')
}

function sortDigits(value: string, direction: 'asc' | 'desc'): string {
  return value
    .split('')
    .sort((left, right) =>
      direction === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left),
    )
    .join('')
}

export function isKaprekarRoutineId(value: string | null | undefined): value is KaprekarRoutineId {
  return value === '6174' || value === '495'
}

export function sanitizeSeed(
  value: string,
  digitCount = KAPREKAR_ROUTINES[DEFAULT_KAPREKAR_ROUTINE_ID].digitCount,
): string {
  return value.replace(/\D/g, '').slice(0, digitCount)
}

export function isValidSeed(
  value: string,
  routine: KaprekarRoutine | KaprekarRoutineId = DEFAULT_KAPREKAR_ROUTINE_ID,
): boolean {
  const { digitCount } = resolveRoutine(routine)
  return isCompleteSeed(value, digitCount) && new Set(value).size > 1
}

export function getSeedError(
  value: string,
  routine: KaprekarRoutine | KaprekarRoutineId = DEFAULT_KAPREKAR_ROUTINE_ID,
): string | null {
  const { digitCount } = resolveRoutine(routine)

  if (!value) {
    return `Enter exactly ${digitCount} digits to start the routine.`
  }

  if (!isCompleteSeed(value, digitCount)) {
    return `Use exactly ${digitCount} digits. Leading zeroes count.`
  }

  if (new Set(value).size < 2) {
    return 'Use at least two different digits so the routine can move.'
  }

  return null
}

export function generateKaprekarSequence(
  seed: string,
  routine: KaprekarRoutine | KaprekarRoutineId = DEFAULT_KAPREKAR_ROUTINE_ID,
): KaprekarStep[] {
  const { constant, digitCount, maxIterations } = resolveRoutine(routine)

  if (!isValidSeed(seed, routine)) {
    return []
  }

  const steps: KaprekarStep[] = []
  const seen = new Set<string>()
  let current = seed

  for (
    let stepNumber = 1;
    stepNumber <= maxIterations && !seen.has(current);
    stepNumber += 1
  ) {
    seen.add(current)

    const descending = sortDigits(current, 'desc')
    const ascending = sortDigits(current, 'asc')
    const result = padToDigits(Number(descending) - Number(ascending), digitCount)
    const reachedConstant = result === constant

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

export function generateRandomValidSeed(
  routine: KaprekarRoutine | KaprekarRoutineId = DEFAULT_KAPREKAR_ROUTINE_ID,
): string {
  const { digitCount } = resolveRoutine(routine)
  let candidate = ''

  while (!isValidSeed(candidate, routine)) {
    candidate = padToDigits(Math.floor(Math.random() * 10 ** digitCount), digitCount)
  }

  return candidate
}
