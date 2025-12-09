import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ChevronRight, Code, Shield, Zap, Bug, AlertTriangle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useSyntaxStyle } from "@/hooks/useSyntaxStyle";

interface BugPattern {
  id: string;
  title: string;
  category: "security" | "performance" | "logic" | "bug";
  language: string;
  description: string;
  buggyCode: string;
  fixedCode: string;
  explanation: string;
}

const bugPatterns: BugPattern[] = [
  {
    id: "sql-injection",
    title: "SQL Injection",
    category: "security",
    language: "javascript",
    description: "User input directly concatenated in SQL query",
    buggyCode: `// ❌ Vulnerable to SQL injection
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query);`,
    fixedCode: `// ✅ Using parameterized queries
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);`,
    explanation: "Never concatenate user input directly into SQL queries. Use parameterized queries or prepared statements to prevent injection attacks."
  },
  {
    id: "xss-vulnerability",
    title: "Cross-Site Scripting (XSS)",
    category: "security",
    language: "javascript",
    description: "Rendering user input without sanitization",
    buggyCode: `// ❌ Vulnerable to XSS
element.innerHTML = userInput;

// Also dangerous in React:
<div dangerouslySetInnerHTML={{ __html: userInput }} />`,
    fixedCode: `// ✅ Use textContent for plain text
element.textContent = userInput;

// ✅ In React, use normal interpolation
<div>{userInput}</div>

// ✅ If HTML needed, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`,
    explanation: "Always sanitize user input before rendering as HTML. Use textContent instead of innerHTML when possible, or use a sanitization library like DOMPurify."
  },
  {
    id: "eval-usage",
    title: "Dangerous eval() Usage",
    category: "security",
    language: "javascript",
    description: "Using eval() with dynamic content",
    buggyCode: `// ❌ Dangerous - can execute arbitrary code
const result = eval(userExpression);

// ❌ Also dangerous
const fn = new Function('return ' + userCode);`,
    fixedCode: `// ✅ Use JSON.parse for JSON data
const data = JSON.parse(jsonString);

// ✅ Use a safe expression parser for math
import { evaluate } from 'mathjs';
const result = evaluate(mathExpression);`,
    explanation: "eval() can execute arbitrary code, making it a security risk. Use JSON.parse for JSON data, or specialized libraries for safe expression evaluation."
  },
  {
    id: "memory-leak",
    title: "Memory Leak in useEffect",
    category: "performance",
    language: "typescript",
    description: "Missing cleanup in React useEffect with subscriptions",
    buggyCode: `// ❌ Memory leak - no cleanup
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });
}, []);

// ❌ Also leaks - interval never cleared
useEffect(() => {
  setInterval(() => fetchData(), 5000);
}, []);`,
    fixedCode: `// ✅ Proper cleanup
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });
  return () => subscription.unsubscribe();
}, []);

// ✅ Clear interval on unmount
useEffect(() => {
  const id = setInterval(() => fetchData(), 5000);
  return () => clearInterval(id);
}, []);`,
    explanation: "Always return a cleanup function from useEffect when setting up subscriptions, timers, or event listeners to prevent memory leaks."
  },
  {
    id: "n-plus-one",
    title: "N+1 Query Problem",
    category: "performance",
    language: "javascript",
    description: "Fetching related data in a loop",
    buggyCode: `// ❌ N+1 queries - very slow
const users = await db.query("SELECT * FROM users");
for (const user of users) {
  const posts = await db.query(
    "SELECT * FROM posts WHERE user_id = " + user.id
  );
  user.posts = posts;
}`,
    fixedCode: `// ✅ Single query with JOIN or batch fetch
const users = await db.query(\`
  SELECT u.*, p.* 
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
\`);

// ✅ Or fetch all posts in one query
const users = await db.query("SELECT * FROM users");
const userIds = users.map(u => u.id);
const posts = await db.query(
  "SELECT * FROM posts WHERE user_id IN (?)",
  [userIds]
);`,
    explanation: "Avoid fetching related data in loops. Use JOINs or batch fetch all related data in a single query to dramatically improve performance."
  },
  {
    id: "race-condition",
    title: "Race Condition in State",
    category: "logic",
    language: "typescript",
    description: "Using stale state in async operations",
    buggyCode: `// ❌ Race condition - count may be stale
const [count, setCount] = useState(0);

const increment = async () => {
  await someAsyncOperation();
  setCount(count + 1); // Uses stale count
};`,
    fixedCode: `// ✅ Use functional update
const [count, setCount] = useState(0);

const increment = async () => {
  await someAsyncOperation();
  setCount(prev => prev + 1); // Always uses latest
};`,
    explanation: "When updating state based on previous state, especially after async operations, use the functional update form to avoid race conditions."
  },
  {
    id: "floating-point",
    title: "Floating Point Precision",
    category: "bug",
    language: "javascript",
    description: "Money calculations with floating point numbers",
    buggyCode: `// ❌ Floating point errors
const price = 0.1 + 0.2; // 0.30000000000000004
const total = price * 3;  // Wrong!

// ❌ Comparing floats directly
if (0.1 + 0.2 === 0.3) { // false! }`,
    fixedCode: `// ✅ Use integers (cents) for money
const priceInCents = 10 + 20; // 30
const totalInCents = priceInCents * 3; // 90
const displayPrice = totalInCents / 100; // $0.90

// ✅ Use a decimal library
import Decimal from 'decimal.js';
const price = new Decimal('0.1').plus('0.2'); // 0.3`,
    explanation: "Floating point numbers can't represent all decimal values exactly. For money, use integers (cents) or a decimal library like decimal.js."
  },
  {
    id: "null-check",
    title: "Missing Null Checks",
    category: "bug",
    language: "typescript",
    description: "Accessing properties without null checks",
    buggyCode: `// ❌ Will crash if user is null/undefined
const name = user.profile.name;

// ❌ Array access without check
const first = items[0].value;`,
    fixedCode: `// ✅ Optional chaining
const name = user?.profile?.name;

// ✅ With default value
const name = user?.profile?.name ?? 'Unknown';

// ✅ Array with bounds check
const first = items?.[0]?.value;`,
    explanation: "Use optional chaining (?.) and nullish coalescing (??) to safely access nested properties and provide default values."
  },
  {
    id: "async-loop",
    title: "Async Operations in Loop",
    category: "performance",
    language: "javascript",
    description: "Sequential async calls that could be parallel",
    buggyCode: `// ❌ Sequential - very slow
for (const id of ids) {
  const data = await fetchData(id);
  results.push(data);
}`,
    fixedCode: `// ✅ Parallel execution - much faster
const results = await Promise.all(
  ids.map(id => fetchData(id))
);

// ✅ With error handling
const results = await Promise.allSettled(
  ids.map(id => fetchData(id))
);`,
    explanation: "When async operations are independent, use Promise.all() to run them in parallel instead of waiting for each one sequentially."
  },
  {
    id: "secrets-exposed",
    title: "Exposed API Keys",
    category: "security",
    language: "javascript",
    description: "Hardcoded secrets in client-side code",
    buggyCode: `// ❌ Never do this in frontend code!
const API_KEY = "sk-abc123secret456";
const stripe = new Stripe(API_KEY);

// ❌ Also exposed in git
const config = {
  dbPassword: "admin123"
};`,
    fixedCode: `// ✅ Use environment variables (server-side only)
const API_KEY = process.env.STRIPE_SECRET_KEY;

// ✅ For frontend, use public keys only
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// ✅ Call API through your backend
const response = await fetch('/api/create-payment', {
  method: 'POST',
  body: JSON.stringify({ amount })
});`,
    explanation: "Never hardcode secrets in code, especially frontend code. Use environment variables and keep secret keys on the server side only."
  }
];

const categoryConfig = {
  security: { icon: Shield, color: "text-critical", bg: "bg-critical/10" },
  performance: { icon: Zap, color: "text-medium", bg: "bg-medium/10" },
  logic: { icon: AlertTriangle, color: "text-high", bg: "bg-high/10" },
  bug: { icon: Bug, color: "text-low", bg: "bg-low/10" },
};

interface BugPatternTemplatesProps {
  onUseExample: (code: string) => void;
}

const BugPatternTemplates = ({ onUseExample }: BugPatternTemplatesProps) => {
  const syntaxStyle = useSyntaxStyle();
  const [selectedPattern, setSelectedPattern] = useState<BugPattern | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredPatterns = categoryFilter === "all" 
    ? bugPatterns 
    : bugPatterns.filter(p => p.category === categoryFilter);

  if (selectedPattern) {
    const config = categoryConfig[selectedPattern.category];
    const Icon = config.icon;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPattern(null)}>
            ← Back
          </Button>
          <div className={`flex items-center gap-2 px-2 py-1 rounded ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {selectedPattern.category.charAt(0).toUpperCase() + selectedPattern.category.slice(1)}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{selectedPattern.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{selectedPattern.description}</p>

        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            <div>
              <h4 className="text-sm font-medium text-destructive mb-2">❌ Buggy Code</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <SyntaxHighlighter
                  language={selectedPattern.language}
                  style={syntaxStyle}
                  customStyle={{ margin: 0, padding: "1rem", fontSize: "0.8rem" }}
                >
                  {selectedPattern.buggyCode}
                </SyntaxHighlighter>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-primary mb-2">✅ Fixed Code</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <SyntaxHighlighter
                  language={selectedPattern.language}
                  style={syntaxStyle}
                  customStyle={{ margin: 0, padding: "1rem", fontSize: "0.8rem" }}
                >
                  {selectedPattern.fixedCode}
                </SyntaxHighlighter>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="text-sm font-medium mb-2">💡 Explanation</h4>
              <p className="text-sm text-muted-foreground">{selectedPattern.explanation}</p>
            </div>

            <Button 
              onClick={() => onUseExample(selectedPattern.buggyCode)} 
              className="w-full"
              variant="outline"
            >
              <Code className="w-4 h-4 mr-2" />
              Try Scanning This Example
            </Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Bug Pattern Templates</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Learn from common bug patterns and understand how to fix them.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "security", "performance", "logic", "bug"].map(cat => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {filteredPatterns.map(pattern => {
            const config = categoryConfig[pattern.category];
            const Icon = config.icon;
            
            return (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{pattern.title}</h4>
                      <p className="text-xs text-muted-foreground">{pattern.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BugPatternTemplates;