import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import IssueCard, { Issue } from "./IssueCard";
import { Download, FileJson, FileText, Filter, Bug, Shield, Zap, AlertTriangle, Loader2, Copy, Check, FileCode, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResultsPanelProps {
  issues: Issue[];
  isLoading: boolean;
  summary?: string;
  language?: string;
}

type FilterType = "all" | "bug" | "vulnerability" | "performance" | "logic" | "bestPractice" | "best-practice";
type SortField = "severity" | "type" | "file";
type SortDirection = "asc" | "desc";

const filterConfig: Record<string, { label: string; icon: typeof Filter }> = {
  all: { label: "All", icon: Filter },
  bug: { label: "Bugs", icon: Bug },
  vulnerability: { label: "Security", icon: Shield },
  performance: { label: "Performance", icon: Zap },
  logic: { label: "Logic", icon: AlertTriangle },
  bestPractice: { label: "Best Practices", icon: FileText },
  "best-practice": { label: "Best Practices", icon: FileText },
};

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const ResultsPanel = ({ issues, isLoading, summary, language = "javascript" }: ResultsPanelProps) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [fileFilter, setFileFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("severity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [exporting, setExporting] = useState<"json" | "pdf" | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { toast } = useToast();

  // Get unique files from issues
  const uniqueFiles = useMemo(() => {
    const files = issues
      .map(i => i.file)
      .filter((file): file is string => !!file);
    return [...new Set(files)];
  }, [issues]);

  const filteredAndSortedIssues = useMemo(() => {
    let result = [...issues];
    
    // Apply file filter first
    if (fileFilter) {
      result = result.filter(issue => issue.file === fileFilter);
    }
    
    // Then apply type filter
    if (filter !== "all") {
      result = result.filter(issue => 
        issue.type === filter || (filter === "bestPractice" && issue.type === "best-practice")
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "severity":
          comparison = (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
          break;
        case "type":
          comparison = (a.type || "").localeCompare(b.type || "");
          break;
        case "file":
          comparison = (a.file || "").localeCompare(b.file || "");
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [issues, filter, fileFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      severity: "Severity",
      type: "Type",
      file: "File",
    };
    return labels[sortField];
  };

  const issueStats = {
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length,
    medium: issues.filter(i => i.severity === "medium").length,
    low: issues.filter(i => i.severity === "low").length,
  };

  const issuesWithFixes = issues.filter(i => i.fixedCode);

  const copyAllFixes = async () => {
    if (issuesWithFixes.length === 0) return;
    
    const allFixes = issuesWithFixes
      .map((issue, index) => {
        const header = `// Fix ${index + 1}: ${issue.title}${issue.line ? ` (Line ${issue.line})` : ""}`;
        return `${header}\n${issue.fixedCode}`;
      })
      .join("\n\n");
    
    try {
      await navigator.clipboard.writeText(allFixes);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
      toast({
        title: "Copied!",
        description: `${issuesWithFixes.length} fix${issuesWithFixes.length > 1 ? "es" : ""} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadJSON = () => {
    setExporting("json");
    try {
      const report = {
        timestamp: new Date().toISOString(),
        summary,
        statistics: issueStats,
        totalIssues: issues.length,
        issues: issues.map(issue => ({
          ...issue,
          type: issue.type,
          severity: issue.severity,
        })),
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bugfind-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "JSON report downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export JSON report.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const downloadPDF = () => {
    setExporting("pdf");
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = 20;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(45, 255, 113); // Primary green
      doc.text("BugFindAI Report", margin, yPos);
      yPos += 15;

      // Timestamp
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
      yPos += 15;

      // Summary
      if (summary) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Summary", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const summaryLines = doc.splitTextToSize(summary, contentWidth);
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // Statistics
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Statistics", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Issues: ${issues.length}`, margin, yPos);
      yPos += 5;
      if (issueStats.critical > 0) {
        doc.setTextColor(239, 68, 68);
        doc.text(`Critical: ${issueStats.critical}`, margin, yPos);
        yPos += 5;
      }
      if (issueStats.high > 0) {
        doc.setTextColor(249, 115, 22);
        doc.text(`High: ${issueStats.high}`, margin, yPos);
        yPos += 5;
      }
      if (issueStats.medium > 0) {
        doc.setTextColor(234, 179, 8);
        doc.text(`Medium: ${issueStats.medium}`, margin, yPos);
        yPos += 5;
      }
      if (issueStats.low > 0) {
        doc.setTextColor(59, 130, 246);
        doc.text(`Low: ${issueStats.low}`, margin, yPos);
        yPos += 5;
      }
      yPos += 10;

      // Issues
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Issues", margin, yPos);
      yPos += 10;

      issues.forEach((issue, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Severity color
        const severityColors: Record<string, [number, number, number]> = {
          critical: [239, 68, 68],
          high: [249, 115, 22],
          medium: [234, 179, 8],
          low: [59, 130, 246],
        };

        // Issue header
        doc.setFontSize(11);
        doc.setTextColor(...(severityColors[issue.severity] || [0, 0, 0]));
        doc.text(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`, margin, yPos);
        yPos += 6;

        // Type and line
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        const meta = `Type: ${issue.type}${issue.line ? ` | Line: ${issue.line}` : ""}`;
        doc.text(meta, margin, yPos);
        yPos += 5;

        // Description
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(issue.description, contentWidth);
        doc.text(descLines, margin, yPos);
        yPos += descLines.length * 4 + 3;

        // Fix suggestion
        doc.setFontSize(9);
        doc.setTextColor(45, 255, 113);
        doc.text("Fix:", margin, yPos);
        doc.setTextColor(60, 60, 60);
        const fixLines = doc.splitTextToSize(issue.fix, contentWidth - 10);
        yPos += 4;
        doc.text(fixLines, margin + 5, yPos);
        yPos += fixLines.length * 4 + 8;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | BugFindAI - AI-Powered Code Analysis`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`bugfind-report-${Date.now()}.pdf`);
      
      toast({
        title: "Export successful",
        description: "PDF report downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export PDF report.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <Bug className="absolute inset-0 m-auto w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Analyzing Your Code...</h3>
        <p className="text-muted-foreground text-sm">
          Scanning for bugs, vulnerabilities, and performance issues
        </p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Bug className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Code Analyzed Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Paste your code or upload a file to get started with AI-powered bug detection.
        </p>
      </div>
    );
  }

  // Get unique filter types that exist in issues
  const availableFilters = ["all", ...new Set(issues.map(i => i.type))];

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Analysis Results
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({issues.length} issues found)
            </span>
          </h2>
          
          <div className="flex items-center gap-2 flex-wrap">
            {issuesWithFixes.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyAllFixes}
                className="gap-1.5"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy All Fixes
                  </>
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadJSON}
              disabled={exporting !== null}
            >
              {exporting === "json" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="w-4 h-4 mr-2" />
              )}
              JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadPDF}
              disabled={exporting !== null}
            >
              {exporting === "pdf" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>

        {/* Severity stats */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {issueStats.critical > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-critical/10 text-critical">
              <span className="w-2 h-2 rounded-full bg-critical" />
              {issueStats.critical} Critical
            </div>
          )}
          {issueStats.high > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-high/10 text-high">
              <span className="w-2 h-2 rounded-full bg-high" />
              {issueStats.high} High
            </div>
          )}
          {issueStats.medium > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-medium/10 text-medium">
              <span className="w-2 h-2 rounded-full bg-medium" />
              {issueStats.medium} Medium
            </div>
          )}
          {issueStats.low > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-low/10 text-low">
              <span className="w-2 h-2 rounded-full bg-low" />
              {issueStats.low} Low
            </div>
          )}
        </div>

        {/* Filter and Sort controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {availableFilters.map((key) => {
              const config = filterConfig[key] || { label: key, icon: Filter };
              const Icon = config.icon;
              const count = key === "all" 
                ? (fileFilter ? issues.filter(i => i.file === fileFilter).length : issues.length)
                : issues.filter(i => 
                    (i.type === key) && (!fileFilter || i.file === fileFilter)
                  ).length;
              
              return (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key as FilterType)}
                  className="gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                  <span className="text-xs opacity-70">({count})</span>
                </Button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort: {getSortLabel()}
                {sortDirection === "asc" ? (
                  <ArrowUp className="w-3 h-3 opacity-70" />
                ) : (
                  <ArrowDown className="w-3 h-3 opacity-70" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => handleSort("severity")} className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Severity
                {sortField === "severity" && (
                  sortDirection === "asc" ? <ArrowUp className="w-3 h-3 ml-auto" /> : <ArrowDown className="w-3 h-3 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("type")} className="gap-2">
                <Filter className="w-4 h-4" />
                Type
                {sortField === "type" && (
                  sortDirection === "asc" ? <ArrowUp className="w-3 h-3 ml-auto" /> : <ArrowDown className="w-3 h-3 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("file")} className="gap-2">
                <FileCode className="w-4 h-4" />
                File Name
                {sortField === "file" && (
                  sortDirection === "asc" ? <ArrowUp className="w-3 h-3 ml-auto" /> : <ArrowDown className="w-3 h-3 ml-auto" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File filter - only show when there are multiple files */}
        {uniqueFiles.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by File</span>
              {fileFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileFilter(null)}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Button>
              )}
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {uniqueFiles.map((file) => {
                  const fileIssueCount = issues.filter(i => i.file === file).length;
                  const fileName = file.split('/').pop() || file;
                  
                  return (
                    <Button
                      key={file}
                      variant={fileFilter === file ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setFileFilter(fileFilter === file ? null : file)}
                      className="gap-1.5 shrink-0"
                      title={file}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      {fileName}
                      <span className="text-xs opacity-70">({fileIssueCount})</span>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">AI Summary</h3>
          <p className="text-sm text-foreground">{summary}</p>
        </div>
      )}

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredAndSortedIssues.map((issue, index) => (
          <IssueCard key={issue.id} issue={issue} index={index} language={language} />
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
