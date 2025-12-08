import { useState } from "react";
import Navbar from "@/components/Navbar";
import CodeInput from "@/components/CodeInput";
import ResultsPanel from "@/components/ResultsPanel";
import { Issue } from "@/components/IssueCard";

// Mock analysis function - will be replaced with AI
const mockAnalyzeCode = (code: string): Promise<{ issues: Issue[]; summary: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issues: Issue[] = [];
      
      // Detect eval usage
      if (code.includes("eval(") || code.includes("eval (")) {
        issues.push({
          id: "1",
          type: "vulnerability",
          severity: "critical",
          title: "Dangerous use of eval()",
          description: "Using eval() can execute arbitrary code and is a major security vulnerability. It allows attackers to inject malicious code.",
          line: code.split("\n").findIndex(l => l.includes("eval")) + 1,
          fix: "Replace eval() with a safer alternative like JSON.parse() for parsing JSON data, or use proper parsing methods for your use case.",
          fixedCode: "const result = JSON.parse(input);",
        });
      }

      // Detect innerHTML
      if (code.includes("innerHTML") || code.includes(".innerHTML =")) {
        issues.push({
          id: "2",
          type: "vulnerability",
          severity: "high",
          title: "Potential XSS vulnerability with innerHTML",
          description: "Using innerHTML with user input can lead to Cross-Site Scripting (XSS) attacks.",
          line: code.split("\n").findIndex(l => l.includes("innerHTML")) + 1,
          fix: "Use textContent instead of innerHTML, or sanitize the input before insertion.",
          fixedCode: "element.textContent = userInput;",
        });
      }

      // Detect console.log in production
      if (code.includes("console.log")) {
        issues.push({
          id: "3",
          type: "bestPractice",
          severity: "low",
          title: "Console.log statement found",
          description: "Console.log statements should be removed in production code for better performance and security.",
          line: code.split("\n").findIndex(l => l.includes("console.log")) + 1,
          fix: "Remove console.log or use a proper logging library with environment-based configuration.",
          fixedCode: "// Use a logging library like winston or pino\nlogger.debug('message');",
        });
      }

      // Detect var usage
      if (code.match(/\bvar\s+/)) {
        issues.push({
          id: "4",
          type: "bestPractice",
          severity: "low",
          title: "Use of 'var' instead of 'let' or 'const'",
          description: "'var' has function scope which can lead to unexpected behavior. Modern JavaScript should use 'let' or 'const'.",
          line: code.split("\n").findIndex(l => l.match(/\bvar\s+/)) + 1,
          fix: "Replace 'var' with 'const' for immutable values or 'let' for mutable ones.",
          fixedCode: "const value = 'example';\nlet counter = 0;",
        });
      }

      // Detect SQL injection pattern
      if (code.includes("SELECT") && (code.includes("+ ") || code.includes("${") || code.includes("' +"))) {
        issues.push({
          id: "5",
          type: "vulnerability",
          severity: "critical",
          title: "Potential SQL Injection vulnerability",
          description: "Concatenating user input directly into SQL queries can lead to SQL injection attacks.",
          line: code.split("\n").findIndex(l => l.includes("SELECT")) + 1,
          fix: "Use parameterized queries or prepared statements to safely include user input.",
          fixedCode: "const query = 'SELECT * FROM users WHERE id = ?';\ndb.execute(query, [userId]);",
        });
      }

      // Detect hardcoded secrets
      if (code.match(/password\s*=\s*['"][^'"]+['"]|api[_-]?key\s*=\s*['"][^'"]+['"]|secret\s*=\s*['"][^'"]+['"]/i)) {
        issues.push({
          id: "6",
          type: "vulnerability",
          severity: "high",
          title: "Hardcoded secret or credential",
          description: "Secrets and credentials should never be hardcoded in source code. They can be exposed through version control.",
          fix: "Use environment variables or a secure secrets manager.",
          fixedCode: "const apiKey = process.env.API_KEY;",
        });
      }

      // Detect empty catch blocks
      if (code.match(/catch\s*\([^)]*\)\s*\{\s*\}/)) {
        issues.push({
          id: "7",
          type: "bug",
          severity: "medium",
          title: "Empty catch block swallows errors",
          description: "Empty catch blocks hide errors and make debugging difficult. Errors should be logged or handled appropriately.",
          line: code.split("\n").findIndex(l => l.match(/catch/)) + 1,
          fix: "Log the error or handle it appropriately.",
          fixedCode: "catch (error) {\n  console.error('Error occurred:', error);\n  // Handle the error appropriately\n}",
        });
      }

      // Detect == instead of ===
      if (code.match(/[^!=]==[^=]/)) {
        issues.push({
          id: "8",
          type: "bug",
          severity: "medium",
          title: "Use of loose equality (==) instead of strict equality (===)",
          description: "Loose equality can lead to unexpected type coercion bugs. Use strict equality for predictable comparisons.",
          line: code.split("\n").findIndex(l => l.match(/[^!=]==[^=]/)) + 1,
          fix: "Replace == with === for strict type checking.",
          fixedCode: "if (value === expected) { ... }",
        });
      }

      // Detect synchronous operations that should be async
      if (code.includes("readFileSync") || code.includes("writeFileSync")) {
        issues.push({
          id: "9",
          type: "performance",
          severity: "medium",
          title: "Synchronous file operation blocks event loop",
          description: "Synchronous file operations block the entire Node.js event loop, affecting application performance.",
          fix: "Use async/await with the promises API or callback-based async methods.",
          fixedCode: "const data = await fs.promises.readFile(path, 'utf8');",
        });
      }

      // Detect infinite loop patterns
      if (code.match(/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/)) {
        issues.push({
          id: "10",
          type: "logic",
          severity: "high",
          title: "Potential infinite loop detected",
          description: "This loop has no visible exit condition which may cause the application to hang.",
          fix: "Add a proper exit condition or use a controlled iteration pattern.",
          fixedCode: "while (condition) {\n  // loop body\n  if (shouldExit) break;\n}",
        });
      }

      const summary = issues.length === 0
        ? "No issues found! Your code looks clean."
        : `Found ${issues.length} issue${issues.length > 1 ? "s" : ""} in your code. ${
            issues.filter(i => i.severity === "critical").length > 0
              ? "Critical security vulnerabilities require immediate attention."
              : issues.filter(i => i.severity === "high").length > 0
              ? "High severity issues should be addressed soon."
              : "Consider fixing these issues to improve code quality."
          }`;

      resolve({ issues, summary });
    }, 2000);
  });
};

const Scan = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (code: string, filename?: string) => {
    setIsLoading(true);
    setIssues([]);
    setSummary("");

    try {
      const result = await mockAnalyzeCode(code);
      setIssues(result.issues);
      setSummary(result.summary);
    } catch (error) {
      console.error("Analysis failed:", error);
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
          </div>

          <div className="grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
            {/* Left: Code Input */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <CodeInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* Right: Results Panel */}
            <div className="glass rounded-2xl p-6 border-primary/10">
              <ResultsPanel issues={issues} isLoading={isLoading} summary={summary} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
