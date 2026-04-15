import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

type ThemePreference = Theme | 'system'

const STORAGE_KEY = '6174-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system'
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)

  const theme = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (event?: MediaQueryListEvent) => {
      setSystemTheme(event ? (event.matches ? 'dark' : 'light') : getSystemTheme())
    }

    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    if (preference === 'system') {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, preference)
  }, [preference, theme])

  return {
    theme,
    isFollowingSystem: preference === 'system',
    toggleTheme: () => {
      setPreference((current) => {
        if (current === 'system') {
          return systemTheme === 'dark' ? 'light' : 'dark'
        }

        return current === 'dark' ? 'light' : 'dark'
      })
    },
  }
}
