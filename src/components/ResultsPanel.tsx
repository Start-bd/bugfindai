import { useState } from "react";
import { Button } from "@/components/ui/button";
import IssueCard, { Issue } from "./IssueCard";
import { Download, FileJson, FileText, Filter, Bug, Shield, Zap, AlertTriangle } from "lucide-react";

interface ResultsPanelProps {
  issues: Issue[];
  isLoading: boolean;
  summary?: string;
}

type FilterType = "all" | "bug" | "vulnerability" | "performance" | "logic" | "bestPractice";

const filterConfig = {
  all: { label: "All", icon: Filter },
  bug: { label: "Bugs", icon: Bug },
  vulnerability: { label: "Security", icon: Shield },
  performance: { label: "Performance", icon: Zap },
  logic: { label: "Logic", icon: AlertTriangle },
  bestPractice: { label: "Best Practices", icon: FileText },
};

const ResultsPanel = ({ issues, isLoading, summary }: ResultsPanelProps) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredIssues = filter === "all" 
    ? issues 
    : issues.filter(issue => issue.type === filter);

  const issueStats = {
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length,
    medium: issues.filter(i => i.severity === "medium").length,
    low: issues.filter(i => i.severity === "low").length,
  };

  const downloadReport = (format: "json" | "pdf") => {
    if (format === "json") {
      const report = {
        timestamp: new Date().toISOString(),
        summary,
        statistics: issueStats,
        issues,
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bugfind-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
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
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadReport("json")}>
              <FileJson className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Severity stats */}
        <div className="flex gap-3 mb-4">
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

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(filterConfig) as FilterType[]).map((key) => {
            const config = filterConfig[key];
            const Icon = config.icon;
            const count = key === "all" ? issues.length : issues.filter(i => i.type === key).length;
            if (key !== "all" && count === 0) return null;
            
            return (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
                className="gap-1.5"
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
                <span className="text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>
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
        {filteredIssues.map((issue, index) => (
          <IssueCard key={issue.id} issue={issue} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
