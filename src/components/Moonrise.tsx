import {useEffect, useRef} from 'react';
import {apps, brand, hero} from '../content';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {clamp, easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Ay doğuşu. Altı katman üst üste dizilir ve sabitlenir; tek bir kaydırma
 * aralığı her birini kendi hızında oynatır:
 *
 *   0.00 – 0.18  sis perdesi yukarı çekilir
 *   0.04 – 0.50  ay tepelerin ardından yükselir
 *   0.10 – 0.24  POFITO yazısı netleşir
 *   0.28 – 0.58  bulutlar görüntünün çevresini sarar
 *   0.36 – 0.62  Pofito tepesiyle birlikte öne çıkar
 *   0.70 – 1.00  her şey yukarı kayar, ön zemin kareyi sayfa rengine
 *                boğar; sayfa oradan devam eder
 *
 * Üstte ince bir gösterge katmanı: akşam saati ve ayın yüksekliği.
 */

const STAGE_VH = 440;

type LayerName = 'sky' | 'moon' | 'hills' | 'clouds' | 'pofito' | 'ground';
const ORDER: LayerName[] = ['sky', 'moon', 'hills', 'clouds', 'pofito', 'ground'];

/** Bütün katmanlar aynı kırpımı paylaşır; her ekranda üst üste otururlar. */
const FIT = 'absolute inset-0 size-full object-cover object-center';

type Mote = {x: number; y: number; r: number; s: number; a: number};

export function Moonrise() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const elevRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Toz tuvalinin boyutu.
  useEffect(() => {
    const c = dustRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current!;
    const ctx = canvas.getContext('2d')!;
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const motes: Mote[] = Array.from({length: 140}, () => ({x: rand(), y: rand(), r: 0.4 + rand() * 1.6, s: 0.3 + rand(), a: 0.2 + rand() * 0.6}));
    let lastP = -1;
    let lastTime = 0;

    const set = (name: LayerName, y: number, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const {p, rect} = pinProgress(root);
      if (rect.bottom < 0) return;

      // Işık tozları görünür oldukça her karede süzülür.
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffe2b0';
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      // Perde yukarı açılır.
      veilRef.current!.style.opacity = String(veil);
      veilRef.current!.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      // Uzaktan yakına; her katman arkasındakinden hızlı.
      set('sky', lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set('moon', lerp(34, 0, rise) - exit * 12, lerp(0.92, 1, rise));
      set('hills', lerp(9, 0, settle) - exit * 26);
      const rim = easeOutCubic(range(p, 0.28, 0.58));
      set('clouds', -exit * 44, lerp(1.6, 1, rim), rim);
      const up = easeOutCubic(range(p, 0.36, 0.62));
      set('pofito', lerp(28, 0, up) - exit * 58, 1, clamp(up * 2));
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      set('ground', lerp(36, 0, ground) - exit * 78);

      // Başlık: harf aralığı kapanarak netleşir, çıkışa kadar kalır.
      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.64, 0.74);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.6, 0.24, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 2 - tOut * 3}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : '';

      // Göstergeler.
      hudRef.current!.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)));
      const mins = 19 * 60 + 30 + Math.round(p * 150);
      clockRef.current!.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      elevRef.current!.textContent = `${(rise * 12.4).toFixed(1)}°`;
    });
  }, []);

  const layer = (name: LayerName) => (
    <div
      key={name}
      ref={(el) => {
        if (el) layerRefs.current[name] = el;
      }}
      className="absolute inset-0 will-change-transform"
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={`/layers/m/${name}.webp`} />
        <img src={`/layers/d/${name}.webp`} alt="" aria-hidden="true" className={FIT} decoding="async" fetchPriority={name === 'sky' ? 'high' : 'auto'} />
      </picture>
      {/* Ön zeminin altında sayfa renginde bir önlük var: yukarı tırmanınca
          ekranı doldurur ve alttaki bölüme dikişsiz devreder. */}
      {name === 'ground' && <div className="absolute inset-x-0 top-full h-[110vh] bg-void" />}
    </div>
  );

  return (
    <section id="top" ref={rootRef} aria-label={`${brand.name}: ay doğuşu`} className="relative" style={{height: `${STAGE_VH}svh`}}>
      <div className="sticky top-0 h-screen-s overflow-hidden bg-void">
        {ORDER.slice(0, 3).map((n) => layer(n))}

        {/* Başlık ayın üstünde, bulutların arkasında durur. */}
        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[16%] text-center md:top-[11%]" style={{opacity: 0}}>
          <h1 className="font-display text-hero font-semibold text-cream [text-shadow:0_4px_40px_rgb(12_10_23/0.6)]" style={{marginRight: '-0.24em'}}>
            {hero.title}
          </h1>
          <p className="mt-3 font-mono text-label tracking-[0.16em] text-mist/85 uppercase md:mt-4">{hero.kicker}</p>
        </div>

        {ORDER.slice(3).map((n) => layer(n))}

        {/* Açılış perdesi: mor bir sis. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 30% 40%, rgba(186,160,222,0.5), transparent 70%), radial-gradient(50% 60% at 75% 60%, rgba(255,186,120,0.28), transparent 70%), radial-gradient(80% 80% at 50% 50%, rgba(30,22,58,0.86), rgba(12,10,23,0.96))',
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
            <img src={brand.mark} alt="" width={320} height={320} className="mx-auto size-20 md:size-24" />
            <p className="mt-5 font-mono text-label text-mist/80 uppercase">
              {brand.caps} · {apps.length} uygulama
            </p>
            <p className="mt-3 font-display text-[0.8125rem] tracking-[0.3em] text-cream/95 uppercase md:tracking-[0.5em]" style={{marginRight: '-0.3em'}}>
              {hero.veil}
            </p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-moon motion-reduce:animate-none">
              ↓
            </span>
          </div>
        </div>
        <canvas ref={dustRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />

        {/* Gösterge katmanı. */}
        <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-4 font-mono text-[0.625rem] tracking-[0.14em] text-mist/75 uppercase sm:inset-6 md:text-label" style={{opacity: 0}}>
          <div className="brackets absolute inset-0 text-mist/40" />
          <div className="absolute top-16 left-3 space-y-1 md:top-20 md:left-4">
            <p ref={clockRef} className="tabular-nums">
              19:30
            </p>
            <p className="text-mist/50 max-md:hidden">{hero.clockLabel}</p>
          </div>
          <div className="absolute top-16 right-3 space-y-1 text-right md:top-20 md:right-4">
            <p>
              Ay{' '}
              <span ref={elevRef} className="text-moon tabular-nums">
                0.0°
              </span>
            </p>
            <p className="text-mist/50 max-md:hidden">{hero.moonLabel}</p>
          </div>
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">{brand.site}</div>
          <div className="absolute right-3 bottom-3 flex items-center gap-2 md:right-4 md:bottom-4">
            {hero.scroll} <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
