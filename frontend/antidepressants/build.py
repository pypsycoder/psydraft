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

def replace_required(text, old, new, count=1):
    if text.count(old) != count:
        raise ValueError('PsyDraft source changed: ' + old[:80])
    return text.replace(old, new)

def inject_before_body_close(document, content):
    before, marker, after = document.rpartition('</body>')
    if not marker or after.strip().lower() != '</html>':
        raise ValueError('Missing final document body')
    return before + content + marker + after

def integrate_status(host):
    # One input per symptom, in its clinical section; shared by report, advisor and compass.
    placements = {
        '<h3>🙂 Настроение</h3>': [('anhedonia', 'Ангедония / утрата интересов'), ('fatigue', 'Снижение энергии / быстрая утомляемость')],
        '<h3>👁️ Обманы ощущений и восприятия</h3>': [('pain', 'Болевой синдром')],
        '<div class="sleep-duration-row">': [('hypersomnia', 'Гиперсомния / повышенная сонливость')],
        '<label>Аппетит:</label>': [('diarrhea', 'Диарея'), ('constipation', 'Запор')],
    }
    for anchor, symptoms in placements.items():
        inputs = '<div class="pd-status-symptoms" style="margin:12px 0">' + ''.join(
            '<label class="checkbox-item"><input type="checkbox" id="pd-status-' + key + '" name="pd-status-symptoms" value="' + key + '" data-report-label="' + html.escape(label, quote=True) + '">' + html.escape(label) + '</label>' for key, label in symptoms) + '</div>'
        host = replace_required(host, anchor, inputs + anchor if anchor.startswith('<div') or anchor.startswith('<label') else anchor + inputs)
    host = replace_required(host, "mood:                   sel('mood'),", "mood:                   sel('mood'),\n        anhedonia: !!document.getElementById('pd-status-anhedonia')?.checked,\n        fatigue: !!document.getElementById('pd-status-fatigue')?.checked,")
    for criterion, key in [('dep_anhedonia','anhedonia'),('dep_energy','fatigue'),('bar_dep_anhedonia','anhedonia'),('bar_dep_energy','fatigue')]:
        pattern = r"(id: '" + criterion + r"',[\s\S]*?weight: 'core', )capturable: false, met: null"
        host, found = re.subn(pattern, r"\1capturable: true, met: function(s) { return s." + key + "; }", host, count=1)
        if found != 1: raise ValueError('Missing criterion: ' + criterion)
    host = replace_required(host, "\n    dep_mood:               { scrollTo: 'status-mood' },", "\n    dep_anhedonia: { scrollTo: 'status-mood' },\n    dep_energy: { scrollTo: 'status-mood' },\n    bar_dep_anhedonia: { scrollTo: 'status-mood' },\n    bar_dep_energy: { scrollTo: 'status-mood' },\n    dep_mood:               { scrollTo: 'status-mood' },")
    host = replace_required(host, '        // Уточнённые у пациента пункты из нозологического советника', "        document.querySelectorAll('input[name=\"pd-status-symptoms\"]:checked').forEach(cb => {\n            text += cb.dataset.reportLabel + '.<br>';\n        });\n\n        // Уточнённые у пациента пункты из нозологического советника")
    # Programmatic diagnosis edits need the same event as typing into the textarea.
    host = replace_required(host, "field.value = lines.join('\\n');", "field.value = lines.join('\\n');\n            field.dispatchEvent(new Event('input', {bubbles:true}));", count=2)
    host = replace_required(host, 'diag.value += line;', "diag.value += line;\n                diag.dispatchEvent(new Event('input', {bubbles:true}));")
    host = replace_required(host, '<textarea id="diagnosis"></textarea>', '<textarea id="diagnosis" aria-describedby="pd-diagnosis-help"></textarea><p id="pd-diagnosis-help" class="small-note">Клинический компас использует первый код МКБ-10 как основной диагноз. При наличии F30/F31 включается маршрут проверки биполярности независимо от порядка кодов.</p>')
    return host

def main():
    compass = (SRC / 'compass.html').read_text(encoding='utf-8')
    host = integrate_status(HOST.read_text(encoding='utf-8').rstrip() + '\n')
    storage_bridge = (SRC / 'case-storage-bridge.js').read_text(encoding='utf-8')
    head_end = host.index('<head>') + len('<head>')
    if head_end > host.index('<body>'):
        raise ValueError('Missing document head')
    host = host[:head_end] + '\n<script>\n' + storage_bridge + '\n</script>' + host[head_end:]
    host = replace_required(host, 'id="new-case"', 'id="new-case" hidden')
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
    host = inject_before_body_close(host, '<script>\n' + host_bridge + '\n</script>')
    receiver = (SRC / 'compass-bridge.js').read_text(encoding='utf-8')
    compass = re.sub(r'<div class="note danger" id="clinical-disclaimer"[^>]*>.*?</div>', '', compass, count=1, flags=re.S)
    compass = replace_required(compass, 'Данные находятся только в памяти этой вкладки.', 'Общий случай сохраняется локально в этом браузере. Статус сохранения показан в PsyDraft; передача в сеть не выполняется.')
    compass = inject_before_body_close(compass, '<script>\n' + receiver + '\n</script>')
    navigation = (SRC / 'embedded-navigation.js').read_text(encoding='utf-8')
    def local_navigation(document):
        document = document.replace('href="#', 'href="about:srcdoc#')
        return inject_before_body_close(document, '<script>\n' + navigation + '\n</script>')
    host, compass = local_navigation(host), local_navigation(compass)
    documents = json.dumps({'draft': host, 'compass': compass}, ensure_ascii=False).replace('<', r'\u003c').replace('\u2028', r'\u2028').replace('\u2029', r'\u2029')
    shell = (SRC / 'shell.html').read_text(encoding='utf-8').replace('__EMBEDDED_DOCUMENTS__', documents).replace('__DISCLAIMER__', disclaimer)
    if any(marker in shell for marker in ['/*__DRUGS__*/','{{SAFETY_SELECTS}}','__EMBEDDED_DOCUMENTS__']): raise ValueError('Unresolved build marker')
    OUTPUT.write_text(shell, encoding='utf-8')
    print(f'Built {OUTPUT.name}: {OUTPUT.stat().st_size} bytes')

if __name__ == '__main__': main()
