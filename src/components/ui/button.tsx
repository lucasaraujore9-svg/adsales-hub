import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-pill text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--ink)] text-[color:var(--bg)] hover:bg-[color:var(--ink-2)]",
        accent:
          "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent)]/90",
        destructive:
          "bg-[color:var(--bad)] text-white hover:bg-[color:var(--bad)]/90",
        outline:
          "border border-[color:var(--line-2)] bg-transparent text-[color:var(--ink)] hover:bg-[color:var(--bg-2)]",
        secondary:
          "bg-[color:var(--bg-2)] text-[color:var(--ink)] hover:bg-[color:var(--panel)]",
        ghost:
          "text-[color:var(--ink-2)] hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]",
        link: "text-[color:var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
