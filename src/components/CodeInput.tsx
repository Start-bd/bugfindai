import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Code, Loader2, X, FileCode, Github, Link, AlertCircle, AlertTriangle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSyntaxStyle } from "@/hooks/useSyntaxStyle";
import { logger } from "@/lib/logger";

interface CodeInputProps {
  onSubmit: (code: string, filename?: string) => void;
  isLoading: boolean;
}

export interface CodeInputRef {
  clear: () => void;
  submit: () => void;
  hasCode: () => boolean;
}

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".php", ".go", ".cpp", ".c", ".rb", ".rs"];
const MAX_CODE_SIZE = 100000; // 100KB - matches server limit
const WARNING_THRESHOLD = 0.8; // Show warning at 80% of limit

const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(({ onSubmit, isLoading }, ref) => {
  const syntaxStyle = useSyntaxStyle();
  const [code, setCode] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [language, setLanguage] = useState("javascript");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubError, setGithubError] = useState("");
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clear: clearFile,
    submit: handleSubmit,
    hasCode: () => code.trim().length > 0,
  }));

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

  const convertGithubUrlToRaw = (url: string): { rawUrl: string; filename: string } | null => {
    try {
      // Handle various GitHub URL formats
      // https://github.com/user/repo/blob/branch/path/to/file.js
      // https://raw.githubusercontent.com/user/repo/branch/path/to/file.js
      
      const githubBlobRegex = /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
      const rawGithubRegex = /raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/;
      
      let match = url.match(githubBlobRegex);
      if (match) {
        const [, user, repo, branch, path] = match;
        const filename = path.split("/").pop() || "file";
        return {
          rawUrl: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`,
          filename
        };
      }
      
      match = url.match(rawGithubRegex);
      if (match) {
        const [, , , , path] = match;
        const filename = path.split("/").pop() || "file";
        return { rawUrl: url, filename };
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const fetchGithubCode = async () => {
    if (!githubUrl.trim()) return;
    
    setGithubError("");
    setIsFetchingGithub(true);
    
    try {
      const result = convertGithubUrlToRaw(githubUrl);
      
      if (!result) {
        setGithubError("Invalid GitHub URL. Please use a link to a file (e.g., github.com/user/repo/blob/main/file.js)");
        setIsFetchingGithub(false);
        return;
      }

      const { rawUrl, filename } = result;
      
      // Check file extension
      const extension = "." + filename.split(".").pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        setGithubError(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`);
        setIsFetchingGithub(false);
        return;
      }

      const response = await fetch(rawUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          setGithubError("File not found. Make sure the repository is public and the URL is correct.");
        } else {
          setGithubError("Failed to fetch file. Please check the URL and try again.");
        }
        setIsFetchingGithub(false);
        return;
      }

      const content = await response.text();
      setUploadedFile({ name: filename, content });
      setCode(content);
      setShowPreview(true);
      setActiveTab("paste"); // Switch to paste tab to show the code
      
    } catch (error) {
      logger.error("GitHub fetch error:", error);
      setGithubError("Failed to fetch file. Please check the URL and try again.");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    onSubmit(code, uploadedFile?.name);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCode("");
    setShowPreview(false);
    setGithubUrl("");
    setGithubError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Paste / Upload
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <div className="flex items-center justify-end mb-3">
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

          <div className="flex-1 relative min-h-[350px]">
            {showPreview && code ? (
              <div className="h-full overflow-auto rounded-lg border border-border">
                <SyntaxHighlighter
                  language={language}
                  style={syntaxStyle}
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
                className="w-full h-full min-h-[350px] font-mono text-sm bg-input border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
                spellCheck={false}
              />
            )}
            
            {/* Line count, size, and language indicator */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground/70">
              {code && <span className="bg-secondary/80 px-2 py-0.5 rounded">{language}</span>}
              <span className="bg-secondary/80 px-2 py-0.5 rounded">{code.split("\n").length} lines</span>
              
              {/* Size indicator with progress bar */}
              <div className={`px-2 py-1 rounded flex items-center gap-2 ${
                code.length > MAX_CODE_SIZE 
                  ? 'bg-destructive/20' 
                  : code.length > MAX_CODE_SIZE * WARNING_THRESHOLD 
                    ? 'bg-yellow-500/20' 
                    : 'bg-secondary/80'
              }`}>
                {code.length > MAX_CODE_SIZE * WARNING_THRESHOLD && code.length <= MAX_CODE_SIZE && (
                  <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                )}
                {code.length > MAX_CODE_SIZE && (
                  <AlertCircle className="w-3 h-3 text-destructive" />
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-default">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                              code.length > MAX_CODE_SIZE 
                                ? 'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.5)]' 
                                : code.length > MAX_CODE_SIZE * WARNING_THRESHOLD 
                                  ? 'bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.4)]' 
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min((code.length / MAX_CODE_SIZE) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`${
                          code.length > MAX_CODE_SIZE 
                            ? 'text-destructive' 
                            : code.length > MAX_CODE_SIZE * WARNING_THRESHOLD 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : ''
                        }`}>
                          {Math.round(code.length / 1000)}KB
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{code.length.toLocaleString()} / {MAX_CODE_SIZE.toLocaleString()} bytes ({Math.round((code.length / MAX_CODE_SIZE) * 100)}% used)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="github" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-lg bg-secondary/30">
            <Github className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Import from GitHub</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Paste a GitHub URL to a file in a public repository. We'll fetch the code and analyze it for bugs.
            </p>
            
            <div className="w-full max-w-lg space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      setGithubError("");
                    }}
                    placeholder="https://github.com/user/repo/blob/main/file.js"
                    className="pl-10"
                    disabled={isFetchingGithub}
                  />
                </div>
                <Button
                  onClick={fetchGithubCode}
                  disabled={!githubUrl.trim() || isFetchingGithub}
                  variant="default"
                >
                  {isFetchingGithub ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </Button>
              </div>
              
              {githubError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {githubError}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                Supported files: {SUPPORTED_EXTENSIONS.join(", ")}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {code.length > MAX_CODE_SIZE * WARNING_THRESHOLD && code.length <= MAX_CODE_SIZE && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Approaching size limit ({Math.round((code.length / MAX_CODE_SIZE) * 100)}% of {MAX_CODE_SIZE / 1000}KB used).</span>
        </div>
      )}

      {code.length > MAX_CODE_SIZE && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Code exceeds the maximum size of {MAX_CODE_SIZE / 1000}KB. Please reduce the code size to submit.</span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <Button
          onClick={handleSubmit}
          disabled={!code.trim() || isLoading || code.length > MAX_CODE_SIZE}
          variant="hero"
          size="lg"
          className="flex-1"
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
        
        <KeyboardShortcuts
          onScan={handleSubmit}
          onClear={clearFile}
          canScan={code.trim().length > 0 && !isLoading && code.length <= MAX_CODE_SIZE}
          canClear={code.trim().length > 0 || !!uploadedFile || !!githubUrl}
        />
      </div>
    </div>
  );
});

CodeInput.displayName = "CodeInput";

export default CodeInput;
