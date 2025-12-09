import { useEffect } from "react";
import { Keyboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeyboardShortcutsProps {
  onScan: () => void;
  onClear: () => void;
  canScan: boolean;
  canClear: boolean;
}

const KeyboardShortcuts = ({ onScan, onClear, canScan, canClear }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to scan
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canScan) {
        e.preventDefault();
        onScan();
      }
      
      // Escape to clear
      if (e.key === "Escape" && canClear) {
        e.preventDefault();
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, onClear, canScan, canClear]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="space-y-1">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded border border-border">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded border border-border">Enter</kbd>
            <span className="text-muted-foreground">Scan code</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded border border-border">Esc</kbd>
            <span className="text-muted-foreground">Clear input</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KeyboardShortcuts;
