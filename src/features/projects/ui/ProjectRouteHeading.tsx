import { useEffect, useRef, type JSX, type ReactNode } from 'react';

interface ProjectRouteHeadingProps {
  children: ReactNode;
  className: string;
  focusOnMount?: boolean | undefined;
}

export function ProjectRouteHeading({
  children,
  className,
  focusOnMount = false,
}: ProjectRouteHeadingProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) {
      headingRef.current?.focus();
    }
  }, [focusOnMount]);

  return (
    <h1 ref={headingRef} tabIndex={focusOnMount ? -1 : undefined} className={className}>
      {children}
    </h1>
  );
}
