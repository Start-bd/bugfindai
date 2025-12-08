import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Code, Loader2, X, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeInputProps {
  onSubmit: (code: string, filename?: string) => void;
  isLoading: boolean;
}

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".php", ".go", ".cpp", ".c", ".rb", ".rs"];

const CodeInput = ({ onSubmit, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [language, setLanguage] = useState("javascript");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const detectLanguage = (filename?: string, content?: string): string => {
    if (filename) {
      const ext = filename.split(".").pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        js: "javascript",
        jsx: "jsx",
        ts: "typescript",
        tsx: "tsx",
        py: "python",
        java: "java",
        php: "php",
        go: "go",
        cpp: "cpp",
        c: "c",
        rb: "ruby",
        rs: "rust",
      };
      if (ext && langMap[ext]) return langMap[ext];
    }
    
    if (content) {
      if (content.includes("def ") && content.includes(":")) return "python";
      if (content.includes("func ") && content.includes("package ")) return "go";
      if (content.includes("public class ") || content.includes("public static void")) return "java";
      if (content.includes("<?php")) return "php";
      if (content.includes(": string") || content.includes(": number") || content.includes("interface ")) return "typescript";
    }
    
    return "javascript";
  };

  useEffect(() => {
    setLanguage(detectLanguage(uploadedFile?.name, code));
  }, [code, uploadedFile?.name]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      alert(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`);
      return;
    }

    const content = await file.text();
    setUploadedFile({ name: file.name, content });
    setCode(content);
    setShowPreview(true);
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    onSubmit(code, uploadedFile?.name);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCode("");
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    if (e.target.value.length > 50 && !showPreview) {
      // Could enable auto-preview after typing
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Code Input
        </h2>
        
        <div className="flex items-center gap-2">
          {code.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs"
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_EXTENSIONS.join(",")}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-secondary rounded-lg">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground flex-1 truncate">{uploadedFile.name}</span>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{language}</span>
          <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 relative min-h-[400px]">
        {showPreview && code ? (
          <div className="h-full overflow-auto rounded-lg border border-border">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                minHeight: "100%",
                background: "hsl(var(--input))",
              }}
              showLineNumbers
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
        ) : (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            placeholder={`// Paste your code here or upload a file...

function example() {
  const data = eval(userInput); // Security issue
  return data;
}`}
            className="w-full h-full min-h-[400px] font-mono text-sm bg-input border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
            spellCheck={false}
          />
        )}
        
        {/* Line count and language indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground/70">
          {code && <span className="bg-secondary/80 px-2 py-0.5 rounded">{language}</span>}
          <span className="bg-secondary/80 px-2 py-0.5 rounded">{code.split("\n").length} lines</span>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!code.trim() || isLoading}
        variant="hero"
        size="lg"
        className="mt-4 w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Code...
          </>
        ) : (
          <>
            <Code className="w-5 h-5" />
            Scan for Bugs
          </>
        )}
      </Button>
    </div>
  );
};

export default CodeInput;
