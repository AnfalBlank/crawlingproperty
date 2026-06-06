"use client";

import { useCountUpOnView } from "@/hooks/use-scroll-reveal";
import { formatNumber } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  duration = 1500,
}: AnimatedCounterProps) {
  const { ref, value: current } = useCountUpOnView(value, duration);
  const formatted = formatNumber(current, decimals);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
