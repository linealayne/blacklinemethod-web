import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

interface FolioProps {
  /** the section label, set in the margin column */
  label: ReactNode
  ariaLabel: string
  id?: string
  children: ReactNode
  className?: string
  /** extra classes for the inner grid (padding overrides) */
  innerClassName?: string
}

/**
 * The page grammar: a hairline across the top with registration crosses at
 * its ends, the section label in a margin column like an annotation in a
 * report, and the content in the wide column. Nothing sticks or scrubs;
 * collapses to label-above on phones.
 */
export function Folio({ label, ariaLabel, id, children, className = '', innerClassName = 'py-24 md:py-32' }: FolioProps) {
  return (
    <section id={id} className={`bg-black ${className}`} aria-label={ariaLabel}>
      <div className="bl-wrap">
        <div className="relative" aria-hidden="true">
          <span className="bl-rule" />
          <span className="bl-cross -left-1 -top-1" />
          <span className="bl-cross -right-1 -top-1" />
        </div>
        <div className={`bl-folio ${innerClassName}`}>
          <div className="bl-margin">
            <Reveal as="p" className="bl-label bl-tick" y={8}>
              {label}
            </Reveal>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  )
}
