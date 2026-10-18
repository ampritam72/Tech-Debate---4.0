import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'tech_debate_theme_logo_blue_v4';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch {}
  }, []);

  const toggleTheme = () => {
    // Keep dark logo-blue theme locked for eye-catching visual experience
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  };

  const setTheme = () => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
