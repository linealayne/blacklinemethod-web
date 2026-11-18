export interface TimelineStep {
  index: string
  label: string
  description: string
}

/**
 * The process as a timeline: horizontal from md, vertical on phones. Static
 * (nothing is tied to scroll); hovering a step lights its reading point.
 */
export function ProcessTimeline({ steps, bracket = true }: { steps: TimelineStep[]; bracket?: boolean }) {
  return (
    <div className="relative md:pt-14">
      {/* rail */}
      <div
        className="absolute left-[5px] top-0 bottom-0 w-px bg-hairline md:left-0 md:right-0 md:top-[19px] md:bottom-auto md:h-px md:w-auto md:translate-y-14"
        aria-hidden="true"
      />

      {/* first ninety days: spans Intake to Protocol */}
      {bracket && (
        <div
          className="hidden md:block absolute top-0 left-0"
          style={{ width: 'calc((100% - 4rem) / 3 + 2rem)' }}
          aria-hidden="true"
        >
          <span className="bl-label text-[10px]">the first ninety days</span>
          <div className="mt-2 h-px bg-amber/45 relative">
            <span className="absolute left-0 -top-[3px] h-[7px] w-px bg-amber/70" />
            <span className="absolute right-0 -top-[3px] h-[7px] w-px bg-amber/70" />
          </div>
        </div>
      )}

      <ol className="grid gap-12 pl-9 md:pl-0 md:grid-cols-3 md:gap-8 md:pt-14">
        {steps.map((step, i) => (
          <li key={step.index} className="group relative">
            <span
              className={[
                'absolute -left-9 top-[3px] block w-[11px] h-[11px] rounded-full border bg-black md:static md:mb-7',
                'transition-[background-color,border-color,box-shadow] duration-500',
                i === 0 ? 'border-amber' : 'border-offwhite/40',
                'group-hover:border-amber group-hover:bg-amber group-hover:shadow-[0_0_14px_rgba(200,150,90,0.5)]',
              ].join(' ')}
              aria-hidden="true"
            />
            <span className="block bl-label mb-4 tabular-nums">{step.index}</span>
            <p className="bl-title mb-5 transition-colors duration-500">{step.label}</p>
            <p className="bl-body max-w-sm">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
