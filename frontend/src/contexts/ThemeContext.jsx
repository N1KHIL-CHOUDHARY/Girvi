import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyClass = (useDark) => {
      if (useDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    const updateTheme = () => {
      if (theme === 'system') {
        applyClass(mediaQuery.matches);
      } else if (theme === 'dark') {
        applyClass(true);
      } else {
        applyClass(false);
      }
    };

    root.classList.add('disable-transitions');
    updateTheme();
    localStorage.setItem('theme', theme);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('disable-transitions');
        if (!root.classList.contains('theme-transition')) {
          root.classList.add('theme-transition');
        }
      });
    });

    const handlePrefChange = () => updateTheme();
    mediaQuery.addEventListener('change', handlePrefChange);
    return () => mediaQuery.removeEventListener('change', handlePrefChange);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);