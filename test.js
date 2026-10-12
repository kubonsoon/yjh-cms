function saveInlineApplicantRecord(index, explicitUid) {
  try {
    // [역순 뒤틀림 영구 박멸선]: 줄 번호에 속지 않기 위해 현재 불이 켜진 수정 행을 직격 포착
    const targetRowDOM = document.querySelector(".editing-row");
    if (!targetRowDOM)
      return alert(
        "수정 대상자 행 (Row)의 메모리 컨텍스트를 포착하지 못했습니다.",
      );

    // [마스터 락킹 해제]: 줄 번호 인덱스를 완전히 불신 처리하고, 행 내부의 진짜타겟 엘리먼트 수색 가동
    let applicantDB =
      JSON.parse(localStorage.getItem("dataStoreApplicant")) || [];
    if (
      typeof dataStoreApplicant !== "undefined" &&
      dataStoreApplicant.length > 0
    ) {
      applicantDB = dataStoreApplicant;
    }

    // ❶ [식별자 우선 수거선]: 목록 버튼이 넘겨준 explicitUid 또는 직접 보정하신 히든 데이터 필드에서 고유 식별자 확정 수집
    const hiddenUidEl = document.getElementById(`inline-app-uid-${index}`);
    const targetUid = explicitUid || (hiddenUidEl ? hiddenUidEl.value : "");

    // ❷ [마스터 원장 정밀 락인 가드]: 가변 index 대신 확정된 고유 uid를 기반으로 원장 배열 내부의 진짜 방 번호 정밀 색인
    let exactMasterIdx = index;
    if (targetUid) {
      const foundIdx = applicantDB.findIndex(
        (d) => d && String(d.uid) === String(targetUid),
      );
      if (foundIdx !== -1) exactMasterIdx = foundIdx;
    }

    // [DOM 다이렉트 컨텍스트 스캔]: ID 뒤틀림 영향을 원천 차단하기 위해 활성화된 행(targetRowDOM) 내부에서 인풋 직접 추출
    // 플레이스홀더 속성 또는 아이디 접두사 속성을 포함하는 태그를 행 안에서 정밀 스캔합니다.
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
        "알림: 대상자 이름과 전화번호 데이터는 필수 항목이므로 빈칸으로 둘 수 없습니다.",
      );

    // ❸ [최종 커밋 조준선 동치화]: 최하단 applicantDB[idx] 수식과 완벽 연동되도록 진짜 원본방 번호(idx) 최종 확정 락업
    let idx = exactMasterIdx;
    if (targetUid) {
      const foundIdx = applicantDB.findIndex(
        (d) => d && String(d.uid) === String(targetUid),
      );
      if (foundIdx !== -1) idx = foundIdx;
    }

    if (idx === -1) {
      return alert(
        `전산망 원장 패킷 매칭 실패: 일치하는 대상자 원본방을 찾을 수 없습니다.`,
      );
    }

    // 진짜 매칭된 타겟 원본방 락인
    const origin = applicantDB[idx];
    const id = origin.uid;

    // ❺ 가변 컴포넌트 알맹이 값 강제 수거 (조준 축선 일치화 및 타인 방 데이터 복사 유발점 완전 소독)
    const getElVal = (baseId, fallback) => {
      const el =
        document.getElementById(`${baseId}-${exactMasterIdx}`) ||
        document.getElementById(`${baseId}-${index}`);
      return el ? el.value : fallback;
    };

    const t = getElVal("inline-app-title", origin.title).trim();
    const th = getElVal("inline-app-th", origin.th).trim();
    const p = getElVal("inline-app-period", origin.period)
      .trim()
      .replace(/[^0-9]/g, "");
    const s = getElVal("inline-app-ssn", origin.ssn).trim();

    const nextPay1 = getElVal("inline-app-pay1", "대기").toString().trim();
    const nextPay2 = getElVal("inline-app-pay2", "대기").toString().trim();
    const nextPay3 = getElVal("inline-app-pay3", "대기").toString().trim();
    const nextPay4 = getElVal("inline-app-pay4", "대기").toString().trim();
    const nextPay5 = getElVal("inline-app-pay5", "대기").toString().trim();

    const nextDuty = getElVal("inline-app-duty", "대기");
    const nextCall = getElVal("inline-app-call", "대기");
    const nextStage = getElVal("inline-app-stage", "신검대기").trim();

    // ==========================================================================
    // 🎯 [saveInlineApplicantRecord - Part 2] 대표님 특허 정원 소독(40) 및 버퍼 조준 치환 마감
    // ==========================================================================
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
      // 💡 [치명적 결함 원천 차단]: 범위 해제 셀렉터인 querySelector를 완벽하게 제거소독!
      // 상단 조준 축선(exactMasterIdx)을 그대로 주입하여 타인 방 인원수 침범을 물리 영구 파괴
      const elCount =
        document.getElementById(`inline-app-count-${exactMasterIdx}`) ||
        document.getElementById(`inline-app-count-${index}`);
      if (elCount) {
        let rawCountText = elCount.value.trim();
        pureQuotaNum = rawCountText.includes("/")
          ? rawCountText
              .split("/")
              .pop()
              .replace(/[^0-9]/g, "")
          : rawCountText.replace(/[^0-9]/g, "");
      }
    }
    if (!pureQuotaNum) pureQuotaNum = "40";

    let currentOrderNum =
      origin.liveMatchOrderNumber !== undefined
        ? origin.liveMatchOrderNumber
        : "1";
    const finalCountString = `${currentOrderNum}/${pureQuotaNum}`;

    // 변동 이력 추적 디프 디텍터
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
      uid: id,
      title: t,
      th: th,
      count: finalCountString,
      period: p,
      name: n,
      ssn: s ? s.toUpperCase() : origin.ssn,
      gender: origin.gender || "남",
      phone: ph,
      payStatus1: nextPay1,
      payStatus2: nextPay2,
      payStatus3: nextPay3,
      payStatus4: nextPay4,
      payStatusEnd: nextPay5,
      result: finalPipelineStatus,
      payStatus: finalPipelineStatus,
      isDutyAgreed: nextDuty,
      isCallAgreed: nextCall,
      stage: nextStage,
      status: nextStage,
    };

    // 💾 마스터 데이터베이스 백업 코어 복착 커밋
    applicantDB[idx] = updatedPayload;
    localStorage.setItem("dataStoreApplicant", JSON.stringify(applicantDB));
    if (typeof dataStoreApplicant !== "undefined")
      dataStoreApplicant = applicantDB;

    // 🚀 🎯 [화면 출력 버퍼 동적 치환]: 통째 복사를 완전히 지워버리고 오직 수정이 발생한 고유 uid 대상자방만 화면 버퍼에서 칼정밀 치환!!
    if (typeof db !== "undefined" && db.length > 0) {
      const dbIdx = db.findIndex(
        (item) => item && String(item.uid) === String(id),
      );
      if (dbIdx !== -1) db[dbIdx] = updatedPayload;
    }

    // 감사 로그 기록 송출
    if (changedItems.length > 0) {
      const logMsg = `대상자[${n}] 참여비 지급 설정 및 상태 변경 처리(변경항목: ${changedItems.join(", ")})`;
      if (typeof insertSystemAuditLog === "function") {
        insertSystemAuditLog("수정", logMsg);
      }
    }

    window.currentAppEditingIndex = null;
    isAppEditing = false;

    // 무선 번개 패킷 실시간 살포 데몬 가동 (원형 유지)
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

    // 화면 새로고침 가동 (필터링 상태 및 정렬 주파수 고스란히 상속 복원)
    if (typeof renderApplicantTable === "function") renderApplicantTable();
    else if (typeof refreshApplicantView === "function") refreshApplicantView();

    if (typeof calculateLiveDashboardStats === "function")
      calculateLiveDashboardStats();

    // 최종수정한 사항 알림창 사출
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

    // 💰 5차 참여비 가변 정산 필드 실시간 변경 탐지 셋업
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

    // 📝 알림창 최종 빌드 사출 (변경된 내용이 있다면 목록화하여 출력, 없으면 기본 완료 안내)
    if (alertDetails.length > 0) {
      alert(
        `📋 [대상자 목록 수정 완료]\n\n대상자: ${n}\n-------------------------\n${alertDetails.join("\n")}`,
      );
    } else {
      alert(
        `📋 [대상자 목록 수정 완료]\n\n대상자 ${n}님의 변경 사항이 원장에 안전하게 저장되었습니다.`,
      );
    }
  } catch (error) {
    console.error("대상자 인라인 세이브 최종 마비 오류:", error);
  }
}
