<script setup>
import { onBeforeMount, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreStore } from '../../stores/store/useStoreStore';

const router = useRouter();
const store = useStoreStore();

// 1. 화면에 바인딩 될 입력 폼 상태 (상세주소, 업종, 상태 추가)
const formData = reactive({
  storeName: '',
  phone: '',
  businessNumber: '',
  address: '',
  detailAddress: '', // 추가: 상세주소
  industryType: '한식',    // 추가: 업종 (기본값)
  businessStatus: 'PENDING',       // 사업자 인증 상태, 표시용
  operationStatus: 'OPERATING',    // 매장 운영 상태, 수정 가능
  kitchenCapacity: '',
  openTime: '',    // 추가: 영업 시작 시간
  closeTime: ''     // 추가: 영업 종료 시간
});

// 사업자 번호 3칸 전용 상태
const bizNumParts = reactive({
  part1: '',
  part2: '',
  part3: ''
});
// 백엔드에서 받은 숫자 10자리 사업자번호를 화면의 3칸 입력값으로 나눠 넣는 함수
const setBusinessNumberParts = (businessNumber) => {
  if (!businessNumber) {
    bizNumParts.part1 = '';
    bizNumParts.part2 = '';
    bizNumParts.part3 = '';
    return;
  }

  bizNumParts.part1 = businessNumber.slice(0, 3);
  bizNumParts.part2 = businessNumber.slice(3, 5);
  bizNumParts.part3 = businessNumber.slice(5, 10);
};

// 화면의 3칸 사업자번호를 백엔드 전송용 숫자 10자리로 합치는 함수
const getBusinessNumber = () => {
  return `${bizNumParts.part1}${bizNumParts.part2}${bizNumParts.part3}`;
};

// 2. 변경된 항목만 추출하기 위해 원본 데이터를 저장해둘 빈 객체
let originalData = {};

// 3. 내 매장 정보가 이미 존재하는지 판별 (버튼 '등록/수정' 동적 변경)
const isExistingStore = computed(() => !!store.currentData);

// 4. 화면이 열리기 전(초기화) 로직: 백엔드 미구현 상태 고려
onBeforeMount(async () => {
  try {
    await store.currentStore(); // 매장 정보 불러오기 시도
    
    // 서버에 내 매장 정보가 있다면 폼에 미리 채워줍니다.
    if (store.currentData) {
      formData.storeName = store.currentData.storeName || '';
      formData.phone = store.currentData.phone || '';
      formData.businessNumber = store.currentData.businessNumber || '';
      formData.address = store.currentData.address || '';
      formData.detailAddress = store.currentData.detailAddress || '';
      formData.industryType = store.currentData.category || '한식';
      formData.businessStatus = store.currentData.businessStatus || 'PENDING';
      formData.operationStatus = store.currentData.status || 'OPERATING';
      formData.kitchenCapacity = store.currentData.kitchenCapacity || '';
      formData.openTime = store.currentData.openTime?.slice(0, 5) || '';
      formData.closeTime = store.currentData.closeTime?.slice(0, 5)  || '';

      setBusinessNumberParts(store.currentData.businessNumber);


      // 스냅샷
      originalData = {
        storeName: formData.storeName,
        phone: formData.phone,
        businessNumber: store.currentData.businessNumber || '',
        address: formData.address,
        detailAddress: formData.detailAddress,
        industryType: formData.industryType,
        operationStatus: formData.operationStatus,
        businessNumber: store.currentData.businessNumber || '',
        kitchenCapacity: String(formData.kitchenCapacity),
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      };
    }
  } catch (error) {
    // 💡 [중요] 백엔드가 미구현이거나 에러가 나더라도 경고창으로 멈추지 않고,
    // 자연스럽게 콘솔에만 알린 뒤 '매장 없는 상태(isExistingStore = false)'로 화면을 띄웁니다.
    console.warn('백엔드 API 연결 실패. 테스트를 위해 매장 미등록 상태로 화면을 초기화합니다.');
  }
});

// 5. 등록 및 수정 버튼 클릭 시 실행될 함수
const handleSubmit = async () => {
  const currentBizNum = getBusinessNumber(); // 화면의 3칸 사업자번호를 합쳐서 가져오기

  if (isExistingStore.value) {
    /* [기존 유저] 부분 수정 로직 (PATCH) */
    const changedFields = {};

    if (formData.storeName !== originalData.storeName) changedFields.storeName = formData.storeName;
    if (formData.phone !== originalData.phone) changedFields.phone = formData.phone;
    if (formData.address !== originalData.address) changedFields.address = formData.address;
    if (formData.detailAddress !== originalData.detailAddress) changedFields.addressDetail = formData.detailAddress;
    if (formData.industryType !== originalData.industryType) changedFields.industryType = formData.industryType;
    if (formData.operationStatus !== originalData.operationStatus) changedFields.operationStatus = formData.operationStatus;
    if (String(formData.kitchenCapacity) !== originalData.kitchenCapacity) changedFields.kitchenCapacity = Number(formData.kitchenCapacity);
    if (currentBizNum !== originalData.businessNumber) changedFields.businessNumber = currentBizNum;
    if (formData.openTime !== originalData.openTime) changedFields.openTime = formData.openTime;
    if (formData.closeTime !== originalData.closeTime) changedFields.closeTime = formData.closeTime;

    if (Object.keys(changedFields).length === 0) {
      alert('수정된 항목이 없습니다.');
      return;
    }

    try {
      await store.updateStore(changedFields);
      alert('매장 정보가 성공적으로 수정되었습니다.');
      Object.assign(originalData, { ...changedFields, kitchenCapacity: String(formData.kitchenCapacity) });
      if (changedFields.businessNumber) originalData.businessNumber = currentBizNum;
    } catch (error) {
      console.error('수정 실패:', error);
    }

  } else {
    /* [신규 유저] 신규 등록 로직 (POST) */
    const payload = {
  storeName: formData.storeName,
  phone: formData.phone,
  businessNumber: currentBizNum,
  address: formData.address,
  addressDetail: formData.detailAddress,
  industryType: formData.industryType,
  operationStatus: formData.operationStatus,
  kitchenCapacity: Number(formData.kitchenCapacity),
  openTime: formData.openTime,
  closeTime: formData.closeTime,
};
    
    try {
      await store.storeForm(payload);
      alert('매장이 성공적으로 등록되었습니다.');
      await store.currentStore(); 
    } catch (error) {
      console.error('등록 실패:', error);
    }
  }
};

// 6. 변경 취소 버튼 로직
const handleCancel = () => {
  if (confirm('작성 중인 내용을 취소하시겠습니까?')) {
    window.location.reload(); 
  }
};
</script>

<template>
  <section data-tab-panel="store" class="page-section">
    <div class="section-title-row">
      <h1 class="main-title">매장 관리</h1>
      <p class="sub-desc">우측 상단 햄버거 메뉴의 내 정보에서 진입해 매장 기본정보를 등록하거나 수정합니다.</p>
    </div>

    <div class="tabs-mock">
      <span class="tab active">기본정보</span>
    </div>

    <article class="card">
      <div class="card-header">
        <div class="title-area">
          <h3>매장 기본정보</h3>
          <p class="required-note"><span>*</span> 필수 입력</p>
        </div>
        <div class="badge" :class="isExistingStore ? 'success' : 'default'">
          {{ isExistingStore ? '등록 완료' : '미등록' }}
        </div>
      </div>
      
      <form id="storeForm" class="grid-form" @submit.prevent="handleSubmit">
        
        <div class="input-group">
          <label>매장명 <span>*</span></label>
          <input name="storeName" type="text" v-model="formData.storeName" placeholder="DeliveryInsider Kitchen" required>
        </div>
        <div class="input-group">
          <label>대표 전화번호 <span>*</span></label>
          <input name="phone" type="text" oninput="this.value=this.value.replace(/[^0-9]/g,'')" v-model="formData.phone" placeholder="02-1234-5678" required maxlength="11">
        </div>
        
        <div class="input-group full-width">
          <label>주소 <span>*</span></label>
          <div class="input-with-btn">
            <input name="address" type="text" v-model="formData.address" placeholder="주소를 검색해주세요" required  style="background-color: #f9fafb;">
            <button type="button" class="btn-secondary">주소 검색</button>
          </div>
        </div>

        <div class="input-group">
          <label>상세주소</label>
          <input name="detailAddress" type="text" v-model="formData.detailAddress" placeholder="1층 101호">
        </div>
        <div class="input-group">
          <label>업종</label>
          <select name="industryType" v-model="formData.industryType">
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="카페/디저트">카페/디저트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div class="input-group">
          <label>사업자번호 <span>*</span></label>
          <div class="input-with-btn">
            <div class="biz-num-group">
              <input type="text" maxlength="3" v-model="bizNumParts.part1" required>
              <span class="dash">-</span>
              <input type="text" maxlength="2" v-model="bizNumParts.part2" required>
              <span class="dash">-</span>
              <input type="text" maxlength="5" v-model="bizNumParts.part3" required>
            </div>
            <button type="button" class="btn-secondary">형식 확인</button>
          </div>
        </div>
        <div class="input-group">
          <label>매장 상태</label>
          <select name="operationStatus" v-model="formData.operationStatus">
            <option value="OPERATING">운영중</option>
            <option value="TEMP_CLOSED">휴업</option>
            <option value="CLOSED">폐업</option>
          </select>
        </div>

        <div class="input-group">
          <label>주방 처리량 <span>*</span></label>
          <input name="kitchenCapacity" type="number" min="1" v-model="formData.kitchenCapacity" placeholder="예: 50" required>
        </div>
        <br>
        <div class="input-group">
          <label>영업 시작 시간 <span>*</span></label>
          <input name="openTime" type="time" v-model="formData.openTime" required>
        </div>

        <div class="input-group">
          <label>영업 종료 시간 <span>*</span></label>
          <input name="closingTime" type="time" v-model="formData.closeTime" required>
        </div>
        
        <div class="info-banner full-width">
          현재 적용 정보 카드, 영업·주방 설정 탭과 변경 이력 탭은 사용하지 않고 기본정보 탭 하나에서 등록과 수정을 처리합니다.
        </div>

        <div class="form-actions full-width">
          <button type="button" class="btn-cancel" @click="handleCancel">변경 취소</button>
          <button type="submit" class="btn-submit">
            {{ isExistingStore ? '수정' : '등록' }}
          </button>
        </div>
      </form>
    </article>
  </section>
</template>

<style scoped>
/* =======================================
   전체 레이아웃
======================================= */
.page-section {
  max-width: 100%; /* 100% 확장 */
  margin: 0 auto;
  padding: 40px 20px;
  color: #374151;
  font-family: 'Pretendard', sans-serif;
}

.main-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}
.sub-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 30px;
}

/* 탭 UI 스타일 */
.tabs-mock {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
}
.tab {
  padding: 12px 20px;
  font-weight: 700;
  font-size: 15px;
  color: #9ca3af;
  cursor: pointer;
}
.tab.active {
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
  margin-bottom: -2px;
}

/* =======================================
   카드 (Card)
======================================= */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}
.title-area h3 {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
}
.required-note {
  font-size: 12px;
  color: #9ca3af;
}
.required-note span {
  color: #ef4444; 
}

/* 상태 뱃지 */
.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}
.badge.success {
  background-color: #d1fae5;
  color: #059669; /* 초록색 텍스트 */
}
.badge.default {
  background-color: #f3f4f6;
  color: #6b7280; /* 회색 텍스트 */
}

/* =======================================
   2단 그리드 폼
======================================= */
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.full-width {
  grid-column: span 2; 
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.input-group label span {
  color: #ef4444;
}

/* =======================================
   입력 필드 & 셀렉트 박스 (Input & Select)
======================================= */
.grid-form input,
.grid-form select {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.grid-form input:focus,
.grid-form select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Select 박스 화살표 커스텀 (사진과 동일하게) */
.grid-form select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}

/* 버튼 포함 인풋 그룹 */
.input-with-btn {
  display: flex;
  gap: 8px;
}
.input-with-btn > input, .biz-num-group {
  flex: 1; 
}

/* 사업자번호 */
.biz-num-group {
  display: flex;
  align-items: center;
  gap: 8px; 
}
.biz-num-group input {
  text-align: center;
}
.biz-num-group input:nth-child(1) { flex: 3; }
.biz-num-group input:nth-child(3) { flex: 2; }
.biz-num-group input:nth-child(5) { flex: 4; }
.biz-num-group .dash {
  color: #6b7280;
  font-weight: 500;
}

/* =======================================
   정보 배너 & 하단 액션 버튼
======================================= */
.info-banner {
  background-color: #f0fdfa; /* 연한 민트/파랑 배경 */
  border: 1px solid #ccfbf1;
  color: #0f766e;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
}

.btn-secondary {
  padding: 0 16px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
}
.btn-secondary:hover {
  background: #f9fafb;
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* 우측 하단 정렬 */
  gap: 12px;
  margin-top: 10px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb; 
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}
.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-submit {
  padding: 10px 32px;
  border: none;
  background: #3b82f6; 
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover {
  background: #2563eb;
}
</style>