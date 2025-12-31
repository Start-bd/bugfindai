import { PrefetchLink } from "@/components/PrefetchLink";
import { Bug } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <PrefetchLink to="/" className="flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">
              BugFind<span className="text-primary">AI</span>
            </span>
          </PrefetchLink>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BugFindAI. Ship cleaner code with AI.
          </p>

          <div className="flex items-center gap-6">
            <PrefetchLink to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </PrefetchLink>
            <PrefetchLink to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </PrefetchLink>
            <a 
              href="mailto:support@bugfindai.com" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;