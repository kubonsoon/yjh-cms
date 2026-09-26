// ================================================================
// 1. 비동기 전산 트래킹 및 데이터 보존 마스터 전역 변수
// ================================================================
let currentChannel = "";
let currentChannelName = "";
let matchedPatientData = null;
let temporaryVerifiedName = "";
let myName = ""; // [정밀 교정 완결] 유실되었던 전역 주파수 락인 결합선 변수

// 모바일 화면 패널을 순차적으로 제어하는 인터페이스 스위칭 엔진
function navigateToStep(stepNumber) {
  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.style.display = "none";
    panel.classList.remove("active");
  });

  const targetPanel = document.getElementById("layer" + stepNumber);
  if (targetPanel) {
    targetPanel.style.display = "flex";
    targetPanel.classList.add("active");
  }
}

// 0단: QR코드 터치 스캔 시뮬레이션 처리
function executeStep0QRScan() {
  alert(
    "[QR 인식 성공] H+양지병원 임상시험 서버와 연동되었습니다. \n본인 인증 단계로 진입합니다.",
  );
  navigateToStep(1);
}

// 1단: 간편인증 수단 버튼 핸들러
function executeStep1Select(provider, providerName) {
  currentChannel = provider;
  currentChannelName = providerName;
  document.getElementById("lblDynamicForm").innerText =
    `이름 (${providerName} 명의 정보)`;
  const submitBtn = document.getElementById("btnSubmitForm");
  if (submitBtn) {
    submitBtn.className = "btn-submit theme-btn-" + provider;
  }
  navigateToStep(2);
}

// 2단: [하이브리드 이중 분기 패치] 마스터 DB 대조 및 신규 유저 대상 가상 계정 즉석 발급 엔진
function executeStep2Submit() {
  const name = document.getElementById("txtUserName").value.trim();
  const birth = document
    .getElementById("txtUserBirth")
    .value.trim()
    .replace(/[^0-9]/g, "");
  const phone = document
    .getElementById("txtUserPhone")
    .value.trim()
    .replace(/[^0-9]/g, "");
  const isAgreed = document.getElementById("chkAgree").checked;

  if (!name || !birth || !phone)
    return alert("본인 식별을 위한 입력 필드를 빠짐없이 채워주세요.");
  if (!isAgreed) return alert("개인정보 활용 동의 체크박스 수락이 필요합니다.");

  temporaryVerifiedName = name;
  let adminApplicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];

  // [교정 반영]: 입력된 생년월일 데이터의 앞 6자리 스트링만 컴팩트하게 추출
  const cleanInputBirth6 = birth.substring(0, 6);

  // [교정 반영]: 특수문자, 하이픈, 미세공백 찌꺼기를 완벽히 발라내어 매칭 무력화를 방어하는 이중 소독 가드 가동
  matchedPatientData = adminApplicantDB.find((user) => {
    const cleanInputName = name.replace(/\s/g, "");
    const cleanDbName = (user.name || "").toString().replace(/\s/g, "");

    // 원본 데이터베이스 주민번호에서 숫자만 추출한 뒤 무조건 앞 6자리만 잘라내어 동등 규격화
    const rawDbBirth = (user.ssn || "").toString().replace(/[^0-9]/g, "");
    const cleanDbBirth6 = rawDbBirth.substring(0, 6);

    // 원본 데이터베이스 전화번호에서 하이픈을 소독하여 순수 숫자 스트링으로 단일화
    const cleanDbPhone = (user.phone || "").toString().replace(/[^0-9]/g, "");

    return (
      cleanDbName === cleanInputName &&
      cleanDbBirth6 === cleanInputBirth6 &&
      cleanDbPhone === phone
    );
  });

  const popup = document.getElementById("popupEmbedded3");

  if (matchedPatientData) {
    // [트랙 A: 기존 등록 대상자 매칭 성공] 세션 바인딩 및 정산안내 모달 알림 컨텍스트 구성
    sessionStorage.setItem("certifiedUserName", name);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ name: name, isNew: false }),
    );

    if (window.opener && !window.opener.closed) {
      window.opener.currentCertifiedUser = matchedPatientData;
    }

    let adminRecruitmentDB =
      JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];
    const matchedRec = adminRecruitmentDB.find((rec) => {
      const recTitleClean = (rec.title || "")
        .toString()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9가-힣]/g, "")
        .trim();
      const appTitleClean = (matchedPatientData.title || "")
        .toString()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9가-힣]/g, "")
        .trim();
      const recTh = (rec.th || "").toString().replace(/[^0-9]/g, "");
      const appTh = (matchedPatientData.th || "")
        .toString()
        .replace(/[^0-9]/g, "");
      return recTitleClean === appTitleClean && recTh === appTh;
    });

    // [교정 반영]: 마스터 대장에 등록된 대상자의 주민번호 원본(ssn)에서 생년월일 앞 6자리와 성별을 정밀 사출
    const rawDbSsn = (matchedPatientData.ssn || "").toString().trim();
    const displayBirth = rawDbSsn.substring(0, 6) || "-";

    // admin.html 성별 판정 엔진 인터셉트 연동
    let displayGender = "미정";
    if (
      rawDbSsn.includes("-M") ||
      rawDbSsn.endsWith("M") ||
      rawDbSsn.endsWith("1") ||
      rawDbSsn.endsWith("3")
    ) {
      displayGender = "남";
    } else if (
      rawDbSsn.includes("-F") ||
      rawDbSsn.endsWith("F") ||
      rawDbSsn.endsWith("2") ||
      rawDbSsn.endsWith("4")
    ) {
      displayGender = "여";
    }

    // [교정 반영]: 모집공고 마스터 대장에서 기록된 가변형 차수별 일정(paySchedule) 데이터를 누수 없이 통째로 릴레이
    const finalPayScheduleLog =
      matchedRec && matchedRec.paySchedule
        ? matchedRec.paySchedule.toString().replace(/\s*\/\s*/g, "\n")
        : "추후 공지 예정";

    popup.parentElement.className = "popup-display-zone pop-theme-pass";
    if (document.getElementById("icoPop")) {
      document.getElementById("icoPop").className = "fa-solid fa-circle-check";
    }
    document.getElementById("txtPopTitle").innerText = "본인인증 승인 (PASS)";

    // [요구사항 가이드 형식을 100% 만족하는 정형화 목록 텍스트 마운트]
    document.getElementById("txtPopMessage").innerText =
      `• 인증기관: ${currentChannelName} 연동모듈\n` +
      `• 대상자: ${matchedPatientData.name || name} (${displayBirth} / ${displayGender})\n` +
      `• 시험명: ${matchedPatientData.title || "미배정 과제"}\n` +
      `• 기수: ${matchedPatientData.th || "1기"}\n\n` +
      ` [참여비 지급 예정일]\n${finalPayScheduleLog}\n\n` +
      `아래 확인 버튼을 클릭하면 참여중인 시험현황으로 이동합니다.`;
  } else {
    // [트랙 B: 최초 방문 신규 대상자 가드] 유령 데이터 터짐을 막기 위해 디폴트 풀백값 매핑
    const ghostPassTicket = {
      uid: "VIRTUAL_" + Date.now(),
      name: name,
      ssn: birth,
      phone: phone.replace(/(\d{3})(\d{4})(\d{4})/, "\$1-\$2-\$3"), // 관리자 폼 호환 하이픈 규격화
      title: "신규 방문 과제 미배정",
      th: "1기",
      count: "-",
      period: "-",
      payStatus: "대기",
      isNewUserGhost: true,
    };

    adminApplicantDB.push(ghostPassTicket);
    localStorage.setItem(
      "dataStoreApplicant",
      JSON.stringify(adminApplicantDB),
    );
    matchedPatientData = ghostPassTicket;
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ name: name, isNew: true }),
    );

    popup.parentElement.className = "popup-display-zone pop-theme-pass";
    if (document.getElementById("icoPop")) {
      document.getElementById("icoPop").className = "fa-solid fa-circle-check";
    }
    document.getElementById("txtPopTitle").innerText =
      "신규 대상자 본인인증 완료";
    document.getElementById("txtPopMessage").innerText =
      `• 연계기관: ${currentChannelName} 연동모듈\n• 대상자명: ${name}님\n\n양지병원 임상시험 참여 이력이 없는 최초 방문 대상자입니다.\n\n확인 버튼을 선택하시면 정산 페이지 대신, [실시간 임상시험 일정관리 스케줄러] 화면으로 유연하게 리디렉션 연동됩니다.`;
  }
  navigateToStep(3);
}

// 3단: 인증 결과 창 확인 후 객체 속성 분석 역추적하여 전산망 분기
function executeStep3ConfirmNext() {
  if (!matchedPatientData) {
    navigateToStep(1);
    alert("인증 정보가 파괴되었거나 부적격 상태입니다. 다시 로그인해 주세요.");
    return;
  }

  // [분기 트랙 B] 참여 이력 없는 최초 방문 신규 대상자는 5단계 캘린더 컴포넌트로 리디렉션
  if (matchedPatientData.isNewUserGhost) {
    navigateToStep(5);
    document.getElementById("lblSetTargetNew").innerText =
      `${matchedPatientData.name} 대상자님 (최초인증)`;

    const iframe = document.getElementById("mobileCalendarFrame");
    if (
      iframe &&
      iframe.contentWindow &&
      typeof iframe.contentWindow.renderCalendar === "function"
    ) {
      iframe.contentWindow.renderCalendar();
    }
    return;
  }

  // =========================================================================
  // [정밀 교정 완결]: 유실되었던 전역 주파수 myName 락인 결합선 복원 (중복적재 영구 차단)
  // =========================================================================
  myName = matchedPatientData.name || "홍길동";
  const systemCurrentTime = new Date("2026-09-11"); // 전산망 표준 현재 마스터 시점 고정
  const lastExamDate = matchedPatientData.recDate
    ? new Date(matchedPatientData.recDate)
    : null;

  if (lastExamDate) {
    const timeDiff = systemCurrentTime.getTime() - lastExamDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // 180일 (6개월) 이상 경과 완료된 기존 참여 대상자 격리 가드 발동
    if (dayDiff >= 180) {
      alert(
        `전산망 보안 안내\n\n대상자 ${matchedPatientData.name} 님은 마지막 시험 참여 후 6개월(현재 ${dayDiff}일 경과)이 지나 새로운 시험에 참여가 가능합니다.\n\n확인을 누르면 모바일 모집공고 캘린더 화면으로 이동합니다.`,
      );
      navigateToStep(5);

      // 5단계 상황판 상단 라벨에 격리 해제 식별 성명을 실시간 강제 오버라이드 명세
      if (document.getElementById("lblSetTargetNew")) {
        document.getElementById("lblSetTargetNew").innerText =
          `${matchedPatientData.name} 대상자님 (6개월 경과 격리해제)`;
      }

      // 매립된 가상 달력 프레임의 진짜 캘린더 렌더러 함수를 무선 호출 가동
      const iframe = document.getElementById("mobileCalendarFrame");
      if (
        iframe &&
        iframe.contentWindow &&
        typeof iframe.contentWindow.renderCalendar === "function"
      ) {
        iframe.contentWindow.renderCalendar();
      }
      return; // 4단계 정산 신청서 서식 폼으로의 진입을 완벽하게 원천 차단
    }
  }

  // [분기 트랙 A] 기존 연동 완료 대상자 4단계 실시간 데이터 동기화 마운트
  navigateToStep(4);

  // 정사각형 라운드 배지 텍스트 개행 매핑 안전 이식 완결
  const cmsBadgeSlot = document.getElementById("cms-badge");
  if (cmsBadgeSlot && matchedPatientData) {
    // 로컬 DB 마스터 대장의 최신 참여상태 필드 실시간 확보
    const currentStage = (matchedPatientData.stage || "소집").toString().trim();

    if (currentStage === "종료") {
      // 관리자가 대장에서 '종료'로 수정해둔 상태라면 즉시 모바일 배지 리스킨
      cmsBadgeSlot.innerText = "정산\n(종료)";
      cmsBadgeSlot.style.background = "#475569"; // 신뢰감을 주는 슬레이트 다크 실버 스킨
    } else if (currentStage === "투약") {
      cmsBadgeSlot.innerText = "진행\n(투약)";
      cmsBadgeSlot.style.background = "#0ea5e9";
    } else {
      cmsBadgeSlot.innerText = `참여\n(${currentStage})`;
      cmsBadgeSlot.style.background = "#0056B3"; // 순정 소집 블루 테마 보존
    }
  }

  // =========================================================================
  // [통합 추가] 최하단 "시험일정" 버튼 노출 및 기존 제출 버튼 가드 잠금 개방
  // =========================================================================
  const calendarBtn = document.getElementById("ui_calendar_redirect_btn");
  const submitBtn = document.getElementById("ui_submit_btn");
  const currentStage = (matchedPatientData.stage || "소집").toString().trim();

  if (currentStage === "종료") {
    // 관리자 승인 대기중 버튼 아래에 "시험일정" 단추 활성화 노출
    if (calendarBtn) {
      calendarBtn.style.setProperty("display", "block", "important");
    }
    // 기존 지급 신청 버튼은 완결 문구와 함께 실시간 락인 잠금
    if (submitBtn) {
      submitBtn.innerText = "지급 청구 마감 (과제 종료)";
      submitBtn.disabled = true;
      submitBtn.style.background = "#1e293b";
      submitBtn.style.cursor = "not-allowed";
    }
    // 5단계 스케줄러 프레임 상단 라벨 성명 미리 상속 동기화
    if (document.getElementById("lblSetTargetNew")) {
      document.getElementById("lblSetTargetNew").innerText =
        `${matchedPatientData.name || "대상자"}님 (임상 과제 완결)`;
    }
  } else {
    // 종료 상태가 아닌 일반 참여/소집 상태일 때는 일정 버튼 철저히 은폐
    if (calendarBtn) calendarBtn.style.display = "none";
  }

  // 1. 실제 연동 시험 공고의 진짜 기수(th) 실시간 치환 주입
  const trialCategorySlot = document.getElementById("lblTrialCategory");
  if (trialCategorySlot) {
    trialCategorySlot.innerText = matchedPatientData.th
      ? `${matchedPatientData.th} 시험`
      : "과제 기수 미정";
  }

  // 2. 실제 연동 시험명 매핑
  document.getElementById("lblTrialTitle").innerText =
    matchedPatientData.title || "참여 과제 정보 없음";

  // 3. 하이픈 뒤 숫자 박멸 및 성별 분리 배지화 공정 가동
  const rawDbSsn = (matchedPatientData.ssn || "").toString().trim();
  const displayBirth6 = rawDbSsn.substring(0, 6) || "-";
  let genderBadgeHtml = "";

  if (
    rawDbSsn.includes("-M") ||
    rawDbSsn.endsWith("M") ||
    rawDbSsn.endsWith("1") ||
    rawDbSsn.endsWith("3")
  ) {
    genderBadgeHtml = `<span class="gender-indicator-badge gender-m">남</span>`;
  } else if (
    rawDbSsn.includes("-F") ||
    rawDbSsn.endsWith("F") ||
    rawDbSsn.endsWith("2") ||
    rawDbSsn.endsWith("4")
  ) {
    genderBadgeHtml = `<span class="gender-indicator-badge gender-f">여</span>`;
  }

  // 요구사항 서식 규칙 일치화 지정 사출
  document.getElementById("ui_target_name_zone").innerHTML =
    `<span>대상자: ${matchedPatientData.name} (${displayBirth6})</span>${genderBadgeHtml}`;

  // 4. 모집공고 마스터 가상 DB를 실시간 역추적하여 과제 배정 진짜 담당 CRC 사원명 바인딩
  let adminRecruitmentDB =
    JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];
  const realRecData = adminRecruitmentDB.find((rec) => {
    const recTitle = (rec.title || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .trim();
    const appTitle = (matchedPatientData.title || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .trim();
    const recTh = (rec.th || "").toString().replace(/[^0-9]/g, "");
    const appTh = (matchedPatientData.th || "")
      .toString()
      .replace(/[^0-9]/g, "");
    return recTitle === appTitle && recTh === appTh;
  });

  const realCrcName = realRecData ? realRecData.crc : "이승호";
  document.getElementById("ui_crc_name_zone").innerText =
    `담당자: ${realCrcName}`;

  // 5. 가짜 계좌번호 가이드 소독 및 대상자 계좌 연동 패킷 실시간 주입
  const bankInputSlot = document.getElementById("ui_bank_input");
  if (bankInputSlot) {
    if (matchedPatientData.accountInfo) {
      const accountTokens = matchedPatientData.accountInfo.split(" ");
      if (accountTokens.length >= 2) {
        const savedBank = accountTokens[0];
        const savedAccount = accountTokens.slice(1).join(" ");
        const bankSelectSlot = document.getElementById("ui_bank_select");
        if (bankSelectSlot) {
          for (let i = 0; i < bankSelectSlot.options.length; i++) {
            if (
              bankSelectSlot.options[i].text.includes(savedBank) ||
              bankSelectSlot.options[i].value === savedBank
            ) {
              bankSelectSlot.selectedIndex = i;
              break;
            }
          }
        }
        bankInputSlot.value = savedAccount;
      } else {
        bankInputSlot.value = matchedPatientData.accountInfo;
      }
    } else {
      bankInputSlot.value = "";
    }
  }

  if (matchedPatientData.stage) {
    document.getElementById("ui_stage_text").innerHTML =
      matchedPatientData.stage;
  }

  setMobileFormActive(false);
  startAdminApprovalMonitor();
}

// 진짜 파일 첨부 데이터 스트림 보존용 전역 메모리 버퍼
let idCardBase64 = "";
let bankBookBase64 = "";

// 4단 스마트 폼 비동기 장벽 원격 해제 스위치 (진짜 파일 업로드 가드 결합 정화)
function setMobileFormActive(isActive) {
  const isDisable = !isActive;
  let adminApplicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const cleanSessionName = (
    sessionStorage.getItem("certifiedUserName") || myName
  )
    .toString()
    .replace(/\s/g, "");
  const currentRecord = adminApplicantDB.find(
    (u) => u.name.toString().replace(/\s/g, "") === cleanSessionName,
  );
  const isProcessingNow = currentRecord && currentRecord.payStatus === "처리중";

  if (isProcessingNow) {
    if (document.getElementById("ui_bank_select"))
      document.getElementById("ui_bank_select").disabled = true;
    if (document.getElementById("ui_bank_input"))
      document.getElementById("ui_bank_input").disabled = true;

    const box1 = document.getElementById("doc_box_1");
    const box2 = document.getElementById("doc_box_2");
    if (box1) box1.className = "upload-box";
    if (box2) box2.className = "upload-box";

    const fileBtn1 = document.getElementById("id_select_btn");
    const fileBtn2 = document.getElementById("bank_select_btn");
    if (fileBtn1) {
      fileBtn1.innerText = "변경불가";
      fileBtn1.style.cursor = "not-allowed";
    }
    if (fileBtn2) {
      fileBtn2.innerText = "변경불가";
      fileBtn2.style.cursor = "not-allowed";
    }

    const submitBtn = document.getElementById("ui_submit_btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.className = "btn-submit-form bg-slate-lock";
      submitBtn.innerText = " 지급 신청 완료 (정산 처리중)";
    }
    return;
  }

  if (document.getElementById("ui_bank_select"))
    document.getElementById("ui_bank_select").disabled = isDisable;
  if (document.getElementById("ui_bank_input"))
    document.getElementById("ui_bank_input").disabled = isDisable;

  const box1 = document.getElementById("doc_box_1");
  const box2 = document.getElementById("doc_box_2");

  if (isActive) {
    if (box1) box1.className = "upload-box active-click";
    if (box2) box2.className = "upload-box active-click";
  } else {
    if (box1 && !idCardBase64) box1.className = "upload-box";
    if (box2 && !bankBookBase64) box2.className = "upload-box";
  }

  const submitBtn = document.getElementById("ui_submit_btn");
  if (submitBtn) {
    const isAlreadyReceived =
      currentRecord && currentRecord.payStatus === "접수";
    if (isActive || isAlreadyReceived) {
      submitBtn.disabled = false;
      submitBtn.className = "btn-submit-form";
      submitBtn.style.background = "#0284c7";
      submitBtn.style.cursor = "pointer";
      if (isAlreadyReceived || idCardBase64 || bankBookBase64) {
        submitBtn.innerText = "지급 신청하기 (변경하기)";
      } else {
        submitBtn.innerText = "지급 신청하기 (관리자 승인 완료)";
      }
    } else {
      submitBtn.disabled = true;
      submitBtn.className = "btn-submit-form";
      submitBtn.style.background = "#9ca3af";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.innerText = "관리자 승인 대기 중 (신청 불가)";
    }
  }
}

// 첨부서류 박스 파일 선택 단추 터치 시 매립된 진짜 파일 태그 트리거 브릿지
function triggerFileInput(type) {
  let adminApplicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const cleanSessionName = (
    sessionStorage.getItem("certifiedUserName") || myName
  )
    .toString()
    .replace(/\s/g, "");
  const currentRecord = adminApplicantDB.find(
    (u) => u.name.toString().replace(/\s/g, "") === cleanSessionName,
  );

  if (currentRecord && currentRecord.payStatus === "처리중") {
    alert(" 정산 처리중 상태이므로 서류를 더 이상 변경할 수 없습니다.");
    return;
  }

  const authSignal = JSON.parse(localStorage.getItem("msg_auth_signal"));
  const isOpened =
    authSignal && authSignal.name === myName && authSignal.isAllow === true;
  const isAlreadyReceived = currentRecord && currentRecord.payStatus === "접수";

  if (!isOpened && !isAlreadyReceived) {
    alert(
      "알림: 관리자의 [신청가능 개방] 승인이 완료된 후에 서류 첨부가 가능합니다.",
    );
    return;
  }

  if (type === "id") document.getElementById("real_file_id").click();
  else if (type === "bank") document.getElementById("real_file_bank").click();
}

// [참조 오류 디버깅 완결]: 변수명 주파수를 단일화하여 진짜 이미지 패킷을 가로채는 인코더 엔진
function handleFileSelect(input, type) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const base64String = e.target.result;
      if (type === "id") {
        idCardBase64 = base64String;
        const box1 = document.getElementById("doc_box_1");
        const idTxt = document.getElementById("id_status_txt");
        if (box1 && idTxt) {
          box1.className = "upload-box upload-complete";
          idTxt.style.color = "#4ade80";
          idTxt.innerHTML = ` 신분증 첨부 완료`;
          const btn = document.getElementById("id_select_btn");
          if (btn) btn.innerText = "변경하기";
        }
      } else if (type === "bank") {
        bankBookBase64 = base64String;
        const box2 = document.getElementById("doc_box_2");
        const bankTxt = document.getElementById("bank_status_txt");
        if (box2 && bankTxt) {
          box2.className = "upload-box upload-complete";
          bankTxt.style.color = "#4ade80";
          bankTxt.innerHTML = ` 통장사본 첨부 완료`;
          const btn = document.getElementById("bank_select_btn");
          if (btn) btn.innerText = "변경하기";
        }
      }

      const submitBtn = document.getElementById("ui_submit_btn");
      if (submitBtn && submitBtn.disabled === false) {
        submitBtn.innerText = "지급 신청하기 (변경하기)";
      }
      console.log(
        `[전산 정화] 모바일 증빙 서류 이미지 파일 데이터 패킷 인코딩 성공: ${file.name}`,
      );
    };

    reader.readAsDataURL(file);
  }
}

// 부모 관리자 시스템 및 m-adm 원격 제어반 글로벌 시그널 폴링 추적 하이브리드 루프
function startAdminApprovalMonitor() {
  const monitorInterval = setInterval(function () {
    const currentVerifiedSessionName =
      sessionStorage.getItem("certifiedUserName") || myName;
    const cleanSessionName = currentVerifiedSessionName
      .toString()
      .replace(/\s/g, "");

    let adminApplicantDB =
      JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
    const liveRecord = adminApplicantDB.find(
      (u) => u.name.toString().replace(/\s/g, "") === cleanSessionName,
    );

    if (liveRecord) {
      const mobileBadge = document.getElementById("cms-badge");
      const stageTxtSlot = document.getElementById("ui_stage_text");

      // [실시간 원격 리스킨 인터셉터]: 관리자가 PC에서 상태를 '종료'로 정하는 즉시 모바일 연쇄 동기화 상시 미러링
      if (liveRecord.stage === "종료") {
        if (mobileBadge) {
          mobileBadge.innerText = "정산\n(종료)";
          mobileBadge.style.setProperty("background", "#475569", "important");
        }
        if (stageTxtSlot) {
          stageTxtSlot.innerHTML =
            '<b style="color:#4ade80;">임상시험 완결 종료 단계</b><br><span style="font-size:11px;color:#94A3B8;">* 본 과제의 정산 청구 및 금융 지급 심사가 정상 완료되었습니다.</span>';
        }

        // [통합 완착] 실시간 "시험일정" 버튼 노출 및 기존 제출 버튼 원격 마감 잠금
        const calendarBtn = document.getElementById("ui_calendar_redirect_btn");
        const submitBtn = document.getElementById("ui_submit_btn");
        if (calendarBtn) {
          calendarBtn.style.setProperty("display", "block", "important");
        }
        if (submitBtn) {
          submitBtn.innerText = "지급 청구 마감 (과제 종료)";
          submitBtn.disabled = true;
          submitBtn.style.background = "#1e293b";
          submitBtn.style.cursor = "not-allowed";
        }
      } else {
        const calendarBtn = document.getElementById("ui_calendar_redirect_btn");
        if (calendarBtn) calendarBtn.style.display = "none";
      }

      if (liveRecord.payStatus === "처리중") {
        setMobileFormActive(false); // 관리자가 처리중으로 넘기면 즉시 모바일 전체 잠금 역하강 트리거
        return;
      }
    }

    const pushSignal = JSON.parse(localStorage.getItem("msg_push_signal"));
    const cmsBadgeSlot = document.getElementById("cms-badge");
    if (pushSignal && pushSignal.name) {
      const cleanPushName = pushSignal.name.toString().replace(/\s/g, "");
      if (cleanPushName === cleanSessionName) {
        if (pushSignal.status === "PASS") {
          if (cmsBadgeSlot) {
            cmsBadgeSlot.className = "badge bg-blue state-pass";
            cmsBadgeSlot.innerText = "통과\n(지급)";
          }
          document.getElementById("history-log").innerHTML =
            "<span style='color: #10B981; font-weight:700;'>원격 통과 승인</span>";
        } else if (pushSignal.status === "FAIL") {
          if (cmsBadgeSlot) {
            cmsBadgeSlot.className = "badge bg-blue state-fail";
            cmsBadgeSlot.innerText = "탈락\n(정산)";
          }
          document.getElementById("history-log").innerHTML =
            "<span style='color: #F43F5E; font-weight:700;'>심사 탈락 반려</span>";
        }
      }
    }

    const authSignal = JSON.parse(localStorage.getItem("msg_auth_signal"));
    if (authSignal && authSignal.name) {
      const cleanAuthName = authSignal.name.toString().replace(/\s/g, "");
      if (cleanAuthName === cleanSessionName) {
        if (authSignal.isAllow === true) {
          setMobileFormActive(true);
          document.getElementById("history-log").innerHTML =
            "<span style='color:#4ade80; font-weight:700;'>지급 신청 개방</span>";
          myName = currentVerifiedSessionName;
        }
      }
    }

    if (
      window.opener &&
      !window.opener.closed &&
      window.opener.currentCertifiedUser
    ) {
      const currentStatus = window.opener.currentCertifiedUser.payStatus;
      if (currentStatus === "신청가능") {
        setMobileFormActive(true);
        document.getElementById("history-log").innerHTML =
          "<span style='color:#4ade80; font-weight:700;'>승인 신호 포착</span>";
        myName = sessionStorage.getItem("certifiedUserName") || myName;
      }
    }
  }, 1000);
}

// 4단: 최종 정산 데이터 전산 패킷 트랜잭션 전송 및 마스터 대장 원격 불 켜기 공정완결
function submitFinalSettlementForm() {
  const bankSelect = document.getElementById("ui_bank_select");
  const accountInput = document.getElementById("ui_bank_input");
  const selectedBankName = bankSelect
    ? bankSelect.options[bankSelect.selectedIndex].text
    : "";
  const inputtedAccount = accountInput ? accountInput.value.trim() : "";

  if (!bankSelect.value)
    return alert("알림: 참여비를 수령하실 은행을 선택해 주세요.");
  if (inputtedAccount === "")
    return alert("알림: 정산 처리를 위한 계좌번호를 입력해 주세요.");

  let adminApplicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const cleanSessionName = (
    sessionStorage.getItem("certifiedUserName") || myName
  )
    .toString()
    .replace(/\s/g, "");
  const idx = adminApplicantDB.findIndex(
    (user) => user.name.toString().replace(/\s/g, "") === cleanSessionName,
  );

  const isReSubmitting =
    idx !== -1 && adminApplicantDB[idx].payStatus === "접수";
  const finalIdCardImg =
    idCardBase64 || (isReSubmitting ? adminApplicantDB[idx].idCardImg : "");
  const finalBankBookImg =
    bankBookBase64 || (isReSubmitting ? adminApplicantDB[idx].bankBookImg : "");

  if (!finalIdCardImg)
    return alert("알림: 지급 증빙을 위한 신분증 사본을 반드시 첨부해 주세요.");
  if (!finalBankBookImg)
    return alert(
      "알림: 지급 증빙을 위한 통장사본 이미지를 반드시 첨부해 주세요.",
    );

  if (idx !== -1) {
    adminApplicantDB[idx].payStatus = "접수";
    adminApplicantDB[idx].accountInfo =
      `${selectedBankName} ${inputtedAccount}`;
    adminApplicantDB[idx].idCardImg = finalIdCardImg;
    adminApplicantDB[idx].bankBookImg = finalBankBookImg;

    localStorage.setItem(
      "dataStoreApplicant",
      JSON.stringify(adminApplicantDB),
    );

    alert(
      `[전산 정산 교정 완료]\n\n${adminApplicantDB[idx].name} 대상자님의 참여비 정산 청구서 및 변경 서류가 안전하게 재접수 완결되었습니다.`,
    );

    const targetBtn = document.getElementById("ui_submit_btn");
    if (targetBtn) {
      targetBtn.innerText = "지급 신청하기 (변경하기)";
    }
    if (document.getElementById("cms-badge")) {
      document.getElementById("cms-badge").innerText = "접수";
      document.getElementById("cms-badge").className = "badge bg-blue";
    }
    document.getElementById("history-log").innerHTML =
      "<strong style='color: #38bdf8;'>[재접수완료]</strong>";

    if (
      window.opener &&
      !window.opener.closed &&
      typeof window.opener.refreshApplicantView === "function"
    ) {
      window.opener.refreshApplicantView();
    } else if (
      window.opener &&
      !window.opener.closed &&
      typeof window.opener.refreshAdminMemberTableView === "function"
    ) {
      window.opener.refreshAdminMemberTableView();
    }
  } else {
    alert(
      "전산 오류: 데이터 동기화 유실로 인해 청구 접수가 거절되었습니다. 다시 로그인해 주세요.",
    );
  }
}

// [최종 연동 완결]: 제어반 무선 패킷 코드를 상시 역파싱하여 차수별 상세 정산 상태를 데이터베이스 대장에 PUSH 커밋
function commitFinalSettlement() {
  const authSignal = JSON.parse(localStorage.getItem("msg_auth_signal"));
  const targetStageCode =
    authSignal && authSignal.stageCode ? parseInt(authSignal.stageCode, 10) : 0;
  const currentVerifiedSessionName =
    sessionStorage.getItem("certifiedUserName") || myName;
  const cleanSessionName = currentVerifiedSessionName
    .toString()
    .replace(/\s/g, "");

  let applicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  let row = applicantDB.find(
    (u) => u.name.toString().replace(/\s/g, "") === cleanSessionName,
  );

  if (row) {
    if (targetStageCode === 1) {
      row.payStatus1 = "완료";
    } else if (targetStageCode === 2) {
      row.payStatus1 = "완료";
      row.payStatus2 = "완료";
      row.payStatus3 = "완료";
    } else if (targetStageCode === 3) {
      row.payStatus1 = "탈락정산";
    } else if (targetStageCode === 4) {
      row.payStatus1 = "예비정산";
    } else if (targetStageCode === 5) {
      row.payStatus1 = "중도정산";
    }

    row.idCardImg = idCardBase64;
    row.bankBookImg = bankBookBase64;

    localStorage.setItem("dataStoreApplicant", JSON.stringify(applicantDB));

    alert(
      `접수 완료\n\n귀하의 참여비 온라인 금융 정산 청구서 및 증빙 서류가 마스터 대장 전산망으로 안전하게 전송되었습니다.`,
    );

    const moBtn = document.getElementById("mo_submit_btn");
    if (moBtn) {
      moBtn.disabled = true;
      moBtn.innerText = "지급 신청 접수 완료";
      moBtn.style.opacity = "0.5";
    }
    console.log(
      `[백엔드 데이터 최종 종결] 대상자 ${row.name} 님의 차수별 정산 레코드 코딩 적재 완결.`,
    );

    if (
      window.opener &&
      !window.opener.closed &&
      typeof window.opener.refreshApplicantView === "function"
    ) {
      window.opener.refreshApplicantView();
    }
  }
}
