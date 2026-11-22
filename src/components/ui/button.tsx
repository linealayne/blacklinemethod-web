import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Buttons are hairline-framed labels in the label face (Inter, small,
 * tracked, uppercase). Primary: an off-white frame whose fill sweeps in from
 * the left on hover and out to the right on leave (a scaleX'd pseudo-element,
 * so no layout shift), text inverting to black. Ghost: a hairline frame that
 * brightens.
 */
const buttonVariants = cva(
  [
    'relative isolate inline-flex items-center justify-center overflow-hidden',
    'font-sans text-[10.5px] font-medium tracking-[0.2em] uppercase',
    'rounded-[1px]',
    'transition-[color,border-color,transform] duration-600 ease-lux',
    "before:absolute before:inset-0 before:-z-10 before:origin-right before:scale-x-0 before:content-['']",
    'before:transition-transform before:duration-500 before:ease-lux hover:before:origin-left hover:before:scale-x-100',
    'active:scale-[0.98] active:duration-150',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-tan focus-visible:outline-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border border-offwhite/70 text-offwhite before:bg-offwhite hover:border-offwhite hover:text-black',
        ghost: 'border border-hairline text-offwhite/75 before:bg-graphite hover:border-offwhite/40 hover:text-offwhite',
      },
      size: {
        default: 'h-12 px-8',
        sm: 'h-11 px-5 text-[10px]',
        lg: 'h-14 px-10',
      },
      // kept for API compatibility; the revamp carries no glow
      glow: {
        true: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
