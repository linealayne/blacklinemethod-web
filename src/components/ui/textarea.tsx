import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full min-h-[128px]',
          'border border-hairline bg-transparent',
          'px-4 py-3',
          'font-sans text-sm text-offwhite',
          'placeholder:text-offwhite/25',
          'transition-colors duration-600 ease-out',
          'focus-visible:outline-none focus-visible:border-amber',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'resize-none rounded-[1px]',
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
