from pathlib import Path
import json
src = Path('/Users/phaptoan/Desktop/giao_trinh_tieng_anh_van_hoa_my.md')
out = Path('dist/content.js')
out.write_text('window.COURSE_MD = ' + json.dumps(src.read_text(encoding='utf-8'), ensure_ascii=False) + ';', encoding='utf-8')
