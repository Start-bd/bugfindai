import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowLeftRight } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useSyntaxStyle } from "@/hooks/useSyntaxStyle";

interface CodeComparisonProps {
  originalCode: string;
  fixedCode: string;
  language?: string;
  title?: string;
}

const CodeComparison = ({ originalCode, fixedCode, language = "javascript", title }: CodeComparisonProps) => {
  const syntaxStyle = useSyntaxStyle();
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);

  const copyToClipboard = async (code: string, type: "original" | "fixed") => {
    await navigator.clipboard.writeText(code);
    if (type === "original") {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedFixed(true);
      setTimeout(() => setCopiedFixed(false), 2000);
    }
  };

  const codeStyle = {
    margin: 0,
    padding: "1rem",
    fontSize: "0.8rem",
    background: "hsl(var(--input))",
    borderRadius: "0.5rem",
  };

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeftRight className="w-4 h-4" />
          {title}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Code */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
              Original Code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(originalCode, "original")}
              className="h-7 text-xs"
            >
              {copiedOriginal ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="overflow-auto rounded-lg border border-destructive/20 max-h-[300px]">
            <SyntaxHighlighter
              language={language}
              style={syntaxStyle}
              customStyle={codeStyle}
              showLineNumbers
              lineNumberStyle={{
                minWidth: "2em",
                paddingRight: "0.8em",
                color: "hsl(var(--muted-foreground))",
                opacity: 0.5,
              }}
            >
              {originalCode}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Fixed Code */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
              Fixed Code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(fixedCode, "fixed")}
              className="h-7 text-xs"
            >
              {copiedFixed ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="overflow-auto rounded-lg border border-success/20 max-h-[300px]">
            <SyntaxHighlighter
              language={language}
              style={syntaxStyle}
              customStyle={codeStyle}
              showLineNumbers
              lineNumberStyle={{
                minWidth: "2em",
                paddingRight: "0.8em",
                color: "hsl(var(--muted-foreground))",
                opacity: 0.5,
              }}
            >
              {fixedCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeComparison;
