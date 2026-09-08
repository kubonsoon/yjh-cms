// 1. 전역 렌더링 오케스트레이터 허브 엔진 깨우기
function initReportModule() {
  renderReportSummaryAndRecruitmentTabs();
  if (typeof renderDropoutAndLedgerTabs === "function") {
    renderDropoutAndLedgerTabs();
  }
}

/**
 * 📈 [1, 2 탭]: 독립 집계 및 그래프 렌더링 엔진
 */
function renderReportSummaryAndRecruitmentTabs() {
  // 가상 가동 데이터베이스 연동 및 무결성 검증
  const data = window.dataStoreApplicant || [];

  // ----------------------------------------------------------------------
  // [1 탭]: 종합 통계 실시간 지표 트래킹 연산 (새벽 5시 오리지널)
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

  const summaryPanel = document.getElementById("report-tab-panel-summary");
  if (summaryPanel) {
    summaryPanel.innerHTML = `
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

  // ----------------------------------------------------------------------
  // [2 탭]: 과제 시험명 단위 모집 효율 분석
  // ----------------------------------------------------------------------
  const recruitmentPanel = document.getElementById(
    "report-tab-panel-recruitment",
  );
  if (recruitmentPanel) {
    let examGroups = {};
    data.forEach((row) => {
      if (!row.title) return;
      if (!examGroups[row.title])
        examGroups[row.title] = { total: 0, joined: 0, dropout: 0 };
      examGroups[row.title].total++;
      if (
        !row.appStatusFlag ||
        row.appStatusFlag === "참여" ||
        row.appStatusFlag === "참여(정상)"
      )
        examGroups[row.title].joined++;
      else if (row.appStatusFlag !== "예비귀가")
        examGroups[row.title].dropout++;
    });

    let rowsHtml = "";
    Object.keys(examGroups).forEach((examName) => {
      let g = examGroups[examName];
      let joinRate = g.total ? Math.round((g.joined / g.total) * 100) : 0;
      rowsHtml += `
                <div class="bar-row" style="margin-bottom:12px; padding:10px; border-radius:6px; border:1px solid var(--border-color); background: rgba(255,255,255,0.01);">
                    <div class="bar-label-group" style="margin-bottom:6px;">
                        <span style="color:#ffffff; font-weight:700;">\text{\${examName}}</span>
                        <span style="color:var(--secondary-color); font-weight:700;">진행률 \${joinRate}% (\${g.joined}/\${g.total}명)</span>
                    </div>
                    <div class="bar-bg" style="height:12px;">
                        <div class="bar-fill" style="width:\${joinRate}%; background:linear-gradient(90deg, var(--secondary-color) 0%, var(--success-color) 100%);"></div>
                    </div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">내부 통제 중도 탈락 인원: \${g.dropout}명</div>
                </div>
            `;
    });

    recruitmentPanel.innerHTML = `
            <div class="chart-card">
                <h4><i class="fa-solid fa-layer-group"></i> 과제별 실시간 집행 상태 및 모집 효율 분석</h4>
                <div class="bar-chart-wrap">\${rowsHtml || '<div class="report-preparing-box">— 가동 중인 과제별 모집 데이터 개체가 존재하지 않습니다 —</div>'}</div>
            </div>
        `;
  }
}
