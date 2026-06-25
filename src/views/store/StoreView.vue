<script setup>
import { onBeforeMount, reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreStore } from '../../stores/store/useStoreStore';

const router = useRouter();
const store = useStoreStore();

// 탭 상태 관리 ('basic', 'platform', 'operation')
const activeTab = ref('basic');

// ==========================================
// 1. [기본정보 탭] 상태 및 로직
// ==========================================
const formData = reactive({
  storeName: '',
  phone: '',
  businessNumber: '',
  address: '',
  detailAddress: '',
  industryType: '한식',
  kitchenCapacity: '',
  openTime: '',
  closeTime: '',
  operationStatus: 'OPERATING'
});

const isOvernightBusiness = computed(() => {
  if (
    !formData.openTime ||
    !formData.closeTime
  ) {
    return false;
  }

  /*
   * 종료 시간이 시작 시간보다 빠르거나 같으면
   * 다음날 종료 영업으로 본다.
   *
   * 예)
   * 18:00 ~ 02:00 → 다음날 02:00 종료
   * 11:00 ~ 11:00 → 다음날 11:00 종료, 24시간 영업
   */
  return formData.closeTime <= formData.openTime;
});

const businessTimeGuide = computed(() => {
  if (
    !formData.openTime ||
    !formData.closeTime
  ) {
    return '영업 시작 시간과 종료 시간을 입력하면 영업일 기준이 표시됩니다.';
  }

  if (formData.openTime === formData.closeTime) {
    return `${formData.openTime}부터 다음날 ${formData.closeTime}까지 영업으로 처리됩니다. 24시간 영업 설정입니다.`;
  }

  if (formData.closeTime < formData.openTime) {
    return `${formData.openTime}부터 다음날 ${formData.closeTime}까지 영업으로 처리됩니다.`;
  }

  return `${formData.openTime}부터 당일 ${formData.closeTime}까지 영업으로 처리됩니다.`;
});

const bizNumParts = reactive({ part1: '', part2: '', part3: '' });

const setBusinessNumberParts = (businessNumber) => {
  if (!businessNumber) {
    bizNumParts.part1 = ''; bizNumParts.part2 = ''; bizNumParts.part3 = '';
    return;
  }
  bizNumParts.part1 = businessNumber.slice(0, 3);
  bizNumParts.part2 = businessNumber.slice(3, 5);
  bizNumParts.part3 = businessNumber.slice(5, 10);
};

const getBusinessNumber = () => {
  return `${bizNumParts.part1}${bizNumParts.part2}${bizNumParts.part3}`;
};

let originalData = {};
const isExistingStore = computed(() => !!store.currentData);

onBeforeMount(async () => {
  try {
    await store.currentStore();
    
    if (store.currentData) {
      formData.storeName = store.currentData.storeName || '';
      formData.phone = store.currentData.phone || '';
      formData.businessNumber = store.currentData.businessNumber || '';
      formData.address = store.currentData.address || '';
      formData.detailAddress = store.currentData.detailAddress || '';
      formData.industryType = store.currentData.industryType || '';
      formData.kitchenCapacity = store.currentData.kitchenCapacity || '';
      formData.openTime = store.currentData.openTime?.slice(0, 5) || '';
      formData.closeTime = store.currentData.closeTime?.slice(0, 5)  || '';
      formData.operationStatus = store.currentData.operationStatus || 'OPERATING';

      setBusinessNumberParts(store.currentData.businessNumber);

      originalData = {
        storeName: formData.storeName,
        phone: formData.phone,
        businessNumber: store.currentData.businessNumber || '',
        address: formData.address,
        detailAddress: formData.detailAddress,
        industryType: formData.industryType,
        kitchenCapacity: String(formData.kitchenCapacity),
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        operationStatus: formData.operationStatus,
      };
    }
  } catch (error) {
    console.warn('백엔드 API 연결 실패. 테스트를 위해 매장 미등록 상태로 화면을 초기화합니다.');
  }
});
/*
 * 브라우저 기본 required 메시지를
 * 필드별 안내 문구로 바꾸는 함수
 */
const setInvalidMessage = (event, message) => {
  event.target.setCustomValidity(message);
};

/*
 * 사용자가 다시 입력하면
 * 이전 custom validity 메시지를 초기화해야 한다.
 */
const clearInvalidMessage = (event) => {
  event.target.setCustomValidity('');
};

// 유효성 검사

const validateStoreForm = () => {
  const currentBizNum = getBusinessNumber();

  if (!formData.storeName.trim()) {
    alert('매장명을 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.phone.trim()) {
    alert('대표 전화번호를 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.address.trim()) {
    alert('주소를 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.industryType) {
    alert('업종을 선택해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!currentBizNum || currentBizNum.length !== 10) {
    alert('사업자번호 10자리를 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.kitchenCapacity || Number(formData.kitchenCapacity) < 1) {
    alert('주방 처리량은 1 이상으로 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.openTime) {
    alert('영업 시작 시간을 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }

  if (!formData.closeTime) {
    alert('영업 종료 시간을 입력해주세요.');
    activeTab.value = 'basic';
    return false;
  }
  if (formData.closeTime <= formData.openTime) {
  const guideMessage =
    formData.openTime === formData.closeTime
      ? `${formData.openTime}부터 다음날 ${formData.closeTime}까지 영업으로 저장됩니다.\n24시간 영업 설정입니다.`
      : `${formData.openTime}부터 다음날 ${formData.closeTime}까지 영업으로 저장됩니다.`;

  const confirmed = confirm(
    `영업 종료 시간이 시작 시간보다 빠르거나 같습니다.\n` +
    `${guideMessage}\n\n` +
    `이 설정으로 저장하시겠습니까?`
  );

  if (!confirmed) {
    activeTab.value = 'basic';
    return false;
  }
}

  if (!formData.operationStatus) {
    alert('매장 운영 상태를 선택해주세요.');
    activeTab.value = 'operation';
    return false;
  }

  return true;
};

const handleBasicSubmit = async () => {
   if (!validateStoreForm()) {
    return;
  }
  const currentBizNum = getBusinessNumber();

  if (isExistingStore.value) {
    const changedFields = {};
    if (formData.storeName !== originalData.storeName) changedFields.storeName = formData.storeName;
    if (formData.phone !== originalData.phone) changedFields.phone = formData.phone;
    if (formData.address !== originalData.address) changedFields.address = formData.address;
    if (formData.detailAddress !== originalData.detailAddress) changedFields.addressDetail = formData.detailAddress;
    if (formData.industryType !== originalData.industryType) changedFields.industryType = formData.industryType;
    if (String(formData.kitchenCapacity) !== originalData.kitchenCapacity) changedFields.kitchenCapacity = Number(formData.kitchenCapacity);
    if (currentBizNum !== originalData.businessNumber) changedFields.businessNumber = currentBizNum;
    if (formData.openTime !== originalData.openTime) changedFields.openTime = formData.openTime;
    if (formData.closeTime !== originalData.closeTime) changedFields.closeTime = formData.closeTime;
    if (formData.operationStatus !== originalData.operationStatus) {
  changedFields.operationStatus = formData.operationStatus;
}
    if (Object.keys(changedFields).length === 0) {
      alert('수정된 항목이 없습니다.');
      return;
    }

    try {
      await store.updateStore(changedFields);
      alert('매장 정보가 성공적으로 수정되었습니다.');
      Object.assign(originalData, {...changedFields,
    kitchenCapacity: String(formData.kitchenCapacity),
      });

    if (changedFields.businessNumber) {
      originalData.businessNumber = currentBizNum;
    }

    if (changedFields.operationStatus) {
      originalData.operationStatus = formData.operationStatus;
    }
    } catch (error) {
      console.error('수정 실패:', error);
    }
  } else {
    const payload = {
      storeName: formData.storeName,
      phone: formData.phone,
      businessNumber: currentBizNum,
      address: formData.address,
      addressDetail: formData.detailAddress,
      industryType: formData.industryType,
      kitchenCapacity: Number(formData.kitchenCapacity),
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      operationStatus: formData.operationStatus,
    };
    
    try {
      await store.storeForm(payload);
      alert('매장이 성공적으로 등록되었습니다.\n 등록확인 후  대시보드로 이동해주세요.');
      await store.currentStore();
    } catch (error) {
      console.error('등록 실패:', error);
    }
  }
};

const handleCancel = () => {
  if (confirm('작성 중인 내용을 취소하시겠습니까?')) {
    window.location.reload(); 
  }
};

// ==========================================
// 2. [플랫폼 수수료 설정 탭] 상태 및 로직
// ==========================================
const platforms = reactive([
  { id: 'BAEMIN', name: '배달의민족', commissionRate: 6.8, deliveryFee: 2600, couponFee: 800 },
  { id: 'COUPANG', name: '쿠팡이츠', commissionRate: 9.8, deliveryFee: 3200, couponFee: 1200 },
  { id: 'YOGIYO', name: '요기요', commissionRate: 8.5, deliveryFee: 2800, couponFee: 1000 },
  { id: 'DDANGYO', name: '땡겨요', commissionRate: 4.5, deliveryFee: 1800, couponFee: 500 },
]);

const handlePlatformSubmit = (platform) => {
  // 실제 연동 시 PATCH /api/stores/platforms 등 호출
  alert(`${platform.name} 플랫폼 수수료 정보가 수정되었습니다.`);
};

// ==========================================
// 3. [운영 설정 탭] 상태 및 로직
// ==========================================
const operationData = reactive({
  peakLoadRate: 100,
  warningKeywords: '알러지, 환불, 별점, 서비스 많이',
  cancelRateWarning: 8
});

const handleOperationSubmit = async () => {
  await handleBasicSubmit(); // 기본정보 저장 후 운영 설정 저장
};
</script>

<template>
  <section class="page-section">
    <div class="section-title-row">
      <h1 class="main-title">매장 관리</h1>
      <p class="sub-desc">매장 기본정보, 플랫폼 수수료, 운영 기준을 관리합니다.</p>
    </div>

    <div class="tabs-mock">
      <button class="tab" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">기본정보</button>
      <button class="tab" :class="{ active: activeTab === 'platform' }" @click="activeTab = 'platform'">플랫폼 수수료 설정</button>
      <button class="tab" :class="{ active: activeTab === 'operation' }" @click="activeTab = 'operation'">운영 설정</button>
    </div>

    <article class="card" v-if="activeTab === 'basic'">
      <div class="card-header">
        <div class="title-area">
          <h3>매장 기본정보</h3>
          <p class="required-note"><span>*</span> 필수 입력</p>
        </div>
        <div class="badge" :class="isExistingStore ? 'success' : 'default'">
          {{ isExistingStore ? '등록 완료' : '미등록' }}
        </div>
      </div>
      
      <form class="grid-form" @submit.prevent="handleBasicSubmit">
        <div class="input-group">
          <label title="고객과 리포트 화면에 표시될 매장 이름입니다.">
          매장명 <span>*</span>
          </label>
          <input
            v-model="formData.storeName"
            required
            placeholder="예: 배프김치찜 동대구점"
            title="예: 배프김치찜 동대구점"
            @invalid="setInvalidMessage($event, '매장명을 입력해주세요. 예: 배프김치찜 동대구점')"
            @input="clearInvalidMessage($event)"
          />
        </div>
        <div class="input-group">
          <label title="주문 처리나 매장 연락처로 사용할 대표 전화번호입니다. 숫자만 입력해주세요.">
          대표 전화번호 <span>*</span>
          </label>
          <input
            v-model="formData.phone"
            required
            inputmode="numeric"
            placeholder="예: 0212345678"
            title="숫자만 입력하는 것을 권장합니다. 예: 0212345678"
            @invalid="setInvalidMessage($event, '대표 전화번호를 입력해주세요. 예: 0212345678')"
            @input="clearInvalidMessage($event)"
          />
        </div>
        
        <div class="input-group full-width">
          <label title="배달 주문의 기준 매장 주소입니다.">
          주소 <span>*</span>
          </label>
          <div class="input-with-btn">
            <input
              v-model="formData.address"
              required
              placeholder="예: 대구광역시 동구 동대구로 475"
              title="도로명 주소 또는 지번 주소를 입력해주세요."
              @invalid="setInvalidMessage($event, '매장 주소를 입력해주세요.')"
              @input="clearInvalidMessage($event)"
            />
            <button type="button" class="btn-secondary">주소 검색</button>
          </div>
        </div>

        <div class="input-group">
          <label title="상가명, 층수, 호수처럼 상세 위치를 입력합니다.">
          상세주소
          </label>
          <input
            v-model="formData.detailAddress"
            placeholder="예: 101호, 2층, 푸드코트 A구역"
            title="예: 101호, 2층, 푸드코트 A구역"
          />
        </div>
        <div class="input-group">
          <label title="매장의 주요 업종입니다. 메뉴 분석과 필터 기준으로 사용할 수 있습니다.">
          업종
          </label>
          <select
            v-model="formData.industryType"
            required
            title="매장의 대표 업종을 선택해주세요."
            @invalid="setInvalidMessage($event, '매장 업종을 선택해주세요.')"
            @change="clearInvalidMessage($event)"
          >
            <option value="">업종을 선택해주세요.</option>
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="카페/디저트">카페/디저트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div class="input-group">
          <label title="사업자 식별용 번호입니다. 10자리 숫자로 입력합니다.">
          사업자번호 <span>*</span>
          </label>
          <div class="input-with-btn">
            <div class="biz-num-group">
              <input
                v-model="bizNumParts.Part1"
                required
                inputmode="numeric"
                maxlength="3"
                pattern="[0-9]{3}"
                placeholder="123"
                title="사업자번호 앞 3자리입니다."
                @invalid="setInvalidMessage($event, '사업자번호 앞 3자리를 입력해주세요.')"
                @input="clearInvalidMessage($event)"
              />
              <span class="dash">-</span>
              <input
                v-model="bizNumParts.Part2"
                required
                inputmode="numeric"
                maxlength="2"
                pattern="[0-9]{2}"
                placeholder="45"
                title="사업자번호 중간 2자리입니다."
                @invalid="setInvalidMessage($event, '사업자번호 중간 2자리를 입력해주세요.')"
                @input="clearInvalidMessage($event)"
              >
              <span class="dash">-</span>
              <input
                v-model="bizNumParts.Part3"
                required
                inputmode="numeric"
                maxlength="5"
                pattern="[0-9]{5}"
                placeholder="67890"
                title="사업자번호 뒷 5자리입니다."
                @invalid="setInvalidMessage($event, '사업자번호 뒷 5자리를 입력해주세요.')"
                @input="clearInvalidMessage($event)"
              >
            </div>
            <button type="button" class="btn-secondary">형식 확인</button>
          </div>
        </div>

        <div class="input-group">
          <label title="동시에 조리 처리 가능한 주문 수입니다. &#10 지연 위험과 주방 부하율 계산에 사용됩니다.&#10 예: 3이면 동시에 3건 정도 처리 가능하다는 의미입니다.">
          주방 처리량 <span>*</span>
          </label>
          <input
            type="number"
            v-model="formData.kitchenCapacity"
            required
            min="1"
            placeholder="예: 3"
            title="예: 3이면 동시에 주문 3건 정도를 처리할 수 있다는 의미입니다."
            @invalid="setInvalidMessage($event, '주방 처리량을 입력해주세요. 예: 3이면 동시에 주문 3건 정도 처리 가능하다는 의미입니다.')"
            @input="clearInvalidMessage($event)"
          />
        </div>
        
        <div class="input-group">
          <label title="매장 영업일 계산의 시작 시간이 됩니다. 대시보드와 오늘 주문 조회 기준에 사용됩니다.">
          영업 시작 시간 <span>*</span>
          </label>
          <input
            type="time"
            v-model="formData.openTime"
            required
            title="예: 오전 11시 시작이면 11:00으로 선택합니다."
            @invalid="setInvalidMessage($event, '영업 시작 시간을 선택해주세요.')"
            @input="clearInvalidMessage($event)"
          />
        </div>

        <div class="input-group">
          <label title="매장 영업일 계산의 종료 시간이 됩니다. 시작 시간보다 빠르면 다음날 종료로 처리됩니다.">
          영업 종료 시간 <span>*</span>
          </label>
          <input
            type="time"
            v-model="formData.closeTime"
            required
            title="예: 02:00이면 다음날 새벽 2시 종료로 처리될 수 있습니다."
            @invalid="setInvalidMessage($event, '영업 종료 시간을 선택해주세요. 시작 시간보다 빠르거나 같으면 다음날 종료로 처리됩니다.')"
            @input="clearInvalidMessage($event)"
          />
        </div>
        <p
          class="business-time-guide full-width"
            :class="{ overnight: isOvernightBusiness }"
        >
            {{ businessTimeGuide }}
        </p>

        <div class="form-actions full-width">
          <button type="button" class="btn-cancel" @click="handleCancel">취소</button>
          <button type="submit" class="btn-submit">
            {{ isExistingStore ? '수정 저장' : '등록' }}
          </button>
        </div>
      </form>
    </article>

    <article class="card" v-if="activeTab === 'platform'">
      <div class="card-header">
        <div class="title-area">
          <h3>플랫폼 수수료 설정</h3>
          <p class="required-note">매장 등록의 서브탭으로 이동된 설정입니다.</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>플랫폼</th>
              <th>수수료율</th>
              <th>배달비 부담금</th>
              <th>쿠폰 부담금</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="platform in platforms" :key="platform.id">
              <td><strong>{{ platform.name }}</strong></td>
              <td>
                <div class="input-wrapper">
                  <input type="number" class="input-field" v-model.number="platform.commissionRate" step="0.1">
                  <span class="input-unit">%</span>
                </div>
              </td>
              <td>
                <div class="input-wrapper">
                  <input type="number" class="input-field" v-model.number="platform.deliveryFee">
                  <span class="input-unit">원</span>
                </div>
              </td>
              <td>
                <div class="input-wrapper">
                  <input type="number" class="input-field" v-model.number="platform.couponFee">
                  <span class="input-unit">원</span>
                </div>
              </td>
              <td>
                <button type="button" class="btn-sm-primary" @click="handlePlatformSubmit(platform)">수정 저장</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="card" v-if="activeTab === 'operation'">
      <div class="card-header">
        <div class="title-area">
          <h3>운영 설정</h3>
          <p class="required-note">운영 상태와 피크타임 판단 기준을 관리합니다.</p>
        </div>
      </div>
      <form class="grid-form" @submit.prevent="handleOperationSubmit">
        <div class="input-group">
          <label>매장 운영 상태</label>
          <select
            v-model="formData.operationStatus"
            required
            title="운영중, 휴업, 폐업 중 현재 매장 상태를 선택합니다."
            @invalid="setInvalidMessage($event, '매장 운영 상태를 선택해주세요.')"
            @change="clearInvalidMessage($event)"
          >
            <option value="">운영 상태를 선택해주세요.</option>
            <option value="OPERATING">운영중</option>
            <option value="TEMP_CLOSE">휴업</option>
            <option value="CLOSE">폐업</option>
          </select>
        </div>
        <div class="input-group">
          <label>피크타임 부하율 기준</label>
          <input
            type="number"
            v-model="operationData.peakLoadRate"
            min="1"
            placeholder="예: 100"
            title="예: 100이면 부하율이 100% 이상일 때 피크타임으로 판단합니다."
          />
        </div>
        <div class="input-group">
          <label>요구사항 경고 기준</label>
          <input
            v-model="operationData.warningKeywords"
            placeholder="예: 알러지, 환불, 별점, 서비스 많이"
            title="쉼표로 구분해서 입력합니다. 예: 알러지, 환불, 별점, 서비스 많이"
          />
        </div>
        <div class="input-group">
          <label>취소율 주의 기준</label>
          <input
            type="number"
            v-model="operationData.cancelRateWarning"
            min="0"
            max="100"
            placeholder="예: 8"
            title="예: 8이면 취소율이 8% 이상일 때 주의 상태로 볼 수 있습니다."
          />
        </div>
        
        <div class="info-banner full-width">
          현재 설정은 사이드바 현재 운영 카드와 대시보드 운영 브리핑에 반영됩니다.
        </div>
        
        <div class="form-actions full-width">
          <button type="button" class="btn-cancel" @click="handleCancel">취소</button>
          <button type="submit" class="btn-submit">저장</button>
        </div>
      </form>
    </article>
  </section>
</template>

<style scoped>
/* =======================================
   전체 레이아웃 및 탭
======================================= */
.business-time-guide {
  margin: -8px 0 4px;
  padding: 12px 14px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.business-time-guide.overnight {
  border-color: #fed7aa;
  background-color: #fff7ed;
  color: #9a3412;
}
.page-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 30px;
  color: #374151;
  font-family: 'Pretendard', sans-serif;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}
.sub-desc {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 30px;
}

.tabs-mock {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
}
.tab {
  background: transparent;
  border: 0;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  outline: none;
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
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}
.title-area h3 {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}
.required-note {
  font-size: 15px;
  color: #64748b;
}
.required-note span {
  color: #ef4444; 
}

/* 상태 뱃지 */
.badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
}
.badge.success {
  background-color: #d1fae5;
  color: #059669; 
}
.badge.default {
  background-color: #f3f4f6;
  color: #6b7280; 
}

/* =======================================
   그리드 폼 및 인풋
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
  font-size: 15px;
  font-weight: 800;
  color: #374151;
}
.input-group label span {
  color: #ef4444;
}

.grid-form input,
.grid-form select {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 16px;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}
.grid-form input:focus,
.grid-form select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.grid-form select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 40px;
  cursor: pointer;
}

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
.biz-num-group input { text-align: center; }
.biz-num-group input:nth-child(1) { flex: 3; }
.biz-num-group input:nth-child(3) { flex: 2; }
.biz-num-group input:nth-child(5) { flex: 4; }
.biz-num-group .dash {
  color: #6b7280;
  font-weight: 600;
}

/* =======================================
   플랫폼 설정 테이블 (Readability)
======================================= */
.table-responsive { overflow-x: auto; margin-top: 10px; }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.data-table th { 
  background: #f8fafc; padding: 18px 16px; font-size: 15px; 
  color: #475569; font-weight: 800; border-bottom: 2px solid #e5e7eb; white-space: nowrap; 
}
.data-table th:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
.data-table th:last-child { border-top-right-radius: 10px; border-bottom-right-radius: 10px; }
.data-table td { padding: 18px 16px; font-size: 16px; color: #111827; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-table tbody tr:hover { background: #EAF8FD; }
.data-table td strong { font-size: 18px; font-weight: 800; color: #111827; }

.input-wrapper { position: relative; display: flex; align-items: center; width: 100%; max-width: 200px; }
.input-field { 
  width: 100%; padding: 12px 36px 12px 14px; background: #f8fafc; 
  border: 1px solid #cbd5e1; border-radius: 10px; font-size: 16px; 
  font-weight: 600; color: #111827; outline: none; 
}
.input-field:focus { background: white; border-color: #2784B8; box-shadow: 0 0 0 3px rgba(39, 132, 184, 0.15); }
.input-unit { position: absolute; right: 14px; font-size: 15px; color: #9ca3af; font-weight: 800; }

/* =======================================
   공통 버튼 & 배너
======================================= */
.info-banner {
  background-color: #f0fdfa; 
  border: 1px solid #ccfbf1;
  color: #0f766e;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 10px;
}

.btn-secondary {
  padding: 0 20px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
}
.btn-secondary:hover { background: #f9fafb; }

.btn-sm-primary { 
  background: #EAF8FD; color: #2784B8; padding: 12px 20px; font-size: 15px; 
  font-weight: 900; border: none; border-radius: 10px; cursor: pointer; 
  transition: all 0.2s ease; white-space: nowrap;
}
.btn-sm-primary:hover { background: #2784B8; color: white; }

.form-actions {
  display: flex;
  justify-content: flex-end; 
  gap: 12px;
  margin-top: 10px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb; 
}

.btn-cancel {
  padding: 12px 28px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #374151;
  cursor: pointer;
}
.btn-cancel:hover { background: #f3f4f6; }

.btn-submit {
  padding: 12px 36px;
  border: none;
  background: #3b82f6; 
  border-radius: 10px;
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover { background: #2563eb; }

/* 모바일 대응 */
@media (max-width: 768px) {
  .page-section { padding: 20px 16px; }
  .card { padding: 24px 20px; }
  .grid-form { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
  .input-with-btn { flex-direction: column; }
  .btn-secondary { min-height: 46px; }
}
</style>