// 1. 페이지 로드 및 테이블 렌더링 스케줄러 연동
function executeLedgerRealtimeSearch() {
  const searchKeyword = document.getElementById("ledger-search-input")
    ? document.getElementById("ledger-search-input").value.trim().toLowerCase()
    : "";
  const applicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const tbody = document.getElementById("dom-report-ledger-table");

  if (!tbody) return;
  tbody.innerHTML = "";

  let filteredRows = applicantDB;
  if (searchKeyword) {
    filteredRows = applicantDB.filter(
      (row) =>
        row.name.toLowerCase().includes(searchKeyword) ||
        row.title.toLowerCase().includes(searchKeyword) ||
        (row.th && row.th.toLowerCase().includes(searchKeyword)) ||
        (row.phone && row.phone.replace(/[^0-9]/g, "").includes(searchKeyword)),
    );
  }

  // 통계 실시간 정산 변수 초기화
  let totalTarget = filteredRows.length;
  let totalPaidAmount = 0;
  let completeCount = 0;

  if (totalTarget === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:30px;">조회된 정산 원장 데이터가 존재하지 않습니다.</td></tr>`;
    updateReportStatsWidgets(0, 0, 0);
    return;
  }

  filteredRows.forEach((row) => {
    // 지급 완료 금액 산정 엔진 (가상 정산 데이터 기준)
    let rowPaid = 0;
    let cellCount = 0;
    if (row.payStatus1 === "완료") {
      rowPaid += 150000;
      cellCount++;
    }
    if (row.payStatus2 === "완료") {
      rowPaid += 150000;
      cellCount++;
    }
    if (row.payStatus3 === "완료") {
      rowPaid += 150000;
      cellCount++;
    }

    totalPaidAmount += rowPaid;
    if (
      row.payStatus1 === "완료" &&
      row.payStatus2 === "완료" &&
      row.payStatus3 === "완료"
    ) {
      completeCount++;
    }

    const displaySsn = row.ssn ? row.ssn.substring(0, 6) : "미정";

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td style="text-align: left; padding-left: 15px; font-weight:700; color:#fff;">${row.title}</td>
            <td><span class="lvl-badge lvl-2">${row.th || "1기"}</span></td>
            <td style="font-weight:700;">${row.name}</td>
            color: var(--text-muted); font-size:13px;">${displaySsn}</td>
            <td>${row.phone || "미등록"}</td>
            <td><span class="lvl-badge ${row.result === "완료" ? "lvl-3" : "lvl-4"}">${row.result || "참여"}</span></td>
            <td><span style="color:${row.payStatus1 === "완료" ? "var(--success-color)" : "#94a3b8"}">${row.payStatus1 || "대기"}</span></td>
            <td><span style="color:${row.payStatus2 === "완료" ? "var(--success-color)" : "#94a3b8"}">${row.payStatus2 || "대기"}</span></td>
            <td><span style="color:${row.payStatus3 === "완료" ? "var(--success-color)" : "#94a3b8"}">${row.payStatus3 || "대기"}</span></td>
        `;
    tbody.appendChild(tr);
  });

  // 상단 통계 판넬 수치 업데이트 반영
  let ratio =
    totalTarget > 0 ? Math.round((completeCount / totalTarget) * 100) : 0;
  updateReportStatsWidgets(totalTarget, totalPaidAmount, ratio);
}

// 2. 대시보드 통계 위젯 텍스트 교체 매커니즘
function updateReportStatsWidgets(target, paid, ratio) {
  if (document.getElementById("report-total-target"))
    document.getElementById("report-total-target").innerText = `${target}명`;
  if (document.getElementById("report-total-paid"))
    document.getElementById("report-total-paid").innerText =
      `${paid.toLocaleString()}원`;
  if (document.getElementById("report-total-ratio"))
    document.getElementById("report-total-ratio").innerText = `${ratio}%`;
}

// 3. 💥 [비즈니스 기능] 임상시험 통합 원장 영수증/보고서 문서 강제 인쇄(Print) 엔진
function executeLedgerDocumentPrint() {
  window.print();
}

// 4. [비즈니스 기능] 원장 데이터 엑셀 CSV 파일 스트림 변환 다운로드 포맷터
function executeLedgerExcelDownload() {
  const applicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  if (applicantDB.length === 0)
    return alert("엑셀로 내보낼 원장 데이터가 비어있습니다.");

  let csvContent =
    "\uFEFF시험명,기수,이름,생년월일,전화번호,참여상태,1차정산,2차정산,3차정산\n";
  applicantDB.forEach((row) => {
    csvContent += `"${row.title}","${row.th || ""}","${row.name}","${row.ssn || ""}","${row.phone || ""}","${row.result || ""}","${row.payStatus1 || ""}","${row.payStatus2 || ""}","${row.payStatus3 || ""}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "임상시험_통합_정산_원장_보고서.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 5. 🔒 [새벽 전역 스코프 복구] 파일 분리로 깨졌던 보안 게이트 권한 통제 엔진 재진입 [INDEX]
window.applyReportLedgerPermissionGate = function (currentSabun) {
  const searchInput = document.getElementById("ledger-search-input");
  const btnSearch = document.getElementById("btn-ledger-search");
  const btnPrint = document.getElementById("btn-ledger-print");
  const btnSave = document.getElementById("btn-ledger-save");

  if (!searchInput || !btnSearch || !btnPrint || !btnSave) return;

  if (currentSabun === "admin") {
    searchInput.disabled = false;
    btnSearch.disabled = false;
    btnPrint.disabled = false;
    btnSave.disabled = false;
    console.log(
      "[보안 승인] admin 계정 확인 - 보고서 원장 제어 권한 전면 해제.",
    );
  } else {
    searchInput.disabled = true;
    btnSearch.disabled = true;
    btnPrint.disabled = true;
    btnSave.disabled = true;
    console.log(
      "[보안 잠금] 일반 사원 계정 감지 - 보고서 제어 요소 회색조 락다운 완료.",
    );
  }

  // 💡 첫 화면 자동 렌더링 연동 트리거 작동
  executeLedgerRealtimeSearch();
};
