import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full min-h-[128px]',
          'border-0 border-b border-[#5E5E5B] bg-transparent',
          'px-0 py-3',
          'font-sans text-[15px] text-offwhite',
          'placeholder:text-body-dim',
          'transition-colors duration-600 ease-out',
          'focus-visible:outline-none focus-visible:border-amber hover:border-offwhite/50',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'resize-none rounded-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
