const CACHE='pyh-app-shell-v2';
const CORE=['./','./index.html','./shell.css','./shell.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('pyh-app-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==location.origin||event.request.method!=='GET'||!url.pathname.includes('/app-shell/'))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(event.request,{cache:'no-store'});
   if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone()).catch(()=>{});}
   return response;
  }catch(error){const cached=await caches.match(event.request);if(cached)return cached;throw error;}
 })());
});
