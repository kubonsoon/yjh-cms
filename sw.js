self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "RESERVE_DEMO_PUSH") {
    const { delay, title, body } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23f97316'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/></svg>",
        requireInteraction: true,
        silent: true, // 카카오톡 사운드를 전면 배치하기 위해 오피셜 알림음 묵음 처리
        tag: "clinical-urgent-call",
      });
    }, delay);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 현재 도메인 루트 기준으로 데모 가로채기 모드 주소 생성
        const targetUrl = new URL(
          "/?mode=independentDemoLaunch",
          self.location.origin,
        ).href;

        for (const client of clientList) {
          if ("focus" in client) {
            return client
              .navigate(targetUrl)
              .then((fClient) => fClient.focus());
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
