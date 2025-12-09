import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bug, Zap, LogOut, User, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import SyntaxThemeSelector from "@/components/SyntaxThemeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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

        <div className="flex items-center gap-2">
          <Link to="/scan">
            <Button variant="ghost" size="sm">
              Scanner
            </Button>
          </Link>
          
          <SyntaxThemeSelector />
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/history')}>
                  <History className="w-4 h-4 mr-2" />
                  Scan History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/scan">
                <Button variant="hero" size="sm">
                  Start Scanning
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
