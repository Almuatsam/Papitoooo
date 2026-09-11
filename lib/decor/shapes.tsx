"use client";

/**
 * Small flat Y2K decorative shapes, single-colour (`currentColor`) so they
 * pick up theme accents via Tailwind text-color utilities. Used as literal
 * decoration in the app chrome (see components/theme/decor/*) and as the
 * basis for a few sticker collections.
 */
import type { SVGProps } from "react";

export type ShapeProps = SVGProps<SVGSVGElement>;

export function HeartShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21s-7.5-4.6-10.2-9.1C.3 9.1 1.2 5.6 4.4 4.5c2-.7 4 .1 5.1 1.8l2.5 3.6 2.5-3.6c1.1-1.7 3.1-2.5 5.1-1.8 3.2 1.1 4.1 4.6 2.6 7.4C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export function StarShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17l-6.4 4 1.7-7.2-5.6-4.9 7.4-.6z" />
    </svg>
  );
}

export function SparkleShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.6 4 3 7.2 7 8-4 .8-6.4 4-7 8-.6-4-3-7.2-7-8 4-.8 6.4-4 7-8z" />
      <circle cx="20" cy="5" r="1.4" />
      <circle cx="4" cy="19" r="1" />
    </svg>
  );
}

export function FlowerShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="6.5" r="3.4" />
      <circle cx="17.5" cy="10.2" r="3.4" />
      <circle cx="15.5" cy="16.4" r="3.4" />
      <circle cx="8.5" cy="16.4" r="3.4" />
      <circle cx="6.5" cy="10.2" r="3.4" />
      <circle cx="12" cy="12" r="2.6" opacity="0.55" />
    </svg>
  );
}

export function LightningShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 1 4 14h6l-1.5 9L20 10h-7z" />
    </svg>
  );
}

export function WaveShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...props}>
      <path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 5-4" />
    </svg>
  );
}

export function BubbleShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.5" cy="8" r="2" opacity="0.5" />
    </svg>
  );
}

export function BowShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11 12c-2.4-3.5-6-5.5-8.4-4.2-2 1.1-1.6 4.3.8 6.2 2 1.6 5.4 1.6 7.6-2z" />
      <path d="M13 12c2.4-3.5 6-5.5 8.4-4.2 2 1.1 1.6 4.3-.8 6.2-2 1.6-5.4 1.6-7.6-2z" />
      <circle cx="12" cy="12" r="2.1" />
    </svg>
  );
}

export function CheckerShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="2" y="2" width="9" height="9" />
      <rect x="13" y="13" width="9" height="9" />
    </svg>
  );
}

export function DotShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function SwirlShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...props}>
      <path d="M4 14c0-5 4-9 9-9 3.9 0 7 3.1 7 7s-2.6 6-6 6-5-2-5-4.5 1.8-4 4-4 3.5 1.4 3.5 3" />
    </svg>
  );
}

export function CameraFlashShape(props: ShapeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1 3 14h6l-1 9L21 10h-6z" opacity="0.9" />
    </svg>
  );
}
