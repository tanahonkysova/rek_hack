"""Nakreslí náhradní (mock) fotky vad kotev, protože starter-kit s fotkami není k dispozici.

kryt-g300.jpg   K1: prasklina přes plastový kryt ovládacího panelu, okraje čisté, bez stop nárazu (E-01)
kryt-roh.jpg    K1: prasklina vychází z otlaku na rohu krytu, roh je promáčknutý (E-07)
t150-spojka.jpg K2: voda uniká kolem rychlospojky hadice, těsnění je vidět posunuté (E-03, E-08)

Názvy souborů jsou pevné ze zadání (01-data.md), obsah odpovídá výrobkům Pohoda Spotřebiče
(K1 = espresso automat Pohoda KV, K2 = myčka Pohoda MY-60). Spuštění: python kresli_fotky.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 960
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotky")


def noise(img, amount, seed):
    rnd = random.Random(seed)
    n = Image.effect_noise((W, H), amount).convert("L")
    n = n.point(lambda v: v)
    rgb = Image.merge("RGB", (n, n, n))
    return Image.blend(img, rgb, 0.06 + rnd.random() * 0.02)


def vignette(img):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for i in range(60):
        v = int(255 * (i / 60))
        d.ellipse([-W * 0.25 + i * 8, -H * 0.25 + i * 6, W * 1.25 - i * 8, H * 1.25 - i * 6], fill=v)
    m = m.filter(ImageFilter.GaussianBlur(80))
    dark = Image.new("RGB", (W, H), (20, 18, 16))
    return Image.composite(img, dark, m)


def gradient(c1, c2, vertical=True):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    n = H if vertical else W
    for i in range(n):
        t = i / (n - 1)
        c = tuple(int(c1[k] + (c2[k] - c1[k]) * t) for k in range(3))
        if vertical:
            d.line([(0, i), (W, i)], fill=c)
        else:
            d.line([(i, 0), (i, H)], fill=c)
    return img


def crack_path(rnd, start, angle, length, step=14, wobble=0.35):
    pts = [start]
    x, y = start
    a = angle
    for _ in range(int(length / step)):
        a += rnd.uniform(-wobble, wobble)
        x += math.cos(a) * step
        y += math.sin(a) * step
        pts.append((x, y))
    return pts


def draw_crack(d, pts, width=3):
    # tmavá linie + světlý okraj (lom plastu)
    d.line([(x + 1.5, y + 1.5) for x, y in pts], fill=(235, 235, 235), width=width + 1, joint="curve")
    d.line(pts, fill=(18, 18, 20), width=width, joint="curve")


def espresso_body(seed):
    """Čelo espresso automatu s ovládacím panelem pod plastovým krytem."""
    img = gradient((70, 66, 62), (40, 37, 35))  # pozadí: kuchyňská linka
    d = ImageDraw.Draw(img)
    # pracovní deska
    d.rectangle([0, 760, W, H], fill=(150, 128, 104))
    # tělo kávovaru (matný stříbrný plast)
    body = [140, 60, 1140, 800]
    for i in range(body[3] - body[1]):
        t = i / (body[3] - body[1])
        c = int(178 - 50 * t)
        d.line([(body[0], body[1] + i), (body[2], body[1] + i)], fill=(c, c + 2, c + 6))
    # kryt ovládacího panelu (lesklý černý plast)
    panel = [230, 130, 1050, 470]
    d.rounded_rectangle(panel, radius=28, fill=(28, 30, 34), outline=(90, 92, 98), width=4)
    # odlesk na krytu
    gl = Image.new("L", (W, H), 0)
    ImageDraw.Draw(gl).polygon([(260, 140), (620, 140), (470, 460), (250, 460)], fill=60)
    gl = gl.filter(ImageFilter.GaussianBlur(30))
    img = Image.composite(Image.new("RGB", (W, H), (210, 215, 225)), img, gl)
    d = ImageDraw.Draw(img)
    # displej a tlačítka pod krytem
    d.rounded_rectangle([300, 190, 620, 330], radius=10, fill=(16, 40, 46))
    d.text((322, 214), "POHODA KV", fill=(120, 220, 230))
    d.text((322, 250), "Pripraveno", fill=(120, 220, 230))
    for i, cx in enumerate([700, 800, 900]):
        d.ellipse([cx - 34, 205, cx + 34, 273], fill=(52, 54, 60), outline=(120, 124, 130), width=3)
        d.ellipse([cx - 10, 232, cx + 10, 252], fill=(200, 160, 80) if i == 0 else (90, 94, 100))
    d.rounded_rectangle([300, 370, 980, 420], radius=20, fill=(44, 46, 52))
    # výpusť kávy a odkapávač
    d.rectangle([560, 520, 720, 590], fill=(60, 62, 68))
    d.rectangle([595, 590, 615, 640], fill=(150, 150, 155))
    d.rectangle([665, 590, 685, 640], fill=(150, 150, 155))
    d.rounded_rectangle([300, 700, 980, 770], radius=12, fill=(70, 72, 78), outline=(140, 142, 148), width=3)
    return img, panel


def foto_kryt_g300():
    rnd = random.Random(300)
    img, panel = espresso_body(1)
    d = ImageDraw.Draw(img)
    # prasklina přes celý kryt, čisté okraje, bez otlaku
    main = crack_path(rnd, (panel[0] + 40, panel[1] + 70), 0.33, 820, wobble=0.18)
    draw_crack(d, main, 4)
    for k in (12, 27, 41):
        if k < len(main):
            br = crack_path(rnd, main[k], 0.33 + rnd.choice([-1, 1]) * 0.9, rnd.randint(60, 120), step=10, wobble=0.3)
            draw_crack(d, br, 2)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    img = noise(vignette(img), 30, 3)
    return img


def foto_kryt_roh():
    rnd = random.Random(7)
    img, panel = espresso_body(2)
    d = ImageDraw.Draw(img)
    # otlak na pravém horním rohu krytu: promáčknutí se stínem a odřením
    cx, cy = panel[2] - 40, panel[1] + 38
    dent = Image.new("L", (W, H), 0)
    ImageDraw.Draw(dent).ellipse([cx - 95, cy - 80, cx + 70, cy + 85], fill=170)
    dent = dent.filter(ImageFilter.GaussianBlur(22))
    img = Image.composite(Image.new("RGB", (W, H), (8, 8, 10)), img, dent)
    d = ImageDraw.Draw(img)
    d.arc([cx - 70, cy - 60, cx + 50, cy + 60], 150, 330, fill=(150, 152, 158), width=3)  # světlý okraj promáčknutí
    for _ in range(40):  # odřeniny od nárazu
        x, y = cx + rnd.randint(-60, 40), cy + rnd.randint(-45, 45)
        d.line([(x, y), (x + rnd.randint(-14, 14), y + rnd.randint(-6, 6))], fill=(170, 170, 176), width=1)
    # roh krytu promáčknutý dovnitř
    d.polygon([(panel[2] - 4, panel[1] + 4), (panel[2] - 60, panel[1] + 4), (panel[2] - 4, panel[1] + 52)],
              fill=(14, 14, 16))
    # praskliny vycházejí paprskovitě z otlaku
    for a in (2.6, 2.95, 2.25):
        p = crack_path(rnd, (cx - 20, cy + 10), a, rnd.randint(260, 420), wobble=0.22)
        draw_crack(d, p, 3)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    img = noise(vignette(img), 30, 4)
    return img


def foto_spojka():
    rnd = random.Random(150)
    img = gradient((205, 200, 192), (150, 145, 138))  # spodní skříňka pod dřezem / zadní stěna myčky
    d = ImageDraw.Draw(img)
    # zadní panel myčky
    d.rectangle([0, 0, 520, H], fill=(196, 198, 202))
    d.line([(520, 0), (520, H)], fill=(120, 122, 126), width=6)
    # přívodní hadice (šedá, žebrovaná) zleva doprava
    for i in range(0, 640, 2):
        x = 60 + i
        y = 520 + 40 * math.sin(i / 160)
        d.ellipse([x - 38, y - 38, x + 38, y + 38], fill=(120, 124, 130))
    for i in range(0, 640, 22):
        x = 60 + i
        y = 520 + 40 * math.sin(i / 160)
        d.arc([x - 38, y - 38, x + 38, y + 38], 250, 290, fill=(150, 154, 160), width=3)
    # rychlospojka (modrý plast + kovová matice)
    sx, sy = 700, 470
    d.rounded_rectangle([sx, sy, sx + 170, sy + 110], radius=18, fill=(40, 90, 170), outline=(20, 50, 110), width=4)
    d.rectangle([sx + 170, sy + 15, sx + 260, sy + 95], fill=(185, 188, 192), outline=(110, 112, 118), width=4)
    for k in range(5):
        d.line([(sx + 182 + k * 16, sy + 15), (sx + 182 + k * 16, sy + 95)], fill=(140, 142, 148), width=3)
    d.rectangle([sx + 260, sy + 35, W, sy + 75], fill=(170, 172, 176))  # přívod z ventilu
    # posunuté černé těsnění vylézá ze spáry spojky
    d.arc([sx + 140, sy - 6, sx + 200, sy + 118], 260, 100, fill=(15, 15, 15), width=9)
    d.ellipse([sx + 150, sy - 14, sx + 182, sy + 12], fill=(15, 15, 15))
    # voda: lesklé kapky, stékající pramínek a louže
    water = Image.new("L", (W, H), 0)
    wd = ImageDraw.Draw(water)
    for _ in range(26):
        x = sx + 140 + rnd.randint(-30, 70)
        y = sy + rnd.randint(-10, 130)
        r = rnd.randint(5, 13)
        wd.ellipse([x - r, y - r, x + r, y + r * 1.3], fill=200)
    wd.line([(sx + 175, sy + 110), (sx + 168, sy + 300), (sx + 185, sy + 420)], fill=170, width=16)
    wd.ellipse([sx - 60, sy + 380, sx + 420, sy + 480], fill=140)
    water = water.filter(ImageFilter.GaussianBlur(3))
    img = Image.composite(Image.new("RGB", (W, H), (175, 205, 230)), img, water)
    d = ImageDraw.Draw(img)
    for _ in range(18):  # odlesky na kapkách
        x = sx + 140 + rnd.randint(-25, 65)
        y = sy + rnd.randint(-5, 125)
        d.ellipse([x - 3, y - 3, x + 2, y + 2], fill=(250, 252, 255))
    d.text((60, 60), "POHODA MY-60", fill=(90, 92, 96))
    img = img.filter(ImageFilter.GaussianBlur(0.9))
    img = noise(vignette(img), 30, 5)
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("kryt-g300.jpg", foto_kryt_g300), ("kryt-roh.jpg", foto_kryt_roh),
                     ("t150-spojka.jpg", foto_spojka)]:
        p = os.path.join(OUT, name)
        fn().save(p, "JPEG", quality=88)
        print(p, os.path.getsize(p) // 1024, "kB")
