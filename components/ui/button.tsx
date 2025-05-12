import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-[#7c5aff] to-[#6c47ff] text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16),0px_1px_2px_0px_rgba(0,0,0,0.20)] hover:from-[#8f71ff] hover:to-[#7c5aff] active:from-[#6c47ff] active:to-[#5835ff]",
        destructive: "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16),0px_1px_2px_0px_rgba(0,0,0,0.20)] hover:from-red-400 hover:to-red-500 active:from-red-600 active:to-red-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-transparent text-white hover:bg-white/[0.08]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "h-8 w-8 p-0",
      },
      size: {
        default: "h-8 px-4 py-1.5",
        sm: "h-7 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-8 w-8",
      },
      weight: {
        default: "font-normal",
        medium: "font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, weight, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, weight, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
