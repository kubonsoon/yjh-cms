<?php
/**
 * 임상시험 스마트 연동 시스템 - 대상자 인증 및 참여비 신청 관문 [PART 1]
 * 파일 위치: /member/login.php
 * 
 * [PHP/Laravel 스타일 변환 및 인클루드 명세]:
 * 1. m-login.html 원본의 모든 패널 시스템 마크업 레이아웃 구조를 100% 누락 없이 전수 이관.
 * 2. '피험자 -> 대상자', '사례비 -> 참여비' 전산 표준 용어 전수 반영 및 치환 완료.
 * 3. [지시사항 반영]: 링크 방식의 404 경로 에러를 박멸하기 위해 layout.css 자원을 백엔드 include로 결합.
 */

// 1. 최상위 루트에 격리된 보안 설정 서브폴더 파일 연결 (상대 경로 역추적)
require_once __DIR__ . '/../database/dbcon.php';
?>

<!-- [모듈화 연동 01]: 렌더 서버의 404 경로 유실을 원천 차단하기 위해 layout.css 소스코드를 서버단에서 직접 흡수 합병 -->
<style>
    <?php include_once __DIR__ . '/layout.css'; ?>
</style>

<!-- 스마트폰 디바이스 프레임 구현 내부 컨테이너 -->
<div class="mobile-container">
    
    <!-- 상단 공통 타이틀 헤더 바 -->
    <div class="simulator-title">
        <h1>임상시험 스마트 연동 시스템</h1>
        <p id="system-subtitle">대상자 모바일 인증 프로세스</p>
    </div>

    <!-- [0단계 PANEL] QR코드 스캔 연동 시뮬레이터 -->
    <div class="step-panel active" id="layer0">
        <div class="panel-header-title">
            <i class="fa-solid fa-qrcode"></i> 시연 시작 단계: 스마트 링커 QR 스캔
        </div>
        <div class="qr-scan-zone">
            <p style="font-size:15px; color:rgba(255, 255, 255,0.8); line-height:1.5; margin-bottom: 5px;">
                게시되는 <span style="color:#38bdf8; font-weight:700;">QR코드를 스캔</span>하여<br>모바일 인증 시스템에 접속합니다.
            </p>
            <div class="qr-box" onclick="executeStep0QRScan()">
                <div class="scan-line"></div>
                <img src="qr-code.png" alt="QR Code Link" onerror="this.style.display='none'; document.getElementById('qr-fallback-ico').style.display='block';">
                <i class="fa-solid fa-qrcode" id="qr-fallback-ico" style="display:none; font-size:64px; color:#06B6D4;"></i>
            </div>
            <p style="font-size:11px; color:rgba(255,255,255,0.4); line-height:1.4;">
                * 시연 안내: 위의 가상 QR 구역을 터치(클릭)하면<br>자동으로 다음 [모바일 인증서 선택] 화면으로 진입합니다.
            </p>
        </div>
    </div>

    <!-- [1단계 PANEL] 민간인증 로그인 수단 선택 스위치 -->
    <div class="step-panel" id="layer1">
        <div class="panel-header-title"><i class="fa-solid fa-key"></i> 1 단계: 간편인증 로그인 수단</div>
        <div class="login-header-mini">
            <div class="badge">스마트 솔루션 (CMS)</div>
            <h2>임상시험 로그인</h2>
            <p class="subtitle">H+ YANGJI HOSPITAL 의생명연구원</p>
        </div>
        <div class="auth-group">
            <h3>인증 수단 선택</h3>
            <button id="btn_kakao" class="btn-auth btn-kakao" onclick="executeStep1Select('kakao', '카카오톡')">
                <span class="icon-wrapper"><i class="fa-solid fa-comment"></i></span>
                <span class="text-wrapper">카카오톡으로 시작하기</span>
            </button>
            <button id="btn_naver" class="btn-auth btn-naver" onclick="executeStep1Select('naver', '네이버')">
                <span class="icon-wrapper"><i class="fa-solid fa-n"></i></span>
                <span class="text-wrapper">네이버로 시작하기</span>
            </button>
            <button id="btn_toss" class="btn-auth btn-toss" onclick="executeStep1Select('toss', '토스')">
                <span class="icon-wrapper"><i class="fa-solid fa-t"></i></span>
                <span class="text-wrapper">토스로 시작하기</span>
            </button>
            <button id="btn_pass" class="btn-auth btn-pass" onclick="executeStep1Select('pass', 'PASS')">
                <span class="icon-wrapper"><i class="fa-solid fa-shield-halved"></i></span>
                <span class="text-wrapper">PASS로 시작하기</span>
            </button>
        </div>
    </div>

    <!-- [2단계 PANEL] 본인 식별 데이터 기입 폼 -->
    <div class="step-panel" id="layer2">
        <div class="panel-header-title"><i class="fa-solid fa-pen-to-square"></i> 2 단계: 본인인증 입력</div>
        <div style="flex:1;">
            <div class="form-group">
                <label id="lblDynamicForm">이름</label>
                <input type="text" id="txtUserName" placeholder="이름을 입력하세요">
            </div>
            <div class="form-group">
                <label>생년월일 (6 or 8 자리)-1 형태 (성별 1~4)</label>
                <input type="text" id="txtUserBirth" placeholder="예: 950505-1">
            </div>
            <div class="form-group">
                <label>휴대폰 번호 (숫자만)</label>
                <input type="text" id="txtUserPhone" placeholder="예: 01012345678">
            </div>
            <div class="agree-box">
                <input type="checkbox" id="chkAgree">
                <label for="chkAgree" style="cursor:pointer; font-weight:500;">이용약관 및 정보 수집 전체 동의</label>
            </div>
            <button id="btnSubmitForm" class="btn-submit theme-btn-default" onclick="executeStep2Submit()">인증 요청</button>
        </div>
    </div>

    <!-- [3단계 PANEL] 검증 처리 결과 안내 모달 알림 스크린 -->
    <div class="step-panel" id="layer3">
        <div class="panel-header-title"><i class="fa-solid fa-bell"></i> 3 단계: 본인 확인 처리 결과</div>
        <div class="popup-display-zone">
            <div class="embedded-result-popup" id="popupEmbedded3">
                <div class="pop-icon-box"><i id="icoPop" class="fa-solid fa-circle-check"></i></div>
                <div class="pop-title-text" id="txtPopTitle">본인 인증 상태</div>
                <div class="pop-body-message" id="txtPopMessage">내용 조회 중...</div>
                <button id="btnActionPop" class="btn-pop-next" onclick="executeStep3ConfirmNext()">확인</button>
            </div>
        </div>
    </div>

       <!-- 4단계 : 자동으로 인증서 통과한 기존 등록 대상자 전용 정산 청구서 페이지 -->
    <div class="step-panel" id="layer4">
        <div class="panel-header-title"><i class="fa-solid fa-money-check-dollar"></i> 4단계: 정산 정보 등록 및 참여비 신청</div>
        <div id="ui_trial_card" class="trial-list-card">
            <div class="trial-info" style="text-align: left;">
                <span id="lblTrialCategory" class="badge bg-blue"></span>
                <h4 id="lblTrialTitle">임상과제 정보 로딩 중...</h4>
                <div class="meta-row">
                    <div id="ui_target_name_zone" class="meta-item-flex"></div>
                    <div id="ui_crc_name_zone"></div>
                </div>
            </div>
            <div class="mobile-settlement-box">
                <span id="cms-badge" class="badge bg-blue">참여\n(소집)</span>
            </div>
        </div>
        
        <div class="status-history-bar">
            <span>실시간 연결: <b style="color:#4ade80;">연결중</b></span>
            <span> 상태: <b id="history-log" style="color: #06B6D4;">승인 대기중</b></span>
        </div>

        <div class="mobile-settlement-box" style="background-color: #112240; border: 1px solid #1E293B; border-radius: 16px; padding: 14px 12px; display: flex; flex-direction: column; gap: 10px;">
            <div class="settlement-title">참여비 지급 신청 서식</div>
            <div class="progress-status" id="ui_stage_text" style="background-color: #07132B; padding: 8px; border-radius: 6px; font-size: 11px; color: #94A3B8; border: 1px solid #1E293B; line-height: 1.4;">
                <b>신청 검증 단계</b><br>
                <span style="font-size:11px;color:#94A3B8;">* 관리자가 [신청가능] 상태를 승인하면 신청이 가능합니다</span>
            </div>
            <div class="form-grid" style="display: grid; grid-template-columns: 95px 1fr; gap: 6px;">
                <select class="form-select" id="ui_bank_select" disabled style="height: 34px; background-color: #07132B; border: 1px solid #1E293B; border-radius: 6px; color: #FFF; padding: 0 8px; font-size: 11.5px; outline: none;">
                    <option value="">은행 선택</option>
                    <option value="국민">KB국민은행</option>
                    <option value="우리">우리은행</option>
                    <option value="하나">하나은행</option>
                    <option value="신한">신한은행</option>
                    <option value="농협">NH농협은행</option>
                    <option value="카카오">카카오뱅크</option>
                    <option value="토스">토스뱅크</option>
                </select>
                <input type="text" class="form-input" id="ui_bank_input" disabled placeholder="계좌번호 입력(숫자만)" value="" style="height: 34px; background-color: #07132B; border: 1px solid #1E293B; border-radius: 6px; color: #FFF; padding: 0 8px; font-size: 11.5px; outline: none;">
            </div>
            
            <div class="upload-box-wrapper" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <input type="file" id="real_file_id" accept="image/*" style="display: none;" onchange="handleFileSelect(this, 'id')">
                <input type="file" id="real_file_bank" accept="image/*" style="display: none;" onchange="handleFileSelect(this, 'bank')">
                
                <div class="upload-box" id="doc_box_1">
                    <div class="status-text" id="id_status_txt" style="font-weight: 700; color:#f87171; font-size:12px; line-height:1.4;">X 신분증 미첨부</div>
                    <div class="btn-file-select" id="id_select_btn" onclick="triggerFileInput('id')">파일 선택</div>
                </div>
                <div class="upload-box" id="doc_box_2">
                    <div class="status-text" id="bank_status_txt" style="font-weight:700; color:#f87171; font-size:12px; line-height: 1.4;">X 통장사본 미첨부</div>
                    <div class="btn-file-select" id="bank_select_btn" onclick="triggerFileInput('bank')">파일 선택</div>
                </div>
            </div>
            
            <button id="ui_submit_btn" class="btn-submit-form" onclick="submitFinalSettlementForm()" disabled style="width: 100%; height: 44px; background-color: #9ca3af; border: none; border-radius: 10px; color: #FFF; font-size: 13.5px; font-weight: 700; cursor: not-allowed; transition: all 0.3s; margin-top: 5px;">관리자 승인 대기중 (신청 불가)</button>
            
            <button type="button" id="ui_calendar_redirect_btn" class="btn-submit-form" onclick="navigateToStep(5);" style="display: none; background-color: #0284c7 !important; cursor: pointer !important; margin-top: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">임상시험 일정 확인 (과제 완료)</button>
        </div>
    </div>

    <!-- [신규 마운트 트랙 B] 참여이력이 전혀 없는 신규 방문 대상자 전용 캘린더 다이렉트 임베드 패널 -->
    <div class="step-panel" id="layer5" style="padding: 12px 10px; display: none; height: 100%; flex-direction: column;">
        <div class="panel-header-title" style="margin-bottom: 8px;">
            <i class="fa-solid fa-calendar-days" style="color:#06B6D4;"></i> 인증 완료: 나의 임상시험 스케줄러 (신규)
        </div>
        <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; color: #e2e8f0;">
            <strong id="lblSetTargetNew" style="color:#06B6D4;">-</strong> 최초 인증 대상자 가상 스케줄러 연동 완료
        </div>
        <div style="flex: 1; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; background: #0b0f19;">
            <!-- 상위 디렉토리에 동거 중인 m-calendar.html 역추적 연동 완착 -->
            <iframe src="../m-calendar.html" id="mobileCalendarFrame" style="width: 100%; height: 100%; border: none; background: #0b0f19;" sandbox="allow-scripts allow-same-origin allow-modals"></iframe>
        </div>
    </div>

</div>

<!-- [모듈화 연동 02 🌟]: 링크 방식의 404 경로 유실 대참사를 막기 위해 layout.js 소스코드를 서버단에서 강제 흡수 합병 -->
<script>
    <?php include_once __DIR__ . '/layout.js'; ?>
</script>
