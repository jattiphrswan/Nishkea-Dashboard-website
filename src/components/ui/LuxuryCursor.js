'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function LuxuryCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Only mount cursor on pointer fine & hover capable devices, and respect reduced motion
    if (typeof window === 'undefined') return undefined;
    const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasPointer || prefersReducedMotion) return undefined;

    setIsSupported(true);

    const onMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const checkHoverTarget = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive = target.closest('a, button, input, select, textarea, [role="button"], [role="option"], .star-border, .option-wheel__item, .category-tile, .product-card, .lookbook-card, .interactive-hover');
      setIsHovered(Boolean(isInteractive));
    };

    let rafId;
    const updateRing = () => {
      const current = posRef.current;
      const target = targetRef.current;
      // Spring lerp interpolation
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(updateRing);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', checkHoverTarget, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(updateRing);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', checkHoverTarget);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isSupported) return null;

  return (
    <>
      {/* Precision Core Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`luxury-cursor-dot ${isVisible ? 'is-visible' : ''} ${isHovered ? 'is-hover' : ''} ${isClicking ? 'is-clicking' : ''}`}
      />
      {/* Fluid Trailing Ring Follower */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`luxury-cursor-ring ${isVisible ? 'is-visible' : ''} ${isHovered ? 'is-hover' : ''} ${isClicking ? 'is-clicking' : ''}`}
      />
    </>
  );
}
