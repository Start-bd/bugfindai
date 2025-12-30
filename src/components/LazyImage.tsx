import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
}

const LazyImage = ({
  src,
  alt,
  placeholderSrc,
  blurDataURL,
  className,
  containerClassName,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a simple blur placeholder if none provided
  const defaultPlaceholder = `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <filter id="blur" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20" edgeMode="duplicate"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="1 1"/>
        </feComponentTransfer>
      </filter>
      <rect width="400" height="300" fill="hsl(145, 80%, 40%, 0.1)" filter="url(#blur)"/>
    </svg>`
  )}`;

  const placeholder = blurDataURL || placeholderSrc || defaultPlaceholder;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      {/* Blur placeholder */}
      <img
        src={placeholder}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100",
          "blur-lg scale-110"
        )}
      />

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
