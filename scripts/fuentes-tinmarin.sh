#!/bin/sh
# Copias recortadas de las fuentes para /tinmarin/: latín con acentos (Latin-1 y Extended-A) y puntuación, y solo
# los pesos que usa la página. Necesita fonttools y brotli (pip install fonttools brotli).
set -e
cd "$(dirname "$0")/.."
U="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0218-021B,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+20AC,U+2190-2193,U+2212,U+2264-2265,U+2713"
mkdir -p public/fonts/tm
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
for src, dst, lim in [
    ("bricolage-grotesque-200_800-normal", "bricolage-grotesque-700_800", {"wght": (700, 800)}),
    ("dm-sans-100_1000-normal", "dm-sans-400_700", {"wght": (400, 700)}),
]:
    font = instancer.instantiateVariableFont(TTFont(f"public/fonts/{src}.woff2"), lim)
    font.flavor = None
    font.save(f"/tmp/{dst}.ttf")
PY
for f in bricolage-grotesque-700_800 dm-sans-400_700; do
  python3 -m fontTools.subset "/tmp/$f.ttf" --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file="public/fonts/tm/$f.woff2"
done
ls -la public/fonts/tm
