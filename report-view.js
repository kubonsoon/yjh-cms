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

    //2탭: 시험별 모집/재무 현황
  } else if (tabKey === "recruitment") {
    // A. 마스터 데이터스토리지 트랜잭션 스트림 최신화 로드
    const recruitmentDB =
      JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];
    const applicantDB =
      JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];

    // B. 소집일자 기준 내림차순 정렬 (최신 미래 과제가 위로 오도록 락인)
    recruitmentDB.sort((a, b) => {
      const dateA = a.recDate
        ? a.recDate.replace(/[^0-9-]/g, "").trim()
        : "0000-00-00";
      const dateB = b.recDate
        ? b.recDate.replace(/[^0-9-]/g, "").trim()
        : "0000-00-00";
      return dateB.localeCompare(dateA);
    });

    // C. 동적 데이터 매트릭스 그리드 빌더 가동
    let htmlBuffer = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 15px;">
                <h4 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">
                    <i class="fa-solid fa-layer-group" style="color: var(--secondary-color); margin-right: 6px;"></i>
                    전산망 등록 임상시험별 마스터 모집 및 재무 실시간 통제 현황
                </h4>
            </div>
            <div class="table-responsive">
                <table style="width: 100% !important; table-layout: fixed !important; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="width: 25%; text-align: left; padding-left: 15px;">임상시험 과제명</th>
                            <th style="width: 8%;">진행기수</th>
                            <th style="width: 10%;">담당 CRC</th>
                            <th style="width: 12%;">소집일자</th>
                            <th style="width: 15%;">모집 진척도</th>
                            <th style="width: 30%;">재무 정산 현황 (피험자별 표준 지급 상태)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    if (recruitmentDB.length === 0) {
      htmlBuffer += `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px; font-weight: 700;">
                        전산망에 마운트된 모집공고 내역이 존재하지 않습니다.
                    </td>
                </tr>
            `;
    } else {
      // 문자열 특수기호 소독 포맷터 유틸리티
      const cleanStr = (str) =>
        str
          ? str
              .toString()
              .toLowerCase()
              .replace(/[^a-zA-Z0-9가-힣]/g, "")
              .trim()
          : "";

      recruitmentDB.forEach((rec) => {
        const recTitleClean = cleanStr(rec.title);
        const recThNum = (rec.th || "").replace(/[^0-9]/g, "");

        // 대상자 대장에서 해당 과제 및 기수와 100% 매칭되는 피험자 풀 필터링
        const matchedApplicants = applicantDB.filter((app) => {
          const appTitleClean = cleanStr(app.title);
          const appThNum = (app.th || "").replace(/[^0-9]/g, "");
          const isTitleMatched =
            appTitleClean === recTitleClean ||
            appTitleClean.includes(recTitleClean) ||
            recTitleClean.includes(appTitleClean);
          return isTitleMatched && recThNum === appThNum && recThNum !== "";
        });

        // 실시간 모집률 연산
        const goalCount = parseInt(rec.count) || 0;
        const activeJoined = matchedApplicants.filter(
          (app) => (app.payStatus || app.result || "참여") === "참여",
        ).length;
        const recruitmentPercent =
          goalCount > 0
            ? Math.min(Math.round((activeJoined / goalCount) * 100), 100)
            : 0;

        // 차수별/단계별 재무 상태 스캔 카운터 가동
        let receivedCount = 0;
        let processingCount = 0;
        let completeCount = 0;

        matchedApplicants.forEach((app) => {
          const payStatus = app.payStatus ? app.payStatus.trim() : "접수";
          if (payStatus === "접수") receivedCount++;
          else if (payStatus === "처리중") processingCount++;
          else if (payStatus === "완료") completeCount++;
        });

        // 기수 배지 색상 동적 매핑
        const thNum = parseInt(recThNum) || 1;
        let thClass = "lvl-1";
        if (thNum === 2) thClass = "lvl-2";
        else if (thNum === 3) thClass = "lvl-3";
        else if (thNum >= 4) thClass = "lvl-4";

        htmlBuffer += `
                    <tr>
                        <td style="text-align: left; padding-left: 15px; font-weight: 700; color: #ffffff;">${rec.title || "미지정 과제"}</td>
                        <td><span class="lvl-badge ${thClass}">${rec.th || "1기"}</span></td>
                        <td style="color: #38bdf8; font-weight: 600;">${rec.crc || "-"}</td>
                        <td style="font-weight: 700;"><i class="fa-regular fa-calendar-check" style="color: var(--text-muted); margin-right: 4px;"></i>${rec.recDate || "미정"}</td>
                        <td>
                            <div class="report-progress-wrapper">
                                <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; padding: 0 4px;">
                                    <span>${activeJoined}/${goalCount}명</span>
                                    <span style="color: var(--secondary-color);">${recruitmentPercent}%</span>
                                </div>
                                <div class="mini-bar-bg" style="margin-top: 2px;"><div class="mini-bar-fill" style="width: ${recruitmentPercent}%; background: var(--secondary-color);"></div></div>
                            </div>
                        </td>
                        <td>
                            <div class="report-financial-grid">
                                <span class="report-financial-badge" style="background: rgba(14, 165, 233, 0.12); border: 1px solid #0ea5e9; color: #38bdf8;">접수: ${receivedCount}건</span>
                                <span class="report-financial-badge" style="background: rgba(245, 158, 11, 0.12); border: 1px solid #f59e0b; color: #fbbf24;">검토: ${processingCount}건</span>
                                <span class="report-financial-badge" style="background: rgba(74, 222, 128, 0.12); border: 1px solid #22c55e; color: #4ade80;">완료: ${completeCount}건</span>
                            </div>
                        </td>
                    </tr>
                `;
      });
    }

    htmlBuffer += `
                    </tbody>
                </table>
            </div>
        `;
    viewport.innerHTML = htmlBuffer;
    // 2탭 : 시험별 모집/재무 현황 끝
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
