import { Bug, Shield, Zap, Code, FileCode, GitBranch } from "lucide-react";

const features = [
  {
    icon: Bug,
    title: "Bug Detection",
    description: "Instantly identify bugs, syntax errors, and runtime issues in your code.",
  },
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Detect SQL injection, XSS, and other critical vulnerabilities.",
  },
  {
    icon: Zap,
    title: "Performance Issues",
    description: "Find memory leaks, inefficient loops, and optimization opportunities.",
  },
  {
    icon: Code,
    title: "AI Fix Suggestions",
    description: "Get intelligent, context-aware code fixes with explanations.",
  },
  {
    icon: FileCode,
    title: "Multi-Language",
    description: "Support for JavaScript, Python, TypeScript, Java, PHP, Go, and more.",
  },
  {
    icon: GitBranch,
    title: "Export Reports",
    description: "Download detailed PDF or JSON reports for your team.",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to
            <span className="gradient-text"> ship clean code</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your code across multiple dimensions to ensure quality, security, and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
