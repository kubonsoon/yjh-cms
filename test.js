function renderDailyCards() {
  const cardBoard = document.getElementById("dailyCardBoard");
  if (!cardBoard) return;
  cardBoard.innerHTML = "";

  const records = getMasterData();
  let applicantDB = getApplicantData() || [];

  // [정밀 동기화]: 브라우저 암호화 패킷 세션명 가로채기
  const liveCertifiedName =
    localStorage.getItem("certifiedUserName") ||
    sessionStorage.getItem("certifiedUserName") ||
    currentCertifiedUser;
  const cleanSessionName = liveCertifiedName.replace(/\s/g, "");

  // [잔상 파쇄 수술]: 주민번호 앞 6자리 추출 및 공백 정제
  const targetSsn =
    localStorage.getItem("loggedInUserSsn") ||
    sessionStorage.getItem("loggedInUserSsn") ||
    "";
  const cleanSsn = targetSsn.replace(/[^0-9a-zA-Z]/g, "");
  const displayBirth6 = cleanSsn.length >= 6 ? cleanSsn.substring(0, 6) : "";

  // 주민번호 7번째 자리 식별락 분석 기반 성별 배지 바인딩
  let genderText = "-";
  let genderClass = "gender-indicator-badge";

  if (cleanSsn.length >= 7) {
    const genderMarker = cleanSsn.charAt(6).toUpperCase();
    if (["1", "3", "5", "M"].includes(genderMarker)) {
      genderText = "남";
      genderClass = "gender-indicator-badge gender-m";
    } else if (["2", "4", "6", "F"].includes(genderMarker)) {
      genderText = "여";
      genderClass = "gender-indicator-badge gender-f";
    }
  } else if (cleanSsn.length > 0) {
    genderText = "확인중";
    genderClass = "gender-indicator-badge gender-wait";
  }

  const myLiveJobRecord = [...applicantDB].reverse().find((app) => {
    if (!app || !app.name) return false;
    const currentLiveStatus = (app.status || app.stage || "").toString().trim();
    return (
      app.name.toString().replace(/\s/g, "") === cleanSessionName &&
      currentLiveStatus !== "" &&
      !["종료", "탈락", "심사탈락"].includes(currentLiveStatus)
    );
  });

  const cachedUserObj = JSON.parse(localStorage.getItem("loggedInUser")) || {};
  let isGhostUser =
    cachedUserObj.isNew === true ||
    (myLiveJobRecord && myLiveJobRecord.uid.toString().startsWith("VIRTUAL_"));

  // [기획 요구사항 - 실시간 트랙 전향]: 참여 이력이 확인되는 순간 신규대상자(트랙B) 장벽을 깨고 기존 유저(트랙A)로 즉시 신분 전향
  const continuousHistoryCheck = applicantDB.some((app) => {
    if (!app || !app.name) return false;
    return (
      app.name.toString().replace(/\s/g, "") === cleanSessionName &&
      !["종료", "탈락", "심사탈락"].includes(app.status || app.stage || "")
    );
  });
  if (continuousHistoryCheck) {
    isGhostUser = false;
  }

  // 디바이스 최상단 프로필 스킨 결착
  const pIframe = window.parent ? window.parent.document : null;
  const lockProfileSlot =
    document.getElementById("lblSetTargetNew") ||
    (pIframe ? pIframe.getElementById("lblSetTargetNew") : null);
  if (lockProfileSlot && cleanSessionName && cleanSessionName !== "홍길동") {
    lockProfileSlot.innerHTML = `
            <span style="color:#ffffff; font-weight:800;">${liveCertifiedName}</span>
            <span style="color:rgba(255,255,255,0.4); font-weight: 500; margin-left:2px;">(${displayBirth6})</span>
            <span class="${genderClass}" style="margin-left: 5px; padding:1px 5px; border-radius: 4px; font-size: 11px; font-weight:800; display: inline-block; line-height:1.3;">${genderText}</span>
        `;
  }

  // [기획 요구사항 - 당일 자동 매핑]: 첫 로드 시 시스템상 오늘 날짜가 자동 선택되어 보이도록 전역 오프셋 동기화
  if (!window.isDayButtonClicked || !window.selectedDateStr) {
    const todayObj = new Date();
    window.selectedDateStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
  }

  const weeklyKeys = window.currentWeeklyDateKeys || [];
  let renderedCardCount = 0;

  // [5대 파일 상호 연동 - 백그라운드 크론 데몬 스케줄러]
  if (typeof window.clinicalCronDaemonInterval === "undefined") {
    window.clinicalCronDaemonInterval = setInterval(() => {
      const currentSystemAlarmLogs =
        JSON.parse(localStorage.getItem("dataStoreSystemLogs")) || [];
      const dispatchedNoticeAlarmKeySet =
        JSON.parse(localStorage.getItem("dispatchedNoticeAlarmKeySet")) || [];
      if (currentSystemAlarmLogs.length === 0) return;

      const rightNow = new Date();
      const currentTimeMatchKey = `${String(rightNow.getHours()).padStart(2, "0")}:${String(rightNow.getMinutes()).padStart(2, "0")}`;
      const matchTargetAlarm = currentSystemAlarmLogs.find(
        (log) =>
          log &&
          log.alarmTime &&
          log.alarmTime.trim() === currentTimeMatchKey &&
          !dispatchedNoticeAlarmKeySet.includes(
            `${log.uid}_${currentTimeMatchKey}`,
          ),
      );

      if (matchTargetAlarm) {
        dispatchedNoticeAlarmKeySet.push(
          `${matchTargetAlarm.uid}_${currentTimeMatchKey}`,
        );
        localStorage.setItem(
          "dispatchedNoticeAlarmKeySet",
          JSON.stringify(dispatchedNoticeAlarmKeySet),
        );

        const cronAlarmOverlay = document.createElement("div");
        cronAlarmOverlay.setAttribute(
          "style",
          "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 21, 40, 0.95); z-index: 99999; display: flex; align-items: center; justify-content: center; animation: blinkEffect 0.5s linear 6; padding: 20px; box-sizing: border-box;",
        );
        cronAlarmOverlay.innerHTML = `
                    <div style="background: #1e293b; border: 2px solid #ef4444; border-radius: 16px; width: 100%; max-width: 320px; padding: 24px 16px; text-align: center; box-shadow: 0 0 25px rgba(239, 68, 68, 0.4);">
                        <i class="fa-solid fa-bell-ring" style="font-size: 36px; color: #ef4444; margin-bottom: 12px; display: block;"></i>
                        <div style="color: #ffffff; font-weight: 800; font-size: 16px; margin-bottom: 8px;">[관리자 전산망 긴급 공지]</div>
                        <div style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin-bottom: 18px;">${matchTargetAlarm.content || "임상 스케줄에 맞춰 대기 및 출석바랍니다."}</div>
                        <button type="button" id="btn_cron_alarm_confirm_${matchTargetAlarm.uid}" style="width: 100%; max-width: 150px; height: 38px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">확인 완료</button>
                    </div>
                `;
        document.body.appendChild(cronAlarmOverlay);
        document.getElementById(
          `btn_cron_alarm_confirm_${matchTargetAlarm.uid}`,
        ).onclick = function (e) {
          e.preventDefault();
          cronAlarmOverlay.remove();
        };
      }
    }, 1000);
  }

  // =============================================================================
  // [트랙 B : 신규 및 180일 만료 대상자 전용 가드 체인]
  // =============================================================================
  if (isGhostUser) {
    let ghostWeekCardsHTML = "";

    records.forEach((item) => {
      if (!item || !item.title) return;
      const actualRawDate = item.examSchedule
        ? item.examSchedule.toString().trim()
        : "";

      if (
        actualRawDate &&
        actualRawDate.includes("-") &&
        weeklyKeys.includes(actualRawDate)
      ) {
        if (actualRawDate === window.selectedDateStr) {
          renderedCardCount++;
          const targetThClass = (item.th || "1기").replace(/\s/g, "");

          ghostWeekCardsHTML += `
                        <div class="trial-manifest-card" style="margin-bottom: 10px; border: 1px solid var(--border-color); background: #111827; padding: 14px; border-radius: 12px; text-align: left; box-shadow: 0 4px 6px 1px rgba(0, 0, 0, 0.5);">
                            <div class="card-top-row" style="padding-bottom: 2px;">
                                <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
                                    <div style="font-size: 14px; color: #cbd5e1; font-weight: 700; display: flex; align-items: center; gap: 5px;">
                                        <span>${actualRawDate}</span><span style="color: #38bdf8; font-size: 13.5px; padding-left: 2px; font-weight: 800;">스크리닝</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 1px;">
                                        <div class="card-title-text" style="color: #ffffff; font-weight: 800; font-size: 15px; letter-spacing: -0.2px;">${item.title || "임상과제"}</div>
                                        <span class="card-th-badge th-color-${targetThClass}" style="margin: 0 !important; transform: scale(0.95); font-weight: 800;">${item.th || "1기"}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-meta-grid" style="margin-top:8px; border-top: 1px dashed #1e293b; padding-top: 6px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
                                <div>연계 과제: <span style="color: #38bdf8; font-weight: 700;">${item.title || "임상 과제명 미지정"}</span></div>
                                <div>배정 정원: <span>${item.count ? item.count + "명" : ""}</span></div>
                                <div>임상 기간: <span>${item.period ? item.period + "시간" : ""}</span></div>
                            </div>
                            <div class="card-action-bar" id="ui_action_bar_the_unique_${item.uid}" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 10px;">
                                <button type="button" class="card-btn join" id="btn_card_join_${item.uid}" style="height:32px; font-size: 12.5px; background: #0ea5e9 !important; color: #ffffff !important;">참여</button>
                                <button type="button" class="card-btn reject" id="btn_card_reject_${item.uid}" style="height:32px; font-size:12.5px; background: #475569;">미참여</button>
                                <button type="button" class="card-btn history-sync" id="btn_card_hist_${item.uid}" style="height:32px; font-size:12.5px;"><i class="fa-solid fa-clock-history"></i> 이력조회</button>
                            </div>
                        </div>
                    `;
        }
      }
    });

    // [신규 대상자 전용 - 2줄 레이아웃 나열 및 우측 공백 스캐너]
    let weeklyScheduleBriefingHTML = "";
    const daysMapShort = ["일", "월", "화", "수", "목", "금", "토"];

    weeklyKeys.forEach((dateKey) => {
      const dateObj = new Date(dateKey);
      const formattedLabel = `${dateKey.split("-")[0]}년 ${String(dateKey.split("-")[1]).padStart(2, "0")}월 ${String(dateKey.split("-")[2]).padStart(2, "0")}일 (${daysMapShort[dateObj.getDay()]})`;
      const matchItem = records.find(
        (r) => r.examSchedule && r.examSchedule.trim() === dateKey.trim(),
      );

      if (matchItem) {
        weeklyScheduleBriefingHTML += `
                    <div class="briefing-row-item" style="margin-bottom: 12px; line-height: 1.5; text-align: left;">
                        <div>• ${formattedLabel} : <span style="color: #38bdf8; font-weight: bold;">스크리닝</span></div>
                        <div style="padding-left: 12px; color: #94a3b8; font-size: 13px; font-weight: 700;">${matchItem.title} ${matchItem.th || "1기"}</div>
                    </div>
                `;
      } else {
        weeklyScheduleBriefingHTML += `<div class="briefing-row-item" style="margin-bottom: 12px; text-align: left; color:rgba(255,255,255,0.35);">• ${formattedLabel} : </div>`;
      }
    });

    // [지정 요구 예외 문구 고정 2종 적용 및 조출 결착]
    if (
      ghostWeekCardsHTML === "" &&
      weeklyScheduleBriefingHTML.replace(/<[^>]*>/g, "").trim() === ""
    ) {
      cardBoard.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; font-weight: 700;">이번주에 등록된 임상시험 일정이 없습니다.</div>`;
      return;
    }

    let totalOutHTML = "";
    if (renderedCardCount === 0) {
      totalOutHTML += `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 15px; font-weight: 600; color: #38bdf8;">선택하신 일자에는 임상시험 일정이 없습니다.</div>`;
    } else {
      totalOutHTML += ghostWeekCardsHTML;
    }

    totalOutHTML += `
            <div style="background: var(--card-color); padding: 14px; border-radius: 14px; width: 100%; border:1px solid var(--border-color); box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-top: 10px; text-align:left;">
                <div style="font-size: 13px; font-weight:800; color:var(--warning-color); margin-bottom: 12px; display: flex; align-items:center; gap:6px;"><i class="fa-solid fa-list-check"></i> 해당 주간 임상 일정</div>
                <div style="display: flex; flex-direction: column; gap:2px;">${weeklyScheduleBriefingHTML}</div>
            </div>
        `;
    cardBoard.innerHTML = totalOutHTML;

    // [트랙 B 전용 비동기 3대 단추 액션 바인딩 수술 - 트랙 B 스코프 내부 가두리 안착]
    setTimeout(() => {
      records.forEach((item) => {
        if (!item || !item.uid) return;
        const btnJoin = document.getElementById(`btn_card_join_${item.uid}`);
        if (btnJoin) {
          btnJoin.onclick = function (e) {
            e.preventDefault();
            let appDB = getApplicantData();
            const liveQuotaCount = appDB.filter(
              (u) =>
                (u.title || "").toString().replace(/\s/g, "") ===
                item.title.toString().replace(/\s/g, ""),
            ).length;
            const liveProgressFormat = liveQuotaCount + 1 + "/60";

            const newApplicantRecord = {
              uid: "NEW_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
              name:
                localStorage.getItem("certifiedUserName") ||
                currentCertifiedUser,
              title: item.title,
              th: item.th || "1기",
              count: liveProgressFormat,
              nCount: 60,
              period: item.period || "0",
              ssn: targetSsn,
              phone: localStorage.getItem("loggedInUserPhone") || "",
              gender: genderText === "남" ? "남" : "여",
              payStatus1: "대기",
              payStatus2: "대기",
              payStatus3: "대기",
              payStatus4: "대기",
              result: "대기",
              isDutyAgreed: "대기",
              isCallAgreed: "대기",
              category: "M인증",
              stage: "신검대기",
              status: "신검대기",
              regDate: new Date().toISOString().split("T")[0],
            };
            appDB.push(newApplicantRecord);
            localStorage.setItem("dataStoreApplicant", JSON.stringify(appDB));

            const signalToken = "SIGNAL_" + Date.now();
            localStorage.setItem("msg_auth_signal", signalToken);
            localStorage.setItem("msg_push_signal", signalToken);

            alert(
              `[신청 접수완료]\n\n${newApplicantRecord.name} 대상자님, 선택하신 임상시험 [${item.title}] 과제 참여 신청이 정상 접수되었습니다.`,
            );
            if (
              window.opener &&
              !window.opener.closed &&
              typeof window.opener.refreshApplicantView === "function"
            )
              window.opener.refreshApplicantView();
            if (typeof renderCalendar === "function") renderCalendar();
            renderDailyCards();
          };
        }
        const btnReject = document.getElementById(
          `btn_card_reject_${item.uid}`,
        );
        if (btnReject) {
          btnReject.onclick = function (e) {
            e.preventDefault();
            alert("미참여 신청 되었습니다.");
          };
        }
        const btnHist = document.getElementById(`btn_card_hist_${item.uid}`);
        if (btnHist) {
          btnHist.onclick = function (e) {
            e.preventDefault();
            if (typeof openIndividualHistoryModalInMobile === "function")
              openIndividualHistoryModalInMobile(
                cleanSessionName,
                item.title,
                item.th || "1기",
              );
          };
        }
      });
    }, 0);
    return; // 트랙 B 격리 방어선 마감 및 완전 이탈
  }

  // =============================================================================
  // [트랙 A : 기존 참여 대상자 전용 가드 체인 - 전반부 목록 팩토리]
  // =============================================================================
  else {
    const matchedRecruitmentItem = records.find((item) => {
      if (!item || !item.title || !myLiveJobRecord.title) return false;
      return (
        myLiveJobRecord.title.toString().replace(/\s/g, "").toLowerCase() ===
        item.title.toString().replace(/\s/g, "").toLowerCase()
      );
    });

    let regularCardsHTML = "";
    let weeklyScheduleBriefingHtml = "";
    const daysMapShort = ["일", "월", "화", "수", "목", "금", "토"];
    let hasWeeklyScheduleInThisWindow = false;

    if (weeklyKeys && weeklyKeys.length > 0) {
      weeklyKeys.forEach((dateKey) => {
        let activeStages = [];
        const cleankey = dateKey.trim();

        if (matchedRecruitmentItem) {
          if (
            matchedRecruitmentItem.examSchedule &&
            matchedRecruitmentItem.examSchedule.trim() === cleankey
          )
            activeStages.push("스크리닝");
          if (
            matchedRecruitmentItem.recDate &&
            matchedRecruitmentItem.recDate.trim() === cleankey
          )
            activeStages.push("소집(입원)");
          if (
            matchedRecruitmentItem.visitDate1 &&
            matchedRecruitmentItem.visitDate1.trim() === cleankey
          )
            activeStages.push("1차 방문채혈");
          if (
            matchedRecruitmentItem.visitDate2 &&
            matchedRecruitmentItem.visitDate2.trim() === cleankey
          )
            activeStages.push("2차 방문채혈");
          if (
            matchedRecruitmentItem.visitDate3 &&
            matchedRecruitmentItem.visitDate3.trim() === cleankey
          )
            activeStages.push("3차 방문채혈");
          if (
            matchedRecruitmentItem.visitDate4 &&
            matchedRecruitmentItem.visitDate4.trim() === cleankey
          )
            activeStages.push("4차 방문채혈");
          if (
            matchedRecruitmentItem.endExamDate &&
            matchedRecruitmentItem.endExamDate.trim() === cleankey
          )
            activeStages.push("종료검사");
        }

        if (activeStages.length > 0) hasWeeklyScheduleInThisWindow = true;

        const dateParts = cleankey.split("-");
        const loopDateObj = new Date(
          parseInt(dateParts[0], 10),
          parseInt(dateParts[1], 10) - 1,
          parseInt(dateParts[2], 10),
        );
        const formattedLabel = `${dateParts[0]}년 ${String(dateParts[1]).padStart(2, "0")}월 ${String(dateParts[2]).padStart(2, "0")}일 (${daysMapShort[loopDateObj.getDay()]})`;

        // [기획 요구사항 반영]: 기존 참여자는 날짜와 공정 단계명이 칼같이 1줄 레이아웃으로 결착됨
        if (activeStages.length > 0) {
          const combinedStages = activeStages.join(", ");
          weeklyScheduleBriefingHtml += `
                        <div class="briefing-row-item" style="margin-bottom: 12px; padding: 4px 0; font-size:13px; text-align:left;">
                            • ${formattedLabel} : <span style="color:#38bdf8; font-weight:800;">${combinedStages}</span>
                        </div>
                    `;

          // 선택 일자와 마일스톤 싱크 정합 시 개별 활성 조작 카드 HTML 누적
          if (cleankey === window.selectedDateStr) {
            activeStages.forEach((stageLabel, sIdx) => {
              renderedCardCount++;
              const uniqueSubKey = `${matchedRecruitmentItem.uid}_REG_${sIdx}`;

              if (stageLabel === "스크리닝") {
                regularCardsHTML += `
                                    <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 10px;">
                                        <i class="fa-solid fa-circle-check" style="font-size: 24px; color: var(--secondary-color); margin-bottom: 8px; display: block;"></i>
                                        <div style="font-size: 12.5px; color: #38bdf8; font-weight: 600;">현재 스크리닝 참여중입니다</div>
                                    </div>
                                `;
                return;
              }

              regularCardsHTML += `
                                <div class="trial-manifest-card" style="margin-bottom: 10px; border: 1px solid var(--border-color); background: #111827; padding: 14px; border-radius: 12px; text-align:left;">
                                    <div class="card-top-row" style="padding-bottom: 2px;">
                                        <div class="card-title-text" style="color: #ffffff; font-weight: 800; font-size: 14.5px;">${stageLabel}</div>
                                    </div>
                                    <div class="card-meta-grid" style="margin-top:8px; border-top: 1px dashed #1e293b; padding-top: 6px; font-size:12.5px; color:var(--text-muted);">
                                        <div>연계 과제: <span style="color: #38bdf8; font-weight: 700;">${matchedRecruitmentItem.title}</span></div>
                                        <div>배정 정원: <span>${matchedRecruitmentItem.count || ""}</span></div>
                                        <div>임상 기간: <span>${matchedRecruitmentItem.period ? matchedRecruitmentItem.period + "시간" : ""}</span></div>
                                    </div>
                                    <div class="card-action-bar" id="ui_action_bar_the_unique_${uniqueSubKey}" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 10px;">
                                        <button type="button" class="card-btn join" id="btn_card_join_${uniqueSubKey}" style="height:32px; font-size: 12.5px;">참여</button>
                                        <button type="button" class="card-btn reject" id="btn_card_reject_${uniqueSubKey}" style="height:32px; font-size:12.5px; background: #475569;">미참여</button>
                                        <button type="button" class="card-btn history-sync" id="btn_card_hist_${uniqueSubKey}" style="height:32px; font-size:12.5px;"><i class="fa-solid fa-clock-history"></i>이력조회</button>
                                    </div>
                                </div>
                            `;
            });
          }
        } else {
          // [기획 요구사항 반영]: 일정이 없는 날짜는 공백 없이 대기 하이픈 마킹
          weeklyScheduleBriefingHtml += `
                        <div class="briefing-row-item" style="margin-bottom: 12px; padding: 4px 0; font-size: 12px; color: rgba(255,255,255,0.35); text-align:left;">
                            <span>• ${formattedLabel} : </span><span style="font-weight:500; color:rgba(255,255,255,0.2);">-</span>
                        </div>
                    `;
        }
      });
    }

    // [기획 요구사항 반영 - 고정 예외 텍스트 2종 안착 및 조출 결착]
    if (!hasWeeklyScheduleInThisWindow) {
      cardBoard.innerHTML = `
                <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px solid var(--border-color); border-radius: 14px; font-weight: 700;">
                    <i class="fa-solid fa-calendar-minus" style="font-size: 24px; color: #eab308; margin-bottom: 8px; display: block;"></i>
                    <div style="font-size: 12px; color: #eab308; font-weight: 700;">이번주에 등록된 임상시험 일정이 없습니다.</div>
                </div>
            `;
      return;
    }

    let totalOutHTML = "";
    if (renderedCardCount === 0) {
      totalOutHTML += `
                <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 15px; font-weight: 600; color: #38bdf8;">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 24px; color: #94a3b8; margin-bottom: 8px; display: block;"></i>
                    <div style="font-size: 12.5px; color: #38bdf8; font-weight: 600;">선택하신 일자에는 임상시험 일정이 없습니다.</div>
                </div>
            `;
    } else {
      totalOutHTML += regularCardsHTML;
    }

    totalOutHTML += `
            <div style="background: var(--card-color); padding: 14px; border-radius: 14px; width: 100%; border:1px solid var(--border-color); box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-top: 10px;">
                <div style="font-size: 13px; font-weight:800; color:var(--warning-color); margin-bottom: 12px; display: flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-list-check"></i> 해당 주간 임상 일정
                </div>
                <div style="display: flex; flex-direction: column; gap:2px;">
                    ${weeklyScheduleBriefingHtml}
                </div>
            </div>
        `;

    cardBoard.innerHTML = totalOutHTML;

    // [트랙 A 전용 비동기 3대 단추 액션 바인딩 및 부모 스코프 최종 안전 폐쇄 락인]
    setTimeout(() => {
      const currentActiveRecords = records.filter(
        (item) =>
          item &&
          item.title &&
          myLiveJobRecord.title.toString().replace(/\s/g, "").toLowerCase() ===
            item.title.toString().replace(/\s/g, "").toLowerCase(),
      );

      currentActiveRecords.forEach((item) => {
        const thText = (item.th || "1기").trim();
        const clickUid = item.uid ? item.uid : "UID";
        const originalMilestones = [
          { label: "스크리닝" },
          { label: "소집(입원)" },
          { label: "1차 방문채혈" },
          { label: "2차 방문채혈" },
          { label: "3차 방문채혈" },
          { label: "4차 방문채혈" },
          { label: "종료검사" },
        ];

        originalMilestones.forEach((schedule, idx) => {
          const uniqueSubKey = `${clickUid}_REG_${idx}`;

          // 1. 참여 버튼 클릭 시 출석 전진 업데이트 및 관제탑(admin.html) 통신선 동기화
          const btnJoin = document.getElementById(
            `btn_card_join_${uniqueSubKey}`,
          );
          if (btnJoin) {
            btnJoin.onclick = function (e) {
              e.preventDefault();
              let appDB = getApplicantData();
              let targetIdx = appDB.findIndex(
                (u) =>
                  u.name.toString().trim().replace(/\s/g, "") ===
                  cleanSessionName,
              );

              if (targetIdx !== -1) {
                let cleanFriendlyStage = "방문";
                if (schedule.label.includes("1차"))
                  cleanFriendlyStage = "1차방문";
                else if (schedule.label.includes("2차"))
                  cleanFriendlyStage = "2차방문";
                else if (schedule.label.includes("3차"))
                  cleanFriendlyStage = "3차방문";
                else if (schedule.label.includes("4차"))
                  cleanFriendlyStage = "4차방문";
                else if (schedule.label.includes("종료"))
                  cleanFriendlyStage = "종료방문";
                else if (schedule.label.includes("소집"))
                  cleanFriendlyStage = "소집완료";

                appDB[targetIdx].status = cleanFriendlyStage;
                appDB[targetIdx].stage = cleanFriendlyStage;
                localStorage.setItem(
                  "dataStoreApplicant",
                  JSON.stringify(appDB),
                );

                // 5대 파일 무선 제어반 통신 패킷 발송
                const signalToken = "SIGNAL_" + Date.now();
                localStorage.setItem("msg_auth_signal", signalToken);
                localStorage.setItem("msg_push_signal", signalToken);

                alert(
                  `인증 성공\n\n대상자님의 참여 상태가 [${cleanFriendlyStage}] 단계로 출석 정상 업데이트 커밋되었습니다.`,
                );

                // PC 마스터 관리자 화면(admin.html) 목록 실시간 새로고침 트리거 점화
                if (
                  window.opener &&
                  !window.opener.closed &&
                  typeof window.opener.refreshApplicantView === "function"
                ) {
                  window.opener.refreshApplicantView();
                }

                if (typeof renderCalendar === "function") renderCalendar();
                renderDailyCards();
              }
            };
          }

          // 2. 미참여 버튼 클릭 시 피드백
          const btnReject = document.getElementById(
            `btn_card_reject_${uniqueSubKey}`,
          );
          if (btnReject) {
            btnReject.onclick = function (e) {
              e.preventDefault();
              alert("미참여 신청 되었습니다.");
            };
          }

          // 3. 모바일 이력조회 전용 모달 바인딩 완착
          const btnHist = document.getElementById(
            `btn_card_hist_${uniqueSubKey}`,
          );
          if (btnHist) {
            btnHist.onclick = function (e) {
              e.preventDefault();
              if (typeof openIndividualHistoryModalInMobile === "function") {
                openIndividualHistoryModalInMobile(
                  cleanSessionName,
                  item.title,
                  thText,
                );
              }
            };
          }
        });
      });
    }, 0);
  } // else 블록 최종 마감
}
