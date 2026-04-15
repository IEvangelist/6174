import { MoonStar, SunMedium } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  isFollowingSystem: boolean
  onToggle: () => void
}

export function ThemeToggle({
  theme,
  isFollowingSystem,
  onToggle,
}: ThemeToggleProps) {
  const isDark = theme === 'dark'
  const Icon = isDark ? SunMedium : MoonStar
  const label = `Switch to ${isDark ? 'light' : 'dark'} theme`

  return (
    <button
      aria-label={label}
      className="button-shell relative size-12 px-0 py-0"
      onClick={onToggle}
      title={isFollowingSystem ? `${label} (currently following system)` : label}
      type="button"
    >
      <Icon className="size-5" />
      {isFollowingSystem ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--accent)]"
        />
      ) : null}
    </button>
  )
}
