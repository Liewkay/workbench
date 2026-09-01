/* ============================================================
   Liewkay's Workbench — Service Worker
   职责：离线缓存（应用外壳 + 静态资源）、Web Push 接收、通知点击
   注册位置：src/lib/push.ts -> navigator.serviceWorker.register(BASE + 'sw.js')
   说明：BASE 取自注册作用域，根部署（Vercel）与子路径（GitHub Pages）通用。
   ============================================================ */

const CACHE = 'lw-cache-v1';
const BASE = self.registration.scope; // 例：https://host/ 或 https://host/workbench/
const u = (p) => new URL(p, BASE).toString();
const APP_SHELL = [BASE, u('index.html'), u('manifest.webmanifest'), u('icons/favicon.svg')];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL).catch(() => undefined)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 直连 Supabase / Open Library 等第三方

  // 导航请求：网络优先，离线回落到缓存的首页
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(u('index.html')).then((r) => r || caches.match(BASE))),
    );
    return;
  }

  // 静态资源：缓存优先，后台刷新（stale-while-revalidate）
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

/* ---------------- Web Push ---------------- */
self.addEventListener('push', (event) => {
  let payload = { title: "Liewkay's Workbench", body: '你有新的提醒', tag: 'lw' };
  try {
    if (event.data) payload = Object.assign(payload, event.data.json());
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag || 'lw',
      icon: u('icons/icon-192.png'),
      badge: u('icons/badge-72.png'),
      data: payload.data || { url: BASE },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || BASE;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ('focus' in c) { c.navigate(target); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});
