from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent
course=json.loads((ROOT/'course-source.json').read_text())
def plain(s):
 return re.sub(r'[*`]', '', s).strip()
def norm(s): return s.casefold().strip()
output={}
for t in course:
 sec=t['sections']; ex=sec['BÀI TẬP VẬN DỤNG & ĐÁP ÁN']
 qtext,answertext=re.split(r'\*Đáp án:\*',ex,flags=re.I)
 questions=re.findall(r'^\d+\.\s*(.+)$',qtext,re.M)
 answerline=answertext.strip().splitlines()[0]
 answers=[re.sub(r'^\d+\.\s*','',x.strip()) for x in answerline.split('|')]
 if t['id']==40:
  questions.append('Small talk usually focuses on ______________ subjects rather than serious personal problems.')
  answers.append('low-stakes')
 if t['id']==33:questions[4]=questions[4].replace('529 plan','______________',1)
 assert len(questions)==len(answers)==5,(t['id'],answers)
 original=[{'prompt':plain(q),'answers':[x.strip() for x in a.split(' / ')]} for q,a in zip(questions,answers)]
 sets=[{'title':'Vòng 1 · Tình huống thực tế','questions':original}]
 candidates=[];seen=set()
 reading=sec['BÀI ĐỌC TIẾNG ANH']
 for sentence in re.split(r'(?<=[.!?])\s+(?=[A-Z*“\"])',reading):
  if '\n*' in sentence: continue
  for term in re.findall(r'\*\*([^*]+)\*\*',sentence):
   if norm(term) in seen or len(plain(sentence).split())<9:continue
   prompt=plain(sentence.replace('**'+term+'**','________',1))
   if norm(term) in norm(prompt):continue
   candidates.append({'prompt':prompt,'answers':[term]})
   seen.add(norm(term));break
  if len(candidates)==5:break
 if len(candidates)<5:
  text=plain(reading)
  for term in re.findall(r'^\*\s+\*\*(.*?)\*\*',sec['TỪ VỰNG & CỤM TỪ CỐT LÕI'],re.M):
   for variant in re.split(r' / | & | \(',term):
    if len(variant)<3 or norm(variant) in seen:continue
    for sentence in re.split(r'(?<=[.!?])\s+(?=[A-Z“\"])',text):
     match=re.search(r'(?<!\w)'+re.escape(variant)+r'(?!\w)',sentence,re.I)
     if match and len(sentence.split())>=4:
      candidates.append({'prompt':sentence[:match.start()]+'________'+sentence[match.end():],'answers':[match.group()]})
      seen.add(norm(variant));break
    if len(candidates)==5:break
   if len(candidates)==5:break
 assert len(candidates)==5,('context',t['id'],len(candidates))
 sets.append({'title':'Vòng 2 · Từ vựng trong bài đọc','questions':candidates})
 defs=[]
 for line in sec['TỪ VỰNG & CỤM TỪ CỐT LÕI'].splitlines():
  m=re.match(r'\*\s+\*\*(.*?)\*\*.*?:\s*(.+)',line)
  if not m:continue
  term,definition=m.groups()
  definition=plain(definition)
  defs.append({'prompt':definition+' → ________','answers':[term]})
 assert len(defs)>=5,('definitions',t['id'])
 sets.append({'title':'Vòng 3 · Nhận diện nghĩa tiếng Việt','questions':defs[:5]})
 trs=ROOT/'translations'/f'{t["id"]:02}.json'
 translations=json.loads(trs.read_text())
 assert len(translations)==len(t['paragraphs']),(t['id'],len(translations),len(t['paragraphs']))
 assert all(isinstance(p,str) and p.strip() for p in translations),('empty translation',t['id'])
 for exercise_set in sets:
  for question in exercise_set['questions']:
   assert len(re.findall(r'_{3,}',question['prompt']))==len(question['answers']),('blank mismatch',t['id'],question)
 output[str(t['id'])]={'paragraphs':[{'en':en,'vi':translations[i]} for i,en in enumerate(t['paragraphs'])],'sets':sets}
(ROOT/'dist/learning-data.js').write_text('window.LEARNING_DATA = '+json.dumps(output,ensure_ascii=False)+';\n')
print('Built',len(output),'lessons;',sum(len(v['paragraphs']) for v in output.values()),'paragraph blocks;',sum(len(s['questions']) for v in output.values() for s in v['sets']),'questions; translated:',sum(bool(p['vi']) for v in output.values() for p in v['paragraphs']))
