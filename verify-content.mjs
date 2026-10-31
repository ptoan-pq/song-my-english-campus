import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const nodes=new Map();
const document={
 querySelector(selector){
  if(!nodes.has(selector))nodes.set(selector,{value:'',style:{},classList:{add(){},remove(){},toggle(){}},innerHTML:'',textContent:''});
  return nodes.get(selector);
 },querySelectorAll(){return [];}
};
const saved=new Map();
const sandbox={window:{scrollTo(){}},document,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)}};
vm.createContext(sandbox);
for(const file of ['content.js','learning-data.js','learning.js'])vm.runInContext(readFileSync(new URL('./dist/'+file,import.meta.url),'utf8'),sandbox);
sandbox.Learning=sandbox.window.Learning;
const learning=sandbox.Learning;
// DOM events are checked in the browser; this self-check executes the real data, renderer and scoring functions.
learning.bind=()=>{};
vm.runInContext(script.replace(/\}\)\(\);\s*$/,'globalThis.courseTest={topics,openTopic};})();'),sandbox);
const {topics,openTopic}=sandbox.courseTest;
assert.equal(topics.length,43);
let paragraphs=0,questions=0;
for(const topic of topics){
 const data=sandbox.window.LEARNING_DATA[topic.n];
 assert.equal(data.sets.length,3);
 for(const paragraph of data.paragraphs){assert.ok(paragraph.en.length>25);assert.ok(paragraph.vi.length>25);paragraphs++;}
 for(const set of data.sets){
  assert.equal(set.questions.length,5);
  for(const q of set.questions){assert.equal((q.prompt.match(/_{3,}/g)||[]).length,q.answers.length);assert.ok(q.answers.every(a=>a.trim()));questions++;}
  const round=learning.makeRound(set);
  // Wrong/empty answers cannot pass, and cannot be edited until retry.
  assert.equal(learning.grade(round),false);
  assert.ok(round.slots.every(s=>s.status==='wrong'));
  assert.equal(learning.place(round,round.choices[0].id),false);
  learning.retry(round);
  assert.equal(learning.place(round,-1),false);
  // Fill one correct answer, then a wrong answer; retry preserves correct work.
  const first=round.choices.find(c=>c.text===round.slots[0].answer);
  assert.equal(learning.place(round,first.id),true);
  assert.equal(learning.place(round,first.id),false,'A used choice cannot be reused');
  const wrong=round.choices.find(c=>c.id!==first.id&&c.text!==round.slots[1].answer);
  if(wrong){assert.equal(learning.place(round,wrong.id),true);}
  assert.equal(learning.grade(round),false);
  learning.retry(round);
  assert.equal(round.slots[0].choice,first.id);
  assert.equal(round.slots[0].status,'correct');
  assert.ok(round.slots.slice(1).every(s=>s.choice===null));
  while(round.selected>=0){
   const answer=round.slots[round.selected].answer;
   const choice=round.choices.find(c=>c.text===answer&&!round.slots.some(s=>s.choice===c.id));
   assert.ok(choice);
   assert.equal(learning.place(round,choice.id),true);
  }
  assert.equal(learning.grade(round),true);
 }
 openTopic(topic.n);
 const rendered=nodes.get('#tabPanels').innerHTML;
 assert.ok(!rendered.includes('Nội dung đang được biên soạn'),`Empty content ${topic.n}`);
 assert.equal((rendered.match(/data-panel=/g)||[]).length,5);
 assert.equal((rendered.match(/class="paragraph-toggle"/g)||[]).length,data.paragraphs.length);
 assert.ok(rendered.includes('Đã điền 0/'), 'Initial answer counter must start at zero');
 assert.ok(!rendered.includes('Hiện đáp án'),'Answers must be checked, not revealed');
 assert.ok(!rendered.includes('Vòng tiếp theo →'),'Cannot advance before scoring');
 const vocabPanel=rendered.match(/data-panel="1"[\s\S]*?<\/section>/)[0];
 if(topic.n===1)assert.equal((vocabPanel.match(/Tip \/ Gratuity/g)||[]).length,1);
}
assert.equal(paragraphs,195);assert.equal(questions,645);
assert.equal(learning.hasPassed(1),false);
console.log(`PASS: ${topics.length} lessons, ${paragraphs} translations, ${questions} questions; multi-blank scoring, wrong-answer retry, locked correct answers, and completion gating.`);
