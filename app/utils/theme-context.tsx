// theme-context.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ThemeType = {
  colors: { [key: string]: string };
  fontSize?: string;
};

type ThemeContextType = {
  theme: ThemeType | null;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme: ThemeType }) {
  const [theme, setTheme] = useState<ThemeType>(initialTheme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
