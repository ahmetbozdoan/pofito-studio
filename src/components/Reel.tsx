import {useEffect, useRef} from 'react';
import {apps, reel} from '../content';
import {clamp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Uygulamalardan kareler şeridi. Bölüm sabitlenir, şerit kaydırmayla yana
 * akar; ortaya en yakın kare öne çıkar, diğerleri geri çekilir ve her
 * görsel kendi çerçevesinin içinde hafifçe kayar.
 */

const SECTION_VH = 360;

const frames = apps.flatMap((app) => app.stills.map((s) => ({...s, app: app.name})));
const pad = (n: number) => String(n).padStart(2, '0');

export function Reel() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, 0.04, 0.96);
      // offsetLeft dönüşümsüz yerleşim konumudur; şerit kayarken de sabit kalır.
      const travel = Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * 0.62) / vw; // odak çizgisi ortanın sağında
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        imgRefs.current[i].style.transform = `translate3d(${off * -40}px, 0, 0) scale(1.1)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = pad(nearest + 1);
    });
  }, []);

  return (
    <section ref={rootRef} id="kareler" aria-labelledby="kareler-title" className="relative bg-void" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:justify-start md:pt-0">
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:flex md:w-[32vw] md:flex-col md:justify-center md:self-stretch md:bg-void md:pr-10 md:pl-[6vw] md:after:absolute md:after:inset-y-0 md:after:left-full md:after:w-16 md:after:bg-gradient-to-r md:after:from-void md:after:to-transparent">
          <p className="font-mono text-label text-moon uppercase">{reel.eyebrow}</p>
          <h2 id="kareler-title" className="mt-4 font-display text-display font-medium text-white">
            {reel.heading}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-mist/70 max-md:hidden">{reel.body}</p>
          <div className="mt-8 flex items-center gap-4 font-mono text-label text-mist/60 uppercase max-md:hidden" aria-hidden="true">
            <span className="tabular-nums">
              <span ref={countRef} className="text-white">
                01
              </span>{' '}
              / {pad(frames.length)}
            </span>
            <span className="relative h-px w-32 bg-white/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-moon" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <ol ref={trackRef} className="mt-8 flex items-start gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-7 md:pl-0">
          {frames.map((entry, i) => (
            <li
              key={entry.image}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className={`shrink-0 origin-bottom ${entry.wide ? 'w-[87.5vw] sm:w-[55vw] md:w-[clamp(20rem,30vw,28.75rem)]' : 'w-[70vw] sm:w-[44vw] md:w-[clamp(16rem,24vw,23rem)]'}`}
            >
              <figure>
                <div className={`relative overflow-hidden rounded-[6px] bg-void-2 ${entry.wide ? 'aspect-[5/4]' : 'aspect-[3/4]'}`}>
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={entry.image}
                    alt={`${entry.app}: ${entry.title}`}
                    width={entry.wide ? 1400 : 840}
                    height={1120}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover will-change-transform"
                  />
                  <span className="absolute top-3 left-3 rounded-[3px] bg-void/75 px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-white uppercase backdrop-blur">
                    {entry.app}
                  </span>
                </div>
                <figcaption className="mt-4 flex gap-4">
                  <span className="font-mono text-label text-moon tabular-nums">{pad(i + 1)}</span>
                  <span>
                    <span className="block font-display text-[0.9375rem] font-medium tracking-[-0.01em] text-white">{entry.title}</span>
                    <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-mist/65">{entry.body}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
