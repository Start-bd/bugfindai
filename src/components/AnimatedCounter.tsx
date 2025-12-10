import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

const AnimatedCounter = ({ value, className = "" }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <span 
      className={`inline-flex items-center justify-center transition-all duration-150 ${
        isAnimating ? "scale-125 text-primary" : "scale-100"
      } ${className}`}
    >
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;
