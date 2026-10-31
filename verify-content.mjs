import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const nodes = new Map();
const document = {
  querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {value:'',style:{},classList:{add(){},remove(){},toggle(){}},innerHTML:'',textContent:''});
    return nodes.get(selector);
  },
  querySelectorAll(){return [];}
};
const sandbox = {window:{scrollTo(){}},document,localStorage:{getItem(){return null;},setItem(){}}};
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('./dist/content.js', import.meta.url),'utf8'), sandbox);
// Run the actual page parser and renderer, exposing only lesson entry points to this test.
vm.runInContext(script.replace(/\}\)\(\);\s*$/, 'globalThis.courseTest = {topics, openTopic}; })();'), sandbox);
const {topics,openTopic} = sandbox.courseTest;
assert.equal(topics.length, 43);
for (const topic of topics) {
  openTopic(topic.n);
  const rendered = nodes.get('#tabPanels').innerHTML;
  assert.ok(!rendered.includes('Nội dung đang được biên soạn'), `Empty section in topic ${topic.n}`);
  assert.equal((rendered.match(/data-panel=/g)||[]).length, 5);
  assert.ok(rendered.includes('Hiện đáp án'));
  assert.ok(/class="answer">\s*[^<\s]/.test(rendered), `Missing answers in topic ${topic.n}`);
}
openTopic(1);
assert.ok(nodes.get('#tabPanels').innerHTML.includes('For newcomers to the United States'));
assert.ok(nodes.get('#tabPanels').innerHTML.includes('Tipped minimum wage'));
const vocabPanel = nodes.get('#tabPanels').innerHTML.match(/data-panel="1"[\s\S]*?<\/section>/)[0];
assert.equal((vocabPanel.match(/Tip \/ Gratuity/g)||[]).length, 1, 'Vocabulary should not repeat its definition');
console.log('PASS: 43 lessons render all 215 sections, including vocabulary and exercise answers.');
