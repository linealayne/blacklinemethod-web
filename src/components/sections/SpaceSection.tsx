import { FadeInSection } from '@/components/FadeInSection'

export function SpaceSection() {
  return (
    <section
      id="space"
      className="bg-black border-t border-hairline"
      aria-label="The space"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: text */}
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              the space
            </span>
            <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
              the space
            </h2>
            <div className="space-y-5 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide max-w-md">
              <p>
                Twenty-eight thousand square feet in a converted Design District
                warehouse. Stone arches run the full length of the training floor.
                Polished black concrete. Warm tungsten at every station.
              </p>
              <p>
                Three distinct environments — training, recovery, clinic — each
                with its own materiality. The kind of building that changes how
                you move the moment you enter it.
              </p>
            </div>
          </FadeInSection>

          {/* Right: image grid placeholder */}
          <FadeInSection delay={0.18}>
            {/* IMAGE_GRID_PLACEHOLDER — replace with curated grid using images from /references/*.png.
                Recommended: interior-atmosphere-dark.png, floor-main-wide-shot.png,
                recovery-cold-plunge-tubs.png, architecture-arches-signature.png.
                Use next/image with fill layout inside each grid cell. */}
            <div
              className="border border-hairline flex items-center justify-center"
              style={{ minHeight: 480 }}
              aria-label="Space imagery — coming soon"
            >
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-offwhite/15">
                image grid
              </p>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
