// 1. 전역 렌더링 오케스트레이터 허브 엔진 깨우기
function initReportModule() {
  renderReportSummaryAndRecruitmentTabs();
  if (typeof renderDropoutAndLedgerTabs === "function") {
    renderDropoutAndLedgerTabs();
  }
}

/**
 * 📈 1, 2 탭 독립 집계 및 그래프 렌더링
 */
function renderReportSummaryAndRecruitmentTabs() {
  // 가상 가동 데이터베이스 연동 및 무결성 검증
  const data = window.dataStoreApplicant || [];

  // 1 탭 화면 슬롯 및 내부 주입 구역 색인
  const summaryRenderZone = document.getElementById(
    "dom-summary-charts-render-zone",
  );
  if (!summaryRenderZone) return;

  // ----------------------------------------------------------------------
  // [1 탭 데이터 계측 수식 대장 - 새벽 5시 오리지널]
  // ----------------------------------------------------------------------
  let totalN = data.length;
  let joinedCount = data.filter(
    (d) =>
      !d.appStatusFlag ||
      d.appStatusFlag === "참여" ||
      d.appStatusFlag === "참여(정상)",
  ).length;
  let standbyCount = data.filter((d) => d.appStatusFlag === "예비귀가").length;
  let dropoutCount = data.filter(
    (d) =>
      d.appStatusFlag &&
      d.appStatusFlag !== "참여" &&
      d.appStatusFlag !== "참여(정상)" &&
      d.appStatusFlag !== "예비귀가",
  ).length;

  let pay1Complete = data.filter((d) => d.payStatus1 === "완료").length;
  let pay2Complete = data.filter((d) => d.payStatus2 === "완료").length;
  let pay3Complete = data.filter((d) => d.payStatus3 === "완료").length;

  // 백틱 잘림 방지형 실시간 격자 렌더링 주입
  summaryRenderZone.innerHTML = `
        <!-- 4대 요약 카드 스코어보드 층 -->
        <div id="report-scoreboard-cards">
            <div class="mini-chart-box">
                <div>
                    <span style="font-size:12px; color:var(--text-muted); font-weight:700;">총 대상자 풀 (N수)</span>
                    <h2 style="font-size:24px; font-weight:800; color:#ffffff; margin-top:4px;">\${totalN}명</h2>
                </div>
                <span style="font-size:11px; color:var(--secondary-color); font-weight:700;">정상 참여진행: \${joinedCount}명</span>
            </div>
            <div class="mini-chart-box">
                <div>
                    <span style="font-size:12px; color:#4ade80; font-weight:700;">예비귀가 자산 대기</span>
                    <h2 style="font-size:24px; font-weight:800; color:#4ade80; margin-top:4px;">\${standbyCount}명</h2>
                </div>
                <span style="font-size:11px; color:var(--text-muted);">예비비 8만원 정산 스케줄러 연동</span>
            </div>
            <div class="mini-chart-box">
                <div>
                    <span style="font-size:12px; color:var(--danger-color); font-weight:700;">🔒 총 탈락자 통제 대장</span>
                    <h2 style="font-size:24px; font-weight:800; color:var(--danger-color); margin-top:4px;">\${dropoutCount}명</h2>
                </div>
                <span style="font-size:11px; color:var(--text-muted);">대표 지정 9대 탈락사유 결합</span>
            </div>
            <div class="mini-chart-box">
                <div>
                    <span style="font-size:12px; color:var(--warning-color); font-weight:700;">1차 참여비 지급 완료</span>
                    <h2 style="font-size:24px; font-weight:800; color:var(--warning-color); margin-top:4px;">\${pay1Complete}건</h2>
                </div>
                <span style="font-size:11px; color:#cbd5e1;">전체 완료율: \${totalN ? Math.round((pay1Complete/totalN)*100) : 0}%</span>
            </div>
        </div>

        <!-- 둘째 줄 지표별 1:1 매칭 미니 수평 그래프 레이어 -->
        <div class="report-mini-charts-layer">
            <div class="mini-chart-box" style="min-height:95px !important; padding:12px 16px !important; gap:4px;">
                <div class="bar-label-group"><span>1차 참여비 완료 스코어</span><span>\${pay1Complete}건</span></div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:\${totalN ? (pay1Complete/totalN)*100 : 0}%; background:var(--secondary-color);"></div></div>
            </div>
            <div class="mini-chart-box" style="min-height:95px !important; padding:12px 16px !important; gap:4px;">
                <div class="bar-label-group"><span>2차 참여비 완료 스코어</span><span>\${pay2Complete}건</span></div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:\${totalN ? (pay2Complete/totalN)*100 : 0}%; background:var(--warning-color);"></div></div>
            </div>
            <div class="mini-chart-box" style="min-height:95px !important; padding:12px 16px !important; gap:4px;">
                <div class="bar-label-group"><span>3차 참여비 완료 스코어</span><span>\${pay3Complete}건</span></div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:\${totalN ? (pay3Complete/totalN)*100 : 0}%; background:var(--success-color);"></div></div>
            </div>
            <div class="mini-chart-box" style="min-height:95px !important; padding:12px 16px !important; gap:4px;">
                <div class="bar-label-group"><span>종합 예비귀가 정산율</span><span>\${standbyCount}건</span></div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:\${totalN ? (standbyCount/totalN)*100 : 0}%; background:#4ade80;"></div></div>
            </div>
        </div>
    `;
}

/**
 * 📄 [인쇄 엔진 라우터 트리거]
 */
window.printReportSummaryMode = function () {
  document.body.classList.add("print-summary-mode"); // 격리 클래스 온
  window.print(); // 하드웨어 프린터 호출
  document.body.classList.remove("print-summary-mode"); // 클래스 반환 오프
};
