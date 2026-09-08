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
  const data = window.dataStoreApplicant || [];

   // 1 탭 화면 슬롯 및 내부 주입 구역 색인
    const summaryRenderZone = document.getElementById("dom-summary-charts-render-zone");
    if (!summaryRenderZone) return;

    // ----------------------------------------------------------------------
    // [1 탭 데이터 계측 수식 대장 - 새벽 5시 오리지널]
    // ----------------------------------------------------------------------
    let totalN = data.length;
    let joinedCount = data.filter(d => !d.appStatusFlag || d.appStatusFlag === "참여" || d.appStatusFlag === "참여(정상)").length;
    let standbyCount = data.filter(d => d.appStatusFlag === "예비귀가").length;
    let dropoutCount = data.filter(d => d.appStatusFlag && d.appStatusFlag !== "참여" && d.appStatusFlag !== "참여(정상)" && d.appStatusFlag !== "예비귀가").length;

    let pay1Complete = data.filter(d => d.payStatus1 === "완료").length;
    let pay2Complete = data.filter(d => d.payStatus2 === "완료").length;
    let pay3Complete = data.filter(d => d.payStatus3 === "완료").length;

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
window.printReportSummaryMode = function() {
    document.body.classList.add('print-summary-mode'); // 격리 클래스 온
    window.print();                                    // 하드웨어 프린터 호출
    document.body.classList.remove('print-summary-mode'); // 클래스 반환 오프
};

  // [2 탭]: 과제 시험명 단위 모집 효율 분석
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
                    <div class="bar-label-group" style="margin-bottom:6px;"><span style="color:#ffffff; font-weight:700;">\${examName}</span><span style="color:var(--secondary-color); font-weight:700;">진행률 \${joinRate}% (\${g.joined}/\${g.total}명)</span></div>
                    <div class="bar-bg" style="height:12px;"><div class="bar-fill" style="width:\${joinRate}%; background:linear-gradient(90deg, var(--secondary-color) 0%, var(--success-color) 100%);"></div></div>
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

/**
 * 🔒 [3, 4 탭 실시간 탈락 사유 및 정산 원장 조회기 기믹]
 */
function renderDropoutAndLedgerTabs() {
  const data = window.dataStoreApplicant || [];

  // [3 탭]: 🔒 대표님 지정 9대 중도 탈락 사유 집계 대장
  const dropoutPanel = document.getElementById("report-tab-panel-dropout");
  if (dropoutPanel) {
    let reasons = {
      지각: 0,
      채혈: 0,
      스크리닝: 0,
      신검: 0,
      비협조: 0,
      임의행동: 0,
      폭언욕설: 0,
      규정위반: 0,
      개인사정: 0,
    };
    data.forEach((row) => {
      if (!row.appStatusFlag) return;
      let f = row.appStatusFlag.toString().trim();
      if (f.includes("지각")) reasons["지각"]++;
      else if (f.includes("채혈")) reasons["채혈"]++;
      else if (f.includes("스크리닝")) reasons["스크리닝"]++;
      else if (f.includes("신검")) reasons["신검"]++;
      else if (f.includes("비협조")) reasons["비협조"]++;
      else if (f.includes("임의행동")) reasons["임의행동"]++;
      else if (f.includes("폭언") || f.includes("욕설")) reasons["폭언욕설"]++;
      else if (f.includes("규정") || f.includes("위반")) reasons["규정위반"]++;
      else if (f.includes("개인") || f.includes("사정")) reasons["개인사정"]++;
    });

    let maxVal = Math.max(...Object.values(reasons), 1);
    let reasonRowsHtml = "";
    Object.keys(reasons).forEach((rKey) => {
      let count = reasons[rKey];
      let barPct = Math.round((count / maxVal) * 100);
      reasonRowsHtml += `
                <div class="bar-row" style="margin-bottom:12px;">
                    <div class="bar-label-group" style="margin-bottom:4px;"><span style="font-weight:700; color:#e2e8f0;">\${rKey}탈락</span><span style="color:var(--danger-color); font-weight:700;">\${count}명</span></div>
                    <div class="bar-bg" style="height:14px;"><div class="bar-fill" style="width:\${barPct}%; background:rgba(239, 68, 68, 0.85); box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);"></div></div>
                </div>
            `;
    });

    dropoutPanel.innerHTML = `
            <div class="chart-card">
                <h4><i class="fa-solid fa-user-slash"></i> 최고 권한자 전용 대상자 중도 탈락 사유 통제 대장</h4>
                <div style="font-size:12px; color:var(--text-muted);">대장 목록 및 인라인 수정판에서 적재된 탈락 플래그 사유가 실시간 연동 집계됩니다.</div>
                <div class="bar-chart-wrap">\${reasonRowsHtml}</div>
            </div>
        `;
  }

  // [4 탭]: 관공서 표준 대상자 개인별 정산 원장 조회 연산 기믹 (새벽 5시 오리지널 복원)
  const ledgerPanel = document.getElementById("report-tab-panel-ledger");
  if (ledgerPanel) {
    let rowsHtml = "";
    data.forEach((row) => {
      rowsHtml += `
                <tr>
                    <td style="text-align:center;">\${row.recKey || '2026-07-005'}</td>
                    <td style="text-align:left; font-weight:700;">\${row.title || ''}</td>
                    <td style="text-align:center;">\${row.th || ''}</td>
                    <td style="text-align:center; font-weight:700; color:#ffffff;">\${row.name || ''}</td>
                    <td style="text-align:center; font-family:monospace;">\${row.phone || ''}</td>
                    <td style="text-align:center;">\${row.inflowPath || '기타'}</td>
                    <td style="text-align:center;">\${row.appStatusFlag || '참여'}</td>
                    <td style="text-align:center; color:var(--warning-color); font-weight:700;">\${row.payStatus1 || '대기'}</td>
                    <td style="text-align:center; color:var(--warning-color); font-weight:700;">\${row.payStatus2 || '대기'}</td>
                    <td style="text-align:center; color:var(--warning-color); font-weight:700;">\${row.payStatus3 || '대기'}</td>
                </tr>
            `;
    });

    ledgerPanel.innerHTML = `
            <div class="chart-card" id="report-ledger-search-gate">
                <h4><i class="fa-solid fa-address-book"></i> 관공서 표준 대상자 개인별 정산 원장 대장 조회</h4>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="reportLedgerSearchName" placeholder="대상자 성명을 입력하세요" class="inline-input" style="max-width:250px; height:34px;" onkeyup="searchReportLedgerTable()">
                    <button type="button" class="btn-inline save" onclick="searchReportLedgerTable()" style="padding:0 15px; height:34px;">조회</button>
                    <button type="button" class="btn-inline list" onclick="window.printReportLedgerMode()" style="padding:0 15px; height:34px; background:#0284c7;">📄 원장 인쇄</button>
                </div>
            </div>
            <div class="table-responsive" id="report-master-ledger-viewport" style="margin-top:20px;">
                <table>
                    <thead>
                        <tr style="background-color:#0b0f19;">
                            <th style="text-align:center; width:110px;">과제번호</th>
                            <th style="text-align:left;">시험명</th>
                            <th style="text-align:center; width:60px;">기수</th>
                            <th style="text-align:center; width:80px;">이름</th>
                            <th style="text-align:center; width:125px;">전화번호</th>
                            <th style="text-align:center; width:90px;">참여경로</th>
                            <th style="text-align:center; width:90px;">참여상태</th>
                            <th style="text-align:center; width:80px;">1차참여비</th>
                            <th style="text-align:center; width:80px;">2차참여비</th>
                            <th style="text-align:center; width:80px;">3차참여비</th>
                        </tr>
                    </thead>
                    <tbody id="report-ledger-tbody-rows">
                        \${rowsHtml || '<tr><td colspan="10" style="text-align:center; color:var(--text-muted);">— 조회 가능한 대상자 원장 기록이 없습니다 —</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
  }

  // [5, 6 탭]: 준비중 모듈 스킨 활성화
  const crcPanel = document.getElementById("report-tab-panel-crc");
  if (crcPanel) {
    crcPanel.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> [5 탭]: 담당 CRC별 시험 통제 및 정산 실시간 효율 분석 모듈 준비 중입니다.</div>`;
  }

  const budgetPanel = document.getElementById("report-tab-panel-budget");
  if (budgetPanel) {
    budgetPanel.innerHTML = `<div class="report-preparing-box"><i class="fa-solid fa-hourglass-half"></i> [6 탭]: 차수별(1~3차) 참여비 미래 예측 스케줄러 배정 모듈 준비 중입니다.</div>`;
  }
}

/**
 * 🔍 성명 검색 엔진
 */
function searchReportLedgerTable() {
  var val = document
    .getElementById("reportLedgerSearchName")
    .value.trim()
    .toLowerCase();
  var rows = document.querySelectorAll("#report-ledger-tbody-rows tr");
  rows.forEach((row) => {
    var nameCell = row.cells[3]; // '이름' 열 정확히 포인팅 검증 완료
    if (nameCell) {
      var text = nameCell.textContent.toLowerCase();
      row.style.display = text.includes(val) ? "" : "none";
    }
  });
}

/**
 * 🔄 서브 탭 스위칭 라우터 엔진
 */
function switchReportSubTab(tabKey) {
  var tabs = ["summary", "recruitment", "dropout", "ledger", "crc", "budget"];
  tabs.forEach((key) => {
    var btn = document.querySelector(
      `button[onclick="switchReportSubTab('\${key}')"]`,
    );
    var panel = document.getElementById(`report-tab-panel-\${key}`);
    if (btn) btn.classList.remove("active");
    if (panel) panel.style.display = "none";
  });
  var activeBtn = document.querySelector(
    `button[onclick="switchReportSubTab('\${tabKey}')"]`,
  );
  var activePanel = document.getElementById(`report-tab-panel-\${tabKey}`);
  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) activePanel.style.display = "flex";
}

window.printReportLedgerMode = function () {
  document.body.classList.add("print-ledger-mode");
  window.print();
  document.body.classList.remove("print-ledger-mode");
};
window.printReportSummaryMode = function () {
  document.body.classList.add("print-summary-mode");
  window.print();
  document.body.classList.remove("print-summary-mode");
};
