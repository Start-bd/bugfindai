import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FolderOpen, FileCode, X, Loader2, CheckCircle, 
  AlertCircle, ChevronDown, ChevronUp, Files
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "./IssueCard";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".php", ".go", ".cpp", ".c", ".rb", ".rs"];

interface FileResult {
  name: string;
  status: "pending" | "scanning" | "complete" | "error";
  issues: Issue[];
  summary?: string;
  error?: string;
}

interface BatchFileUploadProps {
  onComplete: (results: FileResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BatchFileUpload = ({ onComplete, isLoading, setIsLoading }: BatchFileUploadProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const detectLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      php: "php",
      go: "go",
      cpp: "cpp",
      c: "c",
      rb: "ruby",
      rs: "rust",
    };
    return langMap[ext || ""] || "javascript";
  };

  const processFiles = async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length === 0) {
      toast({
        title: "No supported files",
        description: `Please select files with extensions: ${SUPPORTED_EXTENSIONS.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Some files skipped",
        description: `${selectedFiles.length - validFiles.length} file(s) had unsupported extensions.`,
      });
    }

    const fileResults: FileResult[] = await Promise.all(
      validFiles.map(async file => ({
        name: file.name,
        status: "pending" as const,
        issues: [],
        content: await file.text(),
      }))
    );

    // Track file upload event
    const fileExtensions = validFiles.map(f => '.' + f.name.split('.').pop()?.toLowerCase()).join(', ');
    trackEvent('file_upload', {
      file_count: validFiles.length,
      file_types: fileExtensions,
    });

    setFiles(prev => [...prev, ...fileResults.map(f => ({ ...f, content: undefined }))]);
    
    // Store content separately for scanning
    const filesWithContent = fileResults as (FileResult & { content: string })[];
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    return filesWithContent;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    return processFiles(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const toggleExpand = (name: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const scanAllFiles = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    const fileContents = await Promise.all(
      files.map(async f => {
        // Re-read file if needed
        const input = fileInputRef.current;
        if (input?.files) {
          const file = Array.from(input.files).find(fi => fi.name === f.name);
          if (file) {
            return { ...f, content: await file.text() };
          }
        }
        return f;
      })
    );

    const results: FileResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData = fileContents[i];
      
      // Update status to scanning
      setFiles(prev => 
        prev.map(f => f.name === file.name ? { ...f, status: "scanning" } : f)
      );

      try {
        const { data, error } = await supabase.functions.invoke('analyze-code', {
          body: { 
            code: (fileData as any).content || "",
            language: detectLanguage(file.name)
          }
        });

        if (error || data?.error) {
          results.push({
            ...file,
            status: "error",
            error: error?.message || data?.error || "Analysis failed",
            issues: [],
          });
          
          setFiles(prev =>
            prev.map(f => f.name === file.name 
              ? { ...f, status: "error", error: error?.message || data?.error }
              : f
            )
          );
        } else {
          const issuesWithFile = (data.issues || []).map((issue: Issue) => ({
            ...issue,
            file: file.name,
          }));

          results.push({
            ...file,
            status: "complete",
            issues: issuesWithFile,
            summary: data.summary,
          });

          setFiles(prev =>
            prev.map(f => f.name === file.name 
              ? { ...f, status: "complete", issues: issuesWithFile, summary: data.summary }
              : f
            )
          );
        }
      } catch (err) {
        results.push({
          ...file,
          status: "error",
          error: "Unexpected error during analysis",
          issues: [],
        });
        
        setFiles(prev =>
          prev.map(f => f.name === file.name 
            ? { ...f, status: "error", error: "Unexpected error" }
            : f
          )
        );
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setIsLoading(false);
    onComplete(results);
    
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    toast({
      title: "Batch scan complete",
      description: `Found ${totalIssues} issue(s) across ${files.length} file(s).`,
    });
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = await handleFileSelect(e);
    if (newFiles && newFiles.length > 0) {
      // Immediately start scanning after upload
      setFiles(newFiles.map(f => ({ ...f, content: undefined })));
    }
  };

  const totalIssues = files.reduce((sum, f) => sum + f.issues.length, 0);
  const completedFiles = files.filter(f => f.status === "complete" || f.status === "error").length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Files className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Batch File Scan</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Upload multiple files to scan them all at once and generate a combined report.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(",")}
        onChange={handleBatchUpload}
        className="hidden"
        multiple
      />

      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Add Files
        </Button>
        
        {files.length > 0 && (
          <Button
            onClick={scanAllFiles}
            disabled={isLoading || files.every(f => f.status === "complete")}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FolderOpen className="w-4 h-4 mr-2" />
            )}
            Scan All ({files.length})
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Scanning files...</span>
            <span className="text-primary">{completedFiles}/{files.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {files.length === 0 ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
            isDragOver 
              ? "border-primary bg-primary/10" 
              : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
          }`}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <Upload className={`w-12 h-12 mb-4 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
          <h4 className="font-medium mb-2">
            {isDragOver ? "Drop files here" : "Drag & drop files here"}
          </h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            or click to browse. Supported: {SUPPORTED_EXTENSIONS.slice(0, 5).join(", ")}...
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {files.map(file => (
              <div
                key={file.name}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div 
                  className="flex items-center gap-3 p-3 bg-secondary/30 cursor-pointer hover:bg-secondary/50"
                  onClick={() => file.issues.length > 0 && toggleExpand(file.name)}
                >
                  <FileCode className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                  
                  {file.status === "pending" && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      Pending
                    </span>
                  )}
                  {file.status === "scanning" && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {file.status === "complete" && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        file.issues.length === 0 
                          ? "bg-success/10 text-success" 
                          : "bg-critical/10 text-critical"
                      }`}>
                        {file.issues.length} issue{file.issues.length !== 1 ? "s" : ""}
                      </span>
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                  )}
                  {file.status === "error" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">Failed</span>
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                  
                  {!isLoading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.name);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {file.issues.length > 0 && (
                    expandedFiles.has(file.name) 
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {expandedFiles.has(file.name) && file.issues.length > 0 && (
                  <div className="p-3 border-t border-border bg-background/50">
                    {file.summary && (
                      <p className="text-xs text-muted-foreground mb-2">{file.summary}</p>
                    )}
                    <ul className="space-y-1">
                      {file.issues.slice(0, 5).map((issue, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            issue.severity === "critical" ? "bg-critical/10 text-critical" :
                            issue.severity === "high" ? "bg-high/10 text-high" :
                            issue.severity === "medium" ? "bg-medium/10 text-medium" :
                            "bg-low/10 text-low"
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="truncate">{issue.title}</span>
                        </li>
                      ))}
                      {file.issues.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          +{file.issues.length - 5} more issues
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {files.length > 0 && completedFiles === files.length && !isLoading && (
        <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Files: <span className="text-foreground font-medium">{files.length}</span>
            </span>
            <span className="text-muted-foreground">
              Total Issues: <span className={`font-medium ${totalIssues > 0 ? "text-critical" : "text-success"}`}>
                {totalIssues}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchFileUpload;