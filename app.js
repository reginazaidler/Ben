const days=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const icons=['⚽','🏊','🎨','🎵','🥋','📚','🚲','⭐'];
const colors=['#2578d4','#21a567','#ef5350','#f2bd35','#ef8c34','#8a5bd4','#e85c99'];
const defaults=[
 {id:1,name:'כדורגל',icon:'⚽',color:'#21a567',day:'שני',time:'17:00',place:'מגרש הספורט',reminder:'שעה'},
 {id:2,name:'ציור',icon:'🎨',color:'#8a5bd4',day:'רביעי',time:'18:30',place:'מרכז האומנויות',reminder:'30 דקות'},
 {id:3,name:'שחייה',icon:'🏊',color:'#2578d4',day:'שישי',time:'14:00',place:'הבריכה העירונית',reminder:'שעה'}
];
let activities=JSON.parse(localStorage.getItem('myActivities')||'null')||defaults;
let profile=JSON.parse(localStorage.getItem('myProfile')||'null')||{name:'בן'};
let selectedIcon=icons[0],selectedColor=colors[1],selectedDay='שני',deleteId=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function soft(hex){return hex+'22'}
function save(){localStorage.setItem('myActivities',JSON.stringify(activities))}
function saveProfile(){localStorage.setItem('myProfile',JSON.stringify(profile))}
function escapeHtml(value){const el=document.createElement('div');el.textContent=String(value);return el.innerHTML}
function render(){
 $('#profileName').textContent=profile.name;
 $('#profileBadge').setAttribute('aria-label',`הפרופיל של ${profile.name}`);
 $('#welcomeName').textContent=`שלום ${profile.name}! 👋`;
 $('#userName').value=profile.name;
 const next=activities[0];
 $('#nextCard').innerHTML=next?`<div class="next-label">✨ החוג הבא שלי</div><div class="next-content"><div class="big-icon" style="--soft:${soft(next.color)}">${next.icon}</div><div class="next-info"><h2>${next.name}</h2><div class="details"><span>🗓️ יום ${next.day}</span><span>🕐 ${next.time}</span><span>📍 ${next.place||'המקום עדיין לא נקבע'}</span></div></div><div class="countdown">⏳ בעוד שעתיים</div></div>`:`<h2>אין לך חוגים היום</h2><p>אפשר לשחק או לנוח 🌈</p>`;
 $('#nextCard').style.setProperty('--accent',next?.color||'#45a96e');
 $('#activityList').innerHTML=activities.map(a=>`<article class="activity-card" style="--accent:${a.color};--soft:${soft(a.color)}"><div class="activity-head"><div class="activity-icon">${a.icon}</div><div><h3>${a.name}</h3><span>יום ${a.day} • ${a.time}</span></div></div><div class="meta">📍 ${a.place||'ללא מקום'}<br>🔔 תזכורת ${a.reminder} לפני</div><div class="card-actions"><button class="edit" data-edit="${a.id}">✏️ ערוך</button><button class="delete" data-delete="${a.id}">🗑️ מחק</button></div></article>`).join('');
 $('#settingsActivityList').innerHTML=activities.length?activities.map(a=>`<div class="settings-activity"><span class="settings-activity-icon" style="--soft:${soft(a.color)}">${a.icon}</span><div><b>${escapeHtml(a.name)}</b><small>יום ${a.day} בשעה ${a.time}</small></div><div class="settings-actions"><button class="edit" data-edit="${a.id}">✏️ עריכה</button><button class="delete" data-delete="${a.id}" aria-label="מחיקת ${escapeHtml(a.name)}">🗑️</button></div></div>`).join(' '):'<div class="empty-settings">עוד אין חוגים. זה הזמן להוסיף את הראשון! 🌈</div>';
 $('#weekBoard').innerHTML=days.map(d=>{const found=activities.filter(a=>a.day===d);return `<div class="week-row"><div class="week-day">יום ${d}</div><div>${found.length?found.map(a=>`<span class="week-item" style="--accent:${a.color}">${a.time} · ${a.icon} ${a.name}</span>`).join(' '):'<span class="week-empty">אין חוגים — יום פנוי!</span>'}</div></div>`}).join('');
}
function setupChoices(){
 $('#iconChoices').innerHTML=icons.map(x=>`<button type="button" class="choice ${x===selectedIcon?'selected':''}" data-icon="${x}">${x}</button>`).join('');
 $('#colorChoices').innerHTML=colors.map(x=>`<button type="button" aria-label="בחירת צבע" class="color ${x===selectedColor?'selected':''}" style="background:${x}" data-color="${x}"></button>`).join('');
 $('#dayChoices').innerHTML=days.map(x=>`<button type="button" class="choice ${x===selectedDay?'selected':''}" data-day="${x}">${x}</button>`).join('');
}
function go(page){$$('.page').forEach(p=>p.classList.remove('active'));$(`#${page}Page`).classList.add('active');$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===page));scrollTo({top:0,behavior:'smooth'})}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2200)}
document.addEventListener('click',e=>{
 const goBtn=e.target.closest('[data-go]');if(goBtn){if(goBtn.dataset.go==='add')resetForm();go(goBtn.dataset.go)}
 const icon=e.target.closest('[data-icon]');if(icon){selectedIcon=icon.dataset.icon;setupChoices()}
 const color=e.target.closest('[data-color]');if(color){selectedColor=color.dataset.color;setupChoices()}
 const day=e.target.closest('[data-day]');if(day){selectedDay=day.dataset.day;setupChoices()}
 const edit=e.target.closest('[data-edit]');if(edit){openEdit(Number(edit.dataset.edit))}
 const del=e.target.closest('[data-delete]');if(del){deleteId=Number(del.dataset.delete);const a=activities.find(x=>x.id===deleteId);$('#deleteText').textContent=`אתה בטוח שאתה רוצה למחוק את חוג ${a.name}?`;$('#deleteDialog').showModal()}
});
function resetForm(){ $('#activityForm').reset();$('#editId').value='';$('#formTitle').textContent='הוספת חוג חדש';selectedIcon=icons[0];selectedColor=colors[1];selectedDay='שני';setupChoices() }
function openEdit(id){const a=activities.find(x=>x.id===id);$('#editId').value=id;$('#name').value=a.name;$('#time').value=a.time;$('#place').value=a.place;$('#reminder').value=a.reminder;selectedIcon=a.icon;selectedColor=a.color;selectedDay=a.day;$('#formTitle').textContent='עריכת החוג';setupChoices();go('add')}
$('#activityForm').addEventListener('submit',e=>{e.preventDefault();const id=Number($('#editId').value);const data={id:id||Date.now(),name:$('#name').value.trim(),icon:selectedIcon,color:selectedColor,day:selectedDay,time:$('#time').value,place:$('#place').value.trim(),reminder:$('#reminder').value};if(id)activities=activities.map(a=>a.id===id?data:a);else activities.push(data);save();render();go('home');toast(id?'השינויים נשמרו ✓':'החוג נוסף בהצלחה! 🎉')});
$('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#userName').value.trim();if(!name)return;profile={name};saveProfile();render();go('home');toast('הפרטים שלך נשמרו ✓')});
$('#cancelDelete').onclick=()=>$('#deleteDialog').close();$('#confirmDelete').onclick=()=>{activities=activities.filter(a=>a.id!==deleteId);save();render();$('#deleteDialog').close();toast('החוג נמחק')};
$('#settingsBtn').onclick=()=>go('settings');
setupChoices();render();
