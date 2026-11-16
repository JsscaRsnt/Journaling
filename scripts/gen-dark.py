#!/usr/bin/env python3
"""
Membuat aturan CSS mode gelap dari semua class warna yang dipakai di src/.
Jalankan lagi (python3 scripts/gen-dark.py) kalau kamu menambah warna baru.
Hasil ditulis di antara penanda DARK-MODE di src/index.css.
"""
import re, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

BG = {  # latar
    '[#FAF7F2]': '#2A2723', '[#F4EFE6]': '#1C1A17', 'white': '#211F1B',
    '[#FFF8F3]': '#2E2520', '[#FFF3EA]': '#2E2520', '[#F3F8F4]': '#1F2B24', '[#F1F6F2]': '#1F2B24',
    '[#E6DFD3]': '#3A352E',
    'emerald-100': '#1F3D31', 'teal-100': '#1B3B3A', 'amber-100': '#3E3217', 'amber-50': '#34291A',
    'orange-100': '#40281A', 'rose-100': '#411F27', 'rose-50': '#371C23', 'sky-100': '#17344A',
    'indigo-50': '#23264A',
}
TEXT = {
    '[#2D2A26]': '#EEE8DD', '[#4A453E]': '#D5CDC0', '[#6E675F]': '#B7AE9F', '[#8C8378]': '#9A9082',
    '[#3F5B4B]': '#A8D0B8', '[#5C7A67]': '#8FBF9F', '[#C86D51]': '#EE9278',
    'emerald-800': '#9BE0BC', 'teal-800': '#8EDBD3', 'amber-800': '#F2CB78', 'amber-700': '#F2CB78',
    'orange-800': '#F3B58A', 'rose-800': '#F5A9B8', 'rose-700': '#F59DB0', 'rose-600': '#F58AA0',
    'sky-600': '#8CCBEF', 'indigo-600': '#A5B4FC', 'emerald-600': '#5FD39A',
}
BORDER = {
    '[#E6DFD3]': '#3A352E', '[#D8CFC0]': '#4A453C', '[#F0DDD0]': '#4F3D32',
    'emerald-300': '#2E6B50', 'teal-300': '#2A6A66', 'amber-300': '#7A5F22', 'orange-300': '#7A4A28',
    'rose-300': '#7A3345', 'sky-300': '#2D6A93',
}
PROPS = {'bg': ('background-color', BG), 'text': ('color', TEXT), 'border': ('border-color', BORDER),
         'divide': ('border-color', BORDER)}

TOKEN = re.compile(
    r'(?<![\w\[-])((?:hover:|focus:|disabled:)?)(bg|text|border|divide)-'
    r'(\[#[0-9A-Fa-f]{6}\]|white|[a-z]+-\d{2,3})(/\d{1,3})?(?![\w\]-])')

def rgba(hexv, pct):
    h = hexv.lstrip('#'); r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f'rgba({r},{g},{b},{int(pct)/100:.2f})'

found = set()
for f in glob.glob(SRC + '/**/*.jsx', recursive=True):
    txt = open(f, encoding='utf-8').read()
    for m in TOKEN.finditer(txt):
        found.add(m.group(0))

rules, skipped = [], []
for tok in sorted(found):
    m = TOKEN.fullmatch(tok)
    state, kind, color, alpha = m.group(1), m.group(2), m.group(3), m.group(4)
    prop, table = PROPS[kind]
    key = color.upper() if color.startswith('[') else color
    key = key.replace('[#', '[#')
    val = table.get('[#' + color[2:-1].upper() + ']' if color.startswith('[') else color)
    if not val:
        skipped.append(tok); continue
    if alpha:
        val = rgba(val, alpha[1:])
    sel = f'html.dark [class~="{tok}"]'
    if kind == 'divide':
        sel += ' > * + *'
    elif state == 'hover:':
        sel += ':hover'
    elif state == 'focus:':
        sel += ':focus'
    elif state == 'disabled:':
        sel += ':disabled'
    rules.append(f'{sel} {{ {prop}: {val}; }}')

BASE = '''html.dark { color-scheme: dark; }
html.dark body { background: #171512; color: #EEE8DD; }
html.dark .bg-dots { background-color: #171512; background-image: radial-gradient(#2E2A24 1.1px, transparent 1.1px); }
html.dark ::placeholder { color: #7C7364; }
html.dark ::selection { background: #8FBF9F; color: #171512; }
html.dark * { scrollbar-color: #4A453C transparent; }
html.dark svg circle[stroke="#EFE8DA"] { stroke: #3A352E; }
html.dark input:focus, html.dark textarea:focus, html.dark select:focus { box-shadow: 0 0 0 3px rgba(143,191,159,0.25); }
html.dark main section:hover, html.dark main article:hover { box-shadow: 0 8px 22px -12px rgba(0,0,0,0.6); }'''

block = '/* DARK-MODE:BEGIN (dibuat oleh scripts/gen-dark.py, jangan diedit manual) */\n' + BASE + '\n' + '\n'.join(rules) + '\n/* DARK-MODE:END */\n'
css_path = os.path.join(SRC, 'index.css')
css = open(css_path, encoding='utf-8').read()
css = re.sub(r'/\* DARK-MODE:BEGIN.*?DARK-MODE:END \*/\n?', '', css, flags=re.S)
open(css_path, 'w', encoding='utf-8').write(css.rstrip('\n') + '\n\n' + block)
print(f'{len(rules)} aturan dibuat dari {len(found)} class warna')
if skipped:
    print('Dilewati (tanpa padanan gelap, aman jika memang warna aksen):')
    for s in skipped: print('  ', s)
