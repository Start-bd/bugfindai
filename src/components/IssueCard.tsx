import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CodeBlock from "./CodeBlock";

export interface Issue {
  id: string;
  type: "bug" | "vulnerability" | "performance" | "logic" | "bestPractice" | "best-practice";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  line?: number;
  file?: string;
  fix: string;
  fixedCode?: string;
}

interface IssueCardProps {
  issue: Issue;
  index: number;
  language?: string;
}

const severityConfig = {
  critical: {
    color: "text-critical",
    bg: "bg-critical/10",
    border: "border-critical/30",
    icon: AlertCircle,
  },
  high: {
    color: "text-high",
    bg: "bg-high/10",
    border: "border-high/30",
    icon: AlertTriangle,
  },
  medium: {
    color: "text-medium",
    bg: "bg-medium/10",
    border: "border-medium/30",
    icon: AlertTriangle,
  },
  low: {
    color: "text-low",
    bg: "bg-low/10",
    border: "border-low/30",
    icon: Info,
  },
};

const typeLabels: Record<string, string> = {
  bug: "Bug",
  vulnerability: "Vulnerability",
  performance: "Performance",
  logic: "Logic Issue",
  bestPractice: "Best Practice",
  "best-practice": "Best Practice",
};

const IssueCard = ({ issue, index, language = "javascript" }: IssueCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  const copyFix = async () => {
    if (issue.fixedCode) {
      await navigator.clipboard.writeText(issue.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-all duration-300 animate-slide-in-right",
        config.border,
        expanded && "shadow-lg"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bg, config.color)}>
              {issue.severity.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
              {typeLabels[issue.type] || issue.type}
            </span>
            {issue.line && (
              <span className="text-xs text-muted-foreground">
                Line {issue.line}
              </span>
            )}
          </div>
          <h3 className="font-medium text-foreground truncate">{issue.title}</h3>
        </div>

        <div className="text-muted-foreground">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4 animate-fade-in">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm text-foreground">{issue.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggested Fix</h4>
            <p className="text-sm text-foreground">{issue.fix}</p>
          </div>

          {issue.fixedCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">Fixed Code</h4>
                <Button variant="ghost" size="sm" onClick={copyFix}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CodeBlock code={issue.fixedCode} language={language} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueCard;
