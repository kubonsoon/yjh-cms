<?php

// 1. 보안 격리 서브폴더 내 데이터베이스 연결 인프라 로드
require_once __DIR__ . '/database/dbcon.php';

// 2. 이미 로그인 인증된 대상자의 세션이 상주할 경우의 가드 분기 (필요시 개방)
if (isset($_SESSION['certifiedUserName']) && !empty($_SESSION['certifiedUserName'])) {
    // 자동 진입 프로토콜 활성화 구역
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>임상시험 스마트 연동 시스템 | H+양지병원 의생명연구원</title>
    
    <!-- [경로 복원 🌟]: 글로벌 사내 전산망 공통 폰트어썸 아이콘 라이브러리 CDN 정식 주소 상속 -->
    <link rel="stylesheet" href="https://cloudflare.com">
    
    <!-- [반응형 이관]: 미디어 쿼리가 내장되어 PC/모바일 화면 전체를 총괄 제어하는 루트 마스터 스타일시트 바인딩 -->
    <link rel="stylesheet" href="./main.css">
    
    <!-- [경로 복원 🌟]: Supabase 클라우드 전산망 연동 공식 JS SDK 엔진 정식 주소 주입 -->
    <script src="https://jsdelivr.net"></script>

    <!-- [순서 교정 락인 🌟]: 자바스크립트 엔진(main.js)이 돌기 전에 dbcon 접속 자격 상수를 가장 먼저 메모리에 완착시킴 -->
    <?php if (function_exists('injectSupabaseConfig')) { injectSupabaseConfig(); } ?>
</head>
<body>

    <!-- 미디어 쿼리의 명령을 직접 받아 기기별 레이아웃 프레임을 실시간 가공하는 거치대 컨테이너 -->
    <div class="responsive-master-wrapper">
        
        <!-- PC 및 대형 태블릿 접속자 전용 인프라 안내 사이드 바 (스마트폰 접속 시 미디어 쿼리에 의해 원천 은폐) -->
      <!--  <div class="pc-info-sidebar">
            <h2>H+양지병원<br>임상시험 스마트 연동</h2>
            <p>의생명연구원 대상자 전용 모바일 웹 플랫폼입니다. 다중 디바이스 환경에서 클라우드 데이터베이스 인프라를 활용하여 안전하고 신속한 실시간 데이터 처리를 지원합니다.</p>
            
            <ul class="system-feature-list">
                <li><i class="fa-solid fa-circle-check"></i> <b>대상자</b> 간편인증 및 실시간 가입 승인 처리</li>
                <li><i class="fa-solid fa-circle-check"></i> <b>참여비</b> 청구서 양식 및 증빙 서류 클라우드 전송</li>
                <li><i class="fa-solid fa-circle-check"></i> Supabase Realtime 기술 기반 실시간 심사 현황 미러링</li>
            </ul>
        </div>  -->

        <!-- 컴포넌트 마운트 프레임: PHP include 구문을 활용해 일반 유저 전용 m-login 마크업 알맹이를 직접 결합 -->
        <div class="app-component-container">
            <?php 
                // [확정 설계안 연동]: member/login.php 파일을 실시간으로 인클루드 주입하여 대문 프레임에 마운트
                include_once __DIR__ . '/member/login.php'; 
            ?>
        </div>

    </div>

<!-- [반응형 이관]: 루트에 배치된 글로벌 프론트엔드 환경 제어 및 디바이스 식별 스크립트 로드 -->
<script src="./main.js"></script>
</body>
</html>