import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const dom=new JSDOM(html,{url:'https://ptoan-pq.github.io/song-my-english-campus/',runScripts:'outside-only',pretendToBeVisual:true});
const {window}=dom;
const errors=[];
window.addEventListener('error',e=>errors.push(e.error));
window.scrollTo=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.matchMedia=()=>({matches:false});
let animations=0;
window.HTMLElement.prototype.animate=()=>{animations++;return {finished:Promise.resolve()};};
for(const file of ['content.js','learning-data.js','learning.js'])window.eval(readFileSync(new URL('./dist/'+file,import.meta.url),'utf8'));
window.eval(inline);
const doc=window.document,$=s=>doc.querySelector(s),$$=s=>[...doc.querySelectorAll(s)];
function press(selector){const e=typeof selector==='string'?$(selector):selector;assert.ok(e,`Missing ${selector}`);assert.ok(!e.disabled,`Disabled ${selector}`);e.click();}
press('[data-topic="8"]');
assert.ok($('#lessonTitle').textContent.includes('GIẶT'));
const translations=$$('.paragraph-translation');assert.equal(translations.length,5);assert.ok(translations.every(e=>e.hidden));
press('.paragraph-toggle');
assert.equal(translations[0].hidden,false);
assert.equal(translations[1].hidden,true);
assert.ok(translations[0].textContent.includes('tiệm giặt tự phục vụ'));
press('.paragraph-toggle');assert.equal(translations[0].hidden,true);
$('.paragraph-toggle').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
assert.equal(translations[0].hidden,false);
// Sidebar cannot bypass quiz completion.
press('#markBtn');assert.ok($('[data-panel="4"]').classList.contains('active'));
assert.equal(window.localStorage.getItem('songmy-done'),null);
assert.ok($('.quiz-feedback').textContent.includes('0/5'));
function word(text){return $$('.word-choice').find(e=>!e.disabled&&e.textContent===text);}
// One correct and one deliberately incorrect answer, then check with three empty slots.
press(word('laundromat'));assert.equal($('[data-slot="0"]').textContent,'laundromat');
press(word('lint trap'));assert.equal($('[data-slot="1"]').textContent,'lint trap');
press('.quiz-check');
assert.equal($$('.quiz-blank.correct').length,1);assert.equal($$('.quiz-blank.wrong').length,4);
assert.equal($$('.quiz-blank[aria-invalid="true"]').length,4);
assert.equal($('.quiz-next'),null);assert.equal($('.quiz-check'),null);
assert.equal($('[data-slot="0"]').disabled,true);
assert.ok($$('.word-choice').every(e=>e.disabled));
press('.quiz-retry');
assert.equal($('[data-slot="0"]').textContent,'laundromat ✓');
assert.equal($('[data-slot="0"]').disabled,true);
assert.equal($$('.quiz-blank.wrong').length,0);
assert.equal(doc.activeElement.dataset.slot,'1');
assert.equal(word('laundromat'),undefined);
function solveRound(n,index){
 const answers=window.LEARNING_DATA[n].sets[index].questions.flatMap(q=>q.answers);
 for(let i=0;i<answers.length;i++){
  if($(`[data-slot="${i}"]`).disabled)continue;
  press(`[data-slot="${i}"]`);press(word(answers[i]));
 }
 press('.quiz-check');assert.equal($$('.quiz-blank.wrong').length,0);
}
solveRound(8,0);press('.quiz-next');
assert.equal($('.round-indicator').textContent,'2/3');
solveRound(8,1);press('.quiz-next');solveRound(8,2);
assert.equal($('.quiz-next'),null);press('.quiz-complete');
assert.deepEqual(JSON.parse(window.localStorage.getItem('songmy-done')),[8]);
assert.deepEqual(JSON.parse(window.localStorage.getItem('songmy-quiz-passed')),[8]);
assert.equal($('#progressText').textContent,'1 / 43 chủ đề đã hoàn thành');
assert.ok(animations>=15,'Word placement should animate');
// Re-entering preserves the completed attempt, reset starts over.
press('#backBtn');press('[data-topic="8"]');
assert.ok($('.quiz-complete'));press('.quiz-reset');assert.equal($('.round-indicator').textContent,'1/3');
// Multi-blank source question in lesson 17 must render six slots, with both answers required.
press('#backBtn');press('[data-topic="17"]');press('[data-tab="4"]');
assert.equal($$('.quiz-blank').length,6);solveRound(17,0);
assert.equal($$('.quiz-blank.correct').length,6);assert.ok($('.quiz-next'));
// Exercise all 43 lesson screens and every round through the real event handlers.
for(let n=1;n<=43;n++){
 press('#backBtn');press(`[data-topic="${n}"]`);
 const toggles=$$('.paragraph-toggle');
 for(const toggle of toggles){
  press(toggle);
  assert.equal(doc.getElementById(toggle.getAttribute('aria-controls')).hidden,false);
 }
 press('[data-tab="4"]');press('.quiz-reset');
 for(let index=0;index<3;index++){solveRound(n,index);if(index<2)press('.quiz-next');}
 press('.quiz-complete');
}
assert.equal(JSON.parse(window.localStorage.getItem('songmy-done')).length,43);
assert.deepEqual(errors,[]);
console.log('PASS: real DOM clicks, keyboard translation, isolated toggles, animated placement, wrong/empty scoring, red feedback, retry focus, correct-answer locking, 3-round completion, reset and multi-blank questions.');
dom.window.close();
