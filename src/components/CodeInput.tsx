import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Code, Loader2, X, FileCode } from "lucide-react";

interface CodeInputProps {
  onSubmit: (code: string, filename?: string) => void;
  isLoading: boolean;
}

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".php", ".go", ".cpp", ".c", ".rb", ".rs"];

const CodeInput = ({ onSubmit, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    onSubmit(code, uploadedFile?.name);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCode("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your code here or upload a file...

function example() {
  const data = eval(userInput); // Security issue
  return data;
}"
          className="h-full min-h-[400px] font-mono text-sm bg-input border-border resize-none focus:ring-primary/50"
          disabled={isLoading}
        />
        
        {/* Line numbers overlay hint */}
        <div className="absolute top-3 right-3 text-xs text-muted-foreground/50">
          {code.split("\n").length} lines
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
