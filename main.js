// [보안 리팩토링]: database/dbcon.php 상수를 상속받아 Supabase 클라이언트 커넥션 실시간 연동
const { createClient } = window.supabase;
const supabase = createClient(
  window.CMS_CONFIG.SUPABASE_URL,
  window.CMS_CONFIG.SUPABASE_ANON_KEY,
);

let currentChannel = "";
let currentChannelName = "";
let matchedPatientData = null;
let temporaryVerifiedName = "";
let idCardFileObj = null; // 신분증 리얼 바이너리 파일 객체
let bankBookFileObj = null; // 통장사본 리얼 바이너리 파일 객체
let realtimeChannel = null;

// 모바일 화면 인터페이스 패널 순차적 제어 스위칭 엔진
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
    "[QR 인식 성공] H+양지병원 임상시험 실시간 클라우드 DB와 연동되었습니다. \n본인 인증 단계로 진입합니다.",
  );
  navigateToStep(1);
}

// 1단: 간편인증 수단 버튼 선택 브릿지 핸들러
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

// 2단: [Supabase Cloud DB 결합] 마스터 대조 및 신규 유저 대상 가상 계정 즉석 발급 엔진
async function executeStep2Submit() {
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
  const cleanInputBirth6 = birth.substring(0, 6);

  try {
    // [구형 로컬스토리지 전면 파괴]: applicants 테이블에서 실시간 검색 조건 할당
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .eq("name", name.replace(/\s/g, ""));

    if (error) throw error;

    // [정밀 이중 소독 가드]: 입력된 생년월일과 전화번호 찌꺼기를 세척하여 원본 DB 레코드와 정밀 매칭
    matchedPatientData = data.find((user) => {
      const rawDbBirth = (user.ssn || "").toString().replace(/[^0-9]/g, "");
      const cleanDbBirth6 = rawDbBirth.substring(0, 6);
      const cleanDbPhone = (user.phone || "").toString().replace(/[^0-9]/g, "");
      return cleanDbBirth6 === cleanInputBirth6 && cleanDbPhone === phone;
    });

    const popup = document.getElementById("popupEmbedded3");

    if (matchedPatientData) {
      // [트랙 A: 기존 등록 대상자 매칭 성공] 세션 바인딩 및 정산안내 컨텍스트 구성
      sessionStorage.setItem("certifiedUserName", name);

      const displayBirth =
        (matchedPatientData.ssn || "").substring(0, 6) || "-";
      let displayGender = "남";
      const rawDbSsn = (matchedPatientData.ssn || "").toString().trim();
      if (
        rawDbSsn.includes("-F") ||
        rawDbSsn.endsWith("F") ||
        rawDbSsn.endsWith("2") ||
        rawDbSsn.endsWith("4")
      ) {
        displayGender = "여";
      }

      popup.parentElement.className = "popup-display-zone pop-theme-pass";
      if (document.getElementById("icoPop")) {
        document.getElementById("icoPop").className =
          "fa-solid fa-circle-check";
      }
      document.getElementById("txtPopTitle").innerText = "본인인증 승인 (PASS)";

      const finalPayScheduleLog = matchedPatientData.pay_schedule
        ? matchedPatientData.pay_schedule.toString().replace(/\s*\/\s*/g, "\n")
        : "추후 공지 예정";

      document.getElementById("txtPopMessage").innerText =
        `• 인증기관: ${currentChannelName} 연동모듈\n` +
        `• 대상자: ${matchedPatientData.name} (${displayBirth} / ${displayGender})\n` +
        `• 시험명: ${matchedPatientData.title || "미배정 과제"}\n` +
        `• 기수: ${matchedPatientData.th || "1기"}\n\n` +
        ` [참여비 지급 예정일]\n${finalPayScheduleLog}\n\n` +
        `아래 확인 버튼을 클릭하면 참여중인 시험현황으로 이동합니다.`;
    } else {
      // [트랙 B: 최초 방문 신규 대상자 가드] 유령 데이터 유실을 막기 위해 Supabase 클라우드 대장에 정식 즉석 안착
      const ghostUid = "VIRTUAL_" + Date.now();
      const { data: newInsData, error: insErr } = await supabase
        .from("applicants")
        .insert([
          {
            uid: ghostUid,
            name: name,
            ssn: birth,
            phone: phone,
            title: "신규 방문 과제 미배정",
            th: "1기",
            stage: "소집",
            pay_status: "대기",
          },
        ])
        .select();

      if (insErr) throw insErr;

      if (newInsData && newInsData.length > 0) {
        matchedPatientData = newInsData[0];
      } else {
        matchedPatientData = {
          uid: ghostUid,
          name: name,
          ssn: birth,
          phone: phone,
          title: "신규 방문 과제 미배정",
          th: "1기",
          stage: "소집",
          pay_status: "대기",
        };
      }
      sessionStorage.setItem("certifiedUserName", name);

      popup.parentElement.className = "popup-display-zone pop-theme-pass";
      if (document.getElementById("icoPop")) {
        document.getElementById("icoPop").className =
          "fa-solid fa-circle-check";
      }
      document.getElementById("txtPopTitle").innerText =
        "신규 대상자 본인인증 완료";
      document.getElementById("txtPopMessage").innerText =
        `• 연계기관: ${currentChannelName} 연동모듈\n• 대상자명: ${name}님\n\n양지병원 임상시험 참여 이력이 없는 최초 방문 대상자입니다.\n\n확인 버튼을 선택하시면 정산 페이지 대신, [실시간 임상시험 일정관리 스케줄러] 화면으로 유연하게 리디렉션 연동됩니다.`;
    }
    navigateToStep(3);
  } catch (err) {
    console.error(err);
    alert(
      "전산망 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
}
// 3단: 인증 결과 창 확인 후 객체 속성 분석 역추적하여 전산망 분기
function executeStep3ConfirmNext() {
  if (!matchedPatientData) {
    navigateToStep(1);
    return;
  }

  // [분기 트랙 B] 참여 이력 없는 최초 방문 신규 대상자는 5단계 캘린더 컴포넌트로 리디렉션
  if (matchedPatientData.title === "신규 방문 과제 미배정") {
    navigateToStep(5);
    document.getElementById("lblSetTargetNew").innerText =
      `${matchedPatientData.name} 대상자님 (최초인증)`;
    return;
  }

  // [분기 트랙 A] 기존 연동 완료 대상자 4단계 실시간 데이터 동기화 마운트
  navigateToStep(4);
  renderSettlementForm();
  startSupabaseRealtimeMonitor(); // [실시간 혁신]: 폴링을 완벽하게 파괴하고 상시 실시간 미러링 가동
}

// 4단 화면 정산 양식 정보 바인딩 렌더러
function renderSettlementForm() {
  const currentStage = (matchedPatientData.stage || "소집").toString().trim();
  const cmsBadgeSlot = document.getElementById("cms-badge");

  if (cmsBadgeSlot) {
    if (currentStage === "종료") {
      cmsBadgeSlot.innerText = "정산\n(종료)";
      cmsBadgeSlot.style.background = "#475569"; // 슬레이트 다크 실버 스킨
    } else if (currentStage === "투약") {
      cmsBadgeSlot.innerText = "진행\n(투약)";
      cmsBadgeSlot.style.background = "#0ea5e9";
    } else {
      cmsBadgeSlot.innerText = `참여\n(${currentStage})`;
      cmsBadgeSlot.style.background = "#0056B3"; // 순정 소집 블루 테마 보존
    }
  }

  document.getElementById("lblTrialCategory").innerText = matchedPatientData.th
    ? `${matchedPatientData.th} 시험`
    : "과제 기수 미정";
  document.getElementById("lblTrialTitle").innerText =
    matchedPatientData.title || "참여 과제 정보 없음";

  const displayBirth6 = (matchedPatientData.ssn || "").substring(0, 6) || "-";
  let genderBadgeHtml =
    '<span class="gender-indicator-badge gender-m">남</span>';
  if (
    matchedPatientData.ssn &&
    (matchedPatientData.ssn.includes("F") ||
      matchedPatientData.ssn.endsWith("2") ||
      matchedPatientData.ssn.endsWith("4"))
  ) {
    genderBadgeHtml = '<span class="gender-indicator-badge gender-f">여</span>';
  }

  document.getElementById("ui_target_name_zone").innerHTML =
    `<span>대상자: ${matchedPatientData.name} (${displayBirth6})</span>${genderBadgeHtml}`;
  document.getElementById("ui_crc_name_zone").innerText =
    `담당 CRC: 연구원장 배정팀`;

  // 가짜 계좌번호 가이드를 소독하고 대상자 계좌 연동 패킷 실시간 주입
  if (matchedPatientData.bank_name && matchedPatientData.account_number) {
    document.getElementById("ui_bank_input").value =
      matchedPatientData.account_number;
    const bankSelect = document.getElementById("ui_bank_select");
    for (let i = 0; i < bankSelect.options.length; i++) {
      if (bankSelect.options[i].value === matchedPatientData.bank_name) {
        bankSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (matchedPatientData.stage) {
    document.getElementById("ui_stage_text").innerHTML =
      matchedPatientData.stage === "종료"
        ? `<b>임상시험 완결 종료 단계</b><br><span style="font-size:11px;color:#94A3B8;">* 본 과제의 정산 청구 및 금융 지급 심사가 정상 완료되었습니다.</span>`
        : `<b>신청 검증 단계</b><br><span style="font-size:11px;color:#94A3B8;">* 본 과제의 참여비 정산 신청 정보 및 증빙 서류 검수 검증 단계입니다.</span>`;
  }

  handleFormStateByStage(currentStage, matchedPatientData.pay_status);
}

// 상태값 변화에 따른 인풋 및 서식 가드 잠금 제어부
function handleFormStateByStage(stage, payStatus) {
  const isClosed = stage === "종료";
  const isProcessingNow = payStatus === "처리중";

  const calendarBtn = document.getElementById("ui_calendar_redirect_btn");
  const submitBtn = document.getElementById("ui_submit_btn");

  if (isClosed) {
    if (calendarBtn)
      calendarBtn.style.setProperty("display", "block", "important");
    if (submitBtn) {
      submitBtn.innerText = "지급 청구 마감 (과제 종료)";
      submitBtn.disabled = true;
      submitBtn.style.background = "#1e293b";
      submitBtn.style.cursor = "not-allowed";
    }
    setMobileFormActive(false);
    return;
  }

  if (isProcessingNow) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.className = "btn-submit-form bg-slate-lock";
      submitBtn.innerText = " 지급 신청 완료 (정산 처리중)";
    }
    setMobileFormActive(false);
    return;
  }

  if (payStatus === "신청가능" || payStatus === "접수") {
    setMobileFormActive(true);
    document.getElementById("history-log").innerHTML =
      "<span style='color:#4ade80; font-weight:700; '>지급 신청 개방</span>";
    if (submitBtn) {
      submitBtn.innerText =
        payStatus === "접수"
          ? "지급 신청하기 (변경하기)"
          : "지급 신청하기 (관리자 승인 완료)";
    }
  } else {
    setMobileFormActive(false);
    if (submitBtn) {
      submitBtn.innerText = "관리자 승인 대기 중 (신청 불가)";
    }
  }
}

// 스마트 폼 비동기 장벽 원격 해제 스위치
function setMobileFormActive(isActive) {
  document.getElementById("ui_bank_select").disabled = !isActive;
  document.getElementById("ui_bank_input").disabled = !isActive;

  const box1 = document.getElementById("doc_box_1");
  const box2 = document.getElementById("doc_box_2");
  const submitBtn = document.getElementById("ui_submit_btn");

  if (isActive) {
    if (box1) box1.className = "upload-box active-click";
    if (box2) box2.className = "upload-box active-click";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.background = "#0284c7";
      submitBtn.style.cursor = "pointer";
    }
  } else {
    if (box1) box1.className = "upload-box";
    if (box2) box2.className = "upload-box";
    if (submitBtn && matchedPatientData.pay_status !== "처리중") {
      submitBtn.disabled = true;
      submitBtn.style.background = "#9ca3af";
      submitBtn.style.cursor = "not-allowed";
    }
  }
}

// 첨부서류 박스 선택 시 매립된 진짜 파일 태그 트리거 브릿지
function triggerFileInput(type) {
  if (matchedPatientData && matchedPatientData.pay_status === "처리중") {
    alert("정산 처리중 상태이므로 서류를 더 이상 변경할 수 없습니다.");
    return;
  }
  if (type === "id") document.getElementById("real_file_id").click();
  else if (type === "bank") document.getElementById("real_file_bank").click();
}

// 이미지 파일을 가로채 UI 스킨 상태값 변경 처리 핸들러
function handleFileSelect(input, type) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (type === "id") {
      idCardFileObj = file; // 바이너리 스트림 직접 바인딩
      document.getElementById("doc_box_1").className =
        "upload-box upload-complete";
      document.getElementById("id_status_txt").style.color = "#4ade80";
      document.getElementById("id_status_txt").innerHTML = `✔ 신분증 첨부 완료`;
      document.getElementById("id_select_btn").innerText = "변경하기";
    } else if (type === "bank") {
      bankBookFileObj = file;
      document.getElementById("doc_box_2").className =
        "upload-box upload-complete";
      document.getElementById("bank_status_txt").style.color = "#4ade80";
      document.getElementById("bank_status_txt").innerHTML =
        `✔ 통장사본 첨부 완료`;
      document.getElementById("bank_select_btn").innerText = "변경하기";
    }

    const submitBtn = document.getElementById("ui_submit_btn");
    if (submitBtn && submitBtn.disabled === false) {
      submitBtn.innerText = "지급 신청하기 (변경하기)";
    }
  }
}
// [Supabase Storage & DB 통합] 서류 이미지 스토리지 업로드 및 정산 최종 커밋 공정
async function submitFinalSettlementForm() {
  const bankSelect = document.getElementById("ui_bank_select");
  const accountInput = document.getElementById("ui_bank_input");
  const selectedBankName = bankSelect
    ? bankSelect.options[bankSelect.selectedIndex].value
    : "";
  const inputtedAccount = accountInput ? accountInput.value.trim() : "";

  if (!selectedBankName)
    return alert("알림: 참여비를 수령하실 은행을 선택해 주세요.");
  if (inputtedAccount === "")
    return alert("알림: 정산 처리를 위한 계좌번호를 입력해 주세요.");

  // 서류 업로드 검증 세척 가드
  if (!idCardFileObj && !matchedPatientData.id_card_url)
    return alert("알림: 지급 증빙을 위한 신분증 사본을 반드시 첨부해 주세요.");
  if (!bankBookFileObj && !matchedPatientData.bank_book_url)
    return alert(
      "알림: 지급 증빙을 위한 통장사본 이미지를 반드시 첨부해 주세요.",
    );

  try {
    document.getElementById("ui_submit_btn").innerText = "서류 패킷 전송 중...";
    document.getElementById("ui_submit_btn").disabled = true;

    let finalIdCardUrl = matchedPatientData.id_card_url;
    let finalBankBookUrl = matchedPatientData.bank_book_url;

    // 1. [Supabase Storage] 신분증 원격 바이너리 인서트
    if (idCardFileObj) {
      const fileExt = idCardFileObj.name.split(".").pop();
      const fileName = `${matchedPatientData.id}_id_card.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from("medical-documents")
        .upload(`applicants/${fileName}`, idCardFileObj, { upsert: true });

      if (uploadErr) throw uploadErr;
      const { data: idUrlData } = supabase.storage
        .from("medical-documents")
        .getPublicUrl(`applicants/${fileName}`);
      finalIdCardUrl = idUrlData.publicUrl;
    }

    // 2. [Supabase Storage] 통장사본 원격 바이너리 인서트
    if (bankBookFileObj) {
      const fileExt = bankBookFileObj.name.split(".").pop();
      const fileName = `${matchedPatientData.id}_bank_book.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from("medical-documents")
        .upload(`applicants/${fileName}`, bankBookFileObj, { upsert: true });

      if (uploadErr) throw uploadErr;
      const { data: bankUrlData } = supabase.storage
        .from("medical-documents")
        .getPublicUrl(`applicants/${fileName}`);
      finalBankBookUrl = bankUrlData.publicUrl;
    }

    // 3. [Supabase DB Update] applicants 마스터 테이블 데이터 수술 커밋 완료
    const { error: updateErr } = await supabase
      .from("applicants")
      .update({
        pay_status: "접수",
        bank_name: selectedBankName,
        account_number: inputtedAccount,
        id_card_url: finalIdCardUrl,
        bank_book_url: finalBankBookUrl,
      })
      .eq("id", matchedPatientData.id);

    if (updateErr) throw updateErr;

    // 표준 전산화 규격 용어 완벽 엄수 지정 사출
    alert(
      `[전산 정산 완료]\n\n${matchedPatientData.name} 대상자님의 참여비 온라인 금융 정산 청구서 및 증빙 서류가 마스터 대장 전산망으로 안전하게 전송되었습니다.`,
    );

    document.getElementById("ui_submit_btn").innerText =
      "지급 신청하기 (변경하기)";
    document.getElementById("ui_submit_btn").disabled = false;
    document.getElementById("history-log").innerHTML =
      "<span style='color:#38bdf8; font-weight:700;'>[접수완료]</span>";

    // 전역 동적 메모리 실시간 리프레시 반영
    matchedPatientData.pay_status = "접수";
    matchedPatientData.bank_name = selectedBankName;
    matchedPatientData.account_number = inputtedAccount;
    matchedPatientData.id_card_url = finalIdCardUrl;
    matchedPatientData.bank_book_url = finalBankBookUrl;
    renderSettlementForm();
  } catch (err) {
    console.error(err);
    alert(
      "전산 오류: 데이터 동기화 유실로 인해 청구 접수가 거절되었습니다. 다시 로그인해 주세요.",
    );
    document.getElementById("ui_submit_btn").innerText = "지급 신청하기";
    document.getElementById("ui_submit_btn").disabled = false;
  }
}

// [역방향 실시간 락킹 채널]: 관리자가 PC창에서 상태를 변경하는 순간을 딜레이 없이 상시 미러링
function startSupabaseRealtimeMonitor() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel(`public:applicants:id=eq.${matchedPatientData.id}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "applicants",
        filter: `id=eq.${matchedPatientData.id}`,
      },
      (payload) => {
        console.log(
          "[실시간 원격 리스킨 인터셉터] 클라우드 상태 변동 포착:",
          payload.new,
        );
        matchedPatientData = payload.new;
        renderSettlementForm(); // 모바일 연쇄 스킨 실시간 동기화 호출
      },
    )
    .subscribe();
}
