import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CodeInput from "@/components/CodeInput";
import ResultsPanel from "@/components/ResultsPanel";
import { Issue } from "@/components/IssueCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Scan = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    setIsLoading(true);
    setIssues([]);
    setSummary("");

    const language = detectLanguage(code, filename);
    setCurrentLanguage(language);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code, language }
      });

      if (error) {
        console.error("Analysis error:", error);
        toast({
          title: "Analysis failed",
          description: error.message || "Could not analyze the code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        toast({
          title: "Analysis error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const analysisIssues = data.issues || [];
      const analysisSummary = data.summary || "Analysis complete.";
      
      setIssues(analysisIssues);
      setSummary(analysisSummary);

      // Save to history if user is logged in
      if (user) {
        const { error: saveError } = await supabase
          .from('scan_history')
          .insert({
            user_id: user.id,
            code: code.substring(0, 10000), // Limit code size
            language,
            issues: analysisIssues,
            summary: analysisSummary,
          });

        if (saveError) {
          console.error("Failed to save scan:", saveError);
        }
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            {/* Left: Code Input */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <CodeInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* Right: Results Panel */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <ResultsPanel issues={issues} isLoading={isLoading} summary={summary} language={currentLanguage} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
