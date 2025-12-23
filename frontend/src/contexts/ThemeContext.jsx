import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (newTheme) => {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      setResolvedTheme(newTheme);
    };

    const resolveTheme = (targetTheme) =>
      targetTheme === 'system'
        ? systemThemeQuery.matches
          ? 'dark'
          : 'light'
        : targetTheme;

    const handleSystemChange = (e) => {
      const next = e.matches ? 'dark' : 'light';
      applyTheme(next);
    };

    const nextTheme = resolveTheme(theme);
    applyTheme(nextTheme);

    if (theme === 'system') {
      systemThemeQuery.addEventListener('change', handleSystemChange);
      return () => {
        systemThemeQuery.removeEventListener('change', handleSystemChange);
      };
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    isDarkMode: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};