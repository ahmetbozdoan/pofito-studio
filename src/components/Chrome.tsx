import {useState, type MouseEvent} from 'react';
import {brand, footer, hero, nav} from '../content';
import {scrollToHash} from '../lib/scroll';

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute('href');
  if (!hash?.startsWith('#')) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

/** İşaret: Pofito'nun yüzü. */
function Mark({className = ''}: {className?: string}) {
  return <img src={brand.mark} alt="" aria-hidden="true" width={320} height={320} className={className} />;
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 text-white">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-[3vw]">
        <a href="#top" onClick={(e) => go(e)} className="flex items-center gap-2.5" aria-label={`${brand.name}: başa dön`}>
          <Mark className="size-8" />
          <span className="font-display text-[0.875rem] font-medium tracking-[0.3em]">
            {brand.wordmark} <span className="text-white/55 max-sm:hidden">{brand.suffix}</span>
          </span>
        </a>
        <nav aria-label="Ana menü" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} className="font-mono text-label text-white/75 uppercase transition-colors duration-200 hover:text-white">
              {item.label}
            </a>
          ))}
          <a href="#uygulamalar" onClick={(e) => go(e)} className="rounded-full bg-white px-5 py-2.5 font-mono text-label text-void uppercase transition-colors duration-200 hover:bg-moon">
            {hero.cta}
          </a>
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" className="font-mono text-label uppercase md:hidden">
          {open ? 'Kapat' : 'Menü'}
        </button>
      </div>
      <div id="menu" inert={!open} className={`fixed inset-0 -z-10 flex flex-col justify-center gap-6 bg-void/95 px-6 backdrop-blur-xl transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {nav.map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))} className="flex items-baseline gap-4 font-display text-[1.625rem] font-medium tracking-[-0.01em]">
            <span className="font-mono text-label text-moon">0{i + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-void px-4 py-8 sm:px-6 md:px-[6vw]">
      <div className="flex flex-col gap-4 font-mono text-label text-mist/50 uppercase md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2.5 text-white/80">
          <Mark className="size-6" />
          {brand.caps}
        </span>
        <span>
          © {new Date().getFullYear()} · {footer.note}
        </span>
        <a href="#top" onClick={(e) => go(e)} className="transition-colors duration-200 hover:text-white">
          {footer.top}
        </a>
      </div>
    </footer>
  );
}
