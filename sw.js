// 첫 설치 시 대기 없이 즉시 전역 활성화 상태로 강제 전환
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "RESERVE_DEMO_PUSH") {
    // 💡 event.data 구조 분해 할당에 actions 속성을 추가로 받아옵니다.
    const { delay, title, body, actions } = event.data;

    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          // 🎵 [신규 추가] 알림 배너 사출 시점에 화면(admin.html)으로 카톡 사운드 실행 신호 전송
          self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
              clientList.forEach((client) => {
                client.postMessage({
                  action: "PLAY_ALERT_AUDIO_SIGNAL",
                });
              });
            });

          self.registration
            .showNotification(title, {
              body: body,
              icon: "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23f97316'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/></svg>",
              requireInteraction: true,
              silent: true, // 💡 OS 자체 기본 알림음과 섞여 겹치지 않도록 true(무음)로 변경하여 온전한 카톡음만 구현
              tag: "clinical-urgent-call",
              // 💡 전달받은 알림 버튼 배열을 브라우저 노티 설정에 동적으로 주입합니다.
              actions: actions || [],
            })
            .then(resolve);
        }, delay);
      }),
    );
  }
});

// 💥 [완전 교정] 배너 본문 클릭 방어 및 액션 버튼 전용 라우팅 통제 섹션
self.addEventListener("notificationclick", (event) => {
  // 사용자가 배너 본문을 누르든 버튼을 누르든 상관없이 노티 배너 자체는 즉시 닫아줍니다.
  event.notification.close();

  // 🎯 [핵심 요구사항 반영]: 오직 하단의 [👉 공지 확인하기] 버튼을 클릭했을 때만 화면 라우팅 작동
  // admin.html 원본에서 전송하여 actions 매트릭스에 바인딩된 고유 액션 키값('open_modal')을 추적합니다.
  if (event.action === "open_modal") {
    // 깃허브 서브디렉토리 주소 체계를 깨지 않도록 상대 경로 주소 정밀 정렬
    const targetUrl = new URL(
      "admin.html?mode=independentDemoLaunch",
      self.location.href,
    ).href;

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes("admin.html") && "focus" in client) {
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
  } else {
    // 사용자가 버튼을 조준하지 않고 배너 본문이나 빈 공간을 클릭하여 닫은 경우 라우팅 처리 무시
    console.log(
      "[차단] 일반 배너 영역 클릭이 감지되어 화면 이동 포커싱을 차단했습니다.",
    );
  }
});
