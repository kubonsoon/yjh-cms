function saveInlineApplicantRecord(index, explicitUid) {
  try {
    // [역순 뒤틀림 영구 박멸선]: 줄 번호에 속지 않기 위해 현재 불이 켜진 수정 행을 직격 포착 (원형 유지)
    const targetRowDOM =
      document.querySelector(".editing-row") ||
      document.querySelectorAll(".applicant-row, tr[data-uid]")[index];
    if (!targetRowDOM)
      return alert(
        "수정 대상자 행 (Row)의 메모리 컨텍스트를 포착하지 못했습니다.",
      );

    // [마스터 락킹 해제]: 스토리지 및 전역 변수 동시 스캔 복착 (원형 유지)
    let applicantDB =
      JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
    if (
      typeof dataStoreApplicant !== "undefined" &&
      dataStoreApplicant.length > 0
    ) {
      applicantDB = dataStoreApplicant;
    }

    // [식별자 우선 수거선]: 4대 포맷(디폴트, 수동, 엑셀, 모바일인증)의 미세 개행 및 유령 공백을 증발시키는 핵심 정형화
    const hiddenUidEl = document.getElementById(`inline-app-uid-${index}`);
    const targetUid = (
      explicitUid ||
      (hiddenUidEl ? hiddenUidEl.value : "") ||
      targetRowDOM.getAttribute("data-uid") ||
      ""
    )
      .toString()
      .trim()
      .replace(/\s/g, "");

    // [마스터 원장 정밀 락인 가드]: 4대 규격 통합 트림 공정으로 진짜 내 데이터 마스터 방 번호 색인
    let exactMasterIdx = index;
    if (targetUid) {
      const foundIdx = applicantDB.findIndex(
        (d) => d && String(d.uid).trim().replace(/\s/g, "") === targetUid,
      );
      if (foundIdx !== -1) exactMasterIdx = foundIdx;
    }

    // [DOM 다이렉트 컨텍스트 스캔]: 이름과 전화번호 필수 항목 1:1 직접 추출 (원형 유지)
    const nameInputEl =
      targetRowDOM.querySelector('input[id*="inline-app-name"]') ||
      targetRowDOM.querySelector('input[placeholder*="이름"]');
    const phoneInputEl =
      targetRowDOM.querySelector('input[id*="inline-app-phone"]') ||
      targetRowDOM.querySelector('input[placeholder*="전화"]');

    const n = nameInputEl ? nameInputEl.value.trim() : "";
    const ph = phoneInputEl
      ? phoneInputEl.value.trim().replace(/[^0-9]/g, "")
      : "";

    if (!n || !ph)
      return alert(
        "알림: 대상자 이름 and 전화번호 데이터는 필수 항목이므로 빈칸으로 둘 수 없습니다.",
      );

    // [최종 커밋 조준선 동치화]: 4대 포맷 교차 갱신 누수 방지를 위한 물리 방 번호(idx) 최종 락업
    let idx = exactMasterIdx;
    if (targetUid) {
      const foundIdx = applicantDB.findIndex(
        (d) => d && String(d.uid).trim().replace(/\s/g, "") === targetUid,
      );
      if (foundIdx !== -1) idx = foundIdx;
    }

    if (idx === -1) {
      return alert(
        "전산망 원장 패킷 매칭 실패: 일치하는 대상자 원본방을 찾을 수 없습니다.",
      );
    }

    // 진짜 매칭된 타겟 원본방 락인 (원형 유지)
    const origin = applicantDB[idx];
    const id = origin.uid;

    // 🛠️ [ID 엇갈림 영구 소독 구역]: 고유 ID 바인딩 축선이 단선되더라도 현재 활성화된 행(row) 내부에서 직접 데이터 무결 수거
    const getElVal = (baseId, fallback, selector) => {
      const el =
        targetRowDOM.querySelector(selector) ||
        document.getElementById(`${baseId}-${exactMasterIdx}`) ||
        document.getElementById(`${baseId}-${index}`);
      return el ? el.value : fallback;
    };

    const t = getElVal(
      "inline-app-title",
      origin.title,
      '.edit-title, select[name="title"], select[id*="title"]',
    ).trim();
    const th = getElVal(
      "inline-app-th",
      origin.th,
      '.edit-th, select[name="th"], select[id*="th"]',
    ).trim();
    const p = getElVal(
      "inline-app-period",
      origin.period,
      '.edit-period, input[name="period"], input[id*="period"]',
    )
      .trim()
      .replace(/[^0-9]/g, "");
    const s = getElVal(
      "inline-app-ssn",
      origin.ssn,
      '.edit-ssn, input[name="ssn"], input[id*="ssn"]',
    ).trim();

    // 4대 규격 혼재 시에도 참여비 1차~5차 데이터 유실을 원천 박멸하는 정밀 셀렉터 스캔
    const nextPay1 = getElVal(
      "inline-app-pay1",
      "대기",
      '.edit-pay1, select[id*="pay1"]',
    )
      .toString()
      .trim();
    const nextPay2 = getElVal(
      "inline-app-pay2",
      "대기",
      '.edit-pay2, select[id*="pay2"]',
    )
      .toString()
      .trim();
    const nextPay3 = getElVal(
      "inline-app-pay3",
      "대기",
      '.edit-pay3, select[id*="pay3"]',
    )
      .toString()
      .trim();
    const nextPay4 = getElVal(
      "inline-app-pay4",
      "대기",
      '.edit-pay4, select[id*="pay4"]',
    )
      .toString()
      .trim();
    const nextPay5 = getElVal(
      "inline-app-pay5",
      "대기",
      '.edit-pay5, select[id*="pay5"]',
    )
      .toString()
      .trim();

    // 미동조차 하지 않던 당직동의, 소집동의 드롭다운 객체 다이렉트 컨텍스트 결착
    const nextDuty = getElVal(
      "inline-app-duty",
      "대기",
      '.edit-duty, select[id*="duty"]',
    );
    const nextCall = getElVal(
      "inline-app-call",
      "대기",
      '.edit-call, select[id*="call"]',
    );

    // 참여상태 셀렉터 정밀 수거 구역
    const stageSelectDOM =
      targetRowDOM.querySelector('select[id*="inline-app-stage"]') ||
      targetRowDOM.querySelector('select[id*="stage"]') ||
      targetRowDOM.querySelector(".edit-stage, select");
    const nextStage = stageSelectDOM
      ? stageSelectDOM.value.trim()
      : getElVal("inline-app-stage", "신검대기", ".edit-stage").trim();

    // [saveInlineApplicantRecord Part 2] 대표님 특허 인원수 계산 공정 (원형 100% 완전 사수 보존)
    let pureQuotaNum = "40";
    const currentAppTitleText = t.toString().trim();
    if (currentAppTitleText.includes("명인제약")) pureQuotaNum = "44";
    else if (currentAppTitleText.includes("대우제약")) pureQuotaNum = "60";
    else if (currentAppTitleText.includes("파마사이언스")) pureQuotaNum = "74";
    else if (currentAppTitleText.includes("삼진제약")) pureQuotaNum = "30";
    else if (currentAppTitleText.includes("애드파마")) pureQuotaNum = "58";
    else if (currentAppTitleText.includes("신일제약")) pureQuotaNum = "60";
    else if (currentAppTitleText.includes("하나제약")) pureQuotaNum = "36";
    else if (currentAppTitleText.includes("경동제약")) pureQuotaNum = "40";
    else {
      const elCount =
        document.getElementById(`inline-app-count-${exactMasterIdx}`) ||
        document.getElementById(`inline-app-count-${index}`) ||
        targetRowDOM.querySelector(".edit-count, input");
      if (elCount) {
        let rawCountText = elCount.value.trim();
        pureQuotaNum = rawCountText.includes("/")
          ? rawCountText
              .split("/")
              .pop()
              .replace(/[^0-9]/g, "")
          : rawCountText.replace(/[^0-9]/g, "");
        if (!pureQuotaNum) pureQuotaNum = "40";
      }
    }

    let currentOrderNum =
      origin.liveMatchOrderNumber !== undefined
        ? origin.liveMatchOrderNumber
        : "1";
    const finalCountString = `${currentOrderNum}/${pureQuotaNum}`;

    // 변동 이력 추적 디프 디텍터 (원형 유지)
    let changedItems = [];
    if (origin.title !== t) changedItems.push("시험명");
    if (origin.th !== th) changedItems.push("기수");
    if (origin.count !== finalCountString) changedItems.push("인원수");
    if (origin.period !== p) changedItems.push("시간");
    if (origin.name !== n) changedItems.push("이름");
    if (origin.ssn !== s) changedItems.push("생년월일");
    if (origin.phone !== ph) changedItems.push("전화번호");
    if (origin.stage !== nextStage) changedItems.push("참여상태");

    let finalPipelineStatus = "대기";
    if (
      nextPay1 === "완료" &&
      nextPay2 === "완료" &&
      nextPay3 === "완료" &&
      nextPay4 === "완료" &&
      nextPay5 === "완료"
    )
      finalPipelineStatus = "완료";
    else if (
      nextPay1 === "처리중" ||
      nextPay2 === "처리중" ||
      nextPay3 === "처리중" ||
      nextPay4 === "처리중" ||
      nextPay5 === "처리중"
    )
      finalPipelineStatus = "처리중";
    else if (
      nextPay1 === "접수" ||
      nextPay2 === "접수" ||
      nextPay3 === "접수" ||
      nextPay4 === "접수" ||
      nextPay5 === "접수"
    )
      finalPipelineStatus = "접수";

    // 최종 통합 페이로드 커밋 패킷 봉인
    const updatedPayload = {
      ...origin,
      title: t,
      th: th,
      count: finalCountString,
      period: p,
      name: n,
      phone: ph,
      ssn: s,
      payStatus1: nextPay1,
      payStatus2: nextPay2,
      payStatus3: nextPay3,
      payStatus4: nextPay4,
      payStatusEnd: nextPay5,
      isDutyAgreed: nextDuty,
      isCallAgreed: nextCall,
      status: nextStage,
      stage: nextStage,
      participationState: nextStage,
      pipelineStatus: finalPipelineStatus,
    };

    // 마스터 데이터베이스 백업 코어 복착 커밋 (결함 A 영구 해결)
    applicantDB[idx] = updatedPayload;
    localStorage.setItem("dataStoreApplicant", JSON.stringify(applicantDB));
    window.dataStoreApplicant = applicantDB;
    if (typeof dataStoreApplicant !== "undefined")
      dataStoreApplicant = applicantDB;

    // 🚀 🎯 [화면 출력 버퍼 동적 치환]: 4대 규격 알맹이 값 정밀 크로스 트림 매칭으로 내 화면 셀만 칼정밀 치환 (결함 B 해결)
    if (typeof db !== "undefined" && db.length > 0) {
      const dbIdx = db.findIndex(
        (item) =>
          item && String(item.uid).trim().replace(/\s/g, "") === targetUid,
      );
      if (dbIdx !== -1) db[dbIdx] = updatedPayload;
    }

    // 감사 로그 기록 송출 (원형 유지)
    if (changedItems.length > 0) {
      const logMsg = `대상자 [${n}] 참여비 지급 설정 및 상태 변경 처리(변경항목: ${changedItems.join(", ")})`;
      if (typeof insertSystemAuditLog === "function") {
        insertSystemAuditLog("수정", logMsg);
      }
    }

    // 🔓 [수정 모드 플래그 해제 선행 안착]: 셀렉트 박스 락업 해제 및 일반 보기 모드 정상 복귀
    if (typeof currentlyEditingIndex !== "undefined")
      currentlyEditingIndex = -1;
    if (typeof editingRowUid !== "undefined") editingRowUid = null;
    window.currentAppEditingIndex = null;
    isAppEditing = false;

    // 무선 번개 패킷 실시간 살포 데몬 가동 (원형 100% 완전 사수 보존)
    const currentTargetData = applicantDB[idx];
    if (currentTargetData) {
      const dbNameClean = (currentTargetData.name || n || "")
        .toString()
        .replace(/\s/g, "");
      const cleanPhoneNum = (currentTargetData.phone || "")
        .toString()
        .replace(/[^0-9]/g, "")
        .trim();
      currentTargetData.masterCombinedKey = `${dbNameClean}_${cleanPhoneNum}`;
      localStorage.setItem("dataStoreApplicant", JSON.stringify(applicantDB));

      let pushStatusValue = "FAIL";
      if (
        nextStage === "신검통과" ||
        nextStage === "소집" ||
        nextStage === "투약" ||
        nextStage.includes("방문") ||
        nextStage === "종료"
      )
        pushStatusValue = "PASS";
      localStorage.setItem(
        "msg_push_signal",
        JSON.stringify({
          name: currentTargetData.name,
          status: pushStatusValue,
          time: Date.now(),
        }),
      );

      let authAllowValue =
        nextStage === "소집" ||
        nextStage === "투약" ||
        nextStage.includes("방문");
      let authStageCode =
        nextStage === "소집"
          ? 1
          : nextStage === "투약"
            ? 2
            : nextStage.includes("방문")
              ? 5
              : 3;
      localStorage.setItem(
        "msg_auth_signal",
        JSON.stringify({
          name: currentTargetData.name,
          isAllow: authAllowValue,
          stageCode: authStageCode,
          time: Date.now(),
        }),
      );
    }

    // 최종수정한 사항 알림창 사출을 위한 어레이 빌드 (원본 로직 상속)
    let alertDetails = [];
    if (origin.title !== t) alertDetails.push(`시험명 : ${t}`);
    if (origin.th !== th) alertDetails.push(`기수 : ${th}`);
    if (origin.count !== finalCountString)
      alertDetails.push(`인원수 : ${pureQuotaNum}명`);
    if (origin.period !== p) alertDetails.push(`시간 : ${p}시간`);
    if (origin.name !== n) alertDetails.push(`이름 : ${n}`);
    if (origin.phone !== ph) alertDetails.push(`전화번호 : ${ph}`);
    if (origin.stage !== nextStage)
      alertDetails.push(`참여상태 : ${nextStage}`);

    // 5차 참여비 가변 정산 필드 실시간 변경 탐지 셋업 (원형 유지)
    if (origin.payStatus1 !== nextPay1)
      alertDetails.push(`참여비 1차 : ${nextPay1}`);
    if (origin.payStatus2 !== nextPay2)
      alertDetails.push(`참여비 2차 : ${nextPay2}`);
    if (origin.payStatus3 !== nextPay3)
      alertDetails.push(`참여비 3차 : ${nextPay3}`);
    if ((origin.payStatus4 || "대기") !== nextPay4)
      alertDetails.push(`참여비 4차 : ${nextPay4}`);
    if ((origin.payStatusEnd || "대기") !== nextPay5)
      alertDetails.push(`참여비 종료 : ${nextPay5}`);

    if ((origin.isDutyAgreed || "대기") !== nextDuty)
      alertDetails.push(`당직동의 : ${nextDuty}`);
    if ((origin.isCallAgreed || "대기") !== nextCall)
      alertDetails.push(`소집동의 : ${nextCall}`);

    // 📝 [알림창 선행 빌드 사출] (원형 유지)
    if (alertDetails.length > 0) {
      alert(
        `📋 [대상자 목록 수정 완료]\n\n대상자: ${n}\n-------------------------\n${alertDetails.join("\n")}`,
      );
    } else {
      alert(
        `📋 [대상자 목록 수정 완료]\n\n대상자 ${n}님의 변경 사항이 원장에 안전하게 저장되었습니다.`,
      );
    }

    // 🚀 🎯 [인터록 해제 후 화면 최종 덧칠]: 격리 타이머로 상단 폼 지연 간섭을 무력화하고 새로고침 단행 (결함 C 해결)
    setTimeout(function () {
      if (typeof renderApplicantTable === "function") {
        renderApplicantTable();
      } else if (typeof refreshApplicantView === "function") {
        refreshApplicantView();
      }
      if (typeof calculateLiveDashboardStats === "function") {
        calculateLiveDashboardStats();
      }
    }, 50);
  } catch (error) {
    console.error("대상자 인라인 세이브 최종 마비 오류:", error);
  }
}
