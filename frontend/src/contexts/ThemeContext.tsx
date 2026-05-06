import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '../types';

interface Ctx { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<Ctx>({ theme:'light', toggleTheme:()=>{} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const s = localStorage.getItem('mood-theme');
    if (s === 'dark' || s === 'light') return s;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('mood-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t==='light'?'dark':'light') }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);