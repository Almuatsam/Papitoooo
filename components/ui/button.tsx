"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold uppercase tracking-wide transition-transform active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground border-3 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[2px_2px_0_0_hsl(var(--ink))] hover:translate-x-0.5 hover:translate-y-0.5",
        solid: "bg-ink text-paper border-3 border-ink hover:bg-ink/90",
        outline:
          "bg-paper text-ink border-3 border-ink hover:bg-ink hover:text-paper",
        ghost: "text-ink hover:bg-ink/10 border-3 border-transparent",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-md",
        md: "h-12 px-6 text-base rounded-lg",
        lg: "h-16 px-10 text-xl rounded-xl",
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
