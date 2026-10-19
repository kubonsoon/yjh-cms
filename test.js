function executeStep3ConfirmNext() {
  console.log("=== 🔓 [CTMS 탈출 게이트] 확인 버튼 정방향 주파 가동 ===");

  if (matchedPatientData) {
    const systemCurrentTime = new Date();
    const lastExamDate = matchedPatientData.recDate
      ? new Date(matchedPatientData.recDate)
      : null;

    // [순정 교정 완착]: 확실히 종료된 날짜 데이터가 존재하며 180일 (6개월) 이상 경과했을 때만 만료 판정
    let isOver6Months = false;
    if (lastExamDate && !isNaN(lastExamDate.getTime())) {
      const timeDiff = systemCurrentTime.getTime() - lastExamDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      if (dayDiff >= 180) isOver6Months = true;
    }

    // 🚨 [정방향 저격 교정 완착]: 신규/6개월 만료 유저는 navigateToStep(5) 자식 가상 캘린더 레이어로 진입
    if (matchedPatientData.isNewUserGhost || isOver6Months) {
      navigateToStep(5);

      const currentTargetName =
        matchedPatientData.name || temporaryVerifiedName || "대상자";
      const rawDbSsn = (matchedPatientData.ssn || "")
        .toString()
        .trim()
        .replace(/[^0-9]/g, "");
      const displayBirth6 = rawDbSsn.substring(0, 6) || "950505";

      // 성별 코드 판별 및 네온 클래스 테마 분기
      let genderText = "여";
      let genderClass = "gender-indicator-badge gender-f";
      if (
        rawDbSsn.endsWith("1") ||
        rawDbSsn.endsWith("3") ||
        (matchedPatientData.ssn &&
          (matchedPatientData.ssn.includes("-M") ||
            matchedPatientData.ssn.endsWith("M")))
      ) {
        genderText = "남";
        genderClass = "gender-indicator-badge gender-m";
      }

      const iframe = document.getElementById("mobileCalendarFrame");
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        const childDoc = iframe.contentWindow.document;

        // 자식 달력 문서 (m-calendar.html) 내부에 존재하는 자물쇠 프로필 슬롯을 강제 오버라이드
        const targetSlot =
          childDoc.getElementById("lblSetTargetNew") ||
          childDoc.querySelector(".scheduler-profile-bar.user-meta-info");
        if (targetSlot) {
          targetSlot.innerHTML =
            '<span style="color:#ffffff; font-weight:800;">' +
            currentTargetName +
            "</span>" +
            '<span style="color:rgba(255, 255, 255,0.4); font-weight:500; margin-left:2px;">(' +
            displayBirth6 +
            ")</span>" +
            '<span class="' +
            genderClass +
            '" style="margin-left:5px; padding:1px 5px; border-radius: 4px; font-size:11px; font-weight:800; display:inline-block; line-height:1.3;">' +
            genderText +
            "</span>";
        }

        // 자식 달력 화면 세션 메모리 락인 동기화 및 캘린더 엔진 리렌더링 작동
        iframe.contentWindow.sessionStorage.setItem(
          "certifiedUserName",
          currentTargetName,
        );
        if (typeof iframe.contentWindow.renderCalendar === "function") {
          iframe.contentWindow.renderCalendar();
        }
      }
      return; // 트랙 B 진입 시 여기서 탈출
    } else {
      // 🚨 [정방향 저격 교정 완착]: 기존 회원 유효 유저는 navigateToStep(4) 나의 시험정보 화면으로 진입
      navigateToStep(4);

      const cmsBadgeSlot = document.getElementById("cms-badge");
      const currentStage = (
        matchedPatientData.status ||
        matchedPatientData.stage ||
        "신검대기"
      )
        .toString()
        .trim();

      if (cmsBadgeSlot) {
        if (currentStage === "종료") {
          cmsBadgeSlot.innerText = "정산\n(종료)";
          cmsBadgeSlot.style.background = "#64748b";
        } else if (currentStage === "투약") {
          cmsBadgeSlot.innerText = "진행\n(투약)";
          cmsBadgeSlot.style.background = "#2563eb";
        } else if (currentStage === "text대기" || currentStage === "신검대기") {
          cmsBadgeSlot.innerText = "신검\n대기";
          cmsBadgeSlot.style.background = "#7c3aed";
        } else if (currentStage === "신검통과") {
          cmsBadgeSlot.innerText = "신검\n적합";
          cmsBadgeSlot.style.background = "#10b981";
        } else if (currentStage === "소집" || currentStage.includes("소집")) {
          cmsBadgeSlot.innerText = "참여\n(소집)";
          cmsBadgeSlot.style.background = "#2563eb";
        } else {
          cmsBadgeSlot.innerText = currentStage.replace("(", "\n(");
          cmsBadgeSlot.style.background = "#1e3a8a";
        }
      }

      const calendarRedirectBtn = document.getElementById(
        "ui_calendar_redirect_btn",
      );
      const submitBtn = document.getElementById("ui_submit_btn");

      if (calendarRedirectBtn) {
        calendarRedirectBtn.style.setProperty("display", "block", "important");
        calendarRedirectBtn.style.setProperty(
          "background-color",
          "#4f46e5",
          "important",
        );
        calendarRedirectBtn.style.setProperty("color", "#ffffff", "important");
        calendarRedirectBtn.style.setProperty("height", "44px", "important");
        calendarRedirectBtn.style.setProperty(
          "border-radius",
          "10px",
          "important",
        );
        calendarRedirectBtn.style.setProperty("border", "none", "important");
        calendarRedirectBtn.innerText = " 나의 임상시험 일정보기";
      }

      if (currentStage === "신검통과") {
        if (submitBtn) {
          submitBtn.innerText = "신검 통과 승인 (추후 소집 참여 시 신청가능)";
          submitBtn.disabled = true;
          submitBtn.style.setProperty(
            "background-color",
            "#1e293b",
            "important",
          );
          submitBtn.style.setProperty("cursor", "not-allowed", "important");
        }
      } else if (currentStage === "신검대기") {
        if (submitBtn) {
          submitBtn.innerText = "관리자 승인 대기 중 (신청 불가)";
          submitBtn.disabled = true;
          submitBtn.style.setProperty(
            "background-color",
            "#1e293b",
            "important",
          );
          submitBtn.style.setProperty("cursor", "not-allowed", "important");
        }
      } else if (currentStage === "종료") {
        if (calendarRedirectBtn) {
          calendarRedirectBtn.innerText = " 임상시험 일정 확인 (과제완료)";
          calendarRedirectBtn.style.setProperty(
            "background-color",
            "#475569",
            "important",
          );
        }
        if (submitBtn) {
          submitBtn.innerText = "지급 청구 마감 (과제 종료)";
          submitBtn.disabled = true;
          submitBtn.style.setProperty(
            "background-color",
            "#1e293b",
            "important",
          );
        }
      }

      // =============================================================================
      // [트랙 A 내부 완착] 4단계 진입 즉시 '로딩 중...' 텍스트를 모집공고 정보로 치환
      // =============================================================================
      let adminRecruitmentDB =
        JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];

      // 모집공고 마스터 대장 원장에서 진짜 과제 정보 정밀 탐색
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

      const finalTrialTitle = realRecData
        ? realRecData.title
        : matchedPatientData.title || "참여 과제 정보 없음";
      const finalTrialTh = realRecData
        ? realRecData.th
        : matchedPatientData.th || "1기";

      // 1. 진짜 기수(th) 실시간 주입
      const trialCategorySlot = document.getElementById("lblTrialCategory");
      if (trialCategorySlot) {
        trialCategorySlot.innerText = finalTrialTh
          ? `${finalTrialTh} 시험`
          : "과제 기수 미정";
      }

      // 2. 진짜 시험명 매핑 오버라이드 ("로딩 중..." 문구 완벽 타격 소독)
      const trialTitleSlot = document.getElementById("lblTrialTitle");
      if (trialTitleSlot) {
        trialTitleSlot.innerText = finalTrialTitle;
      }

      // 3. 성명 및 성별 분리 배지화 공정 가동
      const rawDbSsn = (matchedPatientData.ssn || "").toString().trim();
      const displayBirth6 = rawDbSsn.substring(0, 6) || "-";
      let genderBadgeHtml = "";

      if (
        rawDbSsn.includes("-M") ||
        rawDbSsn.endsWith("M") ||
        rawDbSsn.endsWith("1") ||
        rawDbSsn.endsWith("3")
      ) {
        genderBadgeHtml =
          '<span class="gender-indicator-badge gender-m">남</span>';
      } else if (
        rawDbSsn.includes("-F") ||
        rawDbSsn.endsWith("F") ||
        rawDbSsn.endsWith("2") ||
        rawDbSsn.endsWith("4")
      ) {
        genderBadgeHtml =
          '<span class="gender-indicator-badge gender-f">여</span>';
      }

      if (document.getElementById("ui_target_name_zone")) {
        document.getElementById("ui_target_name_zone").innerHTML =
          `<span>👤 대상자: ${matchedPatientData.name} (${displayBirth6})</span>${genderBadgeHtml}`;
      }

      // 4. 담당 CRC 사원명 실시간 역추적 바인딩
      const realCrcName = realRecData ? realRecData.crc : "이승호";
      if (document.getElementById("ui_crc_name_zone")) {
        document.getElementById("ui_crc_name_zone").innerText =
          `👩‍⚕️ 담당자: ${realCrcName}`;
      }

      // 5. 계좌 연동 패킷 실시간 매핑
      const bankInputSlot = document.getElementById("ui_bank_input");
      if (bankInputSlot && matchedPatientData.accountInfo) {
        const parts = matchedPatientData.accountInfo.split(" ");
        if (parts.length > 1) {
          bankInputSlot.value = parts.slice(1).join("");
          const bankSelectSlot = document.getElementById("ui_bank_select");
          if (bankSelectSlot) {
            for (let opt of bankSelectSlot.options) {
              if (opt.text.includes(parts) || parts.includes(opt.value)) {
                bankSelectSlot.value = opt.value;
                break;
              }
            }
          }
        }
      }

      // 6. 진짜 데이터가 다 주입되었으므로 1초 주기 안테나 레이더 모니터링 엔진 최종 기동
      if (typeof startAdminApprovalMonitor === "function") {
        startAdminApprovalMonitor();
      }
    }
  } else {
    // -------------------------------------------------------------------------
    // [트랙 B]: 대장에 기존 명의 데이터가 부재한 상태 -> 신규 가상 트랙 바이패스 준비
    // -------------------------------------------------------------------------
    const ghostPassTicket = {
      uid: "VIRTUAL_" + Date.now(),
      name: name,
      ssn: birth,
      phone: phone.replace(/(\d{3})(\d{4})(\d{4})/, "\$1-\$2-\$3"),
      title: "신규 방문 과제 미배정",
      th: "1기",
      count: "-",
      period: "-",
      stage: "대기",
      payStatus: "대기",
      isNewUserGhost: true,
    };

    adminApplicantDB.push(ghostPassTicket);
    localStorage.setItem(
      "dataStoreApplicant",
      JSON.stringify(adminApplicantDB),
    );

    matchedPatientData = ghostPassTicket;
    sessionStorage.setItem("certifiedUserName", name);
    sessionStorage.setItem("certifiedUserPhone", phone);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ name: name, isNew: true }),
    );
    localStorage.setItem("loggedInUserSsn", birth);
    localStorage.setItem("loggedInUserPhone", phone);

    // [트랙 B UI 엔진 기동]
    popup.parentElement.className = "popup-display-zone pop-theme-pass";
    if (document.getElementById("icoPop")) {
      document.getElementById("icoPop").className = "fa-solid fa-circle-check";
    }

    const titleEl = document.getElementById("txtPopTitle");
    if (titleEl) {
      titleEl.innerHTML =
        "<span style='color: #38bdf8 !important; '>신규 대상자</span> 본인인증 완료";
      titleEl.style.setProperty("font-size", "19px", "important");
      titleEl.style.setProperty("font-weight", "900", "important");
    }

    const targetChannel =
      typeof currentChannelName !== "undefined" && currentChannelName
        ? currentChannelName
        : "간편인증";
    const targetName = name || "대상자";

    // JSX/JS 문법 컴파일 오류를 원천 차단하기 위해 문자열 직격 결합 연산 전향 완착
    document.getElementById("txtPopMessage").innerHTML =
      '<div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 6px 12px; margin-top: -6px !important; margin-bottom: 0px !important; text-align: left; font-size: 13px; line-height: 1.2;">' +
      '<div style="margin-bottom: 3px; display: flex; align-items: center;">' +
      '<span style="color: #64748b; width: 65px; flex-shrink: 0;">인증기관 </span>' +
      '<span style="color: #e2e8f0; font-weight: 600;"><span style="color: #34d399 !important; font-weight: 700;">[' +
      targetChannel +
      "]</span> 연동모듈</span>" +
      "</div>" +
      '<div style="display: flex; align-items: center;">' +
      '<span style="color: #64748b; width: 65px; flex-shrink: 0;">대상자</span>' +
      '<span style="color: #38bdf8; font-weight: 600;">' +
      targetName +
      '님 <span style="color: #94a3b8; font-size: 11px; font-weight: 400; margin-left: 4px;">(최초 방문 / 만료자)</span></span>' +
      "</div>" +
      "</div>" +
      '<div style="text-align: center; font-size: 14px; padding: 0; margin: 18px 0 0 0 !important; position: relative; z-index: 10;">' +
      '<p style="margin: 0 0 5px 0; line-height: 1.35; color: #cbd5e1;">양지병원 임상시험 참여 이력이 없거나 <br>최근 시험 참여 후 종료된 지<br><span style="color: #ef4444; font-weight: 700;">180일 이상</span> 지난 대상자입니다.</p>' +
      '<p style="margin: 5px 0 0 0; line-height: 1.35; color: #94a3b8; font-size: 14px;">아래 확인 버튼을 클릭하면 정산 페이지 대신 <br><span style="color: #38bdf8; font-weight: 600;">[실시간 일정관리 스케줄러] 화면으로 이동합니다.</span></p>' +
      "</div>";

    const actionBtn =
      popup.parentElement.querySelector("button") ||
      document.getElementById("btnNewUserConfirm");
    if (actionBtn) {
      actionBtn.style.setProperty("margin-top", "6px", "important");
    }
  }

  if (typeof navigateToStep === "function") {
    navigateToStep(3); // 2단계 폼 제출 성공 완료 후 3단계 승인 팝업 레이어를 띄우는 순정 규격 정상 수렴
  }
}
