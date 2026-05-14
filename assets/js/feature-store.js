(function(){
  const NS='shokyokai.v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const now=()=>new Date().toISOString();
  const uid=(p='id')=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const read=(key, fallback=[])=>{try{return JSON.parse(localStorage.getItem(`${NS}.${key}`)) ?? fallback}catch(e){return fallback}};
  const write=(key,val)=>localStorage.setItem(`${NS}.${key}`, JSON.stringify(val));
  const status=(id,msg,type='success')=>{const el=$(id); if(!el) return; el.textContent=msg; el.className=`status show ${type}`;};
  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function currentUser(){const id=sessionStorage.getItem(`${NS}.sessionUserId`); if(!id) return null; return read('users',[]).find(u=>u.id===id)||null;}
  function setAuthUi(){
    const u=currentUser();
    $$('[data-auth-state]').forEach(el=>{ el.textContent = u ? `ログイン中：${u.name} / ${u.email}` : '未ログイン'; });
    $$('[data-auth-required]').forEach(el=>{ el.classList.toggle('hidden', !u); });
    $$('[data-guest-only]').forEach(el=>{ el.classList.toggle('hidden', !!u); });
  }
  function serialize(form){return Object.fromEntries(new FormData(form).entries());}
  function append(key, obj){const list=read(key,[]); list.unshift({id:uid(key.slice(0,3)), createdAt:now(), ...obj}); write(key,list); return list[0];}
  function renderTable(key, mountId, columns){
    const mount=$(mountId); if(!mount) return;
    const rows=read(key,[]);
    if(!rows.length){mount.innerHTML='<p class="hint">まだ保存データはありません。</p>'; return;}
    const head=columns.map(c=>`<th>${c.label}</th>`).join('');
    const body=rows.map(r=>`<tr>${columns.map(c=>`<td>${String(c.value(r)??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</td>`).join('')}</tr>`).join('');
    mount.innerHTML=`<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  window.SKG={NS,read,write,append,renderTable,currentUser,setAuthUi,status,serialize,sha256,uid,now};

  document.addEventListener('DOMContentLoaded',()=>{
    setAuthUi();
    const logout=$('[data-logout]');
    if(logout) logout.addEventListener('click',()=>{sessionStorage.removeItem(`${NS}.sessionUserId`); setAuthUi(); status('#authStatus','ログアウトしました。','success');});

    const reg=$('#registerForm');
    if(reg) reg.addEventListener('submit',async e=>{
      e.preventDefault();
      const d=serialize(reg); const users=read('users',[]);
      if(users.some(u=>u.email===d.email)){status('#registerStatus','このメールアドレスは、このブラウザのデモ登録に既に存在します。','error');return;}
      if((d.password||'').length<8){status('#registerStatus','パスワードは8文字以上にしてください。','error');return;}
      const user={id:uid('mem'),name:d.name,email:d.email,role:d.role||'member',createdAt:now(),passwordHash:await sha256(d.password)};
      users.unshift(user); write('users',users); sessionStorage.setItem(`${NS}.sessionUserId`,user.id);
      reg.reset(); setAuthUi(); status('#registerStatus','デモ会員登録を保存しました。この認証はブラウザ内だけで有効です。','success');
    });
    const login=$('#loginForm');
    if(login) login.addEventListener('submit',async e=>{
      e.preventDefault();
      const d=serialize(login); const users=read('users',[]); const hash=await sha256(d.password||'');
      const user=users.find(u=>u.email===d.email && u.passwordHash===hash);
      if(!user){status('#loginStatus','一致するデモ会員が見つかりません。','error');return;}
      sessionStorage.setItem(`${NS}.sessionUserId`,user.id); login.reset(); setAuthUi(); status('#loginStatus','ログインしました。','success');
    });

    const contact=$('#contactForm');
    if(contact) contact.addEventListener('submit',e=>{
      e.preventDefault(); const d=serialize(contact); append('contacts',d); contact.reset();
      const cfg=window.SHOKYOKAI_CONFIG||{}; if(cfg.siteContactEmail){ location.href=`mailto:${cfg.siteContactEmail}?subject=${encodeURIComponent('[知性の鏡会] '+(d.type||'問い合わせ'))}&body=${encodeURIComponent(JSON.stringify(d,null,2))}`; }
      status('#contactStatus','問い合わせ内容をこのブラウザに保存しました。実送信にはメールアドレスまたはバックエンド設定が必要です。','success');
      renderTable('contacts','#contactList',[{label:'日時',value:r=>r.createdAt},{label:'種別',value:r=>r.type},{label:'名前',value:r=>r.name},{label:'件名',value:r=>r.subject}]);
    });

    const workshop=$('#workshopForm');
    if(workshop) workshop.addEventListener('submit',e=>{
      e.preventDefault(); const d=serialize(workshop); append('workshopApplications',d); workshop.reset();
      status('#workshopStatus','申込内容をこのブラウザに保存しました。実受付にはバックエンド設定が必要です。','success');
      renderTable('workshopApplications','#workshopList',[{label:'日時',value:r=>r.createdAt},{label:'名前',value:r=>r.name},{label:'メール',value:r=>r.email},{label:'希望',value:r=>r.session}]);
    });

    const logForm=$('#logForm');
    if(logForm) logForm.addEventListener('submit',e=>{
      e.preventDefault(); const d=serialize(logForm); d.userId=currentUser()?.id||''; append('logs',d); logForm.reset();
      status('#logStatus','ログを保存しました。保存先はこのブラウザのlocalStorageです。','success');
      renderTable('logs','#logList',[{label:'日時',value:r=>r.createdAt},{label:'分類',value:r=>r.category},{label:'題名',value:r=>r.title},{label:'判断',value:r=>r.humanDecision}]);
    });

    const donate=$('#donationForm');
    if(donate) donate.addEventListener('submit',e=>{
      e.preventDefault(); const d=serialize(donate); append('donationIntents',d); donate.reset();
      const cfg=window.SHOKYOKAI_CONFIG||{};
      if(cfg.paymentUrl){ window.open(cfg.paymentUrl,'_blank','noopener'); status('#donationStatus','決済ページを開きました。','success'); }
      else status('#donationStatus','寄附意向だけを保存しました。実決済URLは未設定です。','success');
      renderTable('donationIntents','#donationList',[{label:'日時',value:r=>r.createdAt},{label:'名前',value:r=>r.name},{label:'金額',value:r=>r.amount},{label:'用途',value:r=>r.purpose}]);
    });

    $$('.amount-option').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.amount-option').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const target=$('#amount'); if(target) target.value=btn.dataset.amount;
    }));

    const chat=$('#chatForm');
    if(chat) chat.addEventListener('submit',e=>{
      e.preventDefault(); const d=serialize(chat); const history=read('chatHistory',[]);
      const userMsg={role:'user',body:d.message,model:d.model||'manual',createdAt:now()};
      const reply={role:'assistant',body:`静的プロトタイプ応答です。実AI接続には、サーバー側のAIプロキシが必要です。\n\n検証観点：\n1. この問いは結論を誘導していないか。\n2. AIに最終判断を委ねていないか。\n3. 根拠・反例・不確実性を分けて確認できるか。`,model:d.model||'manual',createdAt:now()};
      history.push(userMsg,reply); write('chatHistory',history); chat.reset(); renderChat();
    });
    function renderChat(){
      const box=$('#chatBox'); if(!box) return; const h=read('chatHistory',[]);
      box.innerHTML=h.map(m=>`<div class="msg ${m.role}"><div class="who">${m.role} / ${m.model}</div><div>${String(m.body).replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x])).replace(/\n/g,'<br>')}</div></div>`).join('') || '<p class="hint">まだ会話はありません。</p>';
      box.scrollTop=box.scrollHeight;
    }
    renderChat();

    const exportBtn=$('[data-export]');
    if(exportBtn) exportBtn.addEventListener('click',()=>{
      const keys=['users','contacts','workshopApplications','logs','chatHistory','donationIntents'];
      const data=Object.fromEntries(keys.map(k=>[k,read(k,[])]));
      const blob=new Blob([JSON.stringify({exportedAt:now(),namespace:NS,data},null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='shokyokai-local-data-export.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    const clearBtn=$('[data-clear-all]');
    if(clearBtn) clearBtn.addEventListener('click',()=>{
      if(confirm('このブラウザ内のデモ保存データをすべて削除します。よろしいですか？')){ Object.keys(localStorage).filter(k=>k.startsWith(`${NS}.`)).forEach(k=>localStorage.removeItem(k)); sessionStorage.removeItem(`${NS}.sessionUserId`); location.reload(); }
    });

    renderTable('contacts','#contactList',[{label:'日時',value:r=>r.createdAt},{label:'種別',value:r=>r.type},{label:'名前',value:r=>r.name},{label:'件名',value:r=>r.subject}]);
    renderTable('workshopApplications','#workshopList',[{label:'日時',value:r=>r.createdAt},{label:'名前',value:r=>r.name},{label:'メール',value:r=>r.email},{label:'希望',value:r=>r.session}]);
    renderTable('logs','#logList',[{label:'日時',value:r=>r.createdAt},{label:'分類',value:r=>r.category},{label:'題名',value:r=>r.title},{label:'判断',value:r=>r.humanDecision}]);
    renderTable('donationIntents','#donationList',[{label:'日時',value:r=>r.createdAt},{label:'名前',value:r=>r.name},{label:'金額',value:r=>r.amount},{label:'用途',value:r=>r.purpose}]);
  });
})();
