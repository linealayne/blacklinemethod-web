import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-sans text-xs tracking-[0.2em] uppercase',
    'rounded-[1px]',
    'transition-all duration-600 ease-out',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-amber focus-visible:outline-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border border-amber text-amber bg-transparent hover:bg-amber hover:text-black',
        ghost:
          'border border-hairline text-offwhite/50 bg-transparent hover:border-amber hover:text-amber',
      },
      size: {
        default: 'px-8 py-3',
        sm: 'px-5 py-2 text-[10px]',
        lg: 'px-12 py-4',
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
