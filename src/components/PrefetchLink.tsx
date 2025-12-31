import { Link, LinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { prefetchRoute } from "@/hooks/usePrefetch";

interface PrefetchLinkProps extends LinkProps {
  prefetchOnHover?: boolean;
}

const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, prefetchOnHover = true, onMouseEnter, onFocus, children, ...props }, ref) => {
    const handlePrefetch = useCallback(() => {
      if (prefetchOnHover && typeof to === "string") {
        prefetchRoute(to);
      }
    }, [to, prefetchOnHover]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        handlePrefetch();
        onMouseEnter?.(e);
      },
      [handlePrefetch, onMouseEnter]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLAnchorElement>) => {
        handlePrefetch();
        onFocus?.(e);
      },
      [handlePrefetch, onFocus]
    );

    return (
      <Link
        ref={ref}
        to={to}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

PrefetchLink.displayName = "PrefetchLink";

export { PrefetchLink };
