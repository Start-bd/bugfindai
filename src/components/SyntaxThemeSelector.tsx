import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSyntaxTheme, syntaxThemeNames, SyntaxTheme } from "./ThemeContext";
import { cn } from "@/lib/utils";

const themePreviewColors: Record<SyntaxTheme, { bg: string; accent: string }> = {
  oneDark: { bg: "#282c34", accent: "#61afef" },
  vscDarkPlus: { bg: "#1e1e1e", accent: "#569cd6" },
  dracula: { bg: "#282a36", accent: "#ff79c6" },
  atomDark: { bg: "#1d1f21", accent: "#96cbfe" },
  nord: { bg: "#2e3440", accent: "#88c0d0" },
  synthwave84: { bg: "#262335", accent: "#f97e72" },
  nightOwl: { bg: "#011627", accent: "#82aaff" },
  coldarkDark: { bg: "#111b27", accent: "#6cb8e6" },
  materialDark: { bg: "#212121", accent: "#89ddff" },
  okaidia: { bg: "#272822", accent: "#f92672" },
};

const SyntaxThemeSelector = () => {
  const { syntaxTheme, setSyntaxTheme } = useSyntaxTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{syntaxThemeNames[syntaxTheme]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Syntax Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(syntaxThemeNames) as SyntaxTheme[]).map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => setSyntaxTheme(theme)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              syntaxTheme === theme && "bg-secondary"
            )}
          >
            <div
              className="w-4 h-4 rounded-sm border border-border flex items-center justify-center"
              style={{ backgroundColor: themePreviewColors[theme].bg }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themePreviewColors[theme].accent }}
              />
            </div>
            <span className="flex-1">{syntaxThemeNames[theme]}</span>
            {syntaxTheme === theme && (
              <span className="text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SyntaxThemeSelector;
