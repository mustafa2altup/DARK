# Service Worker لتطبيق DARK
# استراتيجية Offline-First للشبكات الضعيفة

const CACHE_NAME = 'dark-v1';
const OFFLINE_PAGE = '/offline.html';

// الموارد الأساسية للتخزين المؤقت الفوري
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  '/assets/images/logo.png',
  '/assets/fonts/main.woff2'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[DARK SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[DARK SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker وتنظيف الـ caches القديمة
self.addEventListener('activate', (event) => {
  console.log('[DARK SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }
  
  // استراتيجيات مختلفة لأنواع المحتوى
  
  // 1. الصور: Cache First, ثم Network
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 2. صفحات HTML: Network First مع fallback للـ Cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 3. CSS و JS: Cache First
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 4. API Requests: Network First مع fallback للـ Cache
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }
  
  // 5. كل شيء آخر: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// استراتيجية Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('[DARK SW] Cache hit:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[DARK SW] Fetch failed:', request.url);
    return caches.match(OFFLINE_PAGE);
  }
}

// استراتيجية Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[DARK SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return caches.match(OFFLINE_PAGE);
  }
}

// استراتيجية Network First مع تخزين للاستخدام المستقبلي
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[DARK SW] API offline, serving cached data:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // إرجاع استجابة فارغة للـ API
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// مزامنة الخلفية عند عودة الاتصال
self.addEventListener('sync', (event) => {
  console.log('[DARK SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// مزامنة الإجراءات المعلقة
async function syncPendingActions() {
  // قراءة الإجراءات المحفوظة محليًا
  const pendingActions = await getPendingActionsFromIndexedDB();
  
  for (const action of pendingActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: JSON.stringify(action.data)
      });
      
      // إزالة الإجراء من القائمة بعد النجاح
      await removeActionFromIndexedDB(action.id);
      
      console.log('[DARK SW] Synced action:', action.id);
    } catch (error) {
      console.log('[DARK SW] Failed to sync action:', action.id);
      // إعادة المحاولة لاحقًا
    }
  }
}

// التعامل مع الإشعارات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// دوال مساعدة للوصول إلى IndexedDB
async function getPendingActionsFromIndexedDB() {
  // سيتم تنفيذها في التطبيق الرئيسي
  return [];
}

async function removeActionFromIndexedDB(actionId) {
  // سيتم تنفيذها في التطبيق الرئيسي
}

console.log('[DARK SW] Service Worker loaded');
