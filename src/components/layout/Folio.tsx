import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'

interface FolioProps {
  /** the section label, set in the margin column (sticky on desktop) */
  label: ReactNode
  ariaLabel: string
  id?: string
  children: ReactNode
  className?: string
  /** extra classes for the inner grid (padding overrides) */
  innerClassName?: string
}

/**
 * The page grammar of the revamp: a drawn hairline across the top, the
 * section label in a margin column like an annotation in a report, and the
 * content in the wide column. Collapses to label-above on phones.
 */
export function Folio({ label, ariaLabel, id, children, className = '', innerClassName = 'py-24 md:py-36' }: FolioProps) {
  return (
    <section id={id} className={`bg-black ${className}`} aria-label={ariaLabel}>
      <div className="bl-wrap">
        <Reveal as="span" className="bl-rule" y={0} start="top 96%">{null}</Reveal>
        <div className={`bl-folio ${innerClassName}`}>
          <div className="bl-margin">
            <Reveal as="p" className="bl-label bl-tick" y={10}>
              {label}
            </Reveal>
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  )
}
