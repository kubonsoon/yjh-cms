/**
 * ==========================================================================
 * 📑 임상시험 관리 시스템: 보고서 및 통계 단원 외부 독립 모듈 (report-view.js)
 * ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // 최초 세션 가동 시 기본 활성화 제어 브릿지 포트
  if (typeof switchReportSubTab === "function") {
    switchReportSubTab("summary");
  }
});

function RenderReportMasterDashboard() {
  return `
        <!-- 📊 [1 탭]: 종합 통계 관제탑 패널 (독립 격리 단원) -->
        <div id="report-tab-panel-summary" class="report-tab-content-panel active">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
                <h4 style="font-size: 16px; font-weight: 800; color: #ffffff;">
                    <i class="fa-solid fa-chart-pie" style="color: var(--secondary-color); margin-right: 6px;"></i>
                    임상시험 종합 거시 통계 관제 보드
                </h4>
                <div class="report-action-btn-set">
                    <select id="report-time-filter" onchange="calculateReportMasterStats()" style="width: 130px; height: 36px; background: #0b0f19; color: #fff; border: 1px solid var(--border-color); border-radius: 6px; padding: 0 10px; font-weight: 700; font-size: 13px; cursor: pointer; outline: none; margin: 0;">
                        <option value="YEAR">년 단위 통계</option>
                        <option value="MONTH">월 단위 통계</option>
                        <option value="WEEK">주간 단위 통계</option>
                    </select>
                    <button onclick="executeReportPrint('summary')" type="button" style="background: rgba(14, 165, 233, 0.15); color: var(--secondary-color); border: 1px solid var(--secondary-color);"><i class="fa-solid fa-print"></i> 통합 보고서 인쇄</button>
                    <button onclick="executeReportPDF('summary')" type="button" style="background: #1e293b; color: var(--text-color); border: 1px solid var(--border-color);"><i class="fa-solid fa-file-pdf"></i> PDF 저장</button>
                </div>
            </div>

            <!-- 카드 4종 안착 구역 -->
            <div id="report-scoreboard-cards"></div>
            <!-- 미니 차트 레이어 4종 안착 구역 -->
            <div id="report-mini-charts-block" class="report-mini-charts-layer"></div>
        </div> <!-- 💡 ⭕ [버그 직격 교정 안전핀]: 1 탭 본문이 끝나는 이 지점에서 div를 정밀 격리 마감하여 타 탭으로 통계 내용이 쏟아져 전염되는 현상을 원천 방단합니다! -->

        <!-- 📂 [2 탭]: 시험별 모집 및 재무 현황 패널 -->
        <div id="report-tab-panel-recruitment" class="report-tab-content-panel">
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                2. 시험별 모집 및 재무 현황 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        </div>

        <!-- 📂 [3 탭]: 대상자 탈락 사유 통계 대장 패널 -->
        <div id="report-tab-panel-dropout" class="report-tab-content-panel">
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                3. 대상자 탈락 사유 통계 대장 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        </div>

        <!-- 📄 [4 탭]: 대상자 개인별 마스터 원장 조회 패널 -->
        <div id="report-tab-panel-ledger" class="report-tab-content-panel">
            <div id="report-ledger-search-gate" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
                <h4 style="font-size: 16px; font-weight: 800; color: var(--warning-color);">
                    <i class="fa-solid fa-id-card" style="margin-right: 6px;"></i> 대상자별 임상시험 통합 원장 검증 조회
                </h4>
                <div style="display: flex; gap: 10px; align-items: center; width: 100%; max-width: 720px; justify-content: flex-end;">
                    <input type="text" id="report-search-keyword" placeholder="성명 또는 생년월일 6자리를 입력하세요" style="width: 240px; height: 36px; border-radius: 6px; background: #0b0f19; color: #fff; border: 2px solid var(--border-color); padding: 0 12px; font-size: 13px; font-weight: 700; outline: none;">
                    <button type="button" id="btn-ledger-execute" onclick="searchApplicantMasterLedger()" style="background: var(--secondary-color); color: #ffffff; padding: 0 16px; border-radius: 6px; font-weight: 800; font-size: 13px; border: none; cursor: pointer; height: 36px; white-space: nowrap;">조회</button>
                    <button onclick="executeReportPrint('ledger')" type="button" style="background: rgba(74, 222, 128, 0.15); color: var(--success-color); border: 1px solid var(--success-color); height: 36px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;"><i class="fa-solid fa-print"></i> 개인 원장 인쇄</button>
                    <button onclick="executeReportPDF('ledger')" type="button" style="background: #1e293b; color: var(--text-color); border: 1px solid var(--border-color); height: 36px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;"><i class="fa-solid fa-file-pdf"></i> PDF 저장</button>
                </div>
            </div>

            <!-- 실물 이력서 시트 바인딩 웅덩이 -->
            <div id="report-master-ledger-viewport" style="width: 100%;">
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; font-weight: 700; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 20px; margin-bottom: 10px; display: block; color: var(--text-muted);"></i>
                    상단 검색창에 대상자의 성명 또는 생년월일을 입력하신 뒤 [조회] 단추를 누르면,<br>시리얼넘버, 병록번호, 이니셜 교체 대조 기반 동명이인이 분리된 통합 원장이 실시간 역산 되어 표출됩니다.
                </div>
            </div>
        </div>

        <!-- 📂 [5 탭]: 담당 CRC별 시험 통제 및 정산 효율 패널 -->
        <div id="report-tab-panel-crc" class="report-tab-content-panel">
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                5. 담당 CRC별 시험 통제 및 정산 효율 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        </div>

        <!-- 📂 [6 탭]: 차수별(1~3차) 참여비 미래 스케줄러 패널 -->
        <div id="report-tab-panel-budget" class="report-tab-content-panel">
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                6. 차수별(1~3차) 참여비 미래 스케줄러 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        </div>
    `;
}
/**
 * 📈 [2단계 엔진]: 1 탭 거시 통계 스코어보드 및 SVG 차트 연산 커밋 함수
 * (기존 admin.html 내부의 calculateReportMasterStats 소스 원형을 그대로 복원 안착)
 */
function calculateReportMasterStats() {
  // 부모의 localStorage 기반 가상 DB 스트림 동적 로드 [index: 0.1.412]
  const currentApplicants =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];

  let totalN = 0;
  let totalJoined = currentApplicants.length;
  let receivedCount = 0;
  let processingCount = 0;
  let completeCount = 0;

  // 데이터 누적 집계 [index: 0.1.412]
  currentApplicants.forEach((row) => {
    if (row.count) totalN += parseInt(row.count) || 0;

    // 정산 상태별 카운트 역산 [index: 0.1.412]
    const status = row.payStatus ? row.payStatus.trim() : "접수";
    if (status === "접수") receivedCount++;
    else if (status === "처리중") processingCount++;
    else if (status === "완료") completeCount++;
  });

  // 1. 상단 요약 숫자 카드 4종 템플릿 실시간 마운트 [index: 0.1.412]
  const cardsContainer = document.getElementById("report-scoreboard-cards");
  if (cardsContainer) {
    cardsContainer.innerHTML = `
            <div style="background: #111827; border: 1px solid var(--border-color); padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">종합 시험 모집률</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin-top: 4px;">\${totalJoined}명 <span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">/ 목표 \${totalN}명</span></h3>
            </div>
            <div style="background: #111827; border: 1px solid #0ea5e9; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #0ea5e9; font-weight: 700;">청구서 접수 연보</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #0ea5e9; margin-top: 4px;">\${receivedCount}건</h3>
            </div>
            <div style="background: #111827; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #fbbf24; font-weight: 700;">재무 검토 (처리중)</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-top: 4px;">\${processingCount}건</h3>
            </div>
            <div style="background: #111827; border: 1px solid #4ade80; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #4ade80; font-weight: 700;">정산 종결 (지급완료)</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #4ade80; margin-top: 4px;">\${completeCount}건</h3>
            </div>
        `;
  }

  // 비율 역산 [index: 0.1.413]
  const joinPercent = totalN > 0 ? Math.round((totalJoined / totalN) * 100) : 0;
  const recPercent =
    totalJoined > 0 ? Math.round((receivedCount / totalJoined) * 100) : 0;
  const procPercent =
    totalJoined > 0 ? Math.round((processingCount / totalJoined) * 100) : 0;
  const compPercent =
    totalJoined > 0 ? Math.round((completeCount / totalJoined) * 100) : 0;

  // 2. 둘째 줄 미니 SVG 원형/막대 그래프 레이어 4종 실시간 마운트 [index: 0.1.413]
  const chartsContainer = document.getElementById("report-mini-charts-block");
  if (chartsContainer) {
    chartsContainer.innerHTML = `
            <!-- 1차트: 모집률 막대 그래프 -->
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>과제 참여 진척도</span>
                    <span style="color: var(--secondary-color);">\${joinPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: \${joinPercent}%; background: var(--secondary-color);"></div></div>
            </div>
            <!-- 2차트: 접수율 SVG 도넛 원형 -->
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0ea5e9" stroke-width="6"
                            stroke-dasharray="\${2 * Math.PI * 20}"
                            stroke-dashoffset="\${2 * Math.PI * 20 * (1 - recPercent / 100)}"
                            class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">청구서 접수율</span><span style="font-size: 18px; font-weight: 800; color: #0ea5e9;">\${recPercent}%</span></div>
            </div>
            <!-- 3차트: 처리율 SVG 도넛 원형 -->
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#fbbf24" stroke-width="6"
                            stroke-dasharray="\${2 * Math.PI * 20}"
                            stroke-dashoffset="\${2 * Math.PI * 20 * (1 - procPercent / 100)}"
                            class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">재무 검토율</span><span style="font-size: 18px; font-weight: 800; color: #fbbf24;">\${procPercent}%</span></div>
            </div>
            <!-- 4차트: 종결율 막대 그래프 -->
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>정산 종결 확정률</span>
                    <span style="color: #4ade80;">\${compPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: \${compPercent}%; background: #4ade80;"></div></div>
            </div>
        `;
  }
}

/**
 * 🖨️ [3단계 엔진]: 상단 마스터 총괄 보고서 및 4탭 개인 원장 인쇄 통제 함수 [index: 0.1.414]
 */
function executeReportPrint(mode) {
  if (mode === "summary") {
    document.body.classList.add("print-summary-mode");
    document.body.classList.remove("print-ledger-mode");
    window.print();
  } else if (mode === "ledger") {
    document.body.classList.add("print-ledger-mode");
    document.body.classList.remove("print-summary-mode");
    window.print();
  }

  // 인쇄 마감 후 모드 원천 해제 스케줄러 (화면 복구용) [index: 0.1.415]
  setTimeout(() => {
    document.body.classList.remove("print-summary-mode", "print-ledger-mode");
  }, 1000);
}

function executeReportPDF(mode) {
  alert(
    "[" +
      (mode === "summary" ? "통합 총괄 보고서" : "개인 원장 대장") +
      "] 관공서 증빙 규격 PDF 다운로드 스트림을 호출합니다.",
  );
  executeReportPrint(mode);
}

// 부모 admin.html의 글로벌 스코프 인식을 위한 강제 브릿지 연동 바인딩 [index: 0.1.415]
window.RenderReportMasterDashboard = RenderReportMasterDashboard;
window.calculateReportMasterStats = calculateReportMasterStats;
window.executeReportPrint = executeReportPrint;
window.executeReportPDF = executeReportPDF;
