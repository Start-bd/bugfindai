import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CodeInput, { CodeInputRef } from "@/components/CodeInput";
import ResultsPanel from "@/components/ResultsPanel";
import BatchFileUpload from "@/components/BatchFileUpload";
import BugPatternTemplates from "@/components/BugPatternTemplates";
import { Issue } from "@/components/IssueCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStreamingAnalysis } from "@/hooks/useStreamingAnalysis";
import { trackEvent } from "@/lib/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code, Files, BookOpen } from "lucide-react";
import { logger } from "@/lib/logger";

const Scan = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  const [activeInputTab, setActiveInputTab] = useState("single");
  const [streamingText, setStreamingText] = useState<string>("");
  const codeInputRef = useRef<CodeInputRef>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    isStreaming, 
    issues: streamedIssues, 
    summary: streamedSummary, 
    analyzeCode, 
    streamedContent,
    abort 
  } = useStreamingAnalysis();

  const handleCancelAnalysis = () => {
    abort();
    setIsLoading(false);
    toast({
      title: "Analysis cancelled",
      description: "The code analysis has been stopped.",
    });
  };

  const detectLanguage = (code: string, filename?: string): string => {
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'php': 'php',
        'go': 'go',
        'cpp': 'cpp',
        'c': 'c',
        'rb': 'ruby',
        'rs': 'rust',
      };
      if (ext && langMap[ext]) return langMap[ext];
    }
    
    // Simple detection based on syntax
    if (code.includes('def ') || code.includes('import ') && code.includes(':')) return 'python';
    if (code.includes('func ') && code.includes('package ')) return 'go';
    if (code.includes('public class ') || code.includes('public static void')) return 'java';
    if (code.includes('<?php')) return 'php';
    if (code.includes(': string') || code.includes(': number') || code.includes('interface ')) return 'typescript';
    return 'javascript';
  };

  const handleSubmit = async (code: string, filename?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the AI code analyzer.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    setIssues([]);
    setSummary("");
    setStreamingText("");

    const language = detectLanguage(code, filename);
    setCurrentLanguage(language);

    try {
      const result = await analyzeCode(code, language, (content) => {
        setStreamingText(content);
      });

      if (!result) {
        // Aborted
        return;
      }

      const analysisIssues = result.issues || [];
      const analysisSummary = result.summary || "Analysis complete.";
      
      setIssues(analysisIssues);
      setSummary(analysisSummary);

      // Track code scan event
      trackEvent('code_scan', {
        language,
        issues_found: analysisIssues.length,
        code_length: code.length,
      });

      // Save to history if user is logged in
      if (user) {
        const { error: saveError } = await supabase
          .from('scan_history')
          .insert([{
            user_id: user.id,
            code: code.substring(0, 10000),
            language,
            issues: analysisIssues as unknown as import('@/integrations/supabase/types').Json,
            summary: analysisSummary,
          }]);

        if (saveError) {
          logger.error("Failed to save scan:", saveError);
        }
      }

    } catch (error) {
      logger.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: logger.getUserMessage(error, "An unexpected error occurred. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleBatchComplete = (results: { name: string; issues: Issue[]; summary?: string }[]) => {
    const allIssues = results.flatMap(r => r.issues);
    setIssues(allIssues);
    
    const summaryParts = results
      .filter(r => r.issues.length > 0)
      .map(r => `${r.name}: ${r.issues.length} issue(s)`)
      .join(". ");
    
    setSummary(
      summaryParts 
        ? `Batch scan complete. ${summaryParts}` 
        : "Batch scan complete. No issues found!"
    );

    // Track batch scan event
    trackEvent('batch_scan', {
      file_count: results.length,
      total_issues: allIssues.length,
    });
  };

  const handleUseExample = (code: string) => {
    setActiveInputTab("single");
    // We'll set the code through the ref after tab switches
    setTimeout(() => {
      if (codeInputRef.current) {
        codeInputRef.current.clear();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-6">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              AI Code <span className="gradient-text">Scanner</span>
            </h1>
            <p className="text-muted-foreground">
              Paste your code below to detect bugs, vulnerabilities, and get AI-powered fix suggestions.
            </p>
            {!user && (
              <p className="text-sm text-muted-foreground mt-2">
                <button 
                  onClick={() => navigate('/auth')} 
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
                {" "}to save your scan history.
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
            {/* Left: Code Input with Tabs */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <Tabs value={activeInputTab} onValueChange={setActiveInputTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Single File
                  </TabsTrigger>
                  <TabsTrigger value="batch" className="flex items-center gap-2">
                    <Files className="w-4 h-4" />
                    Batch Scan
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Templates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="flex-1 mt-0 data-[state=inactive]:hidden">
                  <CodeInput ref={codeInputRef} onSubmit={handleSubmit} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="batch" className="flex-1 mt-0 data-[state=inactive]:hidden">
                  <BatchFileUpload 
                    onComplete={handleBatchComplete} 
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </TabsContent>

                <TabsContent value="templates" className="flex-1 mt-0 data-[state=inactive]:hidden">
                  <BugPatternTemplates onUseExample={handleUseExample} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: Results Panel */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <ResultsPanel 
                issues={isStreaming ? streamedIssues : issues} 
                isLoading={isLoading || isStreaming} 
                summary={isStreaming ? streamedSummary : summary} 
                language={currentLanguage}
                streamingText={isStreaming ? streamedContent : undefined}
                onCancel={handleCancelAnalysis}
                liveIssueCount={isStreaming ? streamedIssues.length : undefined}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
