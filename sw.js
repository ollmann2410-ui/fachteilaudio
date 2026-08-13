const SHELL_CACHE='tf-shell-v4';
const SHELL=['./','./index.html','./styles.css','./app.js','./episodes.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>(name.startsWith('tf-shell-')&&name!==SHELL_CACHE)||name.startsWith('tf-audio-')).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;
  event.respondWith((async()=>{
    const shell=await caches.open(SHELL_CACHE);
    const cached=await shell.match(req);
    if(cached)return cached;
    try{
      const res=await fetch(req);
      if(res.ok&&req.destination!=='document')shell.put(req,res.clone());
      return res;
    }catch(e){
      if(req.mode==='navigate')return shell.match('./index.html');
      throw e;
    }
  })());
});
