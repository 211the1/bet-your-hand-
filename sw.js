self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const accept=event.request.headers.get('accept')||'';
  if(!accept.includes('text/html')){ event.respondWith(fetch(event.request)); return; }
  event.respondWith((async()=>{
    const response=await fetch(event.request);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    let html=await response.text();
    const tag='<script src="/host-walk-relay.js?v=1"></script>';
    if(!html.includes('/host-walk-relay.js')) html=html.replace(/<\/body>/i,tag+'</body>');
    return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
  })());
});
