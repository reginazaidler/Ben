const CACHE_NAME='my-activities-v19';
const APP_SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icons/app-icon.svg'];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok&&new URL(event.request.url).origin===self.location.origin){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy))}
  return response;
 }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});

self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const targetUrl=event.notification.data?.url||'./';
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(openClients=>{
  const existing=openClients.find(client=>new URL(client.url).origin===self.location.origin);
  return existing?existing.focus():clients.openWindow(targetUrl);
 }));
});
