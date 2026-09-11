"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * One component, one unified look: dark chrome + hot-pink neon, sharp
 * faceted corners (the `.btn` class in app/globals.css clips the corners —
 * see the `.facet` utilities). `btn-primary` / `btn-outline` / `btn-ghost` /
 * `btn-solid` are stable class hooks the CSS in app/globals.css keys off.
 *
 * Uses `font-body`, not `font-display` — the display font (Flavors) is a
 * decorative hero/heading face that stops being legible at button-label
 * sizes, so buttons stay in the readable body font.
 */
const buttonVariants = cva(
  "btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-bold uppercase tracking-wide transition-transform active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
  {
    variants: {
      variant: {
        primary: "btn-primary text-white border-3 border-line hover:brightness-110",
        solid: "btn-solid bg-ink text-paper border-3 border-line hover:opacity-90",
        outline: "btn-outline bg-panel text-ink border-3 border-line hover:bg-ink hover:text-paper",
        ghost: "btn-ghost text-ink hover:bg-white/10 border-3 border-transparent",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-16 px-10 text-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
