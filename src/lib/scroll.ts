import Lenis from 'lenis';

/**
 * One rAF loop for the whole page. Lenis advances first, then every
 * scroll-driven component reads its own rect and writes styles directly —
 * nothing here goes through React state, so scrolling never re-renders.
 */

type Tick = (time: number) => void;

const subscribers = new Set<Tick>();
let lenis: Lenis | null = null;

export function startScroll(reducedMotion: boolean): () => void {
  if (!reducedMotion) {
    lenis = new Lenis({lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9});
  }

  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    subscribers.forEach((fn) => fn(time));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** Paylaşılan eski/kısa adlar → sayfadaki gerçek bölüm kimliği. */
const HASH_ALIASES: Record<string, string> = {
  '#bocuk': '#bocukroll',
  '#bocuk-test': '#bocukroll-test',
  '#test': '#bocukroll-test',
};

/** Sabit üst menünün altında kalmasın diye hedefin üstünde bırakılan pay. */
const HEADER_OFFSET = -96;

/**
 * Smooth-scrolls to an in-page hash like `#services`, or to the top for `#top`.
 * `immediate` jumps without animation (used when the page opens with a hash).
 */
export function scrollToHash(hash: string, {immediate = false} = {}) {
  const real = HASH_ALIASES[hash.toLowerCase()] ?? hash;
  let target: HTMLElement | number | null = 0;
  if (real !== '#top') {
    try {
      target = document.querySelector<HTMLElement>(decodeURIComponent(real));
    } catch {
      target = null;
    }
  }
  if (target === null) return;
  // Hedefi tarayıcının gerçek kaydırma konumundan hesapla: hash elle değişince
  // tarayıcı kendisi atlar ve Lenis'in iç konumu bir an eski kalır.
  const top = typeof target === 'number' ? target : Math.max(0, target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET);
  if (lenis) {
    lenis.scrollTo(top, {duration: 1.6, immediate, force: true});
  } else {
    window.scrollTo({top});
  }
  history.replaceState(null, '', hash === '#top' ? ' ' : hash);
}

/**
 * Sayfa `pofitostudio.com/#bocukroll` gibi bir adresle açıldıysa o bölüme atlar;
 * adres çubuğunda hash sonradan değişirse de oraya kayar. Temizleme işlevi döner.
 */
export function followLocationHash(): () => void {
  let cancelled = false;
  let userMoved = false;
  const markMoved = () => (userMoved = true);
  const jump = () => {
    if (cancelled || userMoved || location.hash.length < 2) return;
    scrollToHash(location.hash, {immediate: true});
  };
  // İlk karede düzen oturmuş olsun; yazı tipleri ve görseller gelince bir kez daha
  // (kullanıcı bu arada kendisi kaydırmadıysa) hizala.
  requestAnimationFrame(() => requestAnimationFrame(jump));
  document.fonts?.ready.then(jump);
  window.addEventListener('load', jump, {once: true});
  window.addEventListener('wheel', markMoved, {once: true, passive: true});
  window.addEventListener('touchstart', markMoved, {once: true, passive: true});
  window.addEventListener('keydown', markMoved, {once: true});

  const onHashChange = () => scrollToHash(location.hash || '#top', {immediate: true});
  window.addEventListener('hashchange', onHashChange);
  return () => {
    cancelled = true;
    window.removeEventListener('load', jump);
    window.removeEventListener('wheel', markMoved);
    window.removeEventListener('touchstart', markMoved);
    window.removeEventListener('keydown', markMoved);
    window.removeEventListener('hashchange', onHashChange);
  };
}
