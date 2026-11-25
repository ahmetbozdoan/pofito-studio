/**
 * Sayfadaki bütün sözler ve bağlantılar burada.
 *
 * YENİ UYGULAMA EKLEMEK: `apps` dizisine bir kayıt ekle, görsellerini
 * `public/media/<id>/` altına koy (icon.webp, poster.jpg, kare-*.webp).
 * Sayfanın geri kalanı (vitrin, kareler şeridi, sayaçlar) kendiliğinden güncellenir.
 */

export const brand = {
  name: 'Pofito Studio',
  /** Büyük harfle basılan yerler için: Türkçe sayfada CSS 'i'yi 'İ' yapar. */
  caps: 'POFITO STUDIO',
  wordmark: 'POFITO',
  suffix: 'STUDIO',
  site: 'pofitostudio.com',
  mark: '/brand/pofito.webp',
  mascot: '/brand/pofito-el.webp',
};

export const links = {
  play: 'https://play.google.com/store/apps/developer?id=Pofito+Studio',
  youtube: 'https://www.youtube.com/@ahmetbozdoan',
};

export const nav = [
  {label: 'Uygulamalar', href: '#uygulamalar'},
  {label: 'Kareler', href: '#kareler'},
  {label: 'Sırada', href: '#sirada'},
];

export const hero = {
  title: 'POFITO',
  kicker: 'STUDIO · uygulamalar ve oyunlar',
  veil: 'Bulutları aralamak için kaydır',
  clockLabel: 'Tepede akşam',
  moonLabel: 'Ufkun üstünde',
  scroll: 'Kaydır',
  cta: 'Uygulamalara bak',
};

export type Still = {image: string; title: string; body: string; wide?: boolean};

export type App = {
  id: string;
  name: string;
  kind: string;
  tagline: string;
  body: string;
  facts: string[];
  icon: string;
  poster: string;
  /** YouTube video kimliği (watch?v=...). */
  video: string;
  videoTitle: string;
  /** İlki ana düğme olur. */
  actions: {label: string; href: string; external?: boolean}[];
  note?: string;
  /** Sıralı adımlar (ör. kapalı teste katılım). Düğmelerin altında kutu olarak görünür. */
  join?: {title: string; body: string; steps: {label: string; hint: string; href: string}[]};
  stills: Still[];
};

export const apps: App[] = [
  {
    id: 'bocukroll',
    name: 'Böcük Roll',
    kind: 'Oyun · ANDROID ve tarayıcı',
    tagline: 'Bütün mahalle terlikle peşinde.',
    body: 'Sen bir hamam böceğisin ve tek çıkış yolun yokuşun dibindeki rögar. Fizikle çalışan, bol kahkahalı bir kovalamaca: düşmek, yuvarlanmak, takla atmak işin en eğlenceli kısmı.',
    facts: ['İki taraf: böcük ol ya da terlikle kovala', '3 yokuş: mahalle, karlı yayla, sahil', '6 haneli oda koduyla arkadaşlarınla aynı yarış', 'Dolapta 20 aksesuar, 4 dil'],
    icon: '/media/bocuk/icon.webp',
    poster: '/media/bocuk/poster.jpg',
    video: 'yMvlsoI2jVA',
    videoTitle: 'Böcük Roll oynanış fragmanı',
    actions: [
      {label: 'Tarayıcıda oyna', href: '/bocukroll/'},
      {label: 'Fragmanı YouTube’da aç', href: 'https://www.youtube.com/watch?v=yMvlsoI2jVA', external: true},
    ],
    note: 'Google Play sürümü kapalı testte',
    join: {
      title: 'Test grubumuza katıl',
      body: 'Oyun Google Play’de kapalı testte. İki adımda telefonuna indirebilirsin:',
      steps: [
        {label: 'Test grubuna katıl', hint: 'Google Grupları’nda “Gruba katıl”a dokun', href: 'https://groups.google.com/g/bocuk-roll-test'},
        {label: 'Testçi ol ve indir', hint: 'Aynı Google hesabıyla “Testçi ol”a bas, sonra aynı sayfadan indir', href: 'https://play.google.com/apps/testing/com.bocuk.roll'},
      ],
    },
    stills: [
      {image: '/media/bocuk/kare-1.webp', title: 'Mahalle peşinde', body: 'Muhtar, teyze, tüpçü: herkesin elinde bir terlik var.', wide: true},
      {image: '/media/bocuk/kare-2.webp', title: 'Tam isabet', body: 'İsabet eden terlik ekranı sarsar, böcük yuvarlanır.', wide: true},
      {image: '/media/bocuk/kare-3.webp', title: 'Rögara kaç', body: 'Bitiş çizgisini geç, kapağı açık rögara dal.', wide: true},
    ],
  },
  {
    id: 'yks',
    name: 'YKS Konu Takip Çizelgesi',
    kind: 'Uygulama · ANDROID',
    tagline: 'Defter tutmayı bırak.',
    body: 'TYT ve AYT konularını ders ders takip et, çözdüğün soruları kaydet, nerede kaldığını tek bakışta gör. Çalışma düzenin telefonunda dursun.',
    facts: ['TYT ve AYT dersleri, konu konu ilerleme', 'Çözdüğün soruları ve tekrarları kaydet', 'Haftalık, aylık ve yıllık istatistik'],
    icon: '/media/yks/icon.webp',
    poster: '/media/yks/poster.jpg',
    video: '0iaLVvMrca4',
    videoTitle: 'YKS Konu Takip Çizelgesi tanıtım videosu',
    actions: [
      {label: 'Google Play’den indir', href: 'https://play.google.com/store/apps/details?id=com.ykstakip', external: true},
      {label: 'Tanıtımı YouTube’da aç', href: 'https://www.youtube.com/watch?v=0iaLVvMrca4', external: true},
    ],
    stills: [
      {image: '/media/yks/kare-1.webp', title: 'Dersler', body: 'Her dersin yüzde kaçı bitti, hemen görünür.'},
      {image: '/media/yks/kare-2.webp', title: 'Soru kaydı', body: 'Bugün kaç soru çözdün? Birkaç dokunuşla ekle.'},
      {image: '/media/yks/kare-3.webp', title: 'İstatistik', body: 'Haftanın, ayın ve yılın dökümü tek ekranda.'},
    ],
  },
];

export const shelf = {
  eyebrow: 'Uygulamalar',
  heading: 'Az ama özenli.',
  body: 'Pofito Studio küçük bir stüdyo. Her uygulamayı kendimiz kullanmak isteyeceğimiz kadar özenle yapıyoruz.',
  count: `${apps.length} uygulama yayında`,
  play: 'Oynat',
};

export const reel = {
  eyebrow: 'Kareler',
  heading: 'İçeriden görüntüler.',
  body: 'Oyundan ve uygulamadan gerçek ekranlar. Kaydırdıkça şerit yana akar.',
};

export const next = {
  eyebrow: 'Sırada',
  heading: 'Raf daha dolmadı.',
  body: 'Yeni uygulamalar yolda. Yayına girdikçe bu sayfaya eklenecek; o zamana kadar ikisini de denemek serbest.',
  links: [
    {label: 'Google Play’de POFITO STUDIO', href: links.play},
    {label: 'YouTube kanalı', href: links.youtube},
  ],
};

export const footer = {
  note: 'Sahne ve maskot çizimleri yapay zekâ ile üretildi',
  top: 'Başa dön ↑',
};
