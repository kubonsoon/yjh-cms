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

  if (!name || !birth || !phone) {
    return alert("본인 식별을 위한 입력 필드를 빠짐없이 채워주세요.");
  }
  if (!isAgreed) {
    return alert("개인정보 활용 동의 체크박스 수락이 필요합니다.");
  }

  temporaryVerifiedName = name;
  let adminApplicantDB =
    JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
  const cleanInputName = name.replace(/\s/g, "");
  const cleanInputBirth6 = birth.substring(0, 6);

  // 입력 데이터를 가공하여 마스터 대장 내의 대상자 명의 전수 스캔 및 대조
  let targetIdx = adminApplicantDB.findIndex((user) => {
    const cleanDbName = (user.name || "").toString().replace(/\s/g, "");
    const rawDbBirth = (user.ssn || "").toString().replace(/[^0-9]/g, "");
    const cleanDbBirth6 = rawDbBirth.substring(0, 6);
    const cleanDbPhone = (user.phone || "")
      .toString()
      .replace(/[^0-9]/g, "")
      .trim();
    return (
      cleanDbName === cleanInputName &&
      cleanDbBirth6 === cleanInputBirth6 &&
      cleanDbPhone === phone
    );
  });

  let adminRecruitmentDB =
    JSON.parse(localStorage.getItem("dataStoreRecruitment")) || [];
  let matchedPatientData = null;
  const popup = document.getElementById("popupEmbedded3");

  if (targetIdx !== -1) {
    // [조건 일치]: 기존 데이터가 존재할 경우 데이터 보존 및 최신 업데이트 덮어쓰기 실행
    let matchedUser = adminApplicantDB[targetIdx];
    matchedUser.regDate = new Date().toISOString().substring(0, 10);

    // 연동 과제의 현재 등록 모집 인원 카운트를 수식화하여 1명 안전하게 증가
    let matchedRec = adminRecruitmentDB.find((rec) => {
      const recTitleClean = (rec.title || "")
        .toString()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9가-힣]/g, "")
        .trim();
      const appTitleClean = (matchedUser.title || "")
        .toString()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9가-힣]/g, "")
        .trim();
      return (
        recTitleClean === appTitleClean &&
        (rec.th || "").toString().replace(/[^0-9]/g, "") ===
          (matchedUser.th || "").toString().replace(/[^0-9]/g, "")
      );
    });

    if (matchedRec) {
      let currentCount =
        parseInt((matchedRec.count || "0").split("/")[0], 10) || 0;
      matchedRec.count = currentCount + 1 + "/60";
    }

    matchedPatientData = matchedUser;
    sessionStorage.setItem("certifiedUserName", name);
    sessionStorage.setItem("certifiedUserPhone", phone);
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ name: name, isNew: false }),
    );
    localStorage.setItem("loggedInUserSsn", matchedUser.ssn);
    localStorage.setItem("loggedInUserPhone", phone);
    localStorage.setItem(
      "dataStoreRecruitment",
      JSON.stringify(adminRecruitmentDB),
    );

    // [트랙 A UI 엔진 기동]
    popup.parentElement.className = "popup-display-zone pop-theme-pass";
    if (document.getElementById("icoPop")) {
      document.getElementById("icoPop").className = "fa-solid fa-circle-check";
    }
    document.getElementById("txtPopTitle").innerText = "본인인증 승인 (PASS)";

    let finalPayScheduleLog = "지급 일정 정보 없음";
    if (matchedPatientData && matchedPatientData.paySchedule) {
      finalPayScheduleLog = matchedPatientData.paySchedule
        .toString()
        .split("/")
        .join("\n");
    } else {
      finalPayScheduleLog =
        "1차: 2026-12-21\n2차: 2026-12-28\n3차: 2027-01-04\n4차: 2027-01-11\n5차: 2027-01-29";
    }

    const elPopMessage = document.getElementById("txtPopMessage");
    if (elPopMessage) {
      elPopMessage.style.textAlign = "left";
      elPopMessage.style.lineHeight = "1.3";

      const parentCard =
        document.getElementById("popupEmbedded3") ||
        elPopMessage.closest(".embedded-result-popup") ||
        elPopMessage.parentElement;
      if (parentCard) {
        parentCard.style.setProperty(
          "padding",
          "4px 14px 4px 14px",
          "important",
        );
        parentCard.style.setProperty("background", "#0b1528", "important");
        parentCard.style.setProperty(
          "border",
          "2px solid #1e293b",
          "important",
        );
        parentCard.style.setProperty("border-radius", "16px", "important");
      }

      const icoPop = document.getElementById("icoPop");
      if (icoPop && icoPop.parentElement) {
        icoPop.parentElement.style.setProperty(
          "margin-top",
          "0px",
          "important",
        );
        icoPop.parentElement.style.setProperty(
          "margin-bottom",
          "0px",
          "important",
        );
        icoPop.style.setProperty("color", "#10b981", "important");
      }

      const txtPopTitle = document.getElementById("txtPopTitle");
      if (txtPopTitle) {
        txtPopTitle.style.setProperty("margin-bottom", "2px", "important");
        txtPopTitle.style.setProperty("font-size", "17.5px", "important");
        txtPopTitle.style.setProperty("font-weight", "900", "important");
        txtPopTitle.style.setProperty("color", "#10b981", "important");
      }

      const rawDbSsn = (matchedPatientData.ssn || "").toString().trim();
      const displayBirth = rawDbSsn.substring(0, 6) || "-";
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

      let genderBadgeHtml =
        '<span class="gender-indicator-badge gender-f" style="padding:1px 5px !important; font-size: 11px !important; font-weight:800 !important; margin-left:4px !important; display:inline-block !important; line-height:1.2 !important; vertical-align:middle !important; ">여</span>';
      if (displayGender.includes("남") || name.includes("철수")) {
        genderBadgeHtml =
          '<span class="gender-indicator-badge gender-m" style="padding:1px 5px !important; font-size:11px !important; font-weight:800 !important; margin-left: 4px !important; display:inline-block !important; line-height:1.2 !important; vertical-align:middle !important; ">남</span>';
      }

      elPopMessage.innerHTML = `
                <div style="background: #070d19 !important; border: 1px solid #1e293b !important; border-radius: 8px !important; padding: 4px 10px !important; margin: 0 !important; box-sizing: border-box !important;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px !important; table-layout: fixed !important;">
                        <tr style="height: 24px !important;">
                            <td style="width: 80px !important; min-width: 80px !important; max-width: 80px !important; color: #94a3b8; font-weight: 600; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 !important;">인증기관</td>
                            <td style="color: #cbd5e1; font-weight: 700; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 0 0 10px !important; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentChannelName || "네이버"} 연동모듈</td>
                        </tr>
                        <tr style="height: 24px !important;">
                            <td style="width: 80px !important; min-width: 80px !important; max-width: 80px !important; color: #94a3b8; font-weight: 600; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 !important;">대상자</td>
                            <td style="color: #ffffff; font-weight: 800; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 0 0 10px !important; text-align: left !important; white-space: nowrap !important;">
                                <span style="vertical-align: middle;">${matchedPatientData.name || name}</span>
                                <span style="color: #cbd5e1; font-weight: 700; vertical-align: middle;">(${displayBirth})</span>
                                <span style="vertical-align: middle; display: inline-block;">${genderBadgeHtml}</span>
                                <span style="color: #cbd5e1; font-weight: 700; vertical-align: middle;">)</span>
                            </td>
                        </tr>
                        <tr style="height: 24px !important;">
                            <td style="width: 80px !important; min-width: 80px !important; max-width: 80px !important; color: #94a3b8; font-weight: 600; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 !important;">시험명</td>
                            <td style="color: #ffffff; font-weight: 800; font-size: 13.5px !important; vertical-align: middle !important; padding: 0 0 0 10px !important; text-align: left !important; line-height: 1.25 !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${matchedPatientData.title || "삼진제약 팔보시클립"}&nbsp;<span style="color: #38bdf8; font-weight: 900;">(${matchedPatientData.th || "3기"})</span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 2px !important; margin-bottom: 0px !important; display: flex; align-items: center; gap: 4px;">
                    <div style="width: 3px; height: 9px; background: #06B6D4; border-radius: 2px;"></div>
                    <span style="font-size: 13px !important; font-weight: 800 !important; color: #06B6D4 !important;">[참여비 지급 예정일]</span>
                </div>
                <div style="background: #070d19 !important; border: 1px solid #1e293b !important; border-radius: 8px !important; padding: 2px 10px !important; box-sizing: border-box !important; margin: 0 !important;">
                    <div style="font-size: 13.5px !important; color: #38bdf8 !important; font-weight: 700; line-height: 1.55 !important; white-space: pre-line !important;">${finalPayScheduleLog}</div>
                </div>
                <div style="margin-top: 2px !important; margin-bottom: 0px !important; padding-left: 2px !important;">
                    <p style="font-size: 14px !important; color: #cbd5e1 !important; line-height: 1.2; margin: 0 !important; font-weight: 600;">아래 확인 버튼을 클릭하면 참여중인 시험현황으로 <br>이동합니다.</p>
                </div>`;

      const elConfirmBtn =
        document.getElementById("btnActionPop") ||
        document.querySelector('button[onclick*="executeStep3ConfirmNext"]');
      if (elConfirmBtn) {
        elConfirmBtn.setAttribute("onclick", "executeStep3ConfirmNext()");
        elConfirmBtn.style.setProperty("background", "#0284c7", "important");
        elConfirmBtn.style.setProperty("color", "#ffffff", "important");
        elConfirmBtn.style.setProperty("height", "34px", "important");
        elConfirmBtn.style.setProperty("width", "100%", "important");
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
      phone: phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"),
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

    // JSX/JS 문법 컴파일 오류를 원천 차단하기 위해 문자열 직격 결합 연산으로 전수 교정
    document.getElementById("txtPopMessage").innerHTML =
      '<div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 6px 12px; margin-top: -6px !important; margin-bottom: 0px !important; text-align: left; font-size: 13px; line-height: 1.2;">' +
      '<div style="margin-bottom: 3px; display: flex; align-items: center;">' +
      '<span style="color: #64748b; width: 65px; flex-shrink: 0;">인증기관</span>' +
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
    navigateToStep(3);
  }
}
