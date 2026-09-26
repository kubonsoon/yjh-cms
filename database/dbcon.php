<?php
/**
 * 임상시험 관리 시스템 (CMS) - 중앙 환경 설정 및 보안 인프라
 */

// 1. 시스템 에러 모니터링 활성화 (개발 단계 디버깅용, 운영 전환 시 false로 변경)
define('DEBUG_MODE', true);
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// 2. 임상 데이터 무결성을 위한 표준 타임존 고정 (한국 표준시)
date_default_timezone_set('Asia/Seoul');

// 3. 글로벌 세션 인프라 시작 (다중 디바이스 인증 상태 추적용)
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 4. Supabase 클라우드 데이터베이스 접속 보안 상수 선언
// TODO: 아래 큰따옴표 안에 본인의 실제 Supabase 프로젝트 API 정보를 정확히 기입하세요.
define('SUPABASE_URL', "https://stkhtdeiaesdjzyfijaj.supabase.co"); 
define('SUPABASE_ANON_KEY', "sb_publishable_nwydaUNV5Pw0t8XqNn_vUg_Rpp5dKgL");

/**
 * 브라우저(JavaScript SDK) 단에서 하드코딩 없이 
 * Supabase 접속 정보를 안전하게 상속받을 수 있도록 돕는 글로벌 통신 가교 함수
 */
function injectSupabaseConfig() {
    ?>
    <script>
        // PHP 보안 상수를 자바스크립트 전역 컨텍스트로 안전하게 릴레이
        window.CMS_CONFIG = {
            SUPABASE_URL: "<?php echo SUPABASE_URL; ?>",
            SUPABASE_ANON_KEY: "<?php echo SUPABASE_ANON_KEY; ?>"
        };
    </script>
    <?php
}
?>