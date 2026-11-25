"""Açılış sahnesinin katmanlarını art-src içindeki ham çizimlerden üretir.

    python art-src/build_layers.py

Çıktı: public/layers/d/*.webp (yatay, 2400x1357) ve public/layers/m/*.webp
(dikey ekranlar için, 1280x724; her şey ortada toplanır).
Katmanlar: sky, moon, hills, clouds, pofito, ground.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

SRC = Path(__file__).parent
OUT = SRC.parent / "public" / "layers"
VOID = (12, 10, 23)


def load(name):
    im = Image.open(SRC / name).convert("RGBA")
    a = im.split()[-1].point(lambda v: 0 if v < 10 else v)
    im.putalpha(a)
    return im


def fit_w(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def fit_h(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def skyline(im, x):
    """İlk opak pikselin y'si (x sütununda)."""
    col = im.split()[-1].crop((x, 0, x + 1, im.height)).load()
    for y in range(im.height):
        if col[0, y] > 128:
            return y
    return im.height


def tint(im, mul, bright=1.0):
    r, g, b, a = im.split()
    r = r.point(lambda v: int(v * mul[0] * bright))
    g = g.point(lambda v: int(v * mul[1] * bright))
    b = b.point(lambda v: int(v * mul[2] * bright))
    return Image.merge("RGBA", (r, g, b, a))


def tiled(im, W, H, cx, top):
    """im'i cx'e ortalar, iki yanına ayna görüntülerini dizer."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    flip = im.transpose(Image.FLIP_LEFT_RIGHT)
    x0 = cx - im.width // 2
    k = 0
    while x0 + k * im.width < W:
        layer.alpha_composite(im if k % 2 == 0 else flip, (x0 + k * im.width, top)) if x0 + k * im.width + im.width > 0 else None
        k += 1
    k = -1
    while x0 + (k + 1) * im.width > 0:
        src = im if k % 2 == 0 else flip
        x = x0 + k * im.width
        # negatif konum: kırparak yapıştır
        if x < 0:
            src = src.crop((-x, 0, src.width, src.height))
            x = 0
        if src.width > 0:
            layer.alpha_composite(src, (x, top))
        k -= 1
    return layer


def sky(W, H, moon_c):
    stops = [(0.0, (9, 7, 20)), (0.34, (22, 16, 52)), (0.58, (58, 34, 96)), (0.72, (120, 64, 110)), (1.0, (150, 84, 104))]
    im = Image.new("RGB", (W, H))
    px = im.load()
    for y in range(H):
        t = y / (H - 1)
        for i in range(len(stops) - 1):
            a, b = stops[i], stops[i + 1]
            if a[0] <= t <= b[0]:
                k = (t - a[0]) / (b[0] - a[0])
                c = tuple(round(a[1][j] + (b[1][j] - a[1][j]) * k) for j in range(3))
                break
        for x in range(W):
            px[x, y] = c
    # Ayın etrafında sıcak ışıma.
    glow = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(glow)
    r = H * 0.42
    d.ellipse((moon_c[0] - r, moon_c[1] - r, moon_c[0] + r, moon_c[1] + r), fill=150)
    glow = glow.filter(ImageFilter.GaussianBlur(H * 0.16))
    im = Image.composite(Image.new("RGB", (W, H), (255, 176, 96)), im, glow.point(lambda v: int(v * 0.55)))
    # Yıldızlar.
    rnd = random.Random(7)
    stars = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(stars)
    for _ in range(int(W * H / 5200)):
        x, y = rnd.random() * W, rnd.random() ** 1.6 * H * 0.62
        s = rnd.choice([0.7, 0.9, 1.1, 1.4, 2.0]) * W / 2400
        d.ellipse((x - s, y - s, x + s, y + s), fill=(255, 240, 214, rnd.randint(70, 230)))
    out = im.convert("RGBA")
    out.alpha_composite(stars)
    return out.convert("RGB")


def moon(W, H, c, dia, src):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    halo = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(halo)
    r = dia * 0.62
    d.ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    halo = halo.filter(ImageFilter.GaussianBlur(dia * 0.11))
    layer.paste(Image.new("RGBA", (W, H), (255, 196, 110, 255)), (0, 0), halo.point(lambda v: int(v * 0.5)))
    box = src.split()[-1].getbbox()
    m = fit_w(src.crop(box), dia)
    layer.alpha_composite(m, (c[0] - m.width // 2, c[1] - m.height // 2))
    return layer


def ground(W, H, mound, crest_y, scale_w):
    g = fit_w(mound, scale_w).transpose(Image.FLIP_LEFT_RIGHT)
    g = tint(g, (0.5, 0.46, 0.62), 0.9).filter(ImageFilter.GaussianBlur(W / 900))
    top = crest_y - skyline(g, g.width // 2)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - g.width) // 2
    layer.alpha_composite(g.crop((max(0, -x), max(0, -top), min(g.width, W - x), min(g.height, H - top))), (max(0, x), max(0, top)))
    # Alta doğru sayfa rengine erit: önlük (apron) dikişsiz devralsın.
    fade = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(fade)
    y0 = crest_y + int(H * 0.04)
    for y in range(y0, H):
        d.line((0, y, W, y), fill=min(255, int(255 * (y - y0) / max(1, (H - y0) * 0.7))))
    solid = Image.new("RGBA", (W, H), VOID + (255,))
    a = layer.split()[-1]
    layer = Image.composite(solid, layer, ImageChops.multiply(fade, a.point(lambda v: 255 if v > 0 else 0)))
    layer.putalpha(a)
    # En alt satırlar her durumda dolu ve sayfa renginde.
    ImageDraw.Draw(layer).rectangle((0, H - 3, W, H), fill=VOID + (255,))
    return layer


def pofito(W, H, mound, mascot, cx, crest_y, mound_w, mascot_h, tile):
    m = fit_w(mound, mound_w)
    top = crest_y - skyline(m, m.width // 2)
    if tile:
        layer = tiled(m, W, H, cx, top)
    else:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        layer.alpha_composite(m.crop((0, 0, m.width, min(m.height, H - top))), (cx - m.width // 2, top))
    box = mascot.split()[-1].getbbox()
    c = fit_h(mascot.crop(box), mascot_h)
    c = ImageEnhance.Color(tint(c, (0.97, 0.93, 1.0))).enhance(1.05)
    feet = crest_y + int(mascot_h * 0.045)
    # Temas gölgesi.
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).ellipse((cx - c.width * 0.36, feet - mascot_h * 0.05, cx + c.width * 0.36, feet + mascot_h * 0.05), fill=200)
    sh = sh.filter(ImageFilter.GaussianBlur(mascot_h * 0.03))
    layer.paste(Image.new("RGBA", (W, H), (8, 5, 20, 255)), (0, 0), ImageChops.multiply(sh, layer.split()[-1]))
    layer.alpha_composite(c, (cx - c.width // 2, feet - c.height))
    return layer


def save(im, cut, name, q=86):
    p = OUT / cut / f"{name}.webp"
    p.parent.mkdir(parents=True, exist_ok=True)
    im.save(p, "WEBP", quality=q, method=6)
    print(p.relative_to(SRC.parent), im.size, f"{p.stat().st_size // 1024} KB")


def main():
    hills_src, mound_src, clouds_src = load("tepeler.png"), load("onplan.png"), load("bulutlar.png")
    moon_src, mascot_src = load("ay.png"), load("maskot.png")

    # ---- d: yatay ------------------------------------------------------
    W, H = 2400, 1357
    mc = (W // 2, 610)
    save(sky(W, H, mc), "d", "sky", 88)
    save(moon(W, H, mc, 480, moon_src), "d", "moon")
    hills = fit_w(hills_src, W)
    top = 830 - skyline(hills, W // 2)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.alpha_composite(hills.crop((0, 0, W, min(hills.height, H - top))), (0, top))
    save(layer, "d", "hills")
    clouds = fit_w(clouds_src, W)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = (clouds.height - H) // 2
    layer.alpha_composite(clouds.crop((0, y, W, y + H)))
    save(layer, "d", "clouds")
    save(pofito(W, H, mound_src, mascot_src, W // 2, 1095, W, 330, False), "d", "pofito")
    save(ground(W, H, mound_src, 1250, int(W * 1.7)), "d", "ground")

    # ---- m: dikey ekranlar (ortadaki dar şerit görünür) -------------------
    W, H = 1280, 724
    cx = W // 2
    mc = (cx, 322)
    save(sky(W, H, mc), "m", "sky", 88)
    save(moon(W, H, mc, 236, moon_src), "m", "moon")
    hills = fit_w(hills_src, 760)
    top = 452 - skyline(hills, hills.width // 2)
    layer = tiled(hills, W, H, cx, top)
    # Tepelerin altı boş kalmasın.
    under = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(under).rectangle((0, top + hills.height - 4, W, H), fill=(34, 24, 72, 255))
    under.alpha_composite(layer)
    save(under, "m", "hills")
    rot = fit_h(clouds_src.rotate(90, expand=True), H)
    save(tiled(rot, W, H, cx, 0), "m", "clouds")
    save(pofito(W, H, mound_src, mascot_src, cx, 606, 640, 168, True), "m", "pofito")
    save(ground(W, H, mound_src, 676, int(W * 1.1)), "m", "ground")


if __name__ == "__main__":
    main()
