import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('lib_theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  // Synchronize on mount and state changes
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      try { localStorage.setItem('lib_theme', 'dark') } catch {}
    } else {
      root.classList.remove('dark')
      try { localStorage.setItem('lib_theme', 'light') } catch {}
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      const root = document.documentElement
      if (next) {
        root.classList.add('dark')
        try { localStorage.setItem('lib_theme', 'dark') } catch {}
      } else {
        root.classList.remove('dark')
        try { localStorage.setItem('lib_theme', 'light') } catch {}
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
