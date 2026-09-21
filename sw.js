const CACHE='quran-ustadh-v1';
const ASSETS=['./','./index.html','./styles.css','./src/app.js','./src/data/quran.js','./src/services/quran-service.js','./src/services/storage-service.js','./src/services/learning-engine.js','./src/services/mock-recitation-service.js','./src/services/recorder-service.js','./src/services/supabase-service.js','./config.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));