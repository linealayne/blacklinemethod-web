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
          'border border-[#5E5E5B] bg-transparent',
          'px-4 py-2',
          'font-sans text-sm text-offwhite',
          'placeholder:text-body-dim',
          'transition-colors duration-600 ease-out',
          'focus-visible:outline-none focus-visible:border-amber',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'rounded-[1px]',
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
