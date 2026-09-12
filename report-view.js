/**
 * ==========================================================================
 * 📊 임상시험 관리 시스템: 보고서 및 통계 단원 외부 독립 모듈 (report-view.js)
 * ==========================================================================
 * [최종 변수 정상화 완결본]: 템플릿 리터럴 이스케이프 오염을 완벽히 소독하여,
 * 대상자 관리 탭(localStorage) 데이터 수치를 SVG 도넛 및 카드에 실시간 반영함.
 */

/**
 * 📈 [마스터 최상위 연산 엔진]: admin.html 사이드바 및 탭 전환 시 직접 가동
 */
function calculateReportMasterStats() {
  const viewport = document.getElementById("report-tab-panel-summary");
  if (!viewport) {
    console.warn(
      "[경고] report-tab-panel-summary 뷰포트 엘리먼트를 찾을 수 없습니다.",
    );
    return;
  }

  if (!document.getElementById("report-scoreboard-cards")) {
    viewport.innerHTML = RenderSummaryTabContent();
  }

  // 🎯 [실시간 연동 체인]: 대상자 관리 탭에서 적재되는 가상 DB 스트림 동적 로드
  const currentApplicants =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  let totalN = 0;
  let totalJoined = currentApplicants.length;
  let receivedCount = 0;
  let processingCount = 0;
  let completeCount = 0;

  currentApplicants.forEach((row) => {
    // 모집공고의 목표 N수를 실시간 누적 산출
    if (row.count) totalN += parseInt(row.count) || 0;

    // 대상자 관리 탭의 [참여상태 / 참여비 지급 상태] 매칭 집계
    const status = row.payStatus ? row.payStatus.trim() : "접수";
    if (status === "접수") receivedCount++;
    else if (status === "처리중") processingCount++;
    else if (status === "완료") completeCount++;
  });

  // 💡 [변수 치환 봉합]: 역슬래시(\)를 완벽 세척하여 실제 실시간 연동 수치 주입
  const cardsContainer = document.getElementById("report-scoreboard-cards");
  if (cardsContainer) {
    cardsContainer.innerHTML = `
            <div style="background: #111827; border: 1px solid var(--border-color); padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">종합 시험 모집률</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #fff; margin-top: 4px;">${totalJoined}명 <span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">/ 목표 ${totalN}명</span></h3>
            </div>
            <div style="background: #111827; border: 1px solid #0ea5e9; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #0ea5e9; font-weight: 700;">청구서 접수 연보</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #0ea5e9; margin-top: 4px;">${receivedCount}건</h3>
            </div>
            <div style="background: #111827; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #fbbf24; font-weight: 700;">재무 검토 (처리중)</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #fbbf24; margin-top: 4px;">${processingCount}건</h3>
            </div>
            <div style="background: #111827; border: 1px solid #4ade80; padding: 16px; border-radius: 8px;">
                <span style="font-size: 12px; color: #4ade80; font-weight: 700;">정산 종결 (지급완료)</span>
                <h3 style="font-size: 22px; font-weight: 800; color: #4ade80; margin-top: 4px;">${completeCount}건</h3>
            </div>
        `;
  }

  // 비율 오프셋 1:1 최종 정밀 매핑 연산
  const joinPercent = totalN > 0 ? Math.round((totalJoined / totalN) * 100) : 0;
  const recPercent =
    totalJoined > 0 ? Math.round((receivedCount / totalJoined) * 100) : 0;
  const procPercent =
    totalJoined > 0 ? Math.round((processingCount / totalJoined) * 100) : 0;
  const compPercent =
    totalJoined > 0 ? Math.round((completeCount / totalJoined) * 100) : 0;

  // 💡 [SVG 도넛 링 동적 오프셋 활성화]: 연산 수치에 따른 실시간 드로잉 가동
  const chartsContainer = document.getElementById("report-mini-charts-block");
  if (chartsContainer) {
    chartsContainer.innerHTML = `
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>과제 참여 진척도</span><span style="color: var(--secondary-color);">${joinPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: ${joinPercent}%; background: var(--secondary-color);"></div></div>
            </div>
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0ea5e9" stroke-width="6" stroke-dasharray="${2 * Math.PI * 20}" stroke-dashoffset="${2 * Math.PI * 20 * (1 - recPercent / 100)}" class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">청구서 접수율</span><span style="font-size: 18px; font-weight: 800; color: #0ea5e9;">${recPercent}%</span></div>
            </div>
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#fbbf24" stroke-width="6" stroke-dasharray="${2 * Math.PI * 20}" stroke-dashoffset="${2 * Math.PI * 20 * (1 - procPercent / 100)}" class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">재무 검토율</span><span style="font-size: 18px; font-weight: 800; color: #fbbf24;">${procPercent}%</span></div>
            </div>
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>정산 종결 확정률</span><span style="color: #4ade80;">${compPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: ${compPercent}%; background: #4ade80;"></div></div>
            </div>
        `;
  }
}

/**
 * 📦 [1 탭 레이아웃 기본 골격 구조 반환]
 */
function RenderSummaryTabContent() {
  return `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
            <h4 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">
                <i class="fa-solid fa-chart-pie" style="color: var(--secondary-color); margin-right: 6px;"></i>
                임상시험 종합 거시 통계 관제 보드
            </h4>
            <div class="report-action-btn-set">
                <select id="report-time-filter" onchange="calculateReportMasterStats()" style="width: 130px; height: 36px; background: #0b0f19; color: #fff; border: 1px solid var(--border-color); border-radius: 6px; padding: 0 10px; font-weight: 700; font-size: 13px; cursor: pointer; outline: none; margin: 0;">
                    <option value="YEAR">년 단위 통계</option>
                    <option value="MONTH">월 단위 통계</option>
                    <option value="WEEK">주간 단위 통계</option>
                </select>
                <button onclick="executeReportPrint('summary')" type="button">
                    <i class="fa-solid fa-print"></i> 통합 보고서 인쇄
                </button>
                <button onclick="executeReportPDF('summary')" type="button">
                    <i class="fa-solid fa-file-pdf"></i> PDF 저장
                </button>
            </div>
        </div>
        <div id="report-scoreboard-cards"></div>
        <div id="report-mini-charts-block" class="report-mini-charts-layer"></div>
    `;
}

/**
 * 📦 [4 탭 레이아웃 프레임 구조 반환]
 */
function RenderLedgerTabContent() {
  return `
        <div id="report-ledger-search-gate" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
            <h4 style="font-size: 16px; font-weight: 800; color: var(--warning-color); margin: 0;">
                <i class="fa-solid fa-id-card" style="margin-right: 6px;"></i> 대상자별 임상시험 통합 원장 검증 조회
            </h4>
            <div style="display: flex; gap: 10px; align-items: center; width: 100%; max-width: 720px; justify-content: flex-end;">
                <input type="text" id="report-search-keyword" placeholder="성명 또는 생년월일 6자리를 입력하세요" style="width: 240px; height: 36px; border-radius: 6px; background: #0b0f19; color: #fff; border: 2px solid var(--border-color); padding: 0 12px; font-size: 13px; font-weight: 700; outline: none;">
                <button type="button" id="btn-ledger-execute" onclick="searchApplicantMasterLedger()" style="background: var(--secondary-color); color: #ffffff; padding: 0 16px; border-radius: 6px; font-weight: 800; font-size: 13px; border: none; cursor: pointer; height: 36px; white-space: nowrap;">조회</button>
                <button onclick="executeReportPrint('ledger')" type="button" style="background: rgba(74, 222, 128, 0.15); color: var(--success-color); border: 1px solid var(--success-color); height: 36px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;"><i class="fa-solid fa-print"></i> 개인 원장 인쇄</button>
                <button onclick="executeReportPDF('ledger')" type="button" style="background: #1e293b; color: var(--text-color); border: 1px solid var(--border-color); height: 36px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;"><i class="fa-solid fa-file-pdf"></i> PDF 저장</button>
            </div>
        </div>
        <div id="report-master-ledger-viewport" style="width: 100%;">
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; font-weight: 700; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 20px; margin-bottom: 10px; display: block; color: var(--text-muted);"></i>
                상단 검색창에 대상자의 성명 또는 생년월일을 입력하신 뒤 [조회] 단추를 누르면,<br>시리얼넘버, 병록번호, 이니셜 교체 대조 기반 동명이인이 분리된 통합 원장이 실시간 역산 되어 표출됩니다.
            </div>
        </div>
    `;
}

function searchApplicantMasterLedger() {
  alert("가상 DB 마스터 원장 조회를 가동합니다.");
}

function switchReportSubTab(tabKey) {
  const viewport = document.getElementById("report-tab-panel-summary");
  if (!viewport) return;

  var tabs = ["summary", "recruitment", "dropout", "ledger", "crc", "budget"];
  tabs.forEach(function (key) {
    var btn = document.querySelector(
      `button[onclick="switchReportSubTab('${key}')"]`,
    );
    if (btn) btn.classList.remove("active");
  });
  var activeBtn = document.querySelector(
    `button[onclick="switchReportSubTab('${tabKey}')"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  if (tabKey === "summary") {
    viewport.innerHTML = RenderSummaryTabContent();
    calculateReportMasterStats();
  } else if (tabKey === "recruitment") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 2. 시험별 모집 및 재무 현황 단원은 현재 전산화 표준화 분석 준비중...</div>`;
  } else if (tabKey === "dropout") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 3. 대상자 탈락 사유 통계 대장 단원은 현재 전산화 표준화 분석 준비중...</div>`;
  } else if (tabKey === "ledger") {
    viewport.innerHTML = RenderLedgerTabContent();
  } else if (tabKey === "crc") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 5. 담당 CRC별 시험 통제 및 정산 효율 단원은 현재 전산화 표준화 분석 준비중...</div>`;
  } else if (tabKey === "budget") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 6. 차수별(1~3차) 참여비 미래 스케줄러 단원은 현재 전산화 표준화 분석 준비중...</div>`;
  }
}

function executeReportPrint(mode) {
  if (mode === "summary") {
    document.body.classList.add("print-summary-mode");
    window.print();
  } else if (mode === "ledger") {
    document.body.classList.add("print-ledger-mode");
    window.print();
  }
  setTimeout(() => {
    document.body.classList.remove("print-summary-mode", "print-ledger-mode");
  }, 1000);
}

function executeReportPDF(mode) {
  executeReportPrint(mode);
}

window.calculateReportMasterStats = calculateReportMasterStats;
window.switchReportSubTab = switchReportSubTab;
window.executeReportPrint = executeReportPrint;
window.executeReportPDF = executeReportPDF;
window.searchApplicantMasterLedger = searchApplicantMasterLedger;
