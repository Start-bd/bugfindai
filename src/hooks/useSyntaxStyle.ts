import { useMemo } from "react";
import { useSyntaxTheme, SyntaxTheme } from "@/components/ThemeContext";

// Import all the syntax highlighting themes
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { synthwave84 } from "react-syntax-highlighter/dist/esm/styles/prism";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

const themeMap: Record<SyntaxTheme, typeof oneDark> = {
  oneDark,
  vscDarkPlus,
  dracula,
  atomDark,
  nord,
  synthwave84,
  nightOwl,
  coldarkDark,
  materialDark,
  okaidia,
};

export const useSyntaxStyle = () => {
  const { syntaxTheme } = useSyntaxTheme();
  
  const style = useMemo(() => {
    return themeMap[syntaxTheme] || oneDark;
  }, [syntaxTheme]);

  return style;
};
