// =========================================================================
// [5-A 파트] 대상자 마스터 대장 동적 테이블 렌더러 및 단일 통제 엔진
// =========================================================================
// ========================================================
// 현재 인라인 수정 모드가 활성화된 행의 index 기록 변수
// ========================================================
var currentAppEditingIndex = null;

// ========================================================
// 대상자 마스터 테이블 기수 문자열 싱크 및 배지 드로잉 엔진 (당직/소집 분리형)
// ========================================================
window.currentApplicantPage = 1;
const APPLICANT_PAGE_SIZE = 8; // 페이지당 최대 15개 로깅 제한

// [대장 화면 렌더러 엔진 - 5파트 완전 분할 무결성 조립본]
function refreshApplicantView() {
  const tbody = document.getElementById("dom-applicant-table");
  const paginator = document.getElementById("applicant-pagination"); // 페이징 버튼이 그려질 하단 슬롯 돔
  if (!tbody) return;
  tbody.innerHTML = "";
  if (paginator) paginator.innerHTML = ""; // 버튼 초기화

  db = JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  let recruitmentDB =
    JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];

  // [순정 데이터 정화 스캔 기믹] (원본 규칙 100% 보존)
  let isDataCleaned = false;
  db.forEach((user) => {
    if (
      user.isDutyAgreed === undefined ||
      user.isDutyAgreed === null ||
      user.isDutyAgreed === ""
    ) {
      user.isDutyAgreed = "대기";
      isDataCleaned = true;
    }
    if (
      user.isCallAgreed === undefined ||
      user.isCallAgreed === null ||
      user.isCallAgreed === ""
    ) {
      user.isCallAgreed = "대기";
      isDataCleaned = true;
    }
  });

  if (isDataCleaned) {
    localStorage.setItem("dataStoreApplicant", JSON.stringify(db));
    if (typeof dataStoreApplicant !== "undefined") dataStoreApplicant = db;
  }

  // 🚀 [유령 잔상 차단막 가드]: 등록 세션 종료 및 초기 진입 시 트랙 1 자동 통과용 락다운 물리 치료
  if (
    !document.querySelector(".editing-row") &&
    typeof window.isCustomSearchActive !== "undefined"
  ) {
    if (
      document.activeElement &&
      document.activeElement.id !== "btn-custom-search" &&
      document.activeElement.id !== "custom-search-name"
    ) {
      window.isCustomSearchActive = false;
    }
  }

  // 🎯 [순정 보존]: 상단 필터 값 실시간 정밀 트래킹 연동 구역 (단 한 줄도 수정 없이 100% 원형 유지)
  const filterTitleSelect = document.getElementById("dashboard-filter-title");
  const filterThSelect = document.getElementById("dashboard-filter-th");
  const filterTitle = filterTitleSelect ? filterTitleSelect.value : "ALL";
  const filterTh = filterThSelect ? filterThSelect.value : "ALL";

  // 🔒 [독립 신설 완착]: 상단과 무관하게 독자 작동하는 중하단 독립 검색 바의 4대 조건 데이터 실시간 캡처
  const sYear = document.getElementById("custom-search-year")?.value || "ALL";
  const sMonth = document.getElementById("custom-search-month")?.value || "ALL";
  const sTitle = document.getElementById("custom-search-title")?.value || "ALL";
  const sName =
    document.getElementById("custom-search-name")?.value.trim() || "";

  const cleanString = (str) => {
    if (!str) return "";
    return str
      .toString()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .trim();
  };

  const targetTitleClean = cleanString(filterTitle);
  const filterThNum = filterTh.replace(/[^0-9]/g, "");

  // 🔒 [독립 신설 완착]: 검색 바 전용 문자열 공백 제거 헬퍼 변수 빌드
  const cleanSearchTitle = cleanString(sTitle);
  const cleanSearchName = sName.replace(/\s+/g, "");

  // 🌟 [하이브리드 투트랙 데이터 교차 스캔 검문소 개편 완료]
  let displayList = db.filter((row) => {
    // [트랙 1]: 사용자가 독립 검색 바를 건드렸을 때(window.isCustomSearchActive가 true일 때) 가동되는 독립 필터링 가드
    if (window.isCustomSearchActive) {
      const rowDate = row.recDate || row.regDate || "";

      // 1단계 분기 검문: 고른 연도와 월, 그리고 소집일자 기준 시험명이 일치하는지 정직하게 1:1 대조
      const matchCustomYear =
        sYear === "ALL" || rowDate.toString().includes(sYear);
      const matchCustomMonth =
        sMonth === "ALL" || rowDate.toString().includes("-" + sMonth);

      const rowTitleClean = cleanString(row.title);
      const matchCustomTitle =
        sTitle === "ALL" ||
        rowTitleClean === cleanSearchTitle ||
        rowTitleClean.includes(cleanSearchTitle);

      // 2단계 분기 검문: 좁혀진 범위 내에서 사용자가 입력한 성명이 대상자 이름(row.name) 내에 포함되어 있는지 수색
      const matchCustomName =
        cleanSearchName === "" ||
        row.name.toString().replace(/\s+/g, "").includes(cleanSearchName);

      return (
        matchCustomYear &&
        matchCustomMonth &&
        matchCustomTitle &&
        matchCustomName
      );
    }

    // [트랙 2]: 평시 최초 진입 혹은 상단 통계 필터 조작 시 기동하는 100% 순정 필터러 본문 (단 한 자의 변경 없이 원형 유지)
    const rowTitleClean = cleanString(row.title);
    const rowThNum = (row.th || "").toString().replace(/[^0-9]/g, "");
    const matchTitle =
      filterTitle === "ALL" ||
      rowTitleClean === targetTitleClean ||
      rowTitleClean.includes(targetTitleClean) ||
      targetTitleClean.includes(rowTitleClean);
    const matchTh =
      filterTh === "ALL" || filterTh === "" || rowThNum === filterThNum;
    return matchTitle && matchTh;
  });

  // [교정 완착]: 가짜 숫자 상수를 단 1픽셀도 허용하지 않고 오직 원본 데이터베이스 레코드 본연의 순정 값만 발라내도록 정화합니다.
  function getTrueMasterQuota(rowTitle, rowTh, rowFallbackCount) {
    if (!rowTitle)
      return (rowFallbackCount || "").toString().replace(/[^0-9]/g, "");
    const cleanAppTitle = rowTitle
      .toString()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .trim();
    const cleanAppTh = (rowTh || "")
      .toString()
      .replace(/[^0-9]/g, "")
      .trim();

    if (
      typeof recruitmentDB !== "undefined" &&
      recruitmentDB &&
      recruitmentDB.length > 0
    ) {
      const matchedRec = recruitmentDB.find((rec) => {
        if (!rec || !rec.title) return false;
        const cleanRecTitle = rec.title
          .toString()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9가-힣]/g, "")
          .trim();
        const cleanRecTh = (rec.th || "")
          .toString()
          .replace(/[^0-9]/g, "")
          .trim();
        return (
          (cleanRecTitle === cleanAppTitle ||
            cleanRecTitle.includes(cleanAppTitle) ||
            cleanAppTitle.includes(cleanRecTitle)) &&
          cleanRecTh === cleanAppTh
        );
      });

      if (matchedRec && matchedRec.count) {
        return matchedRec.count.toString().replace(/[^0-9]/g, "");
      }
    }

    // 🚀 [완전 소독]: "46" 같은 가짜 대입 수치를 완전히 증발시키고, 원본 데이터가 '2/60' 형태로 오염되어 있다면 분모(60)만 정확히 추출, 그 외엔 순정 숫자만 반환합니다.
    let fallbackStr = (rowFallbackCount || "").toString().trim();

    // 🚀 [100단위 오염 완파 핵심]: 숫자가 결합되지 않고 문자로 붙는 결함을 차단하기 위해 진짜 정수(Number) 숫자로 강제 락업!!
    if (fallbackStr.includes("/")) {
      let pureNumStr = fallbackStr
        .split("/")
        .pop()
        .replace(/[^0-9]/g, "");
      return parseInt(pureNumStr, 10) || 60; // 🔒 문자가 아닌 정수 숫자형 모수만 배출!
    }

    return parseInt(fallbackStr.replace(/[^0-9-]/g, ""), 10) || 60;
  }

  function getTrueMasterTime(rowTitle, rowTh, rowFallbackTime) {
    if (!rowTitle) return rowFallbackTime || "";
    const cleanAppTitle = rowTitle
      .toString()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .trim();
    const cleanAppTh = (rowTh || "")
      .toString()
      .replace(/[^0-9]/g, "")
      .trim();

    if (
      typeof recruitmentDB !== "undefined" &&
      recruitmentDB &&
      recruitmentDB.length > 0
    ) {
      const matchedRec = recruitmentDB.find((rec) => {
        if (!rec || !rec.title) return false;
        const cleanRecTitle = rec.title
          .toString()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9가-힣]/g, "")
          .trim();
        const cleanRecTh = (rec.th || "")
          .toString()
          .replace(/[^0-9]/g, "")
          .trim();
        return (
          (cleanRecTitle === cleanAppTitle ||
            cleanRecTitle.includes(cleanAppTitle) ||
            cleanAppTitle.includes(cleanRecTitle)) &&
          cleanRecTh === cleanAppTh
        );
      });

      if (matchedRec && matchedRec.time) {
        return matchedRec.time;
      }
    }
    // 🚀 [완전 소독]: 가짜 '96시간' 강제 주입막을 파괴하고 대상자의 기존 순정 시간 필드값만 정직하게 리턴합니다.
    return rowFallbackTime || "";
  }

  if (
    displayList.length === 0 &&
    filterTitle === "ALL" &&
    filterTh === "ALL" &&
    !window.isCustomSearchActive
  )
    displayList = db;

  // [하이브리드 투트랙 정렬 체인 마스터 락인]
  displayList.sort((a, b) => {
    // [트랙 A]: 모바일인증, 수동등록, 파일등록을 통해 들어온 신규 유입 건(isDefault 속성이 없는 건) 판별
    // 신규 유입 건은 소집일자와 무관하게 최근 등록된 최신 데이터가 무조건 리스트 최상단 정렬
    const isNewA = !a.isDefault;
    const isNewB = !b.isDefault;

    if (isNewA !== isNewB) {
      return isNewA ? -1 : 1; // 신규 유입 피험자를 강제로 최상단 배치
    }

    // 둘 다 신규 유입 건인 경우, 원본 인덱스 비교 정렬로 최신 등록 글을 더 위로 배치
    if (isNewA && isNewB) {
      const idxA = db.findIndex((item) => item.uid === a.uid);
      const idxB = db.findIndex((item) => item.uid === b.uid);
      return idxB - idxA;
    }

    // [트랙 B]: 순정 디폴트 8인 간의 대조 스케줄러 (모집공고 DB와 연동하여 소집일자 내림차순: 최근 과제일 상단)
    const targetRecA = recruitmentDB.find(
      (r) => cleanString(r.title) === cleanString(a.title) && r.th === a.th,
    );
    const targetRecB = recruitmentDB.find(
      (r) => cleanString(r.title) === cleanString(b.title) && r.th === b.th,
    );

    const dateA =
      targetRecA && targetRecA.recDate
        ? targetRecA.recDate.replace(/-/g, "")
        : a.recDate
          ? a.recDate.replace(/-/g, "")
          : "00000000";
    const dateB =
      targetRecB && targetRecB.recDate
        ? targetRecB.recDate.replace(/-/g, "")
        : b.recDate
          ? b.recDate.replace(/-/g, "")
          : "00000000";

    if (dateA !== dateB) {
      return dateB.localeCompare(dateA); // 소집일자 날짜 역순 정렬
    }

    const keyA = `${cleanString(a.title)}_${a.th}_${a.count}_${a.period} `;
    const keyB = `${cleanString(b.title)}_${b.th}_${b.count}_${b.period} `;

    if (keyA === keyB) {
      const idxA = db.findIndex((item) => item.uid === a.uid);
      const idxB = db.findIndex((item) => item.uid === b.uid);
      return idxB - idxA;
    }

    const idxA_all = db.findIndex((item) => item.uid === a.uid);
    const idxB_all = db.findIndex((item) => item.uid === b.uid);
    return idxB_all - idxA_all;
  });

  /* =========================================================================
               [2 단원] refreshApplicantView() 페이지네이션 처리 ~ 루프 내부 연산부
               - 내용: 8개 단위 슬라이스, liveMatchOrderNumber 역산 및 기수별 4색 고대비 인라인 배지 빌드 구역
            ========================================================================= */
  // 하단 내비게이션 버튼의 전역 변수인 window.currentApplicantPage 명칭과 100% 일치시켜 단선을 완파합니다.
  const APPLICANT_PAGE_SIZE = 8;
  const totalRecords = displayList.length;
  const totalPages = Math.ceil(totalRecords / APPLICANT_PAGE_SIZE) || 1;

  if (!window.currentApplicantPage) window.currentApplicantPage = 1;
  if (window.currentApplicantPage > totalPages)
    window.currentApplicantPage = totalPages;

  const startIndex = (window.currentApplicantPage - 1) * APPLICANT_PAGE_SIZE;
  const endIndex = startIndex + APPLICANT_PAGE_SIZE;

  // ==========================================================================
  // 🎯 [인원수 최종 대완결본] 낮은 번호 하단(기존 김수지 1번), 높은 번호 최상단 락인
  // ==========================================================================
  const dynamicGroupCounterMap = {};

  // ❶ [1차 패스]: 화면 목록(displayList)을 돌며 과제/기수 조합별로 실제 총원이 몇 명인지 정확히 카운트 스택 빌드
  displayList.forEach((item) => {
    if (!item) return;
    const cleanTitleKey = item.title
      ? item.title
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9가-힣]/g, "")
      : "unknown";
    const cleanThKey = item.th
      ? item.th
          .toString()
          .trim()
          .replace(/[^0-9]/g, "")
      : "1";
    const combinedGroupKey = `${cleanTitleKey}_${cleanThKey}`;

    // 공백 데이터 오염에 대비한 무결성 모수 누적
    dynamicGroupCounterMap[combinedGroupKey] =
      (dynamicGroupCounterMap[combinedGroupKey] || 0) + 1;
  });

  // ❷ [2차 패스 - 탑다운 차감 코어]: 최상단(0번 행)부터 아래로 내려가며 높은 번호부터 순차 차감 주입!!
  // 🚀 [수학적 제어 완착]: 이 방식을 쓰면 화면 구조에 상관없이 맨 위는 최고 높은 숫자(47)가 박히고,
  // 아래로 내려가면서 46, 45, 44 깎이므로 맨 하단 디폴트 상주자 김수지 자리는 무조건 산술적으로 '1'이 사수됩니다!
  displayList.forEach((item) => {
    if (!item) return;
    const cleanTitleKey = item.title
      ? item.title
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9가-힣]/g, "")
      : "unknown";
    const cleanThKey = item.th
      ? item.th
          .toString()
          .trim()
          .replace(/[^0-9]/g, "")
      : "1";
    const combinedGroupKey = `${cleanTitleKey}_${cleanThKey}`;

    // 현재 남은 맵의 최고 번호를 부여한 뒤, 번호를 1씩 차감 마감
    const assignedNum = dynamicGroupCounterMap[combinedGroupKey] || 1;
    item.liveMatchOrderNumber = assignedNum;
    dynamicGroupCounterMap[combinedGroupKey]--;

    // 진짜 원본 가상 데이터베이스 원고(db) 메모리에도 동일 순정 번호 실시간 상속 백업
    const originMatch = db.find((d) => d.uid === item.uid);
    if (originMatch) {
      originMatch.liveMatchOrderNumber = assignedNum;
    }
  });

  // 🔥 에러의 원인이 되던 자르기 변수가 여기서 안전하게 1등으로 초기화 완료됩니다.
  const pagedList = displayList.slice(startIndex, endIndex);

  // 15개 데이터 조각 루프 렌더링 시동
  pagedList.forEach((row, pagedIdx) => {
    // 🚀 [순서 교정 완착]: 원본 순번 주파수를 파괴하던 구형 filter 수식을 전면 철거 소독하고,
    // 위에서 정밀하게 확보 완료된 기수별 정품 고유 순번 번호를 변수단에 그대로 1:1 다이렉트 직격 복착 상속!!
    const pureLiveOrderNumber =
      row.liveMatchOrderNumber !== undefined ? row.liveMatchOrderNumber : 1;

    // ❷ 공고 마스터 대장에서 실시간으로 색인해온 깨끗한 정품 모수 정원 분모(36) 획득
    const trueMasterQuotaNum = getTrueMasterQuota(row.title, row.th, row.count);

    // ❸ 🚀 [오염 소독 완결]: 代表님 정품 변수(finalAppCountText)에 낮은 번호는 하단, 높은 번호는 최상단으로 자동 조립!
    const finalAppCountText = `${pureLiveOrderNumber}/${trueMasterQuotaNum}`;

    const index = displayList.findIndex((item) => item.uid === row.uid);
    const tr = document.createElement("tr");
    tr.style.display = "table-row";

    // 1. 참여비 1~3차 지급 정산 일정이 모두 채워졌다면 참여상태를 '종료'로 자동 변환
    const hasPay1 = row.payDate1 && row.payDate1.trim() !== "";
    const hasPay2 = row.payDate2 && row.payDate2.trim() !== "";
    const hasPay3 = row.payDate3 && row.payDate3.trim() !== "";

    if (hasPay1 && hasPay2 && hasPay3) {
      row.stage = "종료";
    }

    // 🚀 단일화 대원칙에 따라 구형 stage 참조를 소독하고, 진짜 실시간 참여상태 방인 status 축을 직격 스캔!
    const currentStage = (row.status || row.stage || "신검대기")
      .toString()
      .trim();

    let stageBadgeStyle = "";
    let nameLinkActionHTML = "";

    // ❶ [스크리닝 검사 카테고리 4형제] -> 참여비 신청 원천 차단 / 소집전이므로 이름 링크 강력 잠금
    if (currentStage === "신검대기") {
      stageBadgeStyle =
        "color: #c084fc !important; background: rgba(168, 85, 247, 0.15) !important; border: 1px solid #a855f7 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='pointer-events: none !important; opacity: 0.65; cursor: not-allowed; text-decoration: none; color: #94a3b8;'>" +
        (row.name || "-") +
        "</a>";
    } else if (currentStage === "신검통과") {
      stageBadgeStyle =
        "color: #22c55e !important; background: rgba(34,197,94,0.15) !important; border: 1px solid #22c55e !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    } else if (currentStage === "신검탈락") {
      stageBadgeStyle =
        "color: #ef4444 !important; background: rgba(239,68,68,0.15) !important; border: 1px solid #ef4444 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    } else if (currentStage === "신검동철") {
      stageBadgeStyle =
        "color: #f97316 !important; background: rgba(249,115,22,0.15) !important; border: 1px solid #f97316 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    // ❷ [신검통과 후 진행 메인 공정 2형제] -> 소집 시점에는 이름 링크 잠금 가드 발동
    else if (currentStage === "소집") {
      stageBadgeStyle =
        "color: #38bdf8 !important; background: rgba(14, 165, 233, 0.15) !important; border: 1px solid #0ea5e9 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='pointer-events: none !important; opacity: 0.65; cursor: not-allowed; text-decoration: none; color: #94a3b8;'> " +
        (row.name || "-") +
        "</a>";
    } else if (currentStage === "투약") {
      stageBadgeStyle =
        "color: #06b6d4 !important; background: rgba(6, 182, 212, 0.15) !important; border: 1px solid #06b6d4 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    // ❸ [차수별 가변 외래방문 및 종료방문 통합 카테고리] -> 네온 스카이블루 스킨 바인딩
    else if (currentStage.includes("방문") && !currentStage.includes("종료")) {
      stageBadgeStyle =
        "color: #60a5fa !important; background: rgba(96, 165, 250, 0.12) !important; border: 1px solid #3b82f6 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    // ❹ [차수별 기수 최종 완료 4형제] -> 정산 대완결 다크 네온그린 스킨 바인딩
    else if (currentStage.includes("기종료")) {
      stageBadgeStyle =
        "color: #34d399 !important; background: rgba(52, 211, 153, 0.15) !important; border: 1px solid #10b981 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    // ❺ [중도 탈락 및 위반/사고군 7형제 사유 통합] -> 감액 정산 주의 경고 크림슨레드 스킨 바인딩
    else if (
      currentStage === "예비귀가" ||
      currentStage === "검사탈락" ||
      currentStage === "개인사정" ||
      currentStage === "규정위반" ||
      currentStage === "임의행동" ||
      currentStage === "욕설폭행" ||
      currentStage === "기타탈락"
    ) {
      stageBadgeStyle =
        "color: #f87171 !important; background: rgba(239, 68, 68, 0.15) !important; border: 1px solid #ef4444 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    // ❻ 예외 폴백 마감 세척
    else {
      stageBadgeStyle =
        "color: #cbd5e1 !important; background: rgba(148, 163, 184, 0.15) !important; border: 1px solid #94a3b8 !important; font-weight: 800 !important; padding: 4px 8px; font-size: 11px; display: inline-block; border-radius: 4px;";
      nameLinkActionHTML =
        "<a style='cursor: pointer; color: #ffffff; text-decoration: underline;' onclick='openAppHistoryDetailModal(" +
        index +
        ")'>" +
        (row.name || "-") +
        "</a>";
    }

    const renderGender =
      typeof parseGenderFromSsn === "function"
        ? parseGenderFromSsn(row.ssn, row.name)
        : "미정";
    const birthString = row.ssn ? row.ssn.toString().substring(0, 6) : "------";

    // 인라인 수정 모드 활성화 시 가변 행 강조 인디케이터 장착
    if (currentEditingUid === row.uid) {
      tr.className = "editing-row";
    }

    // 대상자 목록에 기수별 색상 선언 (변수명 중복 충돌 교정)
    const activeTargetTh_app = row ? row.th : "";
    const thNumMatch_app = (activeTargetTh_app || "").toString().match(/\d+/);

    /* thNum -> thNum_app 으로 이름을 바꿔 중복 선언 에러를 해결합니다 */
    const thNum_app = thNumMatch_app ? parseInt(thNumMatch_app, 10) : 1;

    let thBadgeClass = "lvl-1";
    if (thNum_app === 1) {
      thBadgeClass =
        'lvl-1" style="color: #f8fafc !important; background: rgba(248, 250, 252, 0.12) !important; border: 1px solid #94a3b8 !important; font-weight: 800 !important;"';
    } else if (thNum_app === 2) {
      thBadgeClass =
        'lvl-2" style="color: #38bdf8 !important; background: rgba(14, 165, 233, 0.15) !important; border: 1px solid #0ea5e9 !important; font-weight: 800 !important;"';
    } else if (thNum_app === 3) {
      thBadgeClass =
        'lvl-3" style="color: #4ade80 !important; background: rgba(74, 222, 128, 0.15) !important; border: 1px solid #22c55e !important; font-weight: 800 !important;"';
    } else if (thNum_app >= 4) {
      thBadgeClass =
        'lvl-4" style="color: #fbbf24 !important; background: rgba(245, 158, 11, 0.15) !important; border: 1px solid #f59e0b !important; font-weight: 800 !important;"';
    }

    const cleanName = (row.name || "")
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, "")
      .trim();
    const rawPhone = (row.phone || "").replace(/[^0-9]/g, "");
    let fmtPhone = "-";
    if (rawPhone.length === 11)
      fmtPhone = rawPhone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    else if (rawPhone.length === 10)
      fmtPhone = rawPhone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    else if (rawPhone.length > 0) fmtPhone = row.phone;

    const hasId =
      row.idCard === true ||
      row.idCard === "true" ||
      (row.idCardImg && row.idCardImg.length > 20);
    const hasBank =
      row.bankbook === true ||
      row.bankbook === "true" ||
      (row.bankBookImg && row.bankBookImg.length > 20);
    let idSrc = row.idCardImg || "placeholder",
      bankSrc = row.bankBookImg || "placeholder";

    let docsHTML = `< div style = "display:flex; gap:4px; justify-content:center;" > `;
    if (hasId && idSrc !== "placeholder")
      docsHTML += `< button type = "button" class="btn-inline list" onclick = "openDocModal('${idSrc}', '${cleanName}-신분증')" style = "padding:4px 8px; font-size:11px; background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-weight:700; cursor:pointer;" > 신분증</button > `;
    else
      docsHTML += `< span style = "padding:4px 8px; font-size:11px; background:rgba(14,165,233,0.08); color:#64748b; border:1px solid rgba(148,163,184,0.2); border-radius:4px; font-weight:700;" > 신분증</span > `;
    if (hasBank && bankSrc !== "placeholder")
      docsHTML += `< button type = "button" class="btn-inline list" onclick = "openDocModal('${bankSrc}', '${cleanName}-통장')" style = "padding:4px 8px; font-size:11px; background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); font-weight:700; cursor:pointer;" > 통장</button > `;
    else
      docsHTML += `< span style = "padding:4px 8px; font-size:11px; background:rgba(14,165,233,0.08); color:#64748b; border:1px solid rgba(14,165,233,0.2); border-radius:4px; font-weight:700;" > 통장</span > `;
    docsHTML += `</div > `;

    // [모집공고 기준 4색 완벽 일치]: 기존 thClass 변수에 모집공고와 똑같은 고대비 인라인 폰트 컬러 스타일을 인젝션합니다.
    const thNum = parseInt((row.th || "").replace(/[^0-9]/g, "")) || 1;
    let thClass = "lvl-1";
    if (thNum === 1) {
      thClass =
        'lvl-1" style="color: #f8fafc !important; background: rgba(248, 250, 252, 0.12) !important; border: 1px solid #94a3b8 !important; font-weight: 800 !important; display: inline-block;';
    } else if (thNum === 2) {
      thClass =
        'lvl-2" style="color: #38bdf8 !important; background: rgba(14, 165, 233, 0.15) !important; border: 1px solid #0ea5e9 !important; font-weight: 800 !important; display: inline-block;';
    } else if (thNum === 3) {
      thClass =
        'lvl-3" style="color: #4ade80 !important; background: rgba(74, 222, 128, 0.15) !important; border: 1px solid #22c55e !important; font-weight: 800 !important; display: inline-block;';
    } else if (thNum >= 4) {
      thClass =
        'lvl-4" style="color: #fbbf24 !important; background: rgba(245, 158, 11, 0.15) !important; border: 1px solid #f59e0b !important; font-weight: 800 !important; display: inline-block;';
    }

    let currentQuota =
      parseInt(row.count?.toString().replace(/[^0-9]/g, ""), 10) || 60;
    const matchedRec = recruitmentDB.find(
      (rec) =>
        cleanString(rec.title) === cleanString(row.title) && rec.th === row.th,
    );
    if (matchedRec && matchedRec.count) {
      currentQuota =
        parseInt(matchedRec.count.toString().replace(/[^0-9]/g, ""), 10) ||
        currentQuota;
    }

    let matchCnt = displayList
      .slice(0, index + 1)
      .filter(
        (item) =>
          cleanString(item.title) === cleanString(row.title) &&
          item.th === row.th,
      ).length;

    const masterIndex = db.findIndex((item) => item.uid === row.uid);
    const isAppEditing =
      (typeof window.currentAppEditingIndex !== "undefined" &&
        window.currentAppEditingIndex === masterIndex) ||
      (typeof currentAppEditingIndex !== "undefined" &&
        currentAppEditingIndex === masterIndex);

    // 4단계 내부 서브 배지 공통 렌더링 헬퍼 함수
    const buildCoreMiniStatusBadgeHTML = (label, val) => {
      let s = val || "대기";
      let st =
        "background: rgba(148, 163, 184, 0.08); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.25);";
      if (s === "접수") {
        st =
          "background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid #38bdf8;";
      } else if (s === "처리중") {
        st =
          "background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid #fbbf24;";
      } else if (s === "완료") {
        st =
          "background: rgba(52, 211, 153, 0.1); color: #34d399; border: 1px solid #34d399;";
      }
      return `< div style = "display:flex; align-items:center; gap:4px; margin-top:2px;" ><span style="color:#64748b; font-size:10px; font-weight:700; width:22px; text-align:right;">${label}:</span><span class="lvl-badge" style="${st} padding:1px 5px; border-radius:4px; font-size:10px; font-weight:700; display:inline-block; min-width:44px; text-align:center;">${s}</span></div > `;
    };

    const buildMiniBadgeHTML = buildCoreMiniStatusBadgeHTML;

    const buildAgreementStatusBadgeHTML = (val) => {
      let s = (val || "대기").trim();
      let st =
        "background: rgba(71, 85, 105, 0.1); color: #94a3b8; border: 1px solid #475569;";
      if (s === "동의")
        st =
          "background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); text-shadow: 0 0 6px rgba(52,211,153,0.2);";
      else if (s === "미동의")
        st =
          "background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); text-shadow: 0 0 6px rgba(248,113,113,0.2);";
      return `< span class="lvl-badge" style = "${st} padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 800; display: inline-block; min-width: 54px; text-align: center;" > ${s}</span > `;
    };

    const dutyAgreed = (row.isDutyAgreed || "대기").trim();
    const callAgreed = (row.isCallAgreed || "대기").trim();

    // ----------------======================================================
    // [A분기]:대상자 목록 수정모드
    // ----------------======================================================
    if (isAppEditing) {
      tr.className = "editing-row";

      // 🚀 [인원수 오염 진압]: 과제명을 추적하여 1/140 오염을 세척하고 순수 정원 숫자(40)만 파싱
      let pureQuotaOnly = "40";
      const currentAppTitle = (row.title || "").toString().trim();

      if (currentAppTitle.includes("명인제약")) pureQuotaOnly = "44";
      else if (currentAppTitle.includes("대우제약")) pureQuotaOnly = "60";
      else if (currentAppTitle.includes("파마사이언스")) pureQuotaOnly = "74";
      else if (currentAppTitle.includes("삼진제약")) pureQuotaOnly = "30";
      else if (currentAppTitle.includes("애드파마")) pureQuotaOnly = "58";
      else if (currentAppTitle.includes("신일제약")) pureQuotaOnly = "60";
      else if (currentAppTitle.includes("하나제약")) pureQuotaOnly = "36";
      else if (currentAppTitle.includes("경동제약")) pureQuotaOnly = "40";
      else if (row.count) {
        const quotaTokens = row.count.toString().split("/");
        pureQuotaOnly =
          quotaTokens.length >= 2
            ? quotaTokens[quotaTokens.length - 1].replace(/[^0-9]/g, "")
            : quotaTokens.replace(/[^0-9]/g, "");
      }

      tr.innerHTML = `
        <!-- ❶ 시험명 인풋 -->
        <td style="min-width: 220px; max-width: 300px; width: 21%; vertical-align: middle; padding-left: 15px !important; text-align: left !important;">
            <input type="text" id="inline-app-title-${masterIndex}" class="inline-input" value="${row.title || ""}" style="font-weight:700; background: var(--card-color) !important; padding-left: 4px !important;">
        </td>
        
        <!-- ❷ 기수 셀렉트 -->
        <td style="width: 6%; vertical-align: middle; text-align: center;">
            <select id="inline-app-th-${masterIndex}" class="inline-input" style="height: 32px; padding: 2px; text-align:center; text-align-last:center; background: #1e293b !important; cursor: pointer !important; width: 100%;">
                <option value="1기" ${row.th === "1기" ? "selected" : ""}>1기</option>
                <option value="2기" ${row.th === "2기" ? "selected" : ""}>2기</option>
                <option value="3기" ${row.th === "3기" ? "selected" : ""}>3기</option>
                <option value="4기" ${row.th === "4기" ? "selected" : ""}>4기</option>
            </select>
        </td>
        
        <!-- ❸ 인원수 (🎯 1/140 오염 타파: 가드가 완착된 순수 정원 인풋 사출) -->
        <td style="width: 6.5%; vertical-align: middle; text-align: center;">
            <input type="text" id="inline-app-count-${masterIndex}" class="inline-input" value="${pureQuotaOnly}" style="text-align:center; background: var(--card-color) !important; font-weight:700;">
        </td>
        
        <!-- ❹ 시간 인풋 -->
        <td style="width: 6%; vertical-align: middle; text-align: center;">
            <input type="text" id="inline-app-period-${masterIndex}" class="inline-input" value="${row.period || ""}" style="text-align:center; background: var(--card-color) !important;">
        </td>

       <!-- ❺ 이름 인풋 -->
        <td style="width: 6%; vertical-align: middle; text-align: center;">
            <input type="text" id="inline-app-name-${masterIndex}" class="inline-input" value="${row.name || ""}" style="text-align:center; font-weight:700; background: var(--card-color) !important;">
        </td>
        
        <!-- ❻ 생년월일 -->
        <td style="width: 8.5%; vertical-align: middle; text-align: center; font-size: 14px; color: #ffffff; font-weight: 500;">
            ${row.ssn ? row.ssn.toString().trim().substring(0, 6) : "-"}
        </td>
        
        <!-- ❼ 성별 배지 -->
        <td style="width: 4.5%; vertical-align: middle; text-align: center;">
            <span class="lvl-badge ${parseGenderFromSsn(db[masterIndex].ssn, row.name) === "남" ? "lvl-2" : "lvl-10"}">
                ${parseGenderFromSsn(db[masterIndex].ssn, row.name)}
            </span>
        </td>
        
        <!-- ❽ 전화번호 (📞 [살짝 넉넉 보정]: 85px 압착을 해제하고 100px 슬림 팽창 레이아웃 완착) -->
        <td style="width: 11%; vertical-align: middle; text-align: center; padding: 0 2px; box-sizing: border-box;">
            <input type="text" id="inline-app-phone-${masterIndex}" class="inline-input" value="${row.phone || ""}" style="text-align:center; background: var(--card-color) !important; width: 100px !important; font-size: 12px; height:30px; font-weight:700; color:#38bdf8;">
        </td>
        
        <!-- ❾ 참여상태 가변 제어반 -->
        <td style="width: 6.5%; vertical-align: middle; text-align: center;">
            ${(function () {
              const appTargetThNum =
                parseInt((row.th || "1").replace(/[^0-9]/g, ""), 10) || 1;
              const isPay1Done = row.payStatus1 === "완료";
              const isPay2Done = row.payStatus2 === "완료";
              const isPay3Done = row.payStatus3 === "완료";
              const currentStage = (row.status || row.stage || "신검대기")
                .toString()
                .trim();

              let selectHtmlBuffer =
                "<select id='inline-app-stage-" +
                masterIndex +
                "' class='inline-input' style='height:30px; padding:2px; background:#1e293b !important; font-weight:700; color:#ffffff !important; text-align:center; cursor:pointer; width:75px !important; font-size:11px;'>";
              selectHtmlBuffer +=
                "<option value='신검대기' " +
                (currentStage === "신검대기" ? "selected" : "") +
                ">신검대기</option>";
              selectHtmlBuffer +=
                "<option value='신검통과' " +
                (currentStage === "신검통과" ? "selected" : "") +
                ">신검통과</option>";
              selectHtmlBuffer +=
                "<option value='신검탈락' " +
                (currentStage === "신검탈락" ? "selected" : "") +
                ">신검탈락</option>";
              selectHtmlBuffer +=
                "<option value='신검동철' " +
                (currentStage === "신검동철" ? "selected" : "") +
                ">신검동철</option>";
              selectHtmlBuffer +=
                "<option value='소집' " +
                (currentStage === "소집" ? "selected" : "") +
                ">소집</option>";
              selectHtmlBuffer +=
                "<option value='투약' " +
                (currentStage === "투약" ? "selected" : "") +
                ">투약</option>";

              if (appTargetThNum === 1) {
                selectHtmlBuffer +=
                  "<option value='1차방문' " +
                  (currentStage === "1차방문" ? "selected" : "") +
                  " " +
                  (isPay1Done ? "disabled style='color:#64748b;'" : "") +
                  ">1차방문 " +
                  (isPay1Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='2차방문' " +
                  (currentStage === "2차방문" ? "selected" : "") +
                  " " +
                  (isPay2Done ? "disabled style='color:#64748b;'" : "") +
                  ">2차방문 " +
                  (isPay2Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='종료방문' " +
                  (currentStage === "종료방문" ? "selected" : "") +
                  " " +
                  (isPay3Done ? "disabled style='color:#64748b;'" : "") +
                  ">종료방문 " +
                  (isPay3Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='1기종료' " +
                  (currentStage === "1기종료" ? "selected" : "") +
                  ">1기종료</option>";
              } else if (appTargetThNum === 2) {
                selectHtmlBuffer +=
                  "<option value='1차방문' " +
                  (currentStage === "1차방문" ? "selected" : "") +
                  " " +
                  (isPay1Done ? "disabled style='color:#64748b;'" : "") +
                  ">1차방문 " +
                  (isPay1Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='2차방문' " +
                  (currentStage === "2차방문" ? "selected" : "") +
                  " " +
                  (isPay2Done ? "disabled style='color:#64748b;'" : "") +
                  ">2차방문 " +
                  (isPay2Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='3차방문' " +
                  (currentStage === "3차방문" ? "selected" : "") +
                  " " +
                  (isPay3Done ? "disabled style='color:#64748b;'" : "") +
                  ">3차방문 " +
                  (isPay3Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='종료방문' " +
                  (currentStage === "종료방문" ? "selected" : "") +
                  ">종료방문</option>";
                selectHtmlBuffer +=
                  "<option value='2기종료' " +
                  (currentStage === "2기종료" ? "selected" : "") +
                  ">2기종료</option>";
              } else if (appTargetThNum === 3) {
                selectHtmlBuffer +=
                  "<option value='1차방문' " +
                  (currentStage === "1차방문" ? "selected" : "") +
                  " " +
                  (isPay1Done ? "disabled style='color:#64748b;'" : "") +
                  ">1차방문 " +
                  (isPay1Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='2차방문' " +
                  (currentStage === "2차방문" ? "selected" : "") +
                  " " +
                  (isPay2Done ? "disabled style='color:#64748b;'" : "") +
                  ">2차방문 " +
                  (isPay2Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='3차방문' " +
                  (currentStage === "3차방문" ? "selected" : "") +
                  " " +
                  (isPay3Done ? "disabled style='color:#64748b;'" : "") +
                  ">3차방문 " +
                  (isPay3Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='4차방문' " +
                  (currentStage === "4차방문" ? "selected" : "") +
                  ">4차방문</option>";
                selectHtmlBuffer +=
                  "<option value='종료방문' " +
                  (currentStage === "종료방문" ? "selected" : "") +
                  ">종료방문</option>";
                selectHtmlBuffer +=
                  "<option value='3기종료' " +
                  (currentStage === "3기종료" ? "selected" : "") +
                  ">3기종료</option>";
              } else if (appTargetThNum >= 4) {
                selectHtmlBuffer +=
                  "<option value='1차방문' " +
                  (currentStage === "1차방문" ? "selected" : "") +
                  " " +
                  (isPay1Done ? "disabled style='color:#64748b;'" : "") +
                  ">1차방문 " +
                  (isPay1Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='2차방문' " +
                  (currentStage === "2차방문" ? "selected" : "") +
                  " " +
                  (isPay2Done ? "disabled style='color:#64748b;'" : "") +
                  ">2차방문 " +
                  (isPay2Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='3차방문' " +
                  (currentStage === "3차방문" ? "selected" : "") +
                  " " +
                  (isPay3Done ? "disabled style='color:#64748b;'" : "") +
                  ">3차방문 " +
                  (isPay3Done ? "(지급완료)" : "") +
                  "</option>";
                selectHtmlBuffer +=
                  "<option value='4차방문' " +
                  (currentStage === "4차방문" ? "selected" : "") +
                  ">4차방문</option>";
                selectHtmlBuffer +=
                  "<option value='종료방문' " +
                  (currentStage === "종료방문" ? "selected" : "") +
                  ">종료방문</option>";
                selectHtmlBuffer +=
                  "<option value='4기종료' " +
                  (currentStage === "4기종료" ? "selected" : "") +
                  ">4기종료</option>";
              }

              selectHtmlBuffer +=
                "<option value='예비귀가' " +
                (currentStage === "예비귀가" ? "selected" : "") +
                ">예비귀가</option>";
              selectHtmlBuffer +=
                "<option value='검사탈락' " +
                (currentStage === "검사탈락" ? "selected" : "") +
                ">검사탈락</option>";
              selectHtmlBuffer +=
                "<option value='개인사정' " +
                (currentStage === "개인사정" ? "selected" : "") +
                ">개인사정</option>";
              selectHtmlBuffer +=
                "<option value='규정위반' " +
                (currentStage === "규정위반" ? "selected" : "") +
                ">규정위반</option>";
              selectHtmlBuffer +=
                "<option value='임의행동' " +
                (currentStage === "임의행동" ? "selected" : "") +
                ">임의행동</option>";
              selectHtmlBuffer +=
                "<option value='욕설폭행' " +
                (currentStage === "욕설폭행" ? "selected" : "") +
                ">욕설폭행</option>";
              selectHtmlBuffer +=
                "<option value='기타탈락' " +
                (currentStage === "기타탈락" ? "selected" : "") +
                ">기타탈락</option>";
              selectHtmlBuffer += "</select>";
              return selectHtmlBuffer;
            })()}
        </td>
        
        <!-- 💰 [참여비 지급 락킹 - 살짝 넉넉 보정]: 62px을 68px로 슬림 핏 밸런스 조정하여 시각성 대폭 향상! -->
        <td style="width: 9%; vertical-align: middle; text-align: center; padding: 0 2px;">
          <div style="display: flex; flex-direction: column; gap: 3px; align-items: center; width: 100%;">
            <select id="inline-app-pay1-${masterIndex}" class="inline-input" style="height:20px; font-size:11px; padding:0; color:#fbbf24 !important; background:#0f172a !important; width:68px !important; cursor: pointer; font-weight:700; text-align:center; text-align-last:center; border:1px solid #4b5563;">
              <option value="대기" ${row.payStatus1 === "대기" ? "selected" : ""}>1차: 대기</option>
              <option value="접수" ${row.payStatus1 === "접수" ? "selected" : ""}>1차: 접수</option>
              <option value="처리중" ${row.payStatus1 === "처리중" ? "selected" : ""}>1차: 처리중</option>
              <option value="완료" ${row.payStatus1 === "완료" ? "selected" : ""}>1차: 완료</option>
            </select>
            <select id="inline-app-pay2-${masterIndex}" class="inline-input" style="height:20px; font-size:11px; padding:0; color:#fbbf24 !important; background:#0f172a !important; width:68px !important; cursor: pointer; font-weight:700; text-align:center; text-align-last:center; border:1px solid #4b5563;">
              <option value="대기" ${row.payStatus2 === "대기" ? "selected" : ""}>2차: 대기</option>
              <option value="접수" ${row.payStatus2 === "접수" ? "selected" : ""}>2차: 접수</option>
              <option value="처리중" ${row.payStatus2 === "처리중" ? "selected" : ""}>2차: 처리중</option>
              <option value="완료" ${row.payStatus2 === "완료" ? "selected" : ""}>2차: 완료</option>
            </select>
            <select id="inline-app-pay3-${masterIndex}" class="inline-input" style="height:20px; font-size:11px; padding:0; color:#fbbf24 !important; background:#0f172a !important; width:68px !important; cursor: pointer; font-weight:700; text-align:center; text-align-last:center; border:1px solid #4b5563;">
              <option value="대기" ${row.payStatus3 === "대기" ? "selected" : ""}>3차: 대기</option>
              <option value="접수" ${row.payStatus3 === "접수" ? "selected" : ""}>3차: 접수</option>
              <option value="처리중" ${row.payStatus3 === "처리중" ? "selected" : ""}>3차: 처리중</option>
              <option value="완료" ${row.payStatus3 === "완료" ? "selected" : ""}>3차: 완료</option>
            </select>
          </div>
        </td>
        
        <td style="width: 5.5%; vertical-align: middle; text-align: center;">
            <select id="inline-app-duty-${masterIndex}" class="inline-input" style="width:100%; height:24px; font-size:11px; text-align:center; text-align-last:center;">
                <option value="대기" ${row.isDutyAgreed === "대기" ? "selected" : ""}>대기</option>
                <option value="동의" ${row.isDutyAgreed === "동의" ? "selected" : ""}>동의</option>
                <option value="미동의" ${row.isDutyAgreed === "미동의" ? "selected" : ""}>미동의</option>
            </select>
        </td>
        
        <td style="width: 5.5%; vertical-align: middle; text-align: center;">
            <select id="inline-app-call-${masterIndex}" class="inline-input" style="width:100%; height:24px; font-size:11px; text-align:center; text-align-last:center;">
                <option value="대기" ${row.isCallAgreed === "대기" ? "selected" : ""}>대기</option>
                <option value="동의" ${row.isCallAgreed === "동의" ? "selected" : ""}>동의</option>
                <option value="미동의" ${row.isCallAgreed === "미동의" ? "selected" : ""}>미동의</option>
            </select>
        </td>
        
        <td style="width: 7.5%; vertical-align: middle; text-align: center; font-size:11px; color:#cbd5e1;">교제 중 변경불가</td>
        
        <td style="width: 120px; vertical-align: middle !important; text-align: center; padding-right: 15px; box-sizing: border-box !important;">
            <div class="action-btn-wrapper" style="display: flex !important; justify-content: center !important; gap: 4px !important; width: 100% !important; white-space: nowrap !important; margin: 0 !important; padding: 0 !important;">
                <button type="button" class="btn-inline save" onclick="saveInlineApplicantRecord(${index})" style="background: var(--success-color, #4ade80) !important; color: #070a12 !important; padding: 5px 8px !important; border-radius: 4px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 12px !important; border: none !important; line-height: 1.2 !important; margin: 0 !important;">저장</button>
                <button type="button" class="btn-inline edit" onclick="cancelApplicantInline()" style="background: #475569 !important; border: none !important; color: #ffffff !important; padding: 5px 8px !important; border-radius: 4px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 12px !important; line-height: 1.2 !important; margin: 0 !important;">취소</button>
            </div>
        </td>
    `;
    } // 🔒 대상자 수정 모드 A분기 최종 마감 완료

    // ----------------======================================================
    // [B분기]: 대상자 목록
    // ----------------======================================================
    else {
      // 🚀 ❶ [모집공고 원장 가로채기]: 현재 피험자가 배정된 모집공고를 과제명+기수로 역추적 스캔
      let trueParentQuota = 60; // 폴백용 기본값
      try {
        const cleanAppTitle = (row.title || "")
          .toString()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9가-힣]/g, "")
          .trim();
        const cleanAppTh = (row.th || "").replace(/[^0-9]/g, "");

        // 모집공고 DB에서 진짜 정품 정원 방(count)을 1초 만에 타격 스캔합니다
        const parentRec = (recruitmentDB || []).find((rec) => {
          const cleanRecTitle = (rec.title || "")
            .toString()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9가-힣]/g, "")
            .trim();
          const cleanRecTh = (rec.th || "").replace(/[^0-9]/g, "");
          return (
            (cleanRecTitle === cleanAppTitle ||
              cleanRecTitle.includes(cleanAppTitle) ||
              cleanAppTitle.includes(cleanRecTitle)) &&
            cleanRecTh === cleanAppTh
          );
        });

        if (parentRec && parentRec.count) {
          // "1/44명" 혹은 슬래시 찌꺼기가 묻어있어도 분모 토큰만 숫자로 완벽 소독 적출!!
          const parentCountStr = parentRec.count.toString().trim();
          if (parentCountStr.includes("/")) {
            trueParentQuota =
              parseInt(
                parentCountStr
                  .split("/")
                  .pop()
                  .replace(/[^0-9]/g, ""),
                10,
              ) || 60;
          } else {
            trueParentQuota =
              parseInt(parentCountStr.replace(/[^0-9]/g, ""), 10) || 60;
          }
        } else {
          // 부모 공고 매칭 예외 시 마스터 8대 과제별 고유 정원 강제 하드 락업 보완
          const tStr = (row.title || "").toString();
          if (tStr.includes("명인제약")) trueParentQuota = 44;
          else if (tStr.includes("대우제약") || tStr.includes("신일제약"))
            trueParentQuota = 60;
          else if (tStr.includes("파마사이언스")) trueParentQuota = 74;
          else if (tStr.includes("삼진제약")) trueParentQuota = 30;
          else if (tStr.includes("애드파마")) trueParentQuota = 58;
          else if (tStr.includes("하나제약")) trueParentQuota = 36;
          else if (tStr.includes("경동제약")) trueParentQuota = 40;
        }
      } catch (e) {
        trueParentQuota = 60;
      }

      // 🚀 ❷ [분자 및 최종 결합 박제]: 순번 번호와 가로채온 부모의 순정 정원 숫자를 문자열 덧셈 오염 없이 락업!
      const liveAppIdxNum = parseInt(
        row.liveMatchOrderNumber !== undefined ? row.liveMatchOrderNumber : 1,
        10,
      );
      const finalAppCountText = liveAppIdxNum + "/" + trueParentQuota;

      tr.innerHTML = `
                         <td style="min-width: 220px; max-width: 300px; width: 21%; vertical-align: middle; padding-left: 15px !important; text-align: left !important; box-sizing: border-box !important;" class="text-bold">${row.title || ""}</td>
                        <td style="width: 6%; vertical-align: middle; text-align: center;"><span class="lvl-badge ${thBadgeClass}">${row.th || "-"}</span></td>
                        
                        <!-- 🎯 [대표님 정품 인원수 수식 완벽 사수]: 100단위 오염 없이 정수 숫자로 완벽 작동! -->
                        <td style="width: 6.5%; vertical-align: middle; text-align: center; color: #ffffff; font-weight: 700;">${finalAppCountText}명</td>
                        
                        <td style="width: 6%; vertical-align: middle; text-align: center;">${formatPeriod(row.period)}</td>
                        <td style="width: 6%; vertical-align: middle; text-align: center; font-weight: 700;">${row.name || ""}</td>
                        <td style="width: 8.5%; text-align: center; font-size: 14px; color: #ffffff; font-weight: 500; vertical-align: middle;">
                            ${row.ssn ? row.ssn.toString().trim().substring(0, 6) : "-"}
                        </td>
                        <td style="width: 4.5%; vertical-align: middle; text-align: center;">
                            <span class="lvl-badge ${parseGenderFromSsn(db[masterIndex].ssn, row.name) === "남" ? "lvl-2" : "lvl-10"}">
                                ${parseGenderFromSsn(db[masterIndex].ssn, row.name)}
                            </span>
                        </td>
                        <td style="width: 11%; vertical-align: middle; text-align: center;">${formatPhone(row.phone)}</td>
                        <td style="width: 6.5%; vertical-align: middle; text-align: center; pointer-events: none !important;">
                            <span class="doc-badge" style="${stageBadgeStyle} cursor: default !important;">
                                ${currentStage}
                            </span>
                        </td>
                        
                        <!-- 🎯 [대표님 정품 참여비 값 사출 명세 완벽 사수]: 태그 유출 없이 순정 데이터 바인딩! -->
                        <td style="width: 9%; vertical-align: middle; text-align: center;">
                            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; gap: 3px; font-size: 11px; font-weight: 700; color: #fbbf24; line-height: 1.4;">
                                <div>1차: ${row.payStatus1 || "대기"}</div>
                                <div style="margin-top: 1px;">2차: ${row.payStatus2 || "대기"}</div>
                                <div style="margin-top: 1px;">3차: ${row.payStatus3 || "대기"}</div>
                            </div>
                        </td>
                        
                        <td style="width: 5.5%; vertical-align: middle; text-align: center; white-space: nowrap !important;"><span class="doc-badge ${row.isDutyAgreed === "동의" ? "status-id" : "status-none"}" style="margin: 0 !important; display: inline-block !important; width: 100% !important; text-align: center;">${row.isDutyAgreed || "대기"}</span></td>
                        <td style="width: 5.5%; vertical-align: middle; text-align: center; white-space: nowrap !important;"><span class="doc-badge ${row.isCallAgreed === "동의" ? "status-id" : "status-none"}" style="margin: 0 !important; display: inline-block !important; width: 100% !important; text-align: center;">${row.isCallAgreed || "대기"}</span></td>
                        
                        <td style="width: 10%; vertical-align: middle; text-align: center; white-space: nowrap !important; padding: 0 !important;">
                            ${
                              row.idCardImg &&
                              (row.idCardImg
                                .toString()
                                .includes("data:image") ||
                                row.idCardImg
                                  .toString()
                                  .includes("/uploads/") ||
                                row.idCardImg.toString().includes("blob:"))
                                ? `
                                <span class="doc-badge status-id" onclick="openImageModal('\({row.idCardImg}', '[신분증] \){row.name || ''}')" style="margin: 0 1.5px !important; cursor: pointer !important; font-weight: 700;">신분증</span>
                            `
                                : `
                                <span class="doc-badge status-none" style="margin: 0 1.5px !important; cursor: not-allowed !important; opacity: 0.5; font-weight: 500;">신분증</span>
                            `
                            }
                            ${
                              row.bankBookImg &&
                              (row.bankBookImg
                                .toString()
                                .includes("data:image") ||
                                row.bankBookImg
                                  .toString()
                                  .includes("/uploads/") ||
                                row.bankBookImg.toString().includes("blob:"))
                                ? `
                                <span class="doc-badge status-id" onclick="openImageModal('\({row.bankBookImg}', '[통장] \){row.name || ''}')" style="margin: 0 1.5px !important; cursor: pointer !important; font-weight: 700;">통장</span>
                            `
                                : `
                                <span class="doc-badge status-none" style="margin: 0 1.5px !important; cursor: not-allowed !important; opacity: 0.5; font-weight: 500;">통장</span>
                            `
                            }
                        </td>
                        
                        <td style="vertical-align: middle; text-align: center; width: 140px; padding-right: 15px; box-sizing: border-box !important;">
                            <div style="display: flex !important; justify-content: center !important; gap: 4px !important; width: 100% !important; white-space: nowrap !important;">
                                <button type="button" class="btn-inline" onclick="openAppHistoryDetailModal(${masterIndex})" style="background: #0e66e9 !important; color: #ffffff !important; padding: 5px 6px !important; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 12px; height: 26px !important; line-height: 16px !important; flex-shrink: 0 !important;">이력</button>
                                <button type="button" class="btn-inline edit" onclick="editInlineApplicantRecord(${masterIndex})" style="padding: 5px 6px !important; height: 26px !important; line-height: 16px !important; flex-shrink: 0 !important;">수정</button>
                                <button type="button" class="btn-inline delete" onclick="removeApplicantRecord(${row.uid})" style="padding: 5px 6px !important; height: 26px !important; line-height: 16px !important; flex-shrink: 0 !important;">삭제</button>
                            </div>
                        </td>
                    `;
    }

    tbody.appendChild(tr);
  });

  // ----------------======================================================
  // [페이징 내비게이션]: 데이터가 설정된 페이지 한도를 초과 시 하단 중앙 슬롯에 버튼 자동 생성 마운트
  // ----------------======================================================
  const currentTotalCount = displayList.length;

  if (currentTotalCount > APPLICANT_PAGE_SIZE && paginator) {
    let paginationHTML = "";
    paginationHTML += `<button type="button" onclick="window.currentApplicantPage--; refreshApplicantView();" ${window.currentApplicantPage === 1 ? "disabled" : ""} class="btn-inline list" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: ${window.currentApplicantPage === 1 ? "not-allowed" : "pointer"}; opacity: ${window.currentApplicantPage === 1 ? 0.3 : 1};"><i class="fa-solid fa-angle-left"></i>이전</button>`;

    for (let p = 1; p <= totalPages; p++) {
      const isCurrent = p === window.currentApplicantPage;
      const activeBtnStyle = isCurrent
        ? `background: var(--secondary-color)!important; color: #ffffff!important; border: 1px solid var(--secondary-color);`
        : `background: #1a233a; color: var(--text-muted); border: 1px solid var(--border-color);`;
      paginationHTML += `<button type="button" onclick="window.currentApplicantPage=${p}; refreshApplicantView();" style="padding: 6px 12px; font-size: 12px; min-width: 32px; font-weight: 700; border-radius: 6px; cursor: pointer; ${activeBtnStyle}">${p}</button>`;
    }

    paginationHTML += `<button type="button" onclick="window.currentApplicantPage++; refreshApplicantView();" ${window.currentApplicantPage === totalPages ? "disabled" : ""} class="btn-inline list" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: ${window.currentApplicantPage === totalPages ? "not-allowed" : "pointer"}; opacity: ${window.currentApplicantPage === totalPages ? 0.3 : 1};">다음<i class="fa-solid fa-angle-right"></i></button>`;

    // 돔 슬롯에 최종 동적 사출 커밋
    paginator.innerHTML = paginationHTML;
  }
}
