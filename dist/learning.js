(() => {
  const data = window.LEARNING_DATA;
  const h = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => s.normalize('NFC').toLocaleLowerCase('en').trim();
  const passed = new Set(JSON.parse(localStorage.getItem('songmy-quiz-passed') || '[]'));
  const attempts = new Map();
  const shuffle = list => {for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
  function makeRound(set) {
    const answers=set.questions.flatMap(q=>q.answers);
    return {choices:shuffle(answers.map((text,id)=>({id,text}))),slots:answers.map(answer=>({answer,choice:null,status:''})),selected:0,checked:false};
  }
  function grade(round) {
    round.checked=true;
    for(const slot of round.slots){
      const choice=round.choices.find(c=>c.id===slot.choice);
      slot.status=choice&&normalize(choice.text)===normalize(slot.answer)?'correct':'wrong';
    }
    round.selected=round.slots.findIndex(s=>s.status!=='correct');
    return round.slots.every(s=>s.status==='correct');
  }
  function retry(round) {
    for(const slot of round.slots)if(slot.status==='wrong'){slot.choice=null;slot.status='';}
    round.checked=false;
    round.selected=round.slots.findIndex(s=>s.status!=='correct');
  }
  function place(round,id) {
    if(round.checked||round.selected<0||!round.choices.some(c=>c.id===id))return false;
    if(round.slots.some(s=>s.choice===id))return false;
    const slot=round.slots[round.selected];
    if(slot.status==='correct')return false;
    slot.choice=id;slot.status='';
    round.selected=round.slots.findIndex(s=>s.choice===null&&s.status!=='correct');
    return true;
  }
  function reading(n,md) {
    return '<p class="translation-help">Bấm vào từng đoạn tiếng Anh để xem hoặc ẩn bản dịch tiếng Việt.</p>'+data[n].paragraphs.map((p,i)=>`<section class="reading-unit"><div class="paragraph-toggle" role="button" tabindex="0" aria-expanded="false" aria-controls="translation-${n}-${i}" aria-label="Xem bản dịch đoạn ${i+1}">${md(p.en)}<span class="translate-hint">Dịch đoạn này ↗</span></div><div id="translation-${n}-${i}" class="paragraph-translation" lang="vi" hidden><span class="translation-label">Bản dịch tiếng Việt</span>${md(p.vi)}</div></section>`).join('');
  }
  function render(n) {
    const sets=data[n].sets;
    let attempt=attempts.get(n);
    if(!attempt){attempt={index:0,rounds:sets.map(makeRound)};attempts.set(n,attempt);}
    const set=sets[attempt.index], round=attempt.rounds[attempt.index];
    const allCorrect=round.slots.every(s=>s.status==='correct');
    const complete=attempt.index===sets.length-1&&allCorrect;
    const correct=round.slots.filter(s=>s.status==='correct').length;
    const used=new Set(round.slots.filter(s=>s.choice!==null).map(s=>s.choice));
    let slotIndex=0;
    const questions=set.questions.map((q,i)=>{
      let j=0;
      const sentence=q.prompt.split(/_{3,}/).map((part,k)=>{
        if(!k)return h(part);
        const index=slotIndex++,slot=round.slots[index],choice=round.choices.find(c=>c.id===slot.choice);
        j++;
        return `<button type="button" class="quiz-blank ${slot.status} ${index===round.selected?'selected':''}" data-slot="${index}" aria-label="Ô trống câu ${i+1}${q.answers.length>1?' · vị trí '+j:''}${slot.status==='wrong'?' · sai, cần làm lại':slot.status==='correct'?' · đúng':''}" aria-invalid="${slot.status==='wrong'}" ${slot.status==='correct'?'disabled':''}>${choice?h(choice.text):'Chọn từ…'}${slot.status==='correct'?' ✓':slot.status==='wrong'?' ✗':''}</button>${h(part)}`;
      }).join('');
      return `<li class="quiz-question"><span class="question-number">${attempt.index*5+i+1}.</span><span>${sentence}</span></li>`;
    }).join('');
    const status=complete?'Bạn đã hoàn thành đúng cả 15 câu!':allCorrect?'Đúng hết vòng này. Sẵn sàng sang vòng tiếp theo.':round.checked?`Đúng ${correct}/${round.slots.length} ô. Các ô đỏ chưa đúng; hãy bấm “Làm lại câu sai”.`:`Đã điền ${used.size}/${round.slots.length} ô. Chọn ô trống, rồi bấm một từ bên dưới.`;
    return `<div class="interactive-quiz" data-quiz="${n}"><div class="quiz-heading"><div><span class="quiz-kicker">15 CÂU · 3 VÒNG LUYỆN TẬP</span><h4>${h(set.title)}</h4></div><span class="round-indicator">${attempt.index+1}/3</span></div><div class="quiz-track">${sets.map((_,i)=>`<span class="${i<attempt.index?'finished':i===attempt.index?'current':''}"></span>`).join('')}</div><p class="quiz-instructions">Bấm một ô để chọn; bấm từ để điền vào ô đó. Bấm lại ô đã điền để đổi từ. Từ đúng sẽ được giữ lại sau khi kiểm tra.</p><ol class="quiz-questions">${questions}</ol><div class="word-bank" aria-label="Từ vựng để điền">${round.choices.map(c=>`<button type="button" class="word-choice" data-choice="${c.id}" ${used.has(c.id)||round.checked?'disabled':''}>${h(c.text)}</button>`).join('')}</div><p class="quiz-feedback ${round.checked&&!allCorrect?'has-errors':''} ${allCorrect?'success':''}" role="status" aria-live="polite">${status}</p><div class="quiz-actions">${!round.checked?'<button type="button" class="primary quiz-check">Kiểm tra</button>':!allCorrect?'<button type="button" class="primary quiz-retry">Làm lại câu sai</button>':!complete?'<button type="button" class="primary quiz-next">Vòng tiếp theo →</button>':'<button type="button" class="primary quiz-complete">Hoàn thành bài học ✓</button>'}<button type="button" class="filter quiz-reset">Làm lại từ đầu</button></div></div>`;
  }
  function fly(text,from,to) {
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
    const ghost=document.createElement('span');ghost.className='flying-word';ghost.textContent=text;
    Object.assign(ghost.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px'});document.body.append(ghost);
    const animation=ghost.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.96)`,opacity:.4}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
    animation.finished.finally(()=>ghost.remove());
  }
  function bind(n,root,onPassed) {
    root.querySelectorAll('.paragraph-toggle').forEach(toggle=>{
      function change(){const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));document.getElementById(toggle.getAttribute('aria-controls')).hidden=expanded;toggle.querySelector('.translate-hint').textContent=expanded?'Dịch đoạn này ↗':'Ẩn bản dịch ↑';}
      toggle.onclick=change;toggle.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change();}};
    });
    const panel=root.querySelector('.interactive-quiz');
    function refresh(){panel.outerHTML=render(n);bind(n,root,onPassed);}
    const attempt=attempts.get(n), round=attempt.rounds[attempt.index];
    panel.querySelectorAll('[data-slot]').forEach(button=>button.onclick=()=>{
      const index=Number(button.dataset.slot),slot=round.slots[index];
      if(slot.status==='correct'||round.checked)return;
      slot.choice=null;round.selected=index;refresh();
    });
    panel.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
      const target=panel.querySelector(`[data-slot="${round.selected}"]`);
      if(place(round,Number(button.dataset.choice))){if(target)fly(button.textContent,button,target);refresh();}
    });
    const check=panel.querySelector('.quiz-check');if(check)check.onclick=()=>{grade(round);refresh();};
    const again=panel.querySelector('.quiz-retry');if(again)again.onclick=()=>{retry(round);refresh();root.querySelector('.quiz-blank.selected')?.focus();};
    const next=panel.querySelector('.quiz-next');if(next)next.onclick=()=>{if(!round.slots.every(s=>s.status==='correct'))return;attempt.index++;refresh();root.querySelector('.quiz-heading').scrollIntoView({behavior:'smooth',block:'center'});};
    const finish=panel.querySelector('.quiz-complete');if(finish)finish.onclick=()=>{passed.add(n);localStorage.setItem('songmy-quiz-passed',JSON.stringify([...passed]));onPassed(n);};
    panel.querySelector('.quiz-reset').onclick=()=>{attempts.delete(n);refresh();};
  }
  window.Learning={reading,render,bind,hasPassed:n=>passed.has(n),makeRound,grade,retry,place};
})();
