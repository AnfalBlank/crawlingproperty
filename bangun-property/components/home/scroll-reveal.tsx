"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({ children, delay = 0, threshold = 0.15, className = "" }: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>(threshold);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
