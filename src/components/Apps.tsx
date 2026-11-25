import {useState} from 'react';
import {apps, shelf, type App} from '../content';
import {useReveals} from '../hooks/useReveals';

/** Kapak görseli; tıklanınca YouTube oynatıcısı yüklenir (öncesinde hiçbir istek gitmez). */
function Video({app}: {app: App}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[28px] bg-void-2 ring-1 ring-white/10">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${app.video}?autoplay=1&rel=0`}
          title={app.videoTitle}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${app.videoTitle}: oynat`} className="group absolute inset-0 size-full cursor-pointer">
          <img src={app.poster} alt="" width={1280} height={720} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-gradient-to-t from-void/55 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-void/80 py-2 pr-5 pl-2 font-mono text-label text-white uppercase backdrop-blur transition-colors duration-200 group-hover:bg-moon group-hover:text-void md:bottom-6 md:left-6">
            <span className="grid size-9 place-items-center rounded-full bg-moon text-void transition-colors duration-200 group-hover:bg-void group-hover:text-moon">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 size-4">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </span>
            {shelf.play}
          </span>
        </button>
      )}
    </div>
  );
}

function Showcase({app, index}: {app: App; index: number}) {
  const flip = index % 2 === 1;
  return (
    <article id={app.id} aria-labelledby={`${app.id}-title`} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
      <div data-reveal className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
        <Video app={app} />
      </div>
      <div data-reveal style={{transitionDelay: '120ms'}} className="md:col-span-5">
        <div className="flex items-center gap-4">
          <img src={app.icon} alt="" width={256} height={256} loading="lazy" decoding="async" className="size-14 rounded-[14px] ring-1 ring-white/10 md:size-16" />
          <div>
            <p className="font-mono text-label text-moon uppercase">
              0{index + 1} · {app.kind}
            </p>
            {app.note && <p className="mt-1.5 font-mono text-label text-mist/50 uppercase">{app.note}</p>}
          </div>
        </div>
        <h3 id={`${app.id}-title`} className="mt-6 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.1] font-medium tracking-[-0.02em] text-white">
          {app.name}
        </h3>
        <p className="mt-3 text-lead text-cream">{app.tagline}</p>
        <p className="mt-4 max-w-[34rem] text-body text-mist/70">{app.body}</p>
        <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
          {app.facts.map((f) => (
            <li key={f} className="flex gap-3 text-[0.9375rem] text-mist/85">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-moon" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          {app.actions.map((a, i) => (
            <a
              key={a.href}
              href={a.href}
              {...(a.external ? {target: '_blank', rel: 'noopener'} : {})}
              className={`rounded-full px-6 py-3.5 font-mono text-label uppercase transition-colors duration-200 ${
                i === 0 ? 'bg-moon text-void hover:bg-white' : 'text-white ring-1 ring-white/25 hover:bg-white hover:text-void'
              }`}
            >
              {a.label}
              {a.external && <span aria-hidden="true"> ↗</span>}
            </a>
          ))}
        </div>
        {app.join && (
          <div id={`${app.id}-test`} className="mt-8 rounded-[28px] bg-void-2 p-6 ring-1 ring-white/10 md:p-7">
            <p className="font-display text-[1.0625rem] font-medium tracking-[-0.01em] text-white">{app.join.title}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-mist/70">{app.join.body}</p>
            <ol className="mt-5 space-y-2.5">
              {app.join.steps.map((s, i) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener" className="group flex items-center gap-4 rounded-[18px] px-4 py-3.5 ring-1 ring-white/15 transition-colors duration-200 hover:bg-white/5 hover:ring-moon/60">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-moon font-mono text-[0.8125rem] font-medium text-void tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-white">{s.label}</span>
                      <span className="mt-0.5 block text-[0.8125rem] text-mist/60">{s.hint}</span>
                    </span>
                    <span aria-hidden="true" className="text-mist/50 transition-colors duration-200 group-hover:text-moon">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </article>
  );
}

/** Uygulama vitrini: her uygulama için fragman, kısa tanıtım ve bağlantılar. */
export function Apps() {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="uygulamalar" aria-labelledby="uygulamalar-title" className="relative bg-void px-4 pt-24 pb-28 sm:px-6 md:px-[6vw] md:pt-32 md:pb-40">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="font-mono text-label text-moon uppercase">{shelf.eyebrow}</p>
          <h2 id="uygulamalar-title" className="mt-4 font-display text-display font-medium text-white">
            {shelf.heading}
          </h2>
          <p className="mt-5 max-w-[34rem] text-body text-mist/70">{shelf.body}</p>
        </div>
        <p className="font-mono text-label text-mist/50 uppercase">{shelf.count}</p>
      </div>

      <div className="mt-16 space-y-24 md:mt-24 md:space-y-36">
        {apps.map((app, i) => (
          <Showcase key={app.id} app={app} index={i} />
        ))}
      </div>
    </section>
  );
}
