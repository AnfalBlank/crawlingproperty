"use client";

import { useEffect, useRef } from "react";

/**
 * Adds .revealed class to an element when it scrolls into view.
 * Pair with the .reveal class from globals.css.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Counts up to a target value with easing.
 */
import { useState } from "react";

export function useCountUp(target: number, duration = 1200, startWhen = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhen) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, startWhen]);

  return value;
}

/**
 * Triggers a count-up only when the element enters viewport.
 */
export function useCountUpOnView(target: number, duration = 1200) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const value = useCountUp(target, duration, inView);
  return { ref, value };
}
