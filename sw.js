self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const accept=event.request.headers.get('accept')||'';
  if(!accept.includes('text/html')){ event.respondWith(fetch(event.request)); return; }
  event.respondWith((async()=>{
    const response=await fetch(event.request);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const url=new URL(event.request.url);
    // Player pages must never receive the Host walking/relay script.
    if(url.pathname.startsWith('/client/')) return response;
    let html=await response.text();
    const tag='<script src="/host-walk-relay.js?v=3"></script>';
    if(!html.includes('/host-walk-relay.js')) html=html.replace(/<\\/body>/i,tag+'</body>');
    else html=html.replace(/\\/host-walk-relay\\.js\\?v=\\d+/g,'/host-walk-relay.js?v=3');
    return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
  })());
});
