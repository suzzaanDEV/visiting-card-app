import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('cardly-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
  } catch { /* ignore */ }
  return 'system';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeMode] = useState(getInitialTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Keep in sync with system preference changes while in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event) => setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((mode) => {
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') return;
    setThemeMode(mode);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'system' ? systemPrefersDark : theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('cardly-theme', theme);
  }, [theme, systemPrefersDark]);

  const toggleTheme = () => {
    // Cycle through dark -> light; from 'system' resolve to the opposite of the current preference
    if (theme === 'system') {
      setThemeMode(systemPrefersDark ? 'light' : 'dark');
    } else {
      setThemeMode(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const isDark = theme === 'system' ? systemPrefersDark : theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};