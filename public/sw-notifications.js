// WikiWazzimaGiygg Service Worker Notification Handlers
// Imported by Workbox generateSW via vite.config.ts workbox.importScripts

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification && event.notification.data ? event.notification.data : {};
  const slug = data.slug || 'Página_principal';
  const targetUrl = data.url || `/#/wiki/${encodeURIComponent(slug)}`;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('postMessage' in client) {
              client.postMessage({
                type: 'WIKI_NAVIGATE',
                slug,
                url: targetUrl,
              });
            }
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {
    title: 'WikiWazzimaGiygg — Nova edição',
    body: 'Uma página monitorada recebeu uma nova atualização.',
    slug: 'Página_principal',
  };

  try {
    const parsed = event.data.json();
    payload = { ...payload, ...parsed };
  } catch {
    const text = event.data.text();
    if (text) payload.body = text;
  }

  const slug = payload.slug || 'Página_principal';
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: payload.tag || `wiki-push-${slug}`,
      renotify: true,
      data: {
        slug,
        url: `/#/wiki/${encodeURIComponent(slug)}`,
      },
    })
  );
});
