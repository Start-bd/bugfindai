import { PrefetchLink } from "@/components/PrefetchLink";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(45,255,113,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,255,113,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Code Analysis</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Find & fix bugs
            <br />
            <span className="gradient-text">instantly with AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Paste your code, upload files, or connect your repo. 
            Get instant bug detection, vulnerability scanning, and AI-powered fix suggestions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <PrefetchLink to="/scan">
              <Button variant="hero" size="xl" className="group">
                Start Scanning Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </PrefetchLink>
            <a href="#demo-preview">
              <Button variant="glass" size="xl">
                View Demo
              </Button>
            </a>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Vulnerability Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI Fix Suggestions</span>
            </div>
          </div>
        </div>

        {/* Code preview mockup */}
        <div id="demo-preview" className="mt-20 max-w-5xl mx-auto animate-fade-in-up scroll-mt-24" style={{ animationDelay: "0.5s" }}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl" />
            <div className="relative glass rounded-2xl p-1 border-primary/20">
              <div className="bg-card rounded-xl overflow-hidden">
                {/* Window controls */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">bugfind-ai-scanner</span>
                </div>
                
                {/* Code preview */}
                <div className="p-6 font-mono text-sm">
                  <div className="flex gap-4">
                    <div className="text-muted-foreground/50 select-none">
                      {[1,2,3,4,5,6,7].map(n => <div key={n}>{n}</div>)}
                    </div>
                    <div className="flex-1">
                      <div><span className="text-primary">function</span> <span className="text-foreground">processData</span>(<span className="text-warning">input</span>) {"{"}</div>
                      <div className="pl-4"><span className="text-muted-foreground">// TODO: Add input validation</span></div>
                      <div className="pl-4 bg-destructive/10 border-l-2 border-destructive"><span className="text-primary">const</span> result = <span className="text-warning">eval</span>(input); <span className="text-destructive">// ⚠️ Security vulnerability</span></div>
                      <div className="pl-4"><span className="text-primary">return</span> result;</div>
                      <div>{"}"}</div>
                      <div className="mt-2 text-primary">// ✓ AI suggests: Use JSON.parse() for safe parsing</div>
                      <div className="text-success">// ✓ Fixed: const result = JSON.parse(input);</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;