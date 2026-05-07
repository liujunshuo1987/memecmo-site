"""Generate og.png (1200x630) for social sharing."""
from PIL import Image, ImageDraw, ImageFont
import os, sys

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), '..', 'og.png')

# diagonal gradient: top-left #c850c0 -> bottom-right #4158d0, on dark background
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i]-a[i]) * t) for i in range(3))

img = Image.new('RGB', (W, H), (7, 6, 12))
px = img.load()

c1 = (200, 80, 192)   # #c850c0
c2 = (65, 88, 208)    # #4158d0
dark = (7, 6, 12)
glow_max = 0.35       # how strong the gradient overlay is

for y in range(H):
    for x in range(W):
        # diagonal position 0..1
        t = (x + y) / (W + H)
        col = lerp(c1, c2, t)
        # radial fade from center outward, brighter mid
        cx, cy = W * 0.35, H * 0.5
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        falloff = max(0, 1 - d / (W * 0.55))
        alpha = falloff * glow_max
        r = int(dark[0] * (1 - alpha) + col[0] * alpha)
        g = int(dark[1] * (1 - alpha) + col[1] * alpha)
        b = int(dark[2] * (1 - alpha) + col[2] * alpha)
        px[x, y] = (r, g, b)

draw = ImageDraw.Draw(img)

def find_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

bold_candidates = [
    '/System/Library/Fonts/SFNS.ttf',
    '/System/Library/Fonts/Supplemental/Avenir Next.ttc',
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
regular_candidates = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]
font_logo = find_font(bold_candidates, 64)
font_title_lg = find_font(bold_candidates, 92)
font_title_sm = find_font(bold_candidates, 92)
font_sub = find_font(regular_candidates, 28)
font_url = find_font(regular_candidates, 26)

# logo badge (small purple square with M)
badge_x, badge_y, badge_s = 90, 90, 86
draw.rounded_rectangle(
    [badge_x, badge_y, badge_x + badge_s, badge_y + badge_s],
    radius=20, fill=(200, 80, 192))
draw.text((badge_x + badge_s//2, badge_y + badge_s//2), 'M',
          fill=(255, 255, 255), font=font_logo, anchor='mm')
draw.text((badge_x + badge_s + 22, badge_y + badge_s//2),
          'MEMECMO.AI', fill=(220, 218, 230), font=font_url, anchor='lm')

# headline
y0 = 230
draw.text((90, y0), 'Make your brand', fill=(240, 238, 245), font=font_title_lg)
# second line with gradient feel via two passes (simulated)
draw.text((90, y0 + 105), 'the answer in AI.', fill=(199, 165, 250), font=font_title_lg)

# subline
draw.text((90, y0 + 230),
          'GEO across 6 languages — English · Chinese · Vietnamese · Filipino · Thai · Malay',
          fill=(160, 158, 180), font=font_sub)

# url bottom-right
draw.text((W - 90, H - 70), 'memecmo.ai', fill=(199, 165, 250), font=font_sub, anchor='rs')

img.save(OUT, 'PNG', optimize=True)
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
