<script setup>
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';

// Axios 인스턴스
const axios = myAxios;

// [일반 주문 생성] 상태
const generalCnt = ref(1); 
const requestScenario = ref('ALLERGY'); // 요청사항 확인 시나리오 값

// [지연 테스트 주문 생성] 상태 (캡처 이미지 시안에서는 제거되었으므로 내부 로직에서만 기본값 1 유지)
const delayCnt = ref(1);

// ----------------------
// 백엔드 연동 로직
// ----------------------

// 에러 핸들러
const handleError = (error) => {
  if (error.response && error.response.data) {
    const errorCode = error.response.data.code;

    if (errorCode === 'E04' || error.response.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }

    if (errorCode === 'E21' && error.response.data.data) {
      const fields = error.response.data.data;
      const msg = Object.entries(fields)
        .map(([field, text]) => `${field}: ${text}`)
        .join('\n');

      alert(`입력 유효성 실패:\n${msg}`);
      return;
    }

    alert(
      error.response.data.message ||
      error.response.data.data ||
      '요청 중 오류가 발생했습니다.'
    );
    return;
  }

  alert('요청 중 오류가 발생했습니다.');
};

const refreshHeaderNotifications = () => {
  window.dispatchEvent(new CustomEvent('deliveryinsider:notifications-refresh'));
};

// 1. 일반 Mock 주문 (수량/시나리오 직접 지정)
const createBaseMockData = async () => {
  try {
    // 💡 백엔드가 기대하는 기본 데이터를 객체 형태로 실어서 보냅니다.
    const response = await axios.post('/api/mock-data/orders', {
      scenario: 'NORMAL',
      count: generalCnt.value
    });

    const data = response.data.data;

    const msg =
      `일반 Mock 주문 ${data.createdCount}건이 생성되었습니다. ` +
      `주문번호: ${data.orderNos.join(', ')}`;

    refreshHeaderNotifications();
    alert(msg);
  } catch (error) {
    handleError(error);
  }
};

// 2. 단일 기능용 공통 호출 함수 (특정 시나리오 1건 생성)
const createScenario = async (scenarioType, title) => {
  try {
    const response = await axios.post('/api/mock-data/orders', {
      scenario: scenarioType,
      count: 1
    });

    const data = response.data.data;

    const msg =
      `${title} 주문 ${data.createdCount}건이 생성되었습니다. ` +
      `주문번호: ${data.orderNos.join(', ')}`;

    refreshHeaderNotifications();
    alert(msg);
  } catch (error) {
    handleError(error);
  }
};

// 3. 지연 테스트 전용
const createDelayOrder = async () => {
  try {
    const response = await axios.post('/api/mock-data/orders', {
      scenario: 'DELAY_TEST',
      count: delayCnt.value
    });

    const data = response.data.data;

    const msg =
      `조리 지연 테스트 주문 ${data.createdCount}건이 생성되었습니다. ` +
      `주문번호: ${data.orderNos.join(', ')}`;

    refreshHeaderNotifications();
    alert(msg);
  } catch (error) {
    handleError(error);
  }
};

// 4. 발표 피크타임 세트 (여러 종류 일괄 생성)
const createPeakMock = async () => {
  try {
    const response = await axios.post('/api/mock-data/orders', {
      scenario: 'PEAK_SET',
      count: 1
    });

    const data = response.data.data;

    const msg =
      `발표용 피크타임 세트 ${data.createdCount}건이 생성되었습니다. ` +
      `주문번호: ${data.orderNos.join(', ')}`;

    refreshHeaderNotifications();
    alert(msg);
  } catch (error) {
    handleError(error);
  }
};

// 5. Mock 주문 일괄 삭제
const deleteMockOrders = async () => {
  if (!confirm('정말 로그인한 매장의 모든 Mock 주문을 삭제하시겠습니까?')) {
    return;
  }

  try {
    const response =
      await axios.delete('/api/mock-data/orders');

    const data = response.data.data;

    const deletedCount =
      data?.deletedCount ?? data?.deletedOrderCount ?? 0;

    const msg =
      `매장의 Mock 주문 데이터 ${deletedCount}건이 삭제되었습니다.`;

    refreshHeaderNotifications();
    alert(msg);
  } catch (error) {
    handleError(error);
  }
};
</script>

<template>
  <div class="mock-wrapper">

    <header class="page-header">
      <div class="header-content">
        <span class="category-text">MOCK DATA API</span>
        <h1>Mock 데이터 생성 패널</h1>
      </div>
      <p class="header-desc">시연 및 테스트를 위한 가상의 주문 데이터를 생성하고 초기화합니다.</p>
    </header>

    <main class="mock-grid">
      
      <section class="mock-card">
        <div class="card-header">
          <h2>일반 Mock 주문</h2>
          <p>기본 주문을 생성합니다.</p>
        </div>
        <div class="card-body">
          <div class="input-group">
            <label>생성 내용</label>
            <select
              v-model.number="generalCnt"
              class="input-field select-field"
              title="생성할 일반 Mock 주문 수를 선택합니다."
              >
              <option :value="1">1건</option>
              <option :value="3">3건</option>
              <option :value="5">5건</option>
              <option :value="10">10건</option>
              </select>
          </div>
        </div>
        <div class="card-footer">
          <button type="button" class="primary-button full-width-btn" @click="createBaseMockData">일반 주문 생성</button>
        </div>
      </section>
      <section class="mock-card">
        <div class="card-header">
          <h2>요청사항 확인 주문</h2>
          <p>알러지, 배달사항, 고객 요청사항 확인 주문을 생성합니다.</p>
        </div>
        <div class="card-body">
          <div class="input-group">
            <label>요청 유형</label>
            <select v-model="requestScenario" class="input-field select-field">
              <option value="ALLERGY">알러지</option>
              <option value="GROUP">배달사항 확인</option>
              <option value="REQUEST_RISK">요청사항 확인</option>
              <option value="MIXED">랜덤 혼합</option>
            </select>
          </div>
        </div>
        <div class="card-footer">
          <button
            type="button"
            class="primary-button full-width-btn"
            @click="createScenario(requestScenario, '요청사항 확인')"
          >
            요청사항 확인 주문 생성
          </button>
        </div>
      </section>

      <section class="mock-card">
        <div class="card-header">
          <h2>지연 테스트 주문</h2>
          <p>조리중 '주의' 상태로 생성합니다.</p>
          </div>
           <div class="card-body">
              <div class="input-group">
                <label>생성 내용</label>
                <select
                v-model.number="delayCnt"
                class="input-field select-field"
                title="생성할 지연 테스트 주문 수를 선택합니다."
              >
                <option :value="1">1건</option>
                <option :value="3">3건</option>
                <option :value="5">5건</option>
                <option :value="10">10건</option>
                </select>
          </div>
        </div>
        <div class="card-body empty-body"></div>
        <div class="card-footer">
          <button type="button" class="primary-button full-width-btn" @click="createDelayOrder">지연 테스트 생성</button>
        </div>
      </section>

      <section class="mock-card">
        <div class="card-header">
          <h2>손실 위험 주문</h2>
          <p>쿠폰을 적용해 예상 순수익이 낮은 주문입니다.</p>
        </div>
        <div class="card-body empty-body"></div>
        <div class="card-footer">
          <button type="button" class="primary-button full-width-btn" @click="createScenario('LOSS', '손실 위험')">손실 주문 생성</button>
        </div>
      </section>

      <section class="mock-card">
        <div class="card-header">
          <h2>발표 피크타임 세트</h2>
          <p>여러 위험 주문을 한 번에 생성합니다.</p>
        </div>
        <div class="card-body empty-body"></div>
        <div class="card-footer">
          <button type="button" class="primary-button full-width-btn" @click="createPeakMock">피크타임 세트 생성</button>
        </div>
      </section>

      <section class="mock-card">
        <div class="card-header">
          <h2 class="text-danger">Mock 주문 초기화</h2>
          <p>현재 주문을 초기화합니다.</p>
        </div>
        <div class="card-body empty-body"></div>
        <div class="card-footer">
          <button type="button" class="sub-button danger-outline full-width-btn" @click="deleteMockOrders">Mock 주문 일괄 삭제</button>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* ============================================================
   디자인 시스템 변수 & 레이아웃 (Readability Pass 적용)
   ============================================================ */
.mock-wrapper {
  background-color: #f4f6fc;
  min-height: calc(100vh - 78px);
  padding: 34px 40px;
  font-family: 'Pretendard', sans-serif;
  color: #164E68;
  box-sizing: border-box;
}

/* ============================================================
   Page Header
   ============================================================ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-text {
  color: #2784B8;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.page-header h1 {
  font-size: 34px;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.header-desc {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

/* ============================================================
   Mock Grid (요청사항 카드 통합)
   ============================================================ */
.mock-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}

/* ============================================================
   Mock Card Styles
   ============================================================ */
.mock-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  min-height: 280px; /* 카드들의 최소 높이를 맞춰 균형 유지 */
}

.mock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.card-header {
  padding: 30px 28px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  font-size: 21px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.text-danger { color: #dc2626 !important; }

/* ============================================================
   Card Body & Inputs
   ============================================================ */
.card-body {
  padding: 24px 28px;
  flex: 1; 
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 입력 요소들을 아래쪽으로 밀착 */
  gap: 20px;
}

.empty-body {
  padding: 0; /* 내용이 없는 카드는 여백 제거하여 버튼만 보이게 설정 */
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  font-size: 15px;
  font-weight: 800;
  color: #334155;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.readonly-input {
  background-color: #f8fafc;
  color: #475569;
}

.input-field:focus:not(.readonly-input) {
  border-color: #2784B8;
  box-shadow: 0 0 0 3px rgba(39, 132, 184, 0.15);
}

.select-field {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 40px;
}

/* ============================================================
   Card Footer & Buttons
   ============================================================ */
.card-footer {
  padding: 0 28px 28px;
  display: flex;
  justify-content: center;
}

.full-width-btn {
  width: 100%;
}

.primary-button,
.sub-button {
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 900;
  transition: all 0.2s;
}

.primary-button {
  border: 0;
  color: #ffffff;
  background-color: #3b82f6;
}

.primary-button:hover {
  background-color: #2563eb;
}

.sub-button {
  border: 1px solid #fecaca;
  color: #dc2626;
  background-color: #ffffff;
}

.sub-button:hover {
  background-color: #fef2f2;
}

.danger-outline {
  color: #dc2626;
  border: 1px solid #fecaca;
}

.danger-outline:hover {
  background-color: #fef2f2;
}

/* ============================================================
   반응형 처리
   ============================================================ */
@media (max-width: 1400px) {
  .mock-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 1100px) {
  .mock-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}

@media (max-width: 760px) {
  .mock-wrapper { padding: 20px; }
  .mock-grid { grid-template-columns: 1fr; }
  .header-content { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>