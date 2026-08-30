self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "RESERVE_DEMO_PUSH") {
    const { delay, title, body } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23f97316'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/></svg>",
        requireInteraction: true,
        silent: true, // 카카오톡 사운드 연동을 위한 음소거
        tag: "clinical-urgent-call",
      });
    }, delay);
  }
});

// 💥 푸시 알림 배너를 클릭했을 때 가로채는 인터셉터 (깃허브 서브디렉토리 경로 보정)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // 서비스 워커 파일 위치 기준으로 admin.html 절대 경로 생성
  const targetUrl = new URL(
    "admin.html?mode=independentDemoLaunch",
    self.location.href,
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 1. 이미 켜져 있는 동일한 깃허브 관리자 페이지 탭이 있다면 포커싱 후 주소 전환
        for (const client of clientList) {
          if (client.url.includes("admin.html") && "focus" in client) {
            return client
              .navigate(targetUrl)
              .then((fClient) => fClient.focus());
          }
        }
        // 2. 브라우저가 완전히 꺼져 있다면 새 창으로 강제 사출
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
