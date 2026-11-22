import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full',
          'border-0 border-b border-rule-strong bg-transparent',
          'px-0 py-2',
          'font-sans text-[15px] text-offwhite',
          'placeholder:text-body-dim',
          'transition-colors duration-600 ease-out',
          'focus-visible:outline-none focus-visible:border-tan hover:border-offwhite/50',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'rounded-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
