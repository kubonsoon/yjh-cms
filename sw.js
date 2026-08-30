self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "RESERVE_DEMO_PUSH") {
    const { delay, title, body } = event.data;

    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(title, {
            body: body,
            icon: "favicon.ico",
            badge: "favicon.ico",
            tag: "demo-independent-firing-gate",
            requireInteraction: true,
            vibrate: [200, 100, 200],
            sound: "https://daumcdn.net",
            data: {
              launchUrl: "/admin.html?mode=independentDemoLaunch",
            },
          });
          resolve();
        }, delay);
      }),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetLaunchPath = event.notification.data.launchUrl;
  const executionUrl = new URL(targetLaunchPath, self.location.origin).href;

  const windowFocusChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clientsList) => {
      for (let i = 0; i < clientsList.length; i++) {
        const client = clientsList[i];
        if (client.url.includes("admin.html")) {
          return client
            .navigate(executionUrl)
            .then((windowTab) => windowTab.focus());
        }
      }
      return clients.openWindow(executionUrl);
    });

  event.waitUntil(windowFocusChain);
});

self.addEventListener("fetch", (event) => {});
