import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useSyntaxStyle } from "@/hooks/useSyntaxStyle";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock = ({ code, language = "javascript", className = "" }: CodeBlockProps) => {
  const syntaxStyle = useSyntaxStyle();
  
  // Map common language names to Prism language identifiers
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    python: "python",
    java: "java",
    php: "php",
    go: "go",
    cpp: "cpp",
    c: "c",
    rb: "ruby",
    ruby: "ruby",
    rs: "rust",
    rust: "rust",
    sql: "sql",
    json: "json",
    html: "html",
    css: "css",
  };

  const mappedLanguage = languageMap[language.toLowerCase()] || language;

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <SyntaxHighlighter
        language={mappedLanguage}
        style={syntaxStyle}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
          background: "hsl(var(--input))",
        }}
        showLineNumbers={code.split("\n").length > 3}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: "hsl(var(--muted-foreground))",
          opacity: 0.5,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
