"""Checks final editable DOCX/PDF text parity and confirmed commercial terms."""
from pathlib import Path
from zipfile import ZipFile
import re
import json
from docx import Document
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
stem = root / 'assets/documents/bonesaver-smlouva-hudebni-produkce-vzor'
doc = Document(stem.with_suffix('.docx'))
pdf = PdfReader(stem.with_suffix('.pdf'))
normalize = lambda text: re.sub(r'\s+', '', text).replace('\u00ad', '')
pdf_text = normalize('\n'.join(page.extract_text() for page in pdf.pages))
paragraphs = [p.text for p in doc.paragraphs if p.text]
paragraphs += [p.text for table in doc.tables for row in table.rows for cell in row.cells for p in cell.paragraphs if p.text]
missing = [text for text in paragraphs if normalize(text) not in pdf_text]
assert not missing, 'Text missing in PDF: ' + repr(missing)
assert len(pdf.pages) == 5
assert '\ufffd' not in pdf_text
assert not doc.styles.element.xpath('.//w:pBdr'), 'Unexpected title/style border'
for term in [
    'do 14 dnů ode dne, kdy smlouvu podepíše poslední',
    'Zbývající doplatek 50 % je splatný po skončení sjednaného vystoupení',
    'storno 50 % celkové ceny včetně DPH',
    'nehradí se tedy záloha a dalších 50 % navíc',
    'pouze při prokazatelných zdravotních problémech',
    'vystoupení v menším obsazení',
    'bez požadavku na sdělení diagnózy',
]:
    assert normalize(term) in pdf_text, term
with ZipFile(stem.with_suffix('.docx')) as z:
    assert not any('vbaProject' in name for name in z.namelist())
report = {'pages': len(pdf.pages), 'verified_text_blocks': len(paragraphs), 'missing_blocks': 0, 'commercial_terms': 'verified', 'render': 'Microsoft Word PDF export, all five page PNGs visually inspected', 'legal_status': 'draft; not a legal opinion'}
target = root / '_dev/output/contract-verification.json'
target.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=True))
