"""Rebuild the embedded research snapshot after reviewing edits to research.json."""
import hashlib, json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(root))
from pack_data import pack
data = json.loads((root / 'research.json').read_text(encoding='utf-8'))
serialized = json.dumps(pack(data), ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
html = (root / 'index.html').read_text(encoding='utf-8')
pattern = r'(<script id="research-data" type="application/json">).*?(</script>)'
html, count = re.subn(pattern, lambda m: m[1] + serialized + m[2], html, flags=re.S)
if count != 1:
    raise RuntimeError('Expected exactly one research snapshot; no file changed')
if 'src="workspace-ui.js' not in html:
    html=html.replace('<script src="normalized-ui.js','<script src="workspace-ui.js"></script><script src="normalized-ui.js',1)
if 'src="data-codec.js' not in html:
    html=html.replace('<script src="quantify.js','<script src="data-codec.js"></script><script src="quantify.js',1)
html=html.replace("const data=JSON.parse(document.getElementById('research-data').textContent),venues=data.venues;","const data=BayLeafDataCodec.decode(JSON.parse(document.getElementById('research-data').textContent)),venues=data.venues;")
for name in ['data-codec.js','workspace-ui.js','quantify.js', 'numeric-ui.js', 'normalized-engine.js', 'normalized-ui.js']:
    version = hashlib.sha256((root / name).read_bytes()).hexdigest()[:12]
    pattern = r'(src="' + re.escape(name) + r')(?:\?v=[a-f0-9]+)?(")'
    html, matches = re.subn(pattern, lambda m: m[1] + '?v=' + version + m[2], html)
    if matches != 1:
        raise RuntimeError('Expected exactly one script reference: ' + name)
css_version=hashlib.sha256((root/'spreadsheet.css').read_bytes()).hexdigest()[:12]
html=re.sub(r'(href="spreadsheet\.css)(?:\?v=[a-zA-Z0-9]+)?(")',lambda m:m[1]+'?v='+css_version+m[2],html)
(root / 'index.html').write_text(html, encoding='utf-8')
print('Research snapshot updated. Review changes before publishing.')
