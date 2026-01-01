// Offline queue for code analysis requests
// Uses IndexedDB for persistent storage

const DB_NAME = 'bugfindai-offline';
const STORE_NAME = 'pending-analyses';
const DB_VERSION = 1;

export interface QueuedAnalysis {
  id: string;
  code: string;
  language: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'failed';
  retryCount: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
  
  return dbPromise;
}

export async function addToQueue(code: string, language: string): Promise<string> {
  const db = await openDB();
  const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const item: QueuedAnalysis = {
    id,
    code,
    language,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);
    
    request.onsuccess = () => {
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          (registration as any).sync.register('sync-analyses').catch(console.error);
        });
      }
      resolve(id);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingItems(): Promise<QueuedAnalysis[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(): Promise<QueuedAnalysis[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItemStatus(
  id: string, 
  status: QueuedAnalysis['status'],
  retryCount?: number
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = status;
        if (retryCount !== undefined) {
          item.retryCount = retryCount;
        }
        store.put(item);
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getQueueCount(): Promise<number> {
  const items = await getPendingItems();
  return items.length;
}
