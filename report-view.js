// 전역 렌더링 오케스트레이터 허브 기동
function initReportModule() {
  renderReportSummaryAndRecruitmentTabs();
  if (typeof renderDropoutAndLedgerTabs === "function") {
    renderDropoutAndLedgerTabs();
  }
}

/**
 * 📈 [1, 2 탭 마스터 렌더러 엔진]
 */
function renderReportSummaryAndRecruitmentTabs() {
  const data = window.dataStoreApplicant || [];

  // ----------------------------------------------------------------------
  // [1 탭]: 종합 통계 관제탑 데이터 실시간 트래킹 연산
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
  // [2 탭]: 과제 시험별 모집 상태 효율 집계
  // ----------------------------------------------------------------------
  const recruitmentPanel = document.getElementById(
    "report-tab-panel-recruitment",
  );
  if (recruitmentPanel) {
    let examGroups = {};
    data.forEach((row) => {
      if (!row.title) return;
      if (!examGroups[row.title]) {
        examGroups[row.title] = { total: 0, joined: 0, dropout: 0 };
      }
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
                        <span style="color:#ffffff; font-weight:700;">\${examName}</span>
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
                <div class="bar-chart-wrap">
                    \${rowsHtml || '<div class="report-preparing-box">— 가동 중인 과제별 모집 데이터 개체가 존재하지 않습니다 —</div>'}
                </div>
            </div>
        `;
  }
}

/**
 * 🔒 [3 탭]: 대상자 탈락 사유 통계 대장 연산 엔진
 */
function renderDropoutAndLedgerTabs() {
  const data = window.dataStoreApplicant || [];
  const dropoutPanel = document.getElementById("report-tab-panel-dropout");

  if (dropoutPanel) {
    // 🎯 대표님 지정 9대 핵심 사유 원형 매트릭스 수립 및 카운팅
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
      // 단어 파싱 보정 (지각탈락 ➡️ 지각 등)
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
                    <div class="bar-label-group" style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
                        <span style="font-weight:700; color:#e2e8f0;">\${rKey === '참여' ? '참여(정상)' : rKey + '탈락'}</span>
                        <span style="color:var(--danger-color); font-weight:700;">\${count}명</span>
                    </div>
                    <div class="bar-bg" style="height:14px; background:#0b0f19; border-radius:4px; overflow:hidden; width:100%;">
                        <div class="bar-fill" style="width:\${barPct}%; height:100%; border-radius:4px; transition: width 0.6s ease-in-out; background:rgba(239, 68, 68, 0.85); box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);"></div>
                    </div>
                </div>
            `;
    });

    dropoutPanel.innerHTML = `
            <div class="chart-card" style="background: var(--card-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                    <i class="fa-solid fa-user-slash"></i> 최고 권한자 전용 대상자 중도 탈락 사유 통제 대장
                </h4>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:2px;">명단 대장 및 인라인 수정창에서 반영된 탈락 플래그 사유가 실시간 집계 차트로 피드됩니다.</div>
                <div class="bar-chart-wrap" style="display:flex; flex-direction:column; gap:12px; padding-top:10px;">\${reasonRowsHtml}</div>
            </div>
        `;
  }

  // ----------------------------------------------------------------------
  // [4 탭]: 대상자 개인별 마스터 정산 원장 조회 연산 기믹
  // ----------------------------------------------------------------------
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
            <div class="chart-card" id="report-ledger-search-gate" style="background: var(--card-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                    <i class="fa-solid fa-address-book"></i> 관공서 표준 대상자 개인별 정산 원장 대장 조회
                </h4>
                <div style="display:flex; gap:10px; margin-bottom:2px;">
                    <input type="text" id="reportLedgerSearchName" placeholder="대상자 성명을 입력하세요" class="inline-input" style="max-width:250px; height:34px; padding:8px 10px; border:2px solid var(--warning-color); background-color:#0b0f19; color:#ffffff; border-radius:6px; font-size:13px;" onkeyup="searchReportLedgerTable()">
                    <button type="button" class="btn-inline save" onclick="searchReportLedgerTable()" style="padding:0 15px; height:34px; background: var(--success-color); color: #070a12; border:none; border-radius:6px; font-weight:700; cursor:pointer;">조회</button>
                    <button type="button" class="btn-inline list" onclick="window.printReportLedgerMode()" style="padding:0 15px; height:34px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">📄 원장 인쇄</button>
                </div>
            </div>
            <div class="table-responsive" id="report-master-ledger-viewport" style="width:100%; overflow-x:auto; border-radius:10px; border:1px solid var(--border-color); margin-top:20px;">
                <table style="width:100%; border-collapse:collapse; font-size:14px; background:#111827;">
                    <thead>
                        <tr style="background-color:#0b0f19;">
                            <th style="text-align:center; width:110px; color:#ffffff; padding:16px 14px; font-weight:700;">과제번호</th>
                            <th style="text-align:left; color:#ffffff; padding:16px 14px; font-weight:700;">시험명</th>
                            <th style="text-align:center; width:60px; color:#ffffff; padding:16px 14px; font-weight:700;">기수</th>
                            <th style="text-align:center; width:80px; color:#ffffff; padding:16px 14px; font-weight:700;">이름</th>
                            <th style="text-align:center; width:125px; color:#ffffff; padding:16px 14px; font-weight:700;">전화번호</th>
                            <th style="text-align:center; width:90px; color:#ffffff; padding:16px 14px; font-weight:700;">참여경로</th>
                            <th style="text-align:center; width:90px; color:#ffffff; padding:16px 14px; font-weight:700;">참여상태</th>
                            <th style="text-align:center; width:80px; color:#ffffff; padding:16px 14px; font-weight:700;">1차참여비</th>
                            <th style="text-align:center; width:80px; color:#ffffff; padding:16px 14px; font-weight:700;">2차참여비</th>
                            <th style="text-align:center; width:80px; color:#ffffff; padding:16px 14px; font-weight:700;">3차참여비</th>
                        </tr>
                    </thead>
                    <tbody id="report-ledger-tbody-rows">
                        \${rowsHtml || '<tr><td colspan="10" style="text-align:center; color:var(--text-muted); padding:16px 14px;">— 조회 가능한 대상자 원장 기록이 없습니다 —</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
  }

  // ----------------------------------------------------------------------
  // [5, 6 탭]: 준비중 스킨 독립 가동
  // ----------------------------------------------------------------------
  const crcPanel = document.getElementById("report-tab-panel-crc");
  if (crcPanel) {
    crcPanel.innerHTML = `<div class="report-preparing-box" style="text-align:center; padding:8px 20px; color:var(--text-muted); font-size:16px; font-weight:700; background:rgba(0,0,0,0.15); border-radius:10px; border:1px dashed var(--border-color); width:100%;"><i class="fa-solid fa-hourglass-half"></i> [5 탭]: 담당 CRC별 시험 통제 및 정산 실시간 효율 분석 모듈 수립 준비 중입니다.</div>`;
  }
  const budgetPanel = document.getElementById("report-tab-panel-budget");
  if (budgetPanel) {
    budgetPanel.innerHTML = `<div class="report-preparing-box" style="text-align:center; padding:8px 20px; color:var(--text-muted); font-size:16px; font-weight:700; background:rgba(0,0,0,0.15); border-radius:10px; border:1px dashed var(--border-color); width:100%;"><i class="fa-solid fa-hourglass-half"></i> [6 탭]: 차수별(1~3차) 참여비 미래 예측 스케줄러 배정 모듈 수립 준비 중입니다.</div>`;
  }
}

/**
 * 🔍 [내부 액션]: 4탭 마스터 원장 실시간 성명 필터링 검색 장치
 */
function searchReportLedgerTable() {
  var val = document
    .getElementById("reportLedgerSearchName")
    .value.trim()
    .toLowerCase();
  var rows = document.querySelectorAll("#report-ledger-tbody-rows tr");
  rows.forEach((row) => {
    var nameCell = row.cells[3]; // '이름' 열 정확히 타겟팅 (0부터 시작하므로 3번째 인덱스)
    if (nameCell) {
      var text = nameCell.textContent.toLowerCase();
      if (text.includes(val)) row.style.display = "";
      else row.style.display = "none";
    }
  });
}

/**
 * 🔄 [탭 정리 서브 스위처 엔진]: 보고서 메뉴 내부의 6대 하위 관제탑 스위칭 처리
 */
function switchReportSubTab(tabKey) {
  var tabs = ["summary", "recruitment", "dropout", "ledger", "crc", "budget"];

  // 1. 모든 가상 탭 버튼의 하이라이트 액티브 클래스 해제 및 패널 숨김
  tabs.forEach((key) => {
    var btn = document.querySelector(
      `button[onclick="switchReportSubTab('\${key}')"]`,
    );
    var panel = document.getElementById(`report-tab-panel-\${key}`);
    if (btn) btn.classList.remove("active");
    if (panel) panel.style.display = "none";
  });

  // 2. 선택된 특정 부서 관제탑 레이아웃만 동적 개방 (display: flex)
  var activeBtn = document.querySelector(
    `button[onclick="switchReportSubTab('\${tabKey}')"]`,
  );
  var activePanel = document.getElementById(`report-tab-panel-\${tabKey}`);
  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) activePanel.style.display = "flex";
}

/**
 * 📄 [관공서 표준 격자 인쇄 실행 컨트롤러]
 */
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
