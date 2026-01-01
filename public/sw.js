const CACHE_NAME = 'bugfindai-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.jpg',
  '/apple-touch-icon.jpg'
];

// IndexedDB helpers for background sync
const DB_NAME = 'bugfindai-offline';
const STORE_NAME = 'pending-analyses';

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getPendingItems() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function updateItemStatus(db, id, status, retryCount) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          if (retryCount !== undefined) item.retryCount = retryCount;
          store.put(item);
        }
        resolve();
      };
      getRequest.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function removeItem(db, id) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      resolve();
    } catch {
      resolve();
    }
  });
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Background sync for queued analyses
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analyses') {
    event.waitUntil(processQueuedAnalyses());
  }
});

async function processQueuedAnalyses() {
  try {
    const pending = await getPendingItems();
    if (pending.length === 0) return;

    const db = await openDB();
    
    for (const item of pending) {
      try {
        await updateItemStatus(db, item.id, 'processing');
        
        // Note: We can't access env vars in service worker, 
        // so we'll notify the client to process the queue
        await notifyClients({ type: 'SYNC_COMPLETE' });
        
      } catch (error) {
        console.error('Background sync failed for item:', item.id, error);
        if (item.retryCount < 3) {
          await updateItemStatus(db, item.id, 'pending', item.retryCount + 1);
        } else {
          await updateItemStatus(db, item.id, 'failed');
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return cached index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
