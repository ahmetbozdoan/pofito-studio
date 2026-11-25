import {brand, next} from '../content';
import {useReveals} from '../hooks/useReveals';

/** Kapanış: sırada ne var, ve stüdyonun diğer adresleri. */
export function Next() {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="sirada" aria-labelledby="sirada-title" className="relative overflow-hidden bg-void px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7" data-reveal>
          <p className="font-mono text-label text-moon uppercase">{next.eyebrow}</p>
          <h2 id="sirada-title" className="mt-4 font-display text-display font-medium text-white">
            {next.heading}
          </h2>
          <p className="mt-5 max-w-[32rem] text-lead text-mist/75">{next.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {next.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className="rounded-full px-6 py-3.5 font-mono text-label text-white uppercase ring-1 ring-white/25 transition-colors duration-200 hover:bg-white hover:text-void">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-5" data-reveal style={{transitionDelay: '140ms'}}>
          <img src={brand.mascot} alt="El sallayan Pofito, stüdyonun maskotu" width={664} height={720} loading="lazy" decoding="async" className="mx-auto w-[min(62vw,22rem)]" />
        </div>
      </div>
    </section>
  );
}
