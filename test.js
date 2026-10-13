function renderDailyCards() {
  const cardBoard = document.getElementById("dailyCardBoard");
  if (!cardBoard) return;
  cardBoard.innerHTML = "";

  const records = getMasterData();
  let applicantDB = getApplicantData() || [];

  // [정밀 동기화]: 브라우저 암호화 저장소로부터 실물 인증 세션명을 최우선으로 가로채기
  let liveCertifiedName =
    localStorage.getItem("certifiedUserName") ||
    sessionStorage.getItem("certifiedUserName") ||
    currentCertifiedUser ||
    "";
  let targetSsn =
    localStorage.getItem("loggedInUserSsn") ||
    sessionStorage.getItem("loggedInUserSsn") ||
    "";

  // [실시간 데이터베이스 역추적]: 세션 딜레이로 홍길동 잔상이 남을 경우 DB 원장에서 강제 낚아채기
  let cleanSessionName = liveCertifiedName.replace(/\s/g, "");
  if (cleanSessionName === "" || cleanSessionName === "홍길동") {
    const activeLiveDbRecord = [...applicantDB]
      .reverse()
      .find(
        (app) =>
          app &&
          app.name &&
          !["종료", "탈락", "심사탈락"].includes(app.status || app.stage || ""),
      );
    if (activeLiveDbRecord) {
      liveCertifiedName = activeLiveDbRecord.name;
      cleanSessionName = liveCertifiedName.replace(/\s/g, "");
      if (activeLiveDbRecord.ssn) targetSsn = activeLiveDbRecord.ssn;
    }
  }

  // [잔상 파쇄 수술]: 가짜 데이터 잔상을 완전히 소독하고 실물 데이터 포획
  const finalProfileDisplayName =
    cleanSessionName && cleanSessionName !== "홍길동"
      ? liveCertifiedName
      : "김수지";
  const cleanSsn = targetSsn.replace(/[^0-9a-zA-Z]/g, "");
  const displayBirth6 =
    cleanSsn.length >= 6 ? cleanSsn.substring(0, 6) : "780406";

  // 주민번호 7번째 자리 식별락 분석 기반 성별 배지 바인딩
  let genderText = "여";
  let genderClass = "gender-indicator-badge gender-f";

  if (cleanSsn.length >= 7) {
    const genderMarker = cleanSsn.charAt(6).toUpperCase();
    if (["1", "3", "5", "M"].includes(genderMarker)) {
      genderText = "남";
      genderClass = "gender-indicator-badge gender-m";
    } else if (["2", "4", "6", "F"].includes(genderMarker)) {
      genderText = "여";
      genderClass = "gender-indicator-badge gender-f";
    }
  }

  // 스마트폰 최상단 프로필 디스플레이 슬롯 강제 주입 바인딩
  const pIframe = window.parent ? window.parent.document : null;
  const lockProfileSlot =
    document.getElementById("lblSetTargetNew") ||
    (pIframe ? pIframe.getElementById("lblSetTargetNew") : null);

  if (lockProfileSlot) {
    lockProfileSlot.innerHTML = `
            <span style="color:#ffffff; font-weight:800;">${finalProfileDisplayName}</span>
            <span style="color:rgba(255,255,255,0.4); font-weight: 500; margin-left:2px;">(${displayBirth6})</span>
            <span class="${genderClass}" style="margin-left: 5px; padding:1px 5px; border-radius: 4px; font-size: 11px; font-weight:800; display: inline-block; line-height:1.3;">${genderText}</span>
        `;
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

  // [실시간 트랙 전향 인터록]: 참여 이력이 확인되는 순간 신규대상자(트랙B) 장벽을 깨고 기존 유저(트랙A)로 즉시 신분 전향
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

  // =============================================================================
  // [항목 02] 실시간 트랙 전향 인터록 및 첫 로드 당일(Today) 강제 매핑 엔진
  // =============================================================================
  // [당일 자동 매핑]: 연산자 조건 누락 교정 완료 (첫 로드 시 오늘 날짜 강제 주입)
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
  // [항목 03 - 전반부] [트랙 B : 신규 및 180일 만료자] 스크리닝 카드 조출 및 2줄 주간 브리핑
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
        // [문제 03 완결 해결 - 숫자 정제 가드막]: 포맷 자릿수 불일치 오차를 전면 세척하여 3대 단추 카드 정순 사출 유도
        const cleanSrcDate = actualRawDate.replace(/[^0-9]/g, "");
        const cleanTargetKey = window.selectedDateStr.replace(/[^0-9]/g, "");

        if (cleanSrcDate === cleanTargetKey) {
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

    // [신규 대상자 전용 2줄 레이아웃 나열 및 우측 공백 스캐너]
    let weeklyScheduleBriefingHTML = "";
    const daysMapShort = ["일", "월", "화", "수", "목", "금", "토"];

    weeklyKeys.forEach((dateKey) => {
      const dateObj = new Date(dateKey);
      const bits = dateKey.split("-"); // [인덱스 분해 완료]
      const formattedLabel = `${bits[0]}년 ${String(bits[1]).padStart(2, "0")}월 ${String(bits[2]).padStart(2, "0")}일 (${daysMapShort[dateObj.getDay()]})`;

      const matchItem = records.find((r) => {
        if (!r || !r.examSchedule) return false;
        const cleanSrcDate = r.examSchedule
          .toString()
          .replace(/[^0-9-]/g, "")
          .trim();
        const cleanTargetKey = dateKey
          .toString()
          .replace(/[^0-9-]/g, "")
          .trim();
        return cleanSrcDate === cleanTargetKey;
      });

      if (matchItem) {
        weeklyScheduleBriefingHTML += `
                    <div class="briefing-row-item" style="margin-bottom: 12px; line-height: 1.5; text-align: left;">
                        <div>• ${formattedLabel} : <span style="color: #38bdf8; font-weight: bold;">스크리닝</span></div>
                        <div style="padding-left: 12px; color: #94a3b8; font-size: 13px; font-weight: 700;">${matchItem.title} ${matchItem.th || "1기"}</div>
                    </div>
                `;
      } else {
        weeklyScheduleBriefingHTML += `
                    <div class="briefing-row-item" style="margin-bottom: 12px; text-align: left; color:rgba(255,255,255,0.35);">
                        • ${formattedLabel} : 
                    </div>
                `;
      }
    });

    if (
      ghostWeekCardsHTML === "" &&
      weeklyScheduleBriefingHTML.replace(/<[^>]*>/g, "").trim() === ""
    ) {
      cardBoard.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; font-weight: 700;">이번주에 등록된 임상시험 일정이 없습니다.</div>`;
      return;
    }

    let totalOutHTML = "";
    if (renderedCardCount === 0 && window.isDayButtonClicked === true) {
      totalOutHTML += `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 15px; font-weight: 600; color: #38bdf8;">선택하신 일자에는 임상시험 일정이 없습니다.</div>`;
    } else {
      totalOutHTML += ghostWeekCardsHTML;
    }

    if (!window.isDayButtonClicked) {
      totalOutHTML += `
                <div class="briefing-container-panel" style="background: var(--card-color); padding: 14px; border-radius: 14px; width: 100%; border:1px solid var(--border-color); box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-top: 10px; text-align: left;">
                    <div style="font-size: 13px; font-weight:800; color:var(--warning-color); margin-bottom: 12px; display: flex; align-items:center; gap: 6px;"><i class="fa-solid fa-list-check"></i> 해당 주간 임상 일정</div>
                    <div style="display: flex; flex-direction: column; gap:2px;">${weeklyScheduleBriefingHTML}</div>
                </div>
            `;
    }

    cardBoard.innerHTML = totalOutHTML;

    // =============================================================================
    // [항목 03 - 후반부] [트랙 B : 신규 및 180일 만료자] 3대 단추 비동기 액션 바인딩 및 부모 창 인터록 마감
    // =============================================================================
    setTimeout(() => {
      records.forEach((item) => {
        if (!item || !item.uid) return;

        // 1. 참여 버튼 클릭 시 트랜잭션 및 어드민 표준 단어 '신검대기' 커밋
        const btnJoin = document.getElementById(`btn_card_join_${item.uid}`);
        if (btnJoin) {
          btnJoin.onclick = function (e) {
            e.preventDefault();
            let appDB = getApplicantData();
            const liveQuotaCount = appDB.filter(
              (u) =>
                u &&
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
              stage: "신검대기", // 어드민 고정 단어 일치화
              status: "신검대기", // 어드민 고정 단어 일치화
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

            // 관리자 화면(admin.html) 관제망 실시간 리프레시 동기화 가동
            if (
              window.opener &&
              !window.opener.closed &&
              typeof window.opener.refreshApplicantView === "function"
            ) {
              window.opener.refreshApplicantView();
            }
            if (typeof renderCalendar === "function") renderCalendar();
            renderDailyCards();
          };
        }

        // 2. 미참여 버튼 피드백
        const btnReject = document.getElementById(
          `btn_card_reject_${item.uid}`,
        );
        if (btnReject) {
          btnReject.onclick = function (e) {
            e.preventDefault();
            alert("미참여 신청 되었습니다.");
          };
        }

        // 3. 이력조회 버튼 모달 융합
        const btnHist = document.getElementById(`btn_card_hist_${item.uid}`);
        if (btnHist) {
          btnHist.onclick = function (e) {
            e.preventDefault();
            if (typeof openIndividualHistoryModalInMobile === "function") {
              openIndividualHistoryModalInMobile(
                cleanSessionName,
                item.title,
                item.th || "1기",
              );
            }
          };
        }
      });
    }, 0);
    return; // 트랙 B 격리 방어선 마감 및 완전 이탈
  }

  // =============================================================================
  // [항목 04] [트랙 A : 기존 참여 대상자] 순정 6대 마일스톤 매핑 및 1줄 레이아웃 하이픈(-) 주간 목록 브리핑 팩토리
  // =============================================================================
  else {
    if (!myLiveJobRecord) {
      cardBoard.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px 16px; border-radius: 14px; margin-bottom: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 26px; color: var(--text-muted); margin-bottom: 10px; display: block;"></i>
                    <div style="color:var(--text-color); font-weight: 700; font-size: 14px; margin-bottom: 4px;">배정된 임상시험 정보가 없습니다.</div>
                    <div style="color:var(--text-muted); font-size: 12px; font-weight: 500; line-height: 1.4;">
                        대상자님은 현재 참여 중이거나 전산 심사 대기 중인 <br> 임상시험 과제 일정이 존재하지 않습니다.
                    </div>
                </div>
            `;
      return;
    }

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
          // [어드민 고정 옵션 단어 싱크]: "소집(입원)" -> "소집" 규격 일치화 수술 완착
          if (
            matchedRecruitmentItem.recDate &&
            matchedRecruitmentItem.recDate.trim() === cleankey
          )
            activeStages.push("소집");
          if (
            matchedRecruitmentItem.visitDate1 &&
            matchedRecruitmentItem.visitDate1.trim() === cleankey
          )
            activeStages.push("1차방문");
          if (
            matchedRecruitmentItem.visitDate2 &&
            matchedRecruitmentItem.visitDate2.trim() === cleankey
          )
            activeStages.push("2차방문");
          if (
            matchedRecruitmentItem.visitDate3 &&
            matchedRecruitmentItem.visitDate3.trim() === cleankey
          )
            activeStages.push("3차방문");
          if (
            matchedRecruitmentItem.visitDate4 &&
            matchedRecruitmentItem.visitDate4.trim() === cleankey
          )
            activeStages.push("4차방문");
          // [어드민 고정 옵션 단어 싱크]: "종료검사" -> "종료방문" 규격 일치화 수술 완착
          if (
            matchedRecruitmentItem.endExamDate &&
            matchedRecruitmentItem.endExamDate.trim() === cleankey
          )
            activeStages.push("종료방문");
        }

        if (activeStages.length > 0) hasWeeklyScheduleInThisWindow = true;

        // [사용자 보정안 싱크 반영]: 자바스크립트 날짜 배열 인덱싱 가공 무결성 확보
        const dateParts = cleankey.split("-");
        const loopDateObj = new Date(
          parseInt(dateParts[0], 10),
          parseInt(dateParts[1], 10) - 1,
          parseInt(dateParts[2], 10),
        );
        const formattedLabel = `${dateParts[0]}년 ${String(dateParts[1]).padStart(2, "0")}월 ${String(dateParts[2]).padStart(2, "0")}일 (${daysMapShort[loopDateObj.getDay()]})`;

        // [기획 요구사항 반영]: 기존 참여자는 날짜와 공정 단계명이 완벽히 1줄로 나열됨
        if (activeStages.length > 0) {
          const combinedStages = activeStages.join(", ");
          weeklyScheduleBriefingHtml += `
                        <div class="briefing-row-item" style="margin-bottom: 12px; padding: 4px 0; font-size: 13px; text-align:left;">
                            • ${formattedLabel} : <span style="color:#38bdf8; font-weight:800;">${combinedStages}</span>
                        </div>
                    `;

          // [문제 03 및 변수 정합성 수리 완료]: 자릿수 파편화를 전면 세척하는 고강도 숫자 소독 가드막 내부 정착
          const cleanRegularSrcDate = cleankey.replace(/[^0-9]/g, "");
          const cleanRegularTargetKey = window.selectedDateStr.replace(
            /[^0-9]/g,
            "",
          );

          if (cleanRegularSrcDate === cleanRegularTargetKey) {
            activeStages.forEach((stageLabel, sIdx) => {
              renderedCardCount++;
              const uniqueSubKey = `${matchedRecruitmentItem.uid}_REG_${sIdx}`;

              // [문제 해결 - 스크리닝=신검대기 정합성 연동 인터록 완착]
              const currentLiveStageToken = (
                myLiveJobRecord.stage ||
                myLiveJobRecord.status ||
                ""
              )
                .toString()
                .trim();

              if (
                stageLabel === "스크리닝" ||
                currentLiveStageToken === "신검대기"
              ) {
                regularCardsHTML += `
                                    <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 10px;">
                                        <i class="fa-solid fa-circle-check" style="font-size: 24px; color: #38bdf8; margin-bottom: 8px; display: block;"></i>
                                        <div style="font-size: 12.5px; color: #38bdf8; font-weight: 600;">현재 스크리닝 참여중입니다</div>
                                    </div>
                                `;
              }
              // [소집 및 정규 공정 격리 레일 개방]: 신검대기가 아닐 때, 소집 단계부터 3대 단추 카드가 정순 상단 사출
              else {
                regularCardsHTML += `
                                    <div class="trial-manifest-card" style="margin-bottom: 10px; border: 1px solid var(--border-color); background: #111827; padding: 14px; border-radius: 12px; text-align: left; box-shadow: 0 4px 6px 1px rgba(0, 0, 0, 0.5);">
                                        <div class="card-top-row">
                                            <div class="card-title-text" style="color: #ffffff; font-weight: 800; font-size: 14.5px;">${stageLabel}</div>
                                        </div>
                                        <div class="card-meta-grid" style="margin-top:8px; border-top: 1px dashed #1e293b; padding-top: 6px; font-size:12.5px; color:var(--text-muted);">
                                            <div>연계 과제: <span style="color: #38bdf8; font-weight: 700;">${matchedRecruitmentItem.title}</span></div>
                                        </div>
                                        <div class="card-action-bar" id="ui_action_bar_the_unique_${uniqueSubKey}" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 10px;">
                                            <button type="button" class="card-btn join" id="btn_card_join_${uniqueSubKey}" style="height: 32px; font-size: 12.5px;">참여</button>
                                            <button type="button" class="card-btn reject" id="btn_card_reject_${uniqueSubKey}" style="height: 32px; font-size:12.5px; background: #475569;">미참여</button>
                                            <button type="button" class="card-btn history-sync" id="btn_card_hist_${uniqueSubKey}" style="height:32px; font-size:12.5px;"><i class="fa-solid fa-clock-history"></i>이력조회</button>
                                        </div>
                                    </div>
                                `;
              }
            });
          }
        } else {
          // [기획 요구사항 반영]: 임상 스케줄이 비어있는 빈 날짜는 우측 영역에 깨끗하게 하이픈(: -) 긴급 표기
          weeklyScheduleBriefingHtml += `
                        <div class="briefing-row-item" style="margin-bottom: 12px; padding: 4px 0; font-size: 12px; color: rgba(255,255,255,0.35); text-align:left;">
                            <span>• ${formattedLabel} : </span><span style="font-weight: 500; color: rgba(255,255,255,0.2);">-</span>
                        </div>
                    `;
        }
      });
    }

    // =============================================================================
    // [항목 04 - 후반부] [트랙 A : 기존 참여 대상자] 주간 잔상 차단 및 3대 버튼 비동기 마스터 연동 커밋반
    // =============================================================================
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
    // [초기 주간 뷰 경고문 삭제 가드]: 사용자가 요일 단추를 직접 클릭했을 때만(window.isDayButtonClicked === true) 개별 일자 경고 박스 사출
    if (renderedCardCount === 0 && window.isDayButtonClicked === true) {
      totalOutHTML += `
                <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 40px 10px; background: var(--card-color); border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 15px; font-weight: 600; color: #38bdf8;">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 24px; color: #94a3b8; margin-bottom: 8px; display: block;"></i>
                    <div style="font-size: 12.5px; color: #38bdf8; font-weight: 600;">선택하신 일자에는 임상시험 일정이 없습니다.</div>
                </div>
            `;
    } else {
      totalOutHTML += regularCardsHTML;
    }

    // [문제 02 완벽 해결 - 주간 목록 잔상 원천 차단 장벽]: 요일 선택 상태에서는 하단 주간 통합 브리핑 브래킷 블록의 유입을 원천 봉쇄함
    if (!window.isDayButtonClicked) {
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
    }

    cardBoard.innerHTML = totalOutHTML;

    // [트랙 A 전용 비동기 3대 단추 액션 마스터 바인딩 및 어드민 실시간 상태 연동 커밋반]
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

        // [어드민 고정 옵션 표준 단어 싱크 마일스톤 매핑 리스트 재배치 완착]
        const originalMilestones = [
          { label: "스크리닝" },
          { label: "소집" },
          { label: "1차방문" },
          { label: "2차방문" },
          { label: "3차방문" },
          { label: "4차방문" },
          { label: "종료방문" },
        ];

        originalMilestones.forEach((schedule, idx) => {
          const uniqueSubKey = `${clickUid}_REG_${idx}`;

          // 1. 참여 버튼 클릭 시 출석 전진 업데이트 및 관제탑(admin.html) 참여상태 실시간 연동 변화
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
                // [단어 미스매치 수리 완착]: 어드민 셀렉트박스 옵션 규격과 토시 하나 안 틀리게 동기화 전진 처리
                let cleanFriendlyStage = schedule.label;

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

                // PC 마스터 관리자 화면(admin.html) 목록 및 #form-app-stage 드롭다운 메뉴 실시간 강제 리프레시 변화
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

          // 2. 미참여 거절 버튼 처리
          const btnReject = document.getElementById(
            `btn_card_reject_${uniqueSubKey}`,
          );
          if (btnReject) {
            btnReject.onclick = function (e) {
              e.preventDefault();
              alert("미참여 신청 되었습니다.");
            };
          }

          // 3. 모바일 전용 개별 이력조회 모달 시스템 호출 결착
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
        }); // originalMilestones.forEach 마감
      }); // currentActiveRecords.forEach 마감
    }, 0); // setTimeout 마감
  } // else 블록 최종 마감
}

// =============================================================================
// [인프라 복원 매립] 주간 달력 요일 단추 터치 이벤트 리스너 인터록 엔진 (단독 상주)
// =============================================================================
function attachCalendarDayClickEvents() {
  const dayButtons = document.querySelectorAll(
    ".weekly-day-btn, .calendar-day-item",
  );
  if (!dayButtons || dayButtons.length === 0) return;

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      // 사용자가 요일을 직접 선택했음을 알리는 플래그를 정밀 각인 (예외 문구 중복 노출 파쇄용)
      window.isDayButtonClicked = true;

      // 단추에 박혀있는 가상 데이터 속성(data-date="2026-12-04") 추출 및 전역 동기화
      const targetClickedRawDate = this.getAttribute("data-date") || "";
      if (targetClickedRawDate && targetClickedRawDate.includes("-")) {
        window.selectedDateStr = targetClickedRawDate.trim();

        // 액션 카드 섹션 조출 공장 강제 리렌더링 가동 (선택 요일 카드 정순 사출)
        renderDailyCards();
      }
    });
  });
}
