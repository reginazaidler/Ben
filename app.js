const days=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const icons=['⚽','🏊','🎨','🎵','🥋','📚','🚲','⭐'];
const colors=['#2578d4','#21a567','#ef5350','#f2bd35','#ef8c34','#8a5bd4','#e85c99'];
const mealTypes=[{id:'breakfast',label:'ארוחת בוקר',icon:'🌅'},{id:'lunch',label:'ארוחת צהריים',icon:'☀️'},{id:'dinner',label:'ארוחת ערב',icon:'🌙'}];
const defaults=[
 {id:1,name:'כדורגל',icon:'⚽',color:'#21a567',day:'שני',time:'17:00',place:'מגרש הספורט',reminder:'שעה'},
 {id:2,name:'ציור',icon:'🎨',color:'#8a5bd4',day:'רביעי',time:'18:30',place:'מרכז האומנויות',reminder:'30 דקות'},
 {id:3,name:'שחייה',icon:'🏊',color:'#2578d4',day:'שישי',time:'14:00',place:'הבריכה העירונית',reminder:'שעה'}
];
let activities=JSON.parse(localStorage.getItem('myActivities')||'null')||defaults;
let profile=JSON.parse(localStorage.getItem('myProfile')||'null')||{name:'בן',largeText:false,reduceMotion:false};
let favoriteFoods=JSON.parse(localStorage.getItem('myFavoriteFoods')||'null')||[];
let customFoods=JSON.parse(localStorage.getItem('myCustomFoods')||'null')||[];
let siteTexts=JSON.parse(localStorage.getItem('mySiteTexts')||'{}');
let editingSiteCopy=false;
let selectedIcon=icons[0],selectedColor=colors[1],selectedDay='שני',deleteId=null;
let notificationTimers=[];
let installPrompt=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function soft(hex){return hex+'22'}
function save(){localStorage.setItem('myActivities',JSON.stringify(activities))}
function saveProfile(){localStorage.setItem('myProfile',JSON.stringify(profile))}
function saveFoods(){localStorage.setItem('myFavoriteFoods',JSON.stringify(favoriteFoods));localStorage.setItem('myCustomFoods',JSON.stringify(customFoods))}
function allFoods(){return customFoods}
function applySiteTexts(){$$('[data-site-text]').forEach(element=>{const value=siteTexts[element.dataset.siteText];if(value)element.textContent=value})}
function saveSiteText(element){const value=element.textContent.trim();if(!value){element.textContent=siteTexts[element.dataset.siteText]||element.dataset.originalText;return}siteTexts[element.dataset.siteText]=value;localStorage.setItem('mySiteTexts',JSON.stringify(siteTexts));toast('הטקסט נשמר לכל הכניסות מהמכשיר הזה ✓')}
function renderFoods(){
 const choices=$('#foodChoices');if(!choices)return;
 const foods=allFoods();
 choices.innerHTML=foods.length?mealTypes.map(type=>`<section class="food-group"><h3>${type.icon} ${type.label}</h3><div>${foods.filter(food=>food.meal===type.id).map(food=>`<button type="button" class="food-choice selected" data-food-id="${food.id}" aria-pressed="true"><span>${food.emoji}</span>${escapeHtml(food.name)}<b>✓</b></button>`).join('')}</div></section>`).join(''):'<div class="food-empty">עוד לא הוספת מאכלים. אפשר להתחיל מהטופס למטה 🍽️</div>';
 $('#foodCount').textContent=`${foods.length} מאכלים ברשימה`;
}
function applyPreferences(){
 document.body.classList.toggle('large-text',Boolean(profile.largeText));
 document.body.classList.toggle('reduce-motion',Boolean(profile.reduceMotion));
}
function reminderMinutes(reminder){return {'10 דקות':10,'30 דקות':30,'שעה':60,'שעתיים':120}[reminder]||0}
function nextReminderDate(activity,now=new Date()){
 const dayIndex=days.indexOf(activity.day),[hours,minutes]=activity.time.split(':').map(Number);
 if(dayIndex<0||!Number.isFinite(hours)||!Number.isFinite(minutes))return null;
 const event=new Date(now);event.setHours(hours,minutes,0,0);
 event.setDate(event.getDate()+((dayIndex-event.getDay()+7)%7));
 const reminder=new Date(event.getTime()-reminderMinutes(activity.reminder)*60000);
 if(reminder<=now)reminder.setDate(reminder.getDate()+7);
 return reminder;
}
function showActivityNotification(activity){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const notification=new Notification(`${activity.icon} הגיע הזמן להתכונן ל${activity.name}!`,{body:`החוג מתחיל ב־${activity.time}${activity.place?` · ${activity.place}`:''}`,tag:`activity-${activity.id}`});
 notification.onclick=()=>{window.focus();notification.close()};
}
function scheduleNotifications(){
 notificationTimers.forEach(clearTimeout);notificationTimers=[];
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const now=new Date();
 activities.forEach(activity=>{const date=nextReminderDate(activity,now);if(!date)return;const delay=date-now;if(delay<=2147483647)notificationTimers.push(setTimeout(()=>{showActivityNotification(activity);scheduleNotifications()},delay))});
}
function renderNotificationStatus(){
 const status=$('#notificationStatus'),button=$('#enableNotifications');if(!status||!button)return;
 if(!('Notification' in window)){status.textContent='הדפדפן הזה לא תומך בהתראות';button.disabled=true;return}
 const messages={granted:'ההתראות פעילות כל עוד האפליקציה פתוחה',denied:'ההתראות חסומות בהגדרות הדפדפן',default:'כדי לקבל תזכורת, צריך לאשר התראות'};
 status.textContent=messages[Notification.permission];button.disabled=Notification.permission==='granted';button.textContent=Notification.permission==='granted'?'ההתראות פעילות':Notification.permission==='denied'?'איך לאפשר התראות?':'הפעלת התראות';
}
async function enableNotifications(){
 if(!('Notification' in window))return;
 const permission=await Notification.requestPermission();renderNotificationStatus();scheduleNotifications();toast(permission==='granted'?'ההתראות הופעלו בהצלחה 🔔':'לא ניתן להפעיל התראות. אפשר לשנות זאת בהגדרות הדפדפן');
}
async function shareApp(){
 const shareData={title:'החוגים שלי',text:'בואו ליצור לוח חוגים אישי משלכם!',url:window.location.href};
 try{
  if(navigator.share){await navigator.share(shareData);return}
  await navigator.clipboard.writeText(shareData.url);
  toast('הקישור הועתק — אפשר לשלוח אותו לחברים! 📋');
 }catch(error){
  if(error.name!=='AbortError')toast('לא הצלחנו לשתף. אפשר להעתיק את הקישור משורת הכתובת');
 }
}
function showInstallCard(){
 if(installPrompt&&!localStorage.getItem('installPromptDismissed'))$('#installCard').hidden=false;
}
async function installApp(){
 if(!installPrompt)return;
 installPrompt.prompt();
 const {outcome}=await installPrompt.userChoice;
 installPrompt=null;$('#installCard').hidden=true;
 if(outcome==='accepted')toast('האפליקציה הותקנה בהצלחה! ⭐');
}

function exportSiteData(){
 const backup={version:2,exportedAt:new Date().toISOString(),activities,profile,favoriteFoods,customFoods,siteTexts};
 const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download='my-activities-backup.json';link.click();URL.revokeObjectURL(url);toast('הגיבוי הורד בהצלחה ✓');
}
async function importSiteData(file){
 try{
  const backup=JSON.parse(await file.text());
  if(!Array.isArray(backup.activities)||!backup.profile||!Array.isArray(backup.customFoods))throw new Error('invalid backup');
  activities=backup.activities;profile=backup.profile;favoriteFoods=Array.isArray(backup.favoriteFoods)?backup.favoriteFoods:[];customFoods=backup.customFoods;siteTexts=backup.siteTexts&&typeof backup.siteTexts==='object'?backup.siteTexts:{};
  save();saveProfile();saveFoods();localStorage.setItem('mySiteTexts',JSON.stringify(siteTexts));render();scheduleNotifications();toast('כל נתוני האתר שוחזרו ✓');
 }catch{toast('קובץ הגיבוי אינו תקין')}
}
function resetSiteData(){
 activities=defaults.map(activity=>({...activity}));profile={name:'בן',largeText:false,reduceMotion:false};favoriteFoods=[];customFoods=[];siteTexts={};
 localStorage.removeItem('installPromptDismissed');localStorage.removeItem('mySiteTexts');save();saveProfile();saveFoods();render();scheduleNotifications();go('home');toast('האתר אופס בהצלחה');
}
function escapeHtml(value){const el=document.createElement('div');el.textContent=String(value);return el.innerHTML}
function render(){
 applySiteTexts();
 $('#profileName').textContent=profile.name;
 $('#profileBadge').setAttribute('aria-label',`הפרופיל של ${profile.name}`);
 $('#welcomeName').textContent=`שלום ${profile.name}! 👋`;
 $('#userName').value=profile.name;
 $('#largeText').checked=Boolean(profile.largeText);
 $('#reduceMotion').checked=Boolean(profile.reduceMotion);
 applyPreferences();
 renderNotificationStatus();
 const next=activities[0];
 $('#nextCard').innerHTML=next?`<div class="next-label">✨ החוג הבא שלי</div><div class="next-content"><div class="big-icon" style="--soft:${soft(next.color)}">${next.icon}</div><div class="next-info"><h2>${next.name}</h2><div class="details"><span>🗓️ יום ${next.day}</span><span>🕐 ${next.time}</span><span>📍 ${next.place||'המקום עדיין לא נקבע'}</span></div></div><div class="countdown">⏳ בעוד שעתיים</div></div>`:`<h2>אין לך חוגים היום</h2><p>אפשר לשחק או לנוח 🌈</p>`;
 $('#nextCard').style.setProperty('--accent',next?.color||'#45a96e');
 $('#activityList').innerHTML=activities.map(a=>`<article class="activity-card" style="--accent:${a.color};--soft:${soft(a.color)}"><div class="activity-head"><div class="activity-icon">${a.icon}</div><div><h3>${a.name}</h3><span>יום ${a.day} • ${a.time}</span></div></div><div class="meta">📍 ${a.place||'ללא מקום'}<br>🔔 תזכורת ${a.reminder} לפני</div><div class="card-actions"><button class="edit" data-edit="${a.id}">✏️ ערוך</button><button class="delete" data-delete="${a.id}">🗑️ מחק</button></div></article>`).join('');
 $('#settingsActivityList').innerHTML=activities.length?activities.map(a=>`<div class="settings-activity"><span class="settings-activity-icon" style="--soft:${soft(a.color)}">${a.icon}</span><div><b>${escapeHtml(a.name)}</b><small>יום ${a.day} בשעה ${a.time}</small></div><div class="settings-actions"><button class="edit" data-edit="${a.id}">✏️ עריכה</button><button class="delete" data-delete="${a.id}" aria-label="מחיקת ${escapeHtml(a.name)}">🗑️</button></div></div>`).join(' '):'<div class="empty-settings">עוד אין חוגים. זה הזמן להוסיף את הראשון! 🌈</div>';
 $('#weekBoard').innerHTML=days.map(d=>{const found=activities.filter(a=>a.day===d);return `<div class="week-row"><div class="week-day">יום ${d}</div><div>${found.length?found.map(a=>`<span class="week-item" style="--accent:${a.color}">${a.time} · ${a.icon} ${a.name}</span>`).join(' '):'<span class="week-empty">אין חוגים — יום פנוי!</span>'}</div></div>`}).join('');
 renderFoods();
}
function setupChoices(){
 $('#iconChoices').innerHTML=icons.map(x=>`<button type="button" class="choice ${x===selectedIcon?'selected':''}" data-icon="${x}">${x}</button>`).join('');
 $('#colorChoices').innerHTML=colors.map(x=>`<button type="button" aria-label="בחירת צבע" class="color ${x===selectedColor?'selected':''}" style="background:${x}" data-color="${x}"></button>`).join('');
 $('#dayChoices').innerHTML=days.map(x=>`<button type="button" class="choice ${x===selectedDay?'selected':''}" data-day="${x}">${x}</button>`).join('');
}
function go(page,{updateHash=true}={}){const target=$(`#${page}Page`);if(!target)return;$$('.page').forEach(p=>p.classList.remove('active'));target.classList.add('active');$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===page));if(updateHash)history.replaceState(null,'',page==='home'?`${location.pathname}${location.search}`:`#${page}`);scrollTo({top:0,behavior:profile.reduceMotion?'auto':'smooth'})}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2200)}
document.addEventListener('click',e=>{
 const goBtn=e.target.closest('[data-go]');if(goBtn){e.preventDefault();if(goBtn.dataset.go==='add')resetForm();go(goBtn.dataset.go)}
 if(editingSiteCopy){const editable=e.target.closest('[data-site-text]');if(editable){e.preventDefault();editable.focus();return}}
 const icon=e.target.closest('[data-icon]');if(icon){selectedIcon=icon.dataset.icon;setupChoices()}
 const color=e.target.closest('[data-color]');if(color){selectedColor=color.dataset.color;setupChoices()}
 const day=e.target.closest('[data-day]');if(day){selectedDay=day.dataset.day;setupChoices()}
 const edit=e.target.closest('[data-edit]');if(edit){openEdit(Number(edit.dataset.edit))}
 const del=e.target.closest('[data-delete]');if(del){deleteId=Number(del.dataset.delete);const a=activities.find(x=>x.id===deleteId);$('#deleteText').textContent=`אתה בטוח שאתה רוצה למחוק את חוג ${a.name}?`;$('#deleteDialog').showModal()}
 const food=e.target.closest('[data-food-id]');if(food){const id=food.dataset.foodId;customFoods=customFoods.filter(item=>item.id!==id);favoriteFoods=favoriteFoods.filter(item=>item!==id);saveFoods();renderFoods();toast('המאכל הוסר מהרשימה')}
});
function resetForm(){ $('#activityForm').reset();$('#editId').value='';$('#formTitle').textContent='הוספת חוג חדש';selectedIcon=icons[0];selectedColor=colors[1];selectedDay='שני';setupChoices() }
function openEdit(id){const a=activities.find(x=>x.id===id);$('#editId').value=id;$('#name').value=a.name;$('#time').value=a.time;$('#place').value=a.place;$('#reminder').value=a.reminder;selectedIcon=a.icon;selectedColor=a.color;selectedDay=a.day;$('#formTitle').textContent='עריכת החוג';setupChoices();go('add')}
$('#activityForm').addEventListener('submit',e=>{e.preventDefault();const id=Number($('#editId').value);const data={id:id||Date.now(),name:$('#name').value.trim(),icon:selectedIcon,color:selectedColor,day:selectedDay,time:$('#time').value,place:$('#place').value.trim(),reminder:$('#reminder').value};if(id)activities=activities.map(a=>a.id===id?data:a);else activities.push(data);save();render();scheduleNotifications();go('home');toast(id?'השינויים נשמרו ✓':'החוג נוסף בהצלחה! 🎉')});
$('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#userName').value.trim();if(!name)return;profile={name,largeText:$('#largeText').checked,reduceMotion:$('#reduceMotion').checked};saveProfile();render();go('home');toast('ההגדרות שלך נשמרו ✓')});
$('#cancelDelete').onclick=()=>$('#deleteDialog').close();$('#confirmDelete').onclick=()=>{activities=activities.filter(a=>a.id!==deleteId);save();render();scheduleNotifications();$('#deleteDialog').close();toast('החוג נמחק')};
$('#enableNotifications').onclick=()=>{if(Notification.permission==='denied'){$('#notificationHelpDialog').showModal();return}enableNotifications()};
$('#closeNotificationHelp').onclick=()=>$('#notificationHelpDialog').close();
$('#editSiteCopy').onclick=()=>{editingSiteCopy=true;document.body.classList.add('editing-site-copy');$$('[data-site-text]').forEach(element=>{element.dataset.originalText=element.textContent;element.contentEditable='true';element.setAttribute('role','textbox')});go('home');toast('מצב עריכה פעיל — לחצו על טקסט כדי לשנות אותו')};
document.addEventListener('focusout',e=>{if(editingSiteCopy&&e.target.matches('[data-site-text]'))saveSiteText(e.target)});
document.addEventListener('keydown',e=>{if(editingSiteCopy&&e.target.matches('[data-site-text]')&&e.key==='Enter'){e.preventDefault();e.target.blur()}});
$('#exportSiteData').onclick=exportSiteData;
$('#importSiteData').onchange=e=>{const [file]=e.target.files;if(file)importSiteData(file);e.target.value=''};
$('#resetSiteData').onclick=()=>$('#resetSiteDialog').showModal();
$('#cancelSiteReset').onclick=()=>$('#resetSiteDialog').close();
$('#confirmSiteReset').onclick=()=>{$('#resetSiteDialog').close();resetSiteData()};
$('#shareAppBtn').onclick=shareApp;
$('#customFoodForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#customFoodName').value.trim();if(!name)return;const food={id:`custom-${Date.now()}`,name,emoji:'🍽️',meal:$('#customFoodMeal').value};customFoods.push(food);favoriteFoods.push(food.id);saveFoods();e.target.reset();renderFoods();toast('המאכל נוסף לרשימה שלך! 😋')});
$('#installAppBtn').onclick=installApp;
$('#dismissInstall').onclick=()=>{$('#installCard').hidden=true;localStorage.setItem('installPromptDismissed','true')};
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;showInstallCard()});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('#installCard').hidden=true;toast('האפליקציה מוכנה במסך הבית! 🎉')});
if(window.matchMedia('(display-mode: standalone)').matches)document.body.classList.add('standalone');
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleNotifications()});
setupChoices();render();scheduleNotifications();
const pages=new Set(['home','add','week','food','settings']);
function pageFromHash(){const page=location.hash.slice(1);return pages.has(page)?page:'home'}
const initialPage=pageFromHash();if(initialPage!=='home')go(initialPage,{updateHash:false});
window.addEventListener('hashchange',()=>go(pageFromHash(),{updateHash:false}));
if('serviceWorker' in navigator){
 let refreshing=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()});
 window.addEventListener('load',async()=>{const registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});await registration.update()});
}
