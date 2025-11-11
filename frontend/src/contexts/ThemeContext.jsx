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

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;

    const applyTheme = (newTheme) => {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    };

    if (theme === 'system') {
      const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemChange = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      applyTheme(systemThemeQuery.matches ? 'dark' : 'light');
      systemThemeQuery.addEventListener('change', handleSystemChange);
      
      return () => {
        systemThemeQuery.removeEventListener('change', handleSystemChange);
      };
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};