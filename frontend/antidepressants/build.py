"""Build an offline two-tab HTML. Python 3 only; no runtime dependencies."""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).parent
SRC = ROOT / 'src'
HOST = ROOT.parent / 'psychstatus' / 'dist' / 'psychstatus.html'
OUTPUT = ROOT / 'antidepressant-assistant.html'

def block(text, start, end):
    return text[text.index(start):text.index(end, text.index(start))]

def main():
    compass = (SRC / 'compass.html').read_text(encoding='utf-8')
    host = HOST.read_text(encoding='utf-8').rstrip() + '\n'
    disclaimer = re.search(r'<div class="note danger" id="clinical-disclaimer"[^>]*>(.*?)</div>', compass, re.S).group(1)
    panel = (SRC / 'psydraft-panel.html').read_text(encoding='utf-8')
    def select(key):
        result = re.search(r'<select id="' + re.escape(key) + r'"[^>]*>.*?</select>', compass, re.S)
        if not result: raise ValueError('Missing source select: ' + key)
        return result.group().replace('id="' + key + '"', 'id="pd-shared-' + key + '"')
    def label(key):
        result = re.search(r'<label class="field-label" for="' + re.escape(key) + r'">(.*?)</label>', compass, re.S)
        if not result: raise ValueError('Missing source label: ' + key)
        return result.group(1)
    panel = panel.replace('{{SAFETY_SELECTS}}', ''.join('<div><label for="pd-shared-' + key + '">' + label(key) + '</label>' + select(key) + '</div>' for key in ['preg','bipolar','suicide','psychosis','current','renal','liver','alt']))
    panel = panel.replace('{{DETAIL_SELECTS}}', ''.join('<div class="pd-detail-field" hidden><label for="pd-shared-' + key + '">' + label(key) + '</label>' + select(key) + '</div>' for key in ['cardiacDetail','glaucomaDetail','urinaryDetail']))
    panel = panel.replace('{{HISTORY_SELECT}}', select('historyStatus'))
    host = host.replace('<h2>📋 Общие разделы</h2>', '<h2>📋 Общие разделы</h2>\n' + panel, 1)
    if 'pd-compass-shared' not in host: raise ValueError('PsyDraft general section changed')
    host_bridge = (SRC / 'psydraft-bridge.js').read_text(encoding='utf-8')
    for marker, content in {
        '/*__DRUGS__*/': block(compass, 'const DRUGS=', 'const INDICATIONS='),
        '/*__CHOICES__*/': block(compass, 'const CHOICES=', 'const scalarIds='),
        '/*__COURSE_OPTIONS__*/': block(compass, 'const COURSE_OPTIONS=', 'const COURSE_LABELS='),
        '/*__MAP__*/': (SRC / 'bridge-map.js').read_text(encoding='utf-8'),
    }.items(): host_bridge = host_bridge.replace(marker, content)
    host = host.replace('<body>', '<body><div style="padding:12px 16px;background:#ffebed;color:#9b2f35;font-size:13px" role="note">'+disclaimer+'</div>', 1)
    host = host.replace('</body>', '<script>\n' + host_bridge + '\n</script></body>', 1)
    receiver = (SRC / 'compass-bridge.js').read_text(encoding='utf-8')
    compass = compass.replace('</head>', '<style>@media screen{#clinical-disclaimer{display:none}}</style></head>', 1)
    compass = compass.replace('</body>', '<script>\n' + receiver + '\n</script></body>', 1)
    documents = json.dumps({'draft': host, 'compass': compass}, ensure_ascii=False).replace('<', r'\u003c').replace('\u2028', r'\u2028').replace('\u2029', r'\u2029')
    shell = (SRC / 'shell.html').read_text(encoding='utf-8').replace('__EMBEDDED_DOCUMENTS__', documents).replace('__DISCLAIMER__', disclaimer)
    if any(marker in shell for marker in ['/*__DRUGS__*/','{{SAFETY_SELECTS}}','__EMBEDDED_DOCUMENTS__']): raise ValueError('Unresolved build marker')
    OUTPUT.write_text(shell, encoding='utf-8')
    print(f'Built {OUTPUT.name}: {OUTPUT.stat().st_size} bytes')

if __name__ == '__main__': main()
