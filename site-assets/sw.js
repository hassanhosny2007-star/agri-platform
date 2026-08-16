// sw.js — لازم يكون في جذر الموقع (مش جوا مجلد) عشان يتحكم في الموقع كله
self.addEventListener('push', (event) => {
  let data = {};
  try{ data = event.data.json(); }catch(e){ data = { title: 'AgroNex', body: 'تنبيه جديد' }; }

  const options = {
    body: data.body || '',
    icon: 'site-assets/logo.png',
    badge: 'site-assets/logo.png',
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || 'dashboard.html' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AgroNex', options)
  );
});

// لما المستخدم يدوس على الإشعار، يفتحله الداشبورد
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || 'dashboard.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
