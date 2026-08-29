        // 웹푸시알림(서비스 워커) 메인 백그라운드 이벤트 리스너 세팅
        self.addEventListener('message', (event) => {
            if (event.data && event.data.action === 'RESERVE_DEMO_PUSH') {
                const { delay, title, body } = event.data;

                // 브라우저 프로세스가 완전히 소멸하더라도 OS 스레드 타이머 백그라운드 락 생존
                setTimeout(() => {
                    self.registration.showNotification(title, {
                        body: body,
                        icon: 'favicon.ico',
                        badge: 'favicon.ico',
                        tag: 'demo-independent-firing-gate',
                        requireInteraction: true, // 사용자가 확인을 누르기 전까지 화면에 계속 고정 유지
                        data: {
                            launchUrl: '/admin.html?mode=independentDemoLaunch' // 유입 경로 커스텀 파라미터 매핑
                        }
                    });
                }, delay);
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