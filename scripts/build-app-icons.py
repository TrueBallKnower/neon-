"""Regenerate the included app icons. Optional authoring tool, never run by Node."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'public' / 'icons'
OUT.mkdir(parents=True, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def icon(size, maskable=False):
    scale = 3
    image = Image.new('RGB', (size * scale, size * scale), '#101014')
    draw = ImageDraw.Draw(image)
    unit = size * scale / 512

    def rect(box, radius, fill, outline=None, width=1):
        draw.rounded_rectangle(tuple(round(x * unit) for x in box), radius=radius * unit,
                               fill=fill, outline=outline, width=max(1, round(width * unit)))

    inset = 104 if maskable else 70
    edge = 512 - inset
    rect((inset - 18, inset - 18, edge + 18, edge + 18), 52, '#1b1b24', '#45414e', 2)
    gap = 14
    tile = (edge - inset - gap) / 2
    fills = ['#253e35', '#352c55', '#283b4f', '#c5f679']
    for index in range(4):
        x = inset + (index % 2) * (tile + gap)
        y = inset + (index // 2) * (tile + gap)
        rect((x, y, x + tile, y + tile), 23, fills[index])
        rect((x + 9, y + 9, x + tile - 9, y + tile - 9), 17, None,
             '#dbffb3' if index == 3 else '#ffffff28', 1)
    font = ImageFont.truetype(FONT, round((105 if maskable else 124) * unit))
    # One readable title sits on a dark plaque, including at the small Home Screen size.
    rect((inset - 3, 209, edge + 3, 308), 18, '#13131c')
    draw.text((256 * unit, 256 * unit), '2048', font=font, fill='#f6f4fc',
              anchor='mm', stroke_width=round(unit), stroke_fill='#13131c')
    image.resize((size, size), Image.Resampling.LANCZOS).save(OUT / (
        'fusion-maskable-512.png' if maskable else f'fusion-{size}.png'), optimize=True)


for size in (180, 192, 512):
    icon(size)
icon(512, maskable=True)
