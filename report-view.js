/**
 * 🔄 [전역 오케스트레이터 허브]: admin.html 사이드바 클릭 시 가장 먼저 트리거 가동
 * 💡 메뉴 진입과 동시에 기본값인 1번 '종합 통계 관제탑' 내용을 주입합니다.
 */
function calculateReportMasterStats() {
  // 대표님의 지침대로 기본 1번 탭 화면을 뷰포트 광장에 즉시 사출합니다.
  switchReportSubTab("summary");
}

/**
 * 🔄 [라우터 스위처]: 상단 6대 메뉴 버튼 클릭 시 단일 뷰포트 내부 내용을 실시간 교체 (innerHTML)
 */
function switchReportSubTab(tabKey) {
  // 1. 대표님이 마크업하신 admin.html 본문의 유일한 가변 뷰포트 광장 색인
  const viewport = document.getElementById("report-tab-panel-summary");
  if (!viewport) {
    console.warn(
      "[경고] report-tab-panel-summary 뷰포트 엘리먼트를 찾을 수 없습니다.",
    );
    return;
  }

  console.log(`[단일 뷰포트 교체 가동] 타겟 탭 내용 주입 ➡️ \${tabKey}`);

  // 2. 상단 가로형 서브 탭 버튼들의 하이라이트(.active) 디자인 제어
  var tabs = ["summary", "recruitment", "dropout", "ledger", "crc", "budget"];
  tabs.forEach(function (key) {
    var btn = document.querySelector(
      `button[onclick="switchReportSubTab('\${key}')"]`,
    );
    if (btn) btn.classList.remove("active");
  });
  var activeBtn = document.querySelector(
    `button[onclick="switchReportSubTab('\${tabKey}')"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  // 3. 🎯 [핵심 기믹]: 선택된 탭 고유의 실물 HTML 내용물을 단일 뷰포트 광장에 교체 주입
  if (tabKey === "summary") {
    viewport.innerHTML = RenderSummaryTabContent();
    // 주입 직후, 스토리지 데이터를 계산하여 스코어카드와 SVG 도넛 차트를 실시간으로 그려줍니다.
    renderLiveChartCalculations();
  } else if (tabKey === "recruitment") {
    viewport.innerHTML = `
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                2. 시험별 모집 및 재무 현황 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        `;
  } else if (tabKey === "dropout") {
    viewport.innerHTML = `
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                3. 대상자 탈락 사유 통계 대장 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        `;
  } else if (tabKey === "ledger") {
    viewport.innerHTML = RenderLedgerTabContent();
  } else if (tabKey === "crc") {
    viewport.innerHTML = `
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                5. 담당 CRC별 시험 통제 및 정산 효율 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        `;
  } else if (tabKey === "budget") {
    viewport.innerHTML = `
            <div class="report-preparing-box">
                <i class="fa-solid fa-hourglass-half" style="font-size: 24px; margin-bottom: 12px; display: block; color: var(--warning-color);"></i>
                6. 차수별(1~3차) 참여비 미래 스케줄러 단원은 현재 전산화 표준화 분석 준비중...
            </div>
        `;
  }
}

/**
 * 📦 [1 탭 알맹이]: 종합 통계 관제탑 레이아웃 문자열 반환 (오전 5시 54분 순정 원형)
 */
function RenderSummaryTabContent() {
  return `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
            <h4 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">
                <i class="fa-solid fa-chart-pie" style="color: var(--secondary-color); margin-right: 6px;"></i>
                임상시험 종합 거시 통계 관제 보드
            </h4>
            <div class="report-action-btn-set">
                <select id="report-time-filter" onchange="renderLiveChartCalculations()" style="width: 130px; height: 36px; background: #0b0f19; color: #fff; border: 1px solid var(--border-color); border-radius: 6px; padding: 0 10px; font-weight: 700; font-size: 13px; cursor: pointer; outline: none; margin: 0;">
                    <option value="YEAR">년 단위 통계</option>
                    <option value="MONTH">월 단위 통계</option>
                    <option value="WEEK">주간 단위 통계</option>
                </select>
                <button onclick="executeReportPrint('summary')" type="button" style="background: rgba(14, 165, 233, 0.15); color: var(--secondary-color); border: 1px solid var(--secondary-color);"><i class="fa-solid fa-print"></i> 통합 보고서 인쇄</button>
                <button onclick="executeReportPDF('summary')" type="button" style="background: #1e293b; color: var(--text-color); border: 1px solid var(--border-color);"><i class="fa-solid fa-file-pdf"></i> PDF 저장</button>
            </div>
        </div>
        <!-- 데이터 연산 장치에 의해 실시간 수치가 마운트될 내부 안착 구역들 -->
        <div id="report-scoreboard-cards"></div>
        <div id="report-mini-charts-block" class="report-mini-charts-layer"></div>
    `;
}
/**
 * 📈 [1 탭 실시간 차트 엔진]: 스토리지 연동 및 SVG 도넛 오프셋 수식 계산 (2-2파트)
 */
function renderLiveChartCalculations() {
  const currentApplicants =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  let totalN = 0;
  let totalJoined = currentApplicants.length;
  let receivedCount = 0;
  let processingCount = 0;
  let completeCount = 0;

  currentApplicants.forEach((row) => {
    if (row.count) totalN += parseInt(row.count) || 0;
    const status = row.payStatus ? row.payStatus.trim() : "접수";
    if (status === "접수") receivedCount++;
    else if (status === "처리중") processingCount++;
    else if (status === "완료") completeCount++;
  });

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

  const joinPercent = totalN > 0 ? Math.round((totalJoined / totalN) * 100) : 0;
  const recPercent =
    totalJoined > 0 ? Math.round((receivedCount / totalJoined) * 100) : 0;
  const procPercent =
    totalJoined > 0 ? Math.round((processingCount / totalJoined) * 100) : 0;
  const compPercent =
    totalJoined > 0 ? Math.round((completeCount / totalJoined) * 100) : 0;

  const chartsContainer = document.getElementById("report-mini-charts-block");
  if (chartsContainer) {
    chartsContainer.innerHTML = `
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>과제 참여 진척도</span><span style="color: var(--secondary-color);">\${joinPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: \${joinPercent}%; background: var(--secondary-color);"></div></div>
            </div>
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0ea5e9" stroke-width="6" stroke-dasharray="\${2 * Math.PI * 20}" stroke-dashoffset="\${2 * Math.PI * 20 * (1 - recPercent / 100)}" class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">청구서 접수율</span><span style="font-size: 18px; font-weight: 800; color: #0ea5e9;">\${recPercent}%</span></div>
            </div>
            <div class="mini-chart-box" style="flex-direction: row !important; align-items: center;">
                <div class="mini-circle-svg-wrap">
                    <svg width="50" height="50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#0b0f19" stroke-width="6"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#fbbf24" stroke-width="6" stroke-dasharray="\${2 * Math.PI * 20}" stroke-dashoffset="\${2 * Math.PI * 20 * (1 - procPercent / 100)}" class="mini-donut-segment"/>
                    </svg>
                </div>
                <div><span style="font-size: 11px; color: var(--text-muted); display: block; font-weight: 700;">재무 검토율</span><span style="font-size: 18px; font-weight: 800; color: #fbbf24;">\${procPercent}%</span></div>
            </div>
            <div class="mini-chart-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                    <span>정산 종결 확정률</span><span style="color: #4ade80;">\${compPercent}%</span>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: \${compPercent}%; background: #4ade80;"></div></div>
            </div>
        `;
  }
}

/**
 * 📦 [4 탭 알맹이]: 대상자 개인별 마스터 원장 조회 레이아웃 문자열 반환 (오전 5시 54분 순정 원형)
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
        </div>
    `;
}

/**
 * 🔍 [4 탭 실시간 조회 로직 포트]
 */
function searchApplicantMasterLedger() {
  alert("가상 DB 마스터 원장 역산 정렬 조회를 가동합니다.");
}

/**
 * 🖨️ [3단계 엔진]: 하드웨어 인쇄 및 PDF 다운로드 스풀러 통제 [index: 0.1.414, 0.1.415]
 */
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
  alert(
    "[" +
      (mode === "summary" ? "통합 총괄 보고서" : "개인 원장 대장") +
      "] 관공서 증빙 규격 PDF 다운로드 스트림을 호출합니다.",
  );
  executeReportPrint(mode);
}

// 부모 admin.html의 상속 연동을 위한 전역 브릿지 바인딩 [index: 0.1.415]
window.calculateReportMasterStats = calculateReportMasterStats;
window.switchReportSubTab = switchReportSubTab;
window.executeReportPrint = executeReportPrint;
window.executeReportPDF = executeReportPDF;
window.searchApplicantMasterLedger = searchApplicantMasterLedger;
