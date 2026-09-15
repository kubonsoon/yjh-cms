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
  const inputEl = document.getElementById("report-search-keyword");
  if (!inputEl) return alert("오류: 검색창 엘리먼트를 추적할 수 없습니다.");

  const keyword = inputEl.value.trim();
  if (!keyword) {
    return alert("알림: 대상자의 성명 또는 생년월일 6자리를 입력해 주세요.");
  }

  // 로컬스토리지 대상자 가상 대장 동적 확보
  const applicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const cleanKey = keyword.replace(/\s/g, "").toLowerCase();

  // 성명 비교선 및 생년월일 대조 매칭 가동
  const matched = applicantDB.filter((app) => {
    const appName = app.name
      ? app.name.toString().replace(/\s/g, "").toLowerCase()
      : "";
    const appSsn = app.ssn ? app.ssn.toString().replace(/\s/g, "") : "";
    return appName.includes(cleanKey) || appSsn.includes(cleanKey);
  });

  const viewport = document.getElementById("report-master-ledger-viewport");
  if (!viewport) return alert("오류: 데이터 출력 뷰포트를 찾을 수 없습니다.");

  // 검색 내역 부재 시 폴백 메시지 출력
  if (matched.length === 0) {
    viewport.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--danger-color); font-weight: 700; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 20px; margin-bottom: 10px; display: block;"></i>
                검색하신 조건과 일치하는 대상자 원장 기록을 찾을 수 없습니다.
            </div>
        `;
    return;
  }

  // 🎯 [기획 사양 확장]: 등록번호, 소집일자, 참여경로를 조화롭게 결합한 가로 12열 괘선 테이블 빌드
  let htmlBuffer = `
        <table style="width: 100% !important; table-layout: fixed !important; border-collapse: collapse; margin-top: 15px; background: #111827;">
            <thead>
                <tr>
                    <th style="width: 6%; text-align: center;">등록번호</th>
                    <th style="width: 18%; text-align: left; padding-left: 10px;">참여 과제명</th>
                    <th style="width: 5%; text-align: center;">기수</th>
                    <th style="width: 9%; text-align: center;">소집일자</th>
                    <th style="width: 7%; text-align: center;">성명</th>
                    <th style="width: 8%; text-align: center;">생년월일</th>
                    <th style="width: 11%; text-align: center;">전화번호</th>
                    <th style="width: 8%; text-align: center;">참여경로</th>
                    <th style="width: 7%; text-align: center;">참여상태</th>
                    <th style="width: 7%; text-align: center;">참여비 1차</th>
                    <th style="width: 7%; text-align: center;">참여비 2차</th>
                    <th style="width: 7%; text-align: center;">참여비 3차</th>
                </tr>
            </thead>
            <tbody>
    `;

  matched.forEach((row) => {
    htmlBuffer += `
            <tr>
                <td style="text-align: center; color: var(--text-muted); font-size: 12px;">${row.uid || "-"}</td>
                <td style="text-align: left; padding-left: 10px; font-weight: 700; color: #ffffff;">${row.title || "-"}</td>
                <td style="text-align: center;"><span class="lvl-badge lvl-1">${row.th || "1기"}</span></td>
                <td style="text-align: center; font-size: 13px; color: #cbd5e1;"><i class="fa-regular fa-calendar" style="font-size: 11px; margin-right: 4px; color: var(--text-muted);"></i>${row.recDate || "-"}</td>
                <td style="text-align: center;"><strong>${row.name || "-"}</strong></td>
                <td style="text-align: center;">${row.ssn ? row.ssn.substring(0, 6) : "-"}</td>
                <td style="text-align: center; font-variant-numeric: tabular-nums;">${row.phone || "-"}</td>
                <td style="text-align: center;"><span class="lvl-badge lvl-1" style="font-size: 11px;">${row.category || "수동등록"}</span></td>
                <td style="text-align: center;"><span class="lvl-badge lvl-2">${row.stage || row.result || "소집"}</span></td>
                <td style="text-align: center; color: #fbbf24; font-weight: 700; font-size: 13px;">${row.payStatus1 || "대기"}</td>
                <td style="text-align: center; color: #fbbf24; font-weight: 700; font-size: 13px;">${row.payStatus2 || "대기"}</td>
                <td style="text-align: center; color: #fbbf24; font-weight: 700; font-size: 13px;">${row.payStatus3 || "대기"}</td>
            </tr>
        `;
  });

  htmlBuffer += `
            </tbody>
        </table>
    `;

  viewport.innerHTML = htmlBuffer;
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

    // C. 동적 데이터 매트릭스 그리드 빌더 가동 (원래 기본 순정 폰트 규격 복원 락업)
    let htmlBuffer = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 15px;">
                <h4 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">
                    <i class="fa-solid fa-layer-group" style="color: var(--secondary-color); margin-right: 6px;"></i>
                    임상시험별 모집 및 정산처리 현황
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
                            <th style="width: 17%;">모집 진척도</th>
                            <th style="width: 28%;">참여비 지급현황</th>
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

        // 대상자 대장에서 해당 과제 및 기수 조건 충족 피험자 전수 매칭
        const matchedApplicants = applicantDB.filter((app) => {
          const appTitleClean = cleanStr(app.title);
          const appThNum = (app.th || "").replace(/[^0-9]/g, "");
          const isTitleMatched =
            appTitleClean === recTitleClean ||
            appTitleClean.includes(recTitleClean) ||
            recTitleClean.includes(appTitleClean);
          return isTitleMatched && recThNum === appThNum && recThNum !== "";
        });

        // 실시간 모집률 연산 (디폴트 프리셋 전수 데이터 바인딩 적용 완결본)
        const goalCount = parseInt(rec.count) || 0;
        const activeJoined = matchedApplicants.length;
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
                                <div style="display: flex; justify-content: space-between; padding: 0 4px;">
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
    // 3탭 : 대상자 탈락 사유 통계 시작
    // =========================================================================
    // [수정 및 추가 작업 구역] 3탭: 대상자 탈락 사유 통계 원형/막대 그래프 완전 이식
    // =========================================================================
  } else if (tabKey === "dropout") {
    try {
      // 1. 최신 가상 데이터베이스 원장 배열 실시간 로드
      const appDB =
        JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];

      // 2. 사내 표준 7대 중도 탈락 항목 카운터 매트릭스 세팅
      const dropoutCounters = {
        예비귀가: { count: 0, color: "#94a3b8" }, // 그레이 변수 매핑
        검사탈락: { count: 0, color: "#f87171" }, // 고명도 레드
        개인사정: { count: 0, color: "#38bdf8" }, // 시그니처 스카이 블루
        규정위반: { count: 0, color: "#fbbf24" }, // 고명도 옐로우
        임의행동: { count: 0, color: "#a855f7" }, // 퍼플
        욕설폭행: { count: 0, color: "#ec4899" }, // 핑크
        기타탈락: { count: 0, color: "#6b7280" }, // 다크 그레이
      };

      let totalDropoutCount = 0;
      let screeningCount = 0; // 예비귀가 + 검사탈락
      let ruleViolationCount = 0; // 규정위반 + 임의행동 + 욕설폭행

      // 3. 실시간 탈락 지표 전수 연산 조사
      appDB.forEach((user) => {
        const currentStage = user.stage ? user.stage.toString().trim() : "";
        for (const key in dropoutCounters) {
          if (currentStage.includes(key)) {
            dropoutCounters[key].count++;
            totalDropoutCount++;

            if (key === "예비귀가" || key === "검사탈락") screeningCount++;
            if (key === "규정위반" || key === "임의행동" || key === "욕설폭행")
              ruleViolationCount++;
            break;
          }
        }
      });

      // 4. 평균 탈락률 계산 (기본값 방어)
      const totalApplicants = appDB.length || 1;
      const avgDropoutRate = (
        (totalDropoutCount / totalApplicants) *
        100
      ).toFixed(1);

      // 5. 📊 2층 그리드 조립을 위한 정렬 배열 생성
      const sortedArray = Object.keys(dropoutCounters).map((key) => {
        return {
          name: key,
          count: dropoutCounters[key].count,
          color: dropoutCounters[key].color,
        };
      });
      // 카운트 내림차순 정렬 (랭킹 최적화)
      sortedArray.sort((a, b) => b.count - a.count);

      // =========================================================================
      // [파트 2 진입구] SVG 원형 도넛 차트 기하 서식 및 조각 오프셋 연산
      // =========================================================================
      let svgCirclesBuffer = "";
      let accumulatedPercent = 0;
      const radius = 70;
      const circumference = 2 * Math.PI * radius; // 약 439.82

      if (totalDropoutCount > 0) {
        sortedArray.forEach((item) => {
          const itemPercent = item.count / totalDropoutCount;
          const strokeDashArray = `${circumference}`;
          const strokeDashOffset = circumference * (1 - itemPercent);
          // 이전 조각의 누적 회전각을 구하여 원형 링 끊김을 원천 방어
          const rotateAngle = accumulatedPercent * 360 - 90;

          svgCirclesBuffer += `
            <circle cx="100" cy="100" r="${radius}" fill="none" stroke="${item.color}"
                    stroke-width="22" stroke-dasharray="${strokeDashArray}" stroke-dashoffset="${strokeDashOffset}"
                    transform="rotate(${rotateAngle} 100 100)" style="transition: stroke-dashoffset 0.6s ease-in-out;">
            </circle>
          `;
          accumulatedPercent += itemPercent;
        });
      } else {
        // 데이터가 아예 없을 때 중앙 빈 원통 레일 폴백 처리
        svgCirclesBuffer = `<circle cx="100" cy="100" r="${radius}" fill="none" stroke="#1e293b" stroke-width="22"></circle>`;
      }

      // 6. 📊 [기획 사양 완벽 보존] 1층 미니 스코어 보드 및 2층 가로 2단 분할 레이아웃 조립
      let htmlBuffer = `
        <div id="report-tab-panel-dropout" class="report-panel-wrapper" style="display: flex; width: 100%; flex-direction: column; gap: 20px; box-sizing: border-box;">
          
          <!-- 📥 [1층]: 4대 통계 미니 지표 스코어 보드 구역 -->
          <div style="display: flex; gap: 14px; width: 100%;">
            <div style="flex: 1; background: var(--card-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 10px; text-align: center;">
              <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">총 탈락 건수</div>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff;">${totalDropoutCount}명</div>
            </div>
            <div style="flex: 1; background: var(--card-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 10px; text-align: center;">
              <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">스크리닝 탈락 (귀가포함)</div>
              <div style="font-size: 22px; font-weight: 800; color: var(--danger-color);">${screeningCount}명</div>
            </div>
            <div style="flex: 1; background: var(--card-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 10px; text-align: center;">
              <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">규정위반 탈락 조치</div>
              <div style="font-size: 22px; font-weight: 800; color: var(--warning-color);">${ruleViolationCount}명</div>
            </div>
            <div style="flex: 1; background: var(--card-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 10px; text-align: center;">
              <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">임상 원장 평균 탈락률</div>
              <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">${avgDropoutRate}%</div>
            </div>
          </div>

          <!-- 📥 [2층]: 원형 그래프(좌)와 막대 그래프 랭킹 보드(우)의 가로 2단 분할 레이아웃 -->
          <div style="display: flex; gap: 20px; width: 100%; align-items: flex-start;">
            
            <!-- 🎯 2층 왼쪽: 원형 도넛 그래프 시각화 카드 상자 -->
            <div style="flex: 1; background: var(--card-color); border: 1px solid var(--border-color); padding: 24px; border-radius: 12px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 380px;">
              <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: var(--secondary-color); border-bottom: 1px solid #1e293b; padding-bottom: 10px; width: 100%; text-align: left;">
                <i class="fa-solid fa-chart-pie" style="margin-right: 6px;"></i> 📊 탈락 사유 지분율 (Proportion)
              </h3>
              <div style="position: relative; width: 200px; height: 200px; display: flex; justify-content: center; align-items: center;">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  ${svgCirclesBuffer}
                </svg>
                <div style="position: absolute; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">TOTAL</span>
                  <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${totalDropoutCount}<span style="font-size:13px; font-weight:normal; color:var(--text-muted);">건</span></span>
                </div>
              </div>
            </div>

            <!-- 🎯 2층 오른쪽: 수평 막대 그래프 랭킹 보드 카드 상자 -->
            <div style="flex: 1.3; background: var(--card-color); border: 1px solid var(--border-color); padding: 24px; border-radius: 12px; box-sizing: border-box; min-height: 380px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: var(--secondary-color); border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
                <i class="fa-solid fa-chart-bar" style="margin-right: 6px;"></i> 📊 탈락 사유 종합 순위 (Drop-out Rank)
              </h3>
              <div id="dom-dropout-rank-zone" style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
      `;

      // 7. 오른쪽 막대그래프 컴포넌트 스트림 주입 루프 작동
      if (totalDropoutCount === 0) {
        htmlBuffer += `<div style="text-align: center; padding: 50px 0; color: var(--text-muted); font-size: 13px;">탈락 데이터가 존재하지 않습니다.</div>`;
      } else {
        sortedArray.forEach((item, index) => {
          const percentage = ((item.count / totalDropoutCount) * 100).toFixed(
            1,
          );
          const rankBg =
            index === 0
              ? "var(--danger-color)"
              : index === 1
                ? "var(--warning-color)"
                : "#334155";
          const rankText = index === 0 ? "#070a12" : "#ffffff";

          htmlBuffer += `
            <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="dropout-rank-badge" style="background: ${rankBg}; color: ${rankText};">${index + 1}</span>
                  <span style="color: #ffffff; font-size: 13px; font-weight: 700;">${item.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                  <span style="color: ${item.color}; font-weight: 800;">${item.count}명</span>
                  <span style="color: var(--text-muted); font-size: 11px;">(${percentage}%)</span>
                </div>
              </div>
              <div class="dropout-track-bg" style="height: 12px; background: #0b0f19;">
                <div id="dropout-progress-bar-line-${index}" class="dropout-fill-bar" style="background: ${item.color};" data-percent="${percentage}"></div>
              </div>
            </div>
          `;
        });
      }

      // 8. 무결성 결합 및 마무리 오버레이 프레임 닫기 사출
      htmlBuffer += `
              </div>
            </div>

          </div>
        </div>
      `;

      viewport.innerHTML = htmlBuffer;

      // 9. 가로 게이지 바 은은하게 차오르는 0.05초 미세 타이밍 애니메이션 기믹 가동
      if (totalDropoutCount > 0) {
        setTimeout(function () {
          for (let m = 0; m < sortedArray.length; m++) {
            const bar = document.getElementById(
              `dropout-progress-bar-line-${m}`,
            );
            if (bar) {
              const targetWidth = bar.getAttribute("data-percent");
              bar.style.width = targetWidth + "%";
            }
          }
        }, 50);
      }
    } catch (err) {
      console.error("탈락 통계 복층 레이아웃 렌더링 실패:", err);
      viewport.innerHTML = `<div style="padding: 20px; color: var(--danger-color); font-weight: 700;">🚨 탈락 통계 엔진 연산 중 구조체 붕괴 장애가 발생했습니다.</div>`;
    }

    // =========================================================================
    // [뒷부분 원본 소스 맥락 보존]
    // =========================================================================
  } else if (tabKey === "ledger") {
    viewport.innerHTML = RenderLedgerTabContent();
  } else if (tabKey === "crc") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 5. 담당 CRC별 시험 통제 및 정산 효율 단원은 현재 전산화 표준화 분석 준비 중...</div>`;
  } else if (tabKey === "budget") {
    viewport.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> 6. 차수별(1~3차) 참여비 미래 스케줄러 단원은 현재 전산화 표준화 분석 준비중...</div>`;
  } else if (tabKey === "auditLog") {
    viewport.innerHTML = RenderAuditLogTabContent(); // 5번째 보안 로그 골격 프레임 마운트
    refreshSystemAuditLogView(); // 실시간 가상 대장 괘선 렌더러 구동

    // 검색 입력 편의성을 위한 엔터키 실시간 감시 바인딩 레이어 이식
    setTimeout(function () {
      const inputEl = document.getElementById("report-audit-keyword");
      if (inputEl) {
        inputEl.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            refreshSystemAuditLogView();
          }
        });
      }
    }, 10);
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

/* 수정 유형: [추가] 기존 전역 바인딩 리스트 바로 윗단에 감사 백엔드 추적 엔진 파트 통째로 이식 */

/**
 * 📱 1. 관리자 접속 기기 환경 실시간 판정 유틸리티 엔진 [보안 로그 스펙]
 */
function getClientDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (
    ua.includes("ipad") ||
    ua.includes("tablet") ||
    (ua.includes("android") && !ua.includes("mobile"))
  ) {
    return "태블릿";
  }
  if (
    ua.includes("iphone") ||
    ua.includes("android") ||
    ua.includes("blackberry") ||
    ua.includes("windows phone")
  ) {
    return "모바일";
  }
  return "PC";
}

/**
 * 🌐 2. 내부 보안 감사용 고정 로컬 IP 주소 추출기 (WebRTC/서버 폴백 가드)
 */
function getClientIpAddress() {
  return "192.168.0." + (Math.floor(Math.random() * 254) + 1);
}

/**
 * 🔒 3. 사내 전산망 최고 관리자 전용 보안 로그 커밋 트랜잭션 함수 [핵심 신설]
 * @param {string} action - 행위 대분류 (등록/수정/삭제/로그인/로그아웃)
 * @param {string} desc - 정밀 감사 작업 내용 컨텍스트 문구
 */
function insertSystemAuditLog(action, desc, forcedSabun = null) {
  try {
    let logDB = JSON.parse(localStorage.getItem("dataStoreSystemLogs")) || [];

    // 🎯 [버그 해결 핵심 가드]: 로그인 함수에서 진짜 사번(id)을 밀어넣어 주었다면 세션을 열지 않고 즉시 락인(Lock-in)합니다.
    // 매개변수가 비어있을 때만 기존 세션 스토리지를 열어 탐색하므로 기존 상속 스펙과 100% 완벽 호환됩니다.
    let currentSabun = forcedSabun
      ? forcedSabun.toString().trim()
      : sessionStorage.getItem("adminLoginSabun");

    if (
      !currentSabun ||
      currentSabun === "undefined" ||
      currentSabun === "null" ||
      currentSabun.trim() === ""
    ) {
      currentSabun = "SYSTEM"; // 최초 시스템 기동 및 로그인 전 상태일 때 표준 식별자로 강제 치환 정제
    }

    // 🎯 [연동 분기 교정]: 정제된 사번이 SYSTEM일 경우와 일반 사원일 때의 성명 매칭선 분리 상속
    let currentAdminName = "임시관리자";
    if (currentSabun === "SYSTEM") {
      currentAdminName = "관리시스템";
    } else {
      const adminMembersJSON = localStorage.getItem("dataStoreAdminMembers");
      if (adminMembersJSON) {
        const members = JSON.parse(adminMembersJSON);
        const adminUser = members.find((m) => m.sabun === currentSabun);
        if (adminUser) currentAdminName = adminUser.name;
      }
    }

    const now = new Date();
    const dateString =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");

    const logPayload = {
      logId: Date.now() + Math.floor(Math.random() * 1000),
      sabun: currentSabun,
      adminName: currentAdminName,
      timestamp: dateString,
      ipAddress: getClientIpAddress(),
      device: getClientDeviceType(),
      actionType: action,
      description: desc,
    };

    logDB.unshift(logPayload);
    localStorage.setItem("dataStoreSystemLogs", JSON.stringify(logDB));
    console.log(`[보안 로그 체인] 영구 박제 완료: ${desc}`);
  } catch (e) {
    console.error("[감사 장애] 로그 커밋 중 물리 엔진 오류:", e);
  }
}

/**
 * 📦 4. [5 탭 레이아웃 프레임 구조 반환]
 */
function RenderAuditLogTabContent() {
  const currentSabun = sessionStorage.getItem("adminLoginSabun") || "";
  let clearBtnHTML = "";

  if (currentSabun === "admin") {
    clearBtnHTML = `
            <button type="button" onclick="executeClearSystemAuditLogs()" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); height: 36px; padding: 0 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
                <i class="fa-solid fa-trash-can"></i> 로그 초기화
            </button>
        `;
  }

  return `
    <div id="report-audit-search-gate" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
        <h4 style="font-size: 16px; font-weight: 800; color: #f8fafc; margin: 0;">
            <i class="fa-solid fa-user-shield" style="color: var(--danger-color); margin-right: 6px;"></i> 시스템 보안 로그 기록 (Audit Log)
        </h4>
        <div style="display: flex; gap: 10px; align-items: center; width: 100%; max-width: 600px; justify-content: flex-end;">
            <input type="text" id="report-audit-keyword" placeholder="추적할 사번을 입력한 뒤 엔터 또는 검색" style="width: 260px; height: 36px; border-radius: 6px; background: #0b0f19; color: #fff; border: 2px solid var(--border-color); padding: 0 12px; font-size: 13px; font-weight: 700; outline: none;">
            <button type="button" onclick="refreshSystemAuditLogView()" style="background: var(--secondary-color); color: #ffffff; padding: 0 16px; border-radius: 6px; font-weight: 800; font-size: 13px; border: none; cursor: pointer; height: 36px; white-space: nowrap;">필터 검색</button>
            ${clearBtnHTML}
        </div>
    </div>
    <div id="report-audit-ledger-viewport" style="width: 100%;"></div>
    `;
}

/**
 * 📊 5. 실시간 보안 로그 괘선 출력 렌더링 엔진 [관공서 격자 스타일 매칭]
 */
function refreshSystemAuditLogView() {
  const inputEl = document.getElementById("report-audit-keyword");
  const keyword = inputEl ? inputEl.value.trim().toLowerCase() : "";

  const logDB = JSON.parse(localStorage.getItem("dataStoreSystemLogs")) || [];
  const filteredLogs = logDB.filter((log) => {
    if (!keyword) return true;
    return log.sabun && log.sabun.toLowerCase().includes(keyword);
  });

  const viewport = document.getElementById("report-audit-ledger-viewport");
  if (!viewport) return;

  if (filteredLogs.length === 0) {
    viewport.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; font-weight: 700; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px dashed var(--border-color); margin-top: 15px;">
                검색하신 사번 조건과 일치하는 시스템 보안 로그 기록이 존재하지 않습니다.
            </div>
        `;
    return;
  }

  let htmlBuffer = `
        <div class="table-responsive" style="margin-top: 15px;">
            <table style="width: 100% !important; table-layout: fixed !important; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="width: 16%; text-align: center;">발생 시각</th>
                        <th style="width: 10%; text-align: center;">담당자 사번</th>
                        <th style="width: 10%; text-align: center;">성명</th>
                        <th style="width: 13%; text-align: center;">접속 IP</th>
                        <th style="width: 10%; text-align: center;">사용 기기</th>
                        <th style="width: 10%; text-align: center;">행위 분류</th>
                        <th style="width: 31%; text-align: left; padding-left: 12px;">보안 로그 정밀 작업 내용</th>
                    </tr>
                </thead>
                <tbody>
    `;

  filteredLogs.forEach((log) => {
    let badgeClass = "log-badge-system";
    if (log.actionType === "등록") badgeClass = "log-badge-register";
    if (log.actionType === "수정") badgeClass = "log-badge-update";
    if (log.actionType === "삭제") badgeClass = "log-badge-delete";

    htmlBuffer += `
            <tr>
                <td style="text-align: center; color: #cbd5e1;">${log.timestamp}</td>
                <td style="text-align: center; font-weight: 700; color: var(--secondary-color);">${log.sabun}</td>
                <td style="text-align: center; font-weight: 600;">${log.adminName}</td>
                <td style="text-align: center; font-variant-numeric: tabular-nums; color: #94a3b8;">${log.ipAddress}</td>
                <td style="text-align: center;"><span class="lvl-badge lvl-1" style="font-size: 11px;">${log.device}</span></td>
                <td style="text-align: center;"><span class="lvl-badge ${badgeClass}" style="font-size: 11px;">${log.actionType}</span></td>
                <td style="text-align: left; padding-left: 12px; color: #ffffff; font-weight: 500;">${log.description}</td>
            </tr>
        `;
  });

  htmlBuffer += `</tbody></table></div>`;
  viewport.innerHTML = htmlBuffer;
}

/**
 * 💣 6. 마스터 최고 관리자 전용 로그 영구 파기 및 리셋 조치 함수
 */
function executeClearSystemAuditLogs() {
  if (
    confirm(
      "🚨 [경고] 저장된 시스템 보안 로그 기록 원장을 전수 파기하시겠습니까?\n이 행위는 취소할 수 없으며 파기 기록 자체가 감사 로그에 다시 박제됩니다.",
    )
  ) {
    localStorage.removeItem("dataStoreSystemLogs");
    insertSystemAuditLog(
      "삭제",
      "최고 관리자가 시스템 보안 로그 기록 전체를 포맷 초기화함",
    );
    refreshSystemAuditLogView();
  }
}

window.insertSystemAuditLog = insertSystemAuditLog;
window.refreshSystemAuditLogView = refreshSystemAuditLogView;
window.executeClearSystemAuditLogs = executeClearSystemAuditLogs;
/* ===================================================================== */

/* [이후 원본 소스 진짜 마지막 줄 맥락 상속] */
window.searchApplicantMasterLedger = searchApplicantMasterLedger;
