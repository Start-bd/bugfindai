import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const RouteProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  const startProgress = useCallback(() => {
    setVisible(true);
    setProgress(0);

    // Quickly animate to ~90%
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      if (currentProgress >= 90) {
        currentProgress = 90;
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 50);

    return interval;
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(100);
    
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    if (location.pathname !== prevLocation) {
      const interval = startProgress();
      
      // Complete after a short delay (simulating load completion)
      const timeout = setTimeout(() => {
        clearInterval(interval);
        completeProgress();
      }, 200);

      setPrevLocation(location.pathname);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [location.pathname, prevLocation, startProgress, completeProgress]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent pointer-events-none">
      <div
        className={cn(
          "h-full bg-gradient-to-r from-primary via-primary to-primary/70",
          "shadow-[0_0_10px_hsl(var(--primary)),0_0_5px_hsl(var(--primary))]"
        )}
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 
            ? "width 150ms ease-out, opacity 200ms ease-out 100ms" 
            : "width 150ms ease-out",
        }}
      />
    </div>
  );
};

export default RouteProgressBar;
