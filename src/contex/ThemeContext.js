import React, { createContext, useContext, useEffect, useState } from 'react';
import { lightTheme, darkTheme } from '../constants/theme';
import { getPreferredTheme, setPreferredTheme } from '../services/storage';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    let isMounted = true;
    getPreferredTheme()
      .then((storedTheme) => {
        if (isMounted) setIsDark(storedTheme === 'dark');
      })
      .catch((error) => {
        console.error('Unable to load the saved theme preference:', error);
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    setPreferredTheme(isDark ? 'dark' : 'light').then((saved) => {
      if (!saved) console.error('Unable to save the theme preference.');
    }).catch((error) => {
      console.error('Unable to save the theme preference:', error);
    });
  }, [isDark, isHydrated]);

  const toggleTheme = () => {
    setIsDark((previous) => !previous);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};