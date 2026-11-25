"""Marka simgeleri ve uygulama görselleri. Kaynaklar kardeş depolardan okunur.

    python art-src/build_media.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SRC = Path(__file__).parent
ROOT = SRC.parent
PUB = ROOT / "public"
BOCUK = ROOT.parent / "bocuk" / "docs" / "magaza"
YKS = ROOT.parent / "yks-konu-takip"
PLUM = (27, 20, 56)


def out(rel):
    p = PUB / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def rounded(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255)
    return m


def cover(im, w, h, cy=0.5):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - w) // 2
    y = round((im.height - h) * cy)
    return im.crop((x, y, x + w, y + h))


# ---- marka ----------------------------------------------------------------
face = Image.open(SRC / "yuz.png").convert("RGBA")
a = face.split()[-1].point(lambda v: 0 if v < 10 else v)
face.putalpha(a)
face = face.crop(a.getbbox())
sq = Image.new("RGBA", (max(face.size),) * 2, (0, 0, 0, 0))
sq.alpha_composite(face, ((sq.width - face.width) // 2, (sq.height - face.height) // 2))
sq.resize((320, 320), Image.LANCZOS).save(out("brand/pofito.webp"), "WEBP", quality=90)


def app_icon(n, pad=0.12, radius=0.24):
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    bg = Image.new("RGBA", (n, n), PLUM + (255,))
    glow = Image.new("L", (n, n), 0)
    ImageDraw.Draw(glow).ellipse((n * 0.1, n * 0.2, n * 0.9, n * 1.0), fill=120)
    bg.paste(Image.new("RGBA", (n, n), (255, 176, 96, 255)), (0, 0), glow.filter(ImageFilter.GaussianBlur(n * 0.16)))
    im.paste(bg, (0, 0), rounded((n, n), int(n * radius)))
    f = sq.resize((int(n * (1 - 2 * pad)),) * 2, Image.LANCZOS)
    im.alpha_composite(f, ((n - f.width) // 2, (n - f.height) // 2 + int(n * 0.02)))
    return im


app_icon(512).save(out("brand/icon-512.png"))
app_icon(192).save(out("brand/icon-192.png"))
app_icon(180, radius=0).save(out("brand/apple-touch-icon.png"))
app_icon(64, pad=0.06).save(out("favicon.png"))

# Paylaşım görseli: sahnenin kendisi.
scene = Image.open(PUB / "layers/d/sky.webp").convert("RGBA")
for n in ["moon", "hills", "clouds", "pofito", "ground"]:
    scene.alpha_composite(Image.open(PUB / f"layers/d/{n}.webp").convert("RGBA"))
cover(scene.convert("RGB"), 1200, 630, 0.55).save(out("brand/og.jpg"), quality=86)

# ---- Böcük Roll ---------------------------------------------------------------
# Simge: sarı baretli Erko (oyunun ve mağazanın güncel simgesi). web/ altındaki bakır taslı çizim eski.
Image.open(BOCUK / "google_play/simge_512.png").convert("RGB").resize((256, 256), Image.LANCZOS).save(out("media/bocuk/icon.webp"), "WEBP", quality=90)
Image.open(BOCUK / "video/youtube_kapak_1280x720.jpg").convert("RGB").save(out("media/bocuk/poster.jpg"), quality=84)
for i, name in enumerate(["kare_isimler", "kare_terlik", "kare_rogar"], start=1):
    cover(Image.open(BOCUK / f"video/{name}.jpg").convert("RGB"), 1400, 1120).save(out(f"media/bocuk/kare-{i}.webp"), "WEBP", quality=82)

# ---- YKS Konu Takip -------------------------------------------------------------
Image.open(YKS / "assets/icon.png").convert("RGB").resize((256, 256), Image.LANCZOS).save(out("media/yks/icon.webp"), "WEBP", quality=90)
Image.open(YKS / "tanitim-video/kapak/kapak.jpg").convert("RGB").save(out("media/yks/poster.jpg"), quality=84)
shots = ["01-ana-ekran", "03-soru-ekle", "04-istatistik"]
for i, name in enumerate(shots, start=1):
    W, H = 840, 1120
    card = Image.new("RGB", (W, H), (33, 49, 78))
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((-100, 300, W + 100, H + 400), fill=110)
    card.paste(Image.new("RGB", (W, H), (52, 150, 120)), (0, 0), glow.filter(ImageFilter.GaussianBlur(160)))
    s = Image.open(YKS / f"tanitim-video/play-ekran-goruntuleri/{name}.jpg").convert("RGB")
    ph = 980
    s = s.resize((round(s.width * ph / s.height), ph), Image.LANCZOS)
    x, y = (W - s.width) // 2, 96
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((x - 4, y + 18, x + s.width + 4, y + ph + 30), 44, fill=150)
    card.paste(Image.new("RGB", (W, H), (8, 12, 24)), (0, 0), sh.filter(ImageFilter.GaussianBlur(28)))
    ImageDraw.Draw(card).rounded_rectangle((x - 10, y - 10, x + s.width + 10, y + ph + 10), 46, fill=(14, 18, 30))
    card.paste(s, (x, y), rounded(s.size, 36))
    card.save(out(f"media/yks/kare-{i}.webp"), "WEBP", quality=84)

for p in sorted(PUB.rglob("*")):
    if p.is_file() and "layers" not in p.parts:
        print(p.relative_to(PUB), p.stat().st_size // 1024, "KB")
