/**
 * 🔄 [전역 오케스트레이터] 보고서 탭 최초 개방 시 인프라 및 필터 동기화 자동 기동
 */
function initReportModule() {
  console.log("[시스템 가동] 보고서 통합 관제탑 모듈 리스너를 활성화합니다.");
  bindReportSummaryFilterEvents(); // 1탭 기간 필터 바인딩
  bindReportRecruitmentFilterEvents(); // 2탭 기간 필터 바인딩
}

/**
 * 🔄 [서브 탭 스위칭 라우터 엔진]: 6대 하위 관제탑 스위칭 가시성 통제 장치
 * 💡 본문 버튼의 onclick="switchReportSubTab('summary')" 등과 1:1 결합되어 뷰포트를 온오프 제어합니다.
 */
function switchReportSubTab(tabKey) {
  var tabs = ["summary", "recruitment", "dropout", "ledger", "crc", "budget"];

  console.log(`[라우터 탭 이동 트리거] 타겟 채널 포트 포커싱 ➡️ \${tabKey}`);

  // 1. 6개 가상 서브 탭 버튼의 하이라이트 active 클래스를 일제히 회수하고 실물 패널을 숨김 격리
  tabs.forEach(function (key) {
    // admin.html 본문 버튼 엘리먼트 추적
    var btn = document.querySelector(
      `button[onclick="switchReportSubTab('\${key}')"]`,
    );
    // 본문 가변형 슬롯 패널 div 추적
    var panel = document.getElementById(`report-tab-panel-\${key}`);

    if (btn) {
      btn.classList.remove("active");
    }
    if (panel) {
      panel.style.display = "none"; // 전체 락다운 숨김
    }
  });

  // 2. 대표님이 마크업하신 6대 패널 중 선택된 특정 부서 관제탑 레이아웃만 동적 개방 (display: flex)
  var activeBtn = document.querySelector(
    `button[onclick="switchReportSubTab('\${tabKey}')"]`,
  );
  var activePanel = document.getElementById(`report-tab-panel-\${tabKey}`);

  if (activeBtn) {
    activeBtn.classList.add("active"); // 액티브 스킨 주입
  }
  if (activePanel) {
    activePanel.style.display = "flex"; // 실물 컨테이너 와이드 개방
  }
}

/**
 * ⚙️ [1 탭 코어]: 년/월/주간 필터 셀렉트 박스 실시간 동기화 및 이벤트 바인딩
 */
function bindReportSummaryFilterEvents() {
  var elYear = document.getElementById("filter-report-year-summary");
  var elMonth = document.getElementById("filter-report-month-summary");
  var elWeek = document.getElementById("filter-report-week-summary");

  if (!elYear || !elMonth || !elWeek) return;

  elYear.onchange = function () {
    executeSummaryPipelineFiltering(elYear.value, elMonth.value, elWeek.value);
  };
  elMonth.onchange = function () {
    executeSummaryPipelineFiltering(elYear.value, elMonth.value, elWeek.value);
  };
  elWeek.onchange = function () {
    executeSummaryPipelineFiltering(elYear.value, elMonth.value, elWeek.value);
  };
}

function executeSummaryPipelineFiltering(year, month, week) {
  const fullData = window.dataStoreApplicant || [];
  console.log(
    `[1 탭 필터 트래킹] 조건 ➡️ 년도: \${year}년 | 월: \${month} | 주간: \${week} | 총 N수: \${fullData.length}명`,
  );
}

/**
 * ⚙️ [2 탭 코어]: 년/월/주간 필터 셀렉트 박스 실시간 동기화 및 이벤트 바인딩
 */
function bindReportRecruitmentFilterEvents() {
  var elYear = document.getElementById("filter-report-year-recruitment");
  var elMonth = document.getElementById("filter-report-month-recruitment");
  var elWeek = document.getElementById("filter-report-week-recruitment");

  if (!elYear || !elMonth || !elWeek) return;

  elYear.onchange = function () {
    executeRecruitmentPipelineFiltering(
      elYear.value,
      elMonth.value,
      elWeek.value,
    );
  };
  elMonth.onchange = function () {
    executeRecruitmentPipelineFiltering(
      elYear.value,
      elMonth.value,
      elWeek.value,
    );
  };
  elWeek.onchange = function () {
    executeRecruitmentPipelineFiltering(
      elYear.value,
      elMonth.value,
      elWeek.value,
    );
  };
}

function executeRecruitmentPipelineFiltering(year, month, week) {
  const fullData = window.dataStoreApplicant || [];
  console.log(
    `[2 탭 필터 트래킹] 조건 ➡️ 년도: \${year}년 | 월: \${month} | 주간: \${week} | 총 N수: \${fullData.length}명`,
  );
}

/**
 * 📄 [인쇄 엔진 하드웨어 포트 라우터 호출기]
 */
window.printReportSummaryMode = function () {
  document.body.classList.add("print-summary-mode");
  window.print();
  document.body.classList.remove("print-summary-mode");
};

/**
 * 📥 [관공서 증빙용 PDF 저장 엔진 피드백 트리거]
 */
window.executeReportPdfExport = function (tabKey) {
  alert(
    `[전산 시스템 알림]\n\n'[\${tabKey.toUpperCase()} 채널]'의 기간 조건 필터링 기준 관공서 증빙용 고해상도 PDF 내보내기를 시작합니다.`,
  );
  window.printReportSummaryMode();
};
