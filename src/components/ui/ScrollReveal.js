'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.12,
  delay = 0,
  direction = 'up',
  style = {},
  ...rest
}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Respect reduced motion preference
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${direction} ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
