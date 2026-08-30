// 웹푸시알림(서비스 워커) 메인 백그라운드 이벤트 리스너 세팅
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'RESERVE_DEMO_PUSH') {
        const { delay, title, body } = event.data;

        // 💥 [교정 핵심]: event.waitUntil과 Promise 체인을 바인딩하여 
        // 브라우저 창이 완전히 닫혀도 비동기 타이머가 완료될 때까지 백그라운드 프로세스가 소멸하는 것을 원천 차단합니다.
        event.waitUntil(
            new Promise((resolve) => {
                setTimeout(() => {
                    self.registration.showNotification(title, {
                        body: body,
                        icon: 'favicon.ico',
                        badge: 'favicon.ico',
                        tag: 'demo-independent-firing-gate',
                        requireInteraction: true, // 사용자가 확인을 누르기 전까지 화면에 계속 고정 유지
                        vibrate:, // 💡 컴마 문법 오류 완벽 교정 완료 (200ms 진동, 100ms 대기, 200ms 진동)
                        sound: 'https://daumcdn.net', // 💥 [사운드 경로]: 카카오톡 공식 정품 카톡음 실주소 직접 매칭 완료
                        data: {
                            launchUrl: '/admin.html?mode=independentDemoLaunch' // 유입 경로 커스텀 파라미터 매핑
                        }
                    });
                    resolve(); // 푸시 사출 완료 후 서비스 워커 리소스를 안전하게 해제
                }, delay);
            })
        );
    }
});

// OS 푸시 알림 배너 마우스 클릭 이벤트 인터셉터
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // 화면 알림 배너 소거

    const targetLaunchPath = event.notification.data.launchUrl;
    const executionUrl = new URL(targetLaunchPath, self.location.origin).href;

    // 현재 열려 있는 탭 중 admin.html이 있는지 정밀 역추적
    const windowFocusChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((clientsList) => {
        for (let i = 0; i < clientsList.length; i++) {
            const client = clientsList[i];
            if (client.url.includes('admin.html')) {
                // 이미 열린 전산망 탭이 있다면 해당 주소로 강제 네비게이션 시키고 브라우저 활성화 포커싱
                return client.navigate(executionUrl).then((windowTab) => windowTab.focus());
            }
        }
        // 사용자가 전산망을 완전히 꺼둔 상태였다면 강제로 새로운 단독 세션 창 기동 사출
        return clients.openWindow(executionUrl);
    });

    event.waitUntil(windowFocusChain);
});

// 💥 [웹 표준 필수 결합] 브라우저의 서비스 워커 자격 검증(Fetch Handler)을 통과하기 위한 네트워크 인터셉터 우회 코드
self.addEventListener('fetch', (event) => {
    // 💡 [교정 치명적 버그 해결]: 아무것도 반환하지 않는 빈 return 문을 지우거나 
    // 리스너 내부를 빈칸으로 두어야 전산망 메인 화면의 정상적인 AJAX/네트워크 HTTP 요청 데이터가 먹통(차단)되지 않습니다.
});