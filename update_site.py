"""Rebuild the embedded research snapshot after reviewing edits to research.json."""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent
data = json.loads((root / 'research.json').read_text(encoding='utf-8'))
serialized = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
html = (root / 'index.html').read_text(encoding='utf-8')
pattern = r'(<script id="research-data" type="application/json">).*?(</script>)'
html, count = re.subn(pattern, lambda m: m[1] + serialized + m[2], html, flags=re.S)
if count != 1:
    raise RuntimeError('Expected exactly one research snapshot; no file changed')
(root / 'index.html').write_text(html, encoding='utf-8')
print('Research snapshot updated. Review changes before publishing.')
