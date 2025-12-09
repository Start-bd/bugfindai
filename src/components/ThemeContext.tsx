import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SyntaxTheme = 
  | "oneDark"
  | "vscDarkPlus"
  | "dracula"
  | "atomDark"
  | "nord"
  | "synthwave84"
  | "nightOwl"
  | "coldarkDark"
  | "materialDark"
  | "okaidia";

interface SyntaxThemeContextType {
  syntaxTheme: SyntaxTheme;
  setSyntaxTheme: (theme: SyntaxTheme) => void;
}

const SyntaxThemeContext = createContext<SyntaxThemeContextType | undefined>(undefined);

export const syntaxThemeNames: Record<SyntaxTheme, string> = {
  oneDark: "One Dark",
  vscDarkPlus: "VS Code Dark+",
  dracula: "Dracula",
  atomDark: "Atom Dark",
  nord: "Nord",
  synthwave84: "Synthwave '84",
  nightOwl: "Night Owl",
  coldarkDark: "Coldark Dark",
  materialDark: "Material Dark",
  okaidia: "Okaidia",
};

export const SyntaxThemeProvider = ({ children }: { children: ReactNode }) => {
  const [syntaxTheme, setSyntaxThemeState] = useState<SyntaxTheme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("syntax-theme") as SyntaxTheme) || "oneDark";
    }
    return "oneDark";
  });

  const setSyntaxTheme = (theme: SyntaxTheme) => {
    setSyntaxThemeState(theme);
    localStorage.setItem("syntax-theme", theme);
  };

  useEffect(() => {
    const stored = localStorage.getItem("syntax-theme") as SyntaxTheme;
    if (stored && stored !== syntaxTheme) {
      setSyntaxThemeState(stored);
    }
  }, []);

  return (
    <SyntaxThemeContext.Provider value={{ syntaxTheme, setSyntaxTheme }}>
      {children}
    </SyntaxThemeContext.Provider>
  );
};

export const useSyntaxTheme = () => {
  const context = useContext(SyntaxThemeContext);
  if (!context) {
    throw new Error("useSyntaxTheme must be used within a SyntaxThemeProvider");
  }
  return context;
};
