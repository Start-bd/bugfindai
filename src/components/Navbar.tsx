import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bug, Zap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Bug className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
            <Zap className="w-3 h-3 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold text-foreground">
            BugFind<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/scan">
            <Button variant="ghost" size="sm">
              Scanner
            </Button>
          </Link>
          <Link to="/scan">
            <Button variant="hero" size="sm">
              Start Scanning
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
