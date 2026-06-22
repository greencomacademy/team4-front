<script setup>
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';
import MyButton from '../../components/button/MyButton.vue';
import myAxios from '../../api/myAxios.js';

// ----------------------
// 화면 상태 관리
// ----------------------

const axios = myAxios();

// 발표 시연용 카드 지연 테스트 수량 저장 변수
const delayCnt = ref(1);

// 일반 Mock 주문 카드 생산 수량 저장 변수
const generalCnt = ref(1); 

// 일반 Mock 주문 카드 선택된 시나리오 저장
const generalScenario = ref('MIXED');

// ----------------------
// 화면 제어 증/감
// ----------------------

// 지연 테스트 수량 증가 최대 50개
const increaseDelayOrder = () => {
  if (delayCnt.value < 50) {
    delayCnt.value++;
  }
};

// 지연 테스트 수량 감소 최소 1개
const decreaseDelayOrder = () => {
  if (delayCnt.value > 1) {
    delayCnt.value--;
  }
};

// ----------------------
// 백엔드 연동 axios
// ----------------------

// 일반 Mock 주문 데이터: 화면에서 선택한 문자열과 입력한 수량 전송
const createBaseMockData = async () => {
  try {
    await axios.post('/api/mock-data/orders', {
      scenario: generalScenario.value, // select 박스 Enum 값
      count: generalCnt.value // input 창 입력된 수량
    })
    alert(`${generalScenario.value} 시나리오 주문 ${generalCnt.value}개가 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

// 발표 시연용 주문 1건 생성(단체/프리미엄): 버튼 클릭 시 GROUP/PREMIUM 1개 생성
const createScenario = async (scenarioType) => {
  try {
    await axios.post('/api/mock-data/orders', { scenario: scenarioType, count: 1 });
    alert(`${scenarioType} 주문이 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

// 발표 시연용 지연 테스트 주문 생성: DELAY_TEST
const createDelayOrder = async () => {
  try {
    await axios.post('/api/mock-data/orders', { scenario: 'DELAY_TEST', count: delayCnt.value });
    alert(`지연 테스트 주문 ${delayCnt.value}개가 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

// 로그인한 매장의 모든 Mock 주문 일괄 삭제
const deleteMockOrders = async () => {
  if (!confirm('정말 로그인한 매장의 모든 Mock 주문을 삭제하시겠습니까?')) return;
  try {
    await axios.delete('/api/mock-data/orders');
    alert('Mock 주문이 완전히 삭제되었습니다.');
  } catch (error) {
    handleError(error);
  }
};

// 에러
const handleError = (error) => {
  if (error.response && error.response.data) {
    const errorCode = error.response.data.code;
    
    if (errorCode === 'E04' || error.response.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }
    
    if (errorCode === 'E21' && error.response.data.data) {
      const fields = error.response.data.data;
      const msg = Object.entries(fields).map(([field, text]) => `${field}: ${text}`).join('\n');
      alert(`입력 유효성 실패:\n${msg}`);
      return;
    }
  }
  alert('요청 중 오류가 발생했습니다: ' + (error.response?.data?.data || error.response?.data?.message));
};
</script>

<template>
<div class="mock-wrapper">

  <header class="page-header">
    <span class="category-text">MOCK DATA API</span>
    <h1>Mock 데이터 생성 패널</h1>
    <p class="header-desc">시연 및 테스트를 위한 가상의 주문 데이터를 생성하고 초기화합니다.</p>
  </header>

  <main class="grid-12">
    <section class="card col-3">
      <div class="card-header">
        <h2>기본 데이터</h2>
        <p>기본 샘플 데이터를 생성합니다.</p>
      </div>
      
      <div class="card-body empty-body">
        </div>

      <div class="card-footer">
        <MyButton
          class="card-button"
          :color="'blue'"
          :size="'big'"
          :content="'Mock 기본 데이터 생성'"
          @click="createBaseMockData"
        /> 
      </div>
    </section>

    <section class="card col-3">
      <div class="card-header">
        <h2>일반 Mock 주문</h2>
        <p>시나리오와 수량을 지정하여 생성합니다.</p>
      </div>

      <div class="card-body">
        <div class="input-group">
          <label>수량 설정</label>
          <input v-model="generalCnt" type="number" class="input-field" min="1" />
        </div>

        <div class="input-group">
          <label>시나리오 선택</label>
          <select v-model="generalScenario" class="input-field select-field">
            <option value="MIXED">MIXED (혼합)</option>
            <option value="GROUP">GROUP (단체)</option>
            <option value="PREMIUM">PREMIUM (프리미엄)</option>
            <option value="DELAY_TEST">DELAY (지연 테스트)</option>
          </select>
        </div>
      </div>

      <div class="card-footer">
        <MyButton
          class="card-button"
          :color="'blue'"
          :size="'big'"
          :content="'Mock 주문 데이터 생성'"
          @click="createBaseMockData"
        /> 
      </div>
    </section>

    <section class="card col-3">
      <div class="card-header">
        <h2>발표 시연용 주문</h2>
        <p>랜덤 없이 특정 위험 주문을 즉시 생성합니다.</p>
      </div>
      
      <div class="card-body">
        <div class="button-stack">
          <MyButton
            class="card-button"
            :color="'black'"
            :size="'big'"
            :content="'단체 주문 1건 생성'"
            @click="createScenario('GROUP')"
          /> 
          <MyButton
            class="card-button"
            :color="'gray'"
            :size="'big'"
            :content="'프리미엄 주문 1건 생성'"
            @click="createScenario('PREMIUM')"
          /> 
        </div>
        
        <div class="cnt-group">
          <label>지연 테스트 수량</label>
          <div class="counter-control">
            <button class="step-btn" @click="decreaseDelayOrder" aria-label="감소">-</button>
            <input
              v-model="delayCnt"
              type="number"
              min="1"
              max="50"
              readonly
              class="input-field counter-input"
            />
            <button class="step-btn" @click="increaseDelayOrder" aria-label="증가">+</button>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <MyButton
          class="card-button"
          :color="'blue'"
          :size="'big'"
          :content="'지연 테스트 주문 생성'"
          @click="createDelayOrder"
        /> 
      </div>
    </section>
    
    <section class="card col-3">
      <div class="card-header">
        <h2 class="text-danger">Mock 주문 초기화</h2>
        <p>로그인한 매장의 모든 주문을 삭제합니다.</p>
      </div>
      
      <div class="card-body empty-body">
         </div>

      <div class="card-footer">
        <MyButton
          class="card-button"
          :color="'red'"
          :size="'big'"
          :content="'Mock 주문 일괄 삭제'"
          @click="deleteMockOrders"
        /> 
      </div>
    </section>
  </main>

</div>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.mock-wrapper {
  --primary: #87CEEB;
  --strong: #2784B8;
  --soft: #EAF8FD;
  --primary-text: #164E68;
  
  --danger: #DC2626;
  --danger-bg: #FEF2F2;

  background-color: #f4f6fc;
  min-height: calc(100vh - 60px); 
  padding: 30px;
  font-family: 'Sejong hospital Light', 'Pretendard', sans-serif;
  color: var(--primary-text);
  box-sizing: border-box;
}

/* ==========================================
Page Header
=========================================== */
.page-header {
  margin-bottom: 24px;
}

.category-text {
  color: var(--strong);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #111827;
}

.header-desc {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

/* ==========================================
Grid Layout
=========================================== */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: stretch; /* 카드 높이를 동일하게 맞춤 */
}

.col-3 {
  grid-column: span 3;
}

/* ==========================================
Card Styles
=========================================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.card-header {
  padding: 28px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary-text);
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.text-danger {
  color: var(--danger) !important;
}

/* ==========================================
Card Body & Inputs
=========================================== */
.card-body {
  padding: 24px;
  flex: 1; /* 남은 높이를 채워서 푸터(버튼)를 맨 아래로 밀어냄 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-body {
  min-height: 120px; /* 기본/초기화 카드 영역 확보용 */
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label, .cnt-group label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field:hover {
  border-color: #94a3b8;
}

.input-field:focus {
  background-color: #ffffff;
  border-color: var(--strong);
  box-shadow: 0 0 0 3px var(--soft);
}

.select-field {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* ==========================================
발표 시연용 (버튼 그룹 & 카운터)
=========================================== */
.button-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e2e8f0;
}

.cnt-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.counter-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter-input {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 0;
}

.step-btn {
  width: 44px;
  height: 44px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.step-btn:hover {
  background: #e2e8f0;
  color: var(--strong);
  border-color: #94a3b8;
}

/* ==========================================
Card Footer (버튼 영역)
=========================================== */
.card-footer {
  padding: 0 24px 24px;
  display: flex;
  justify-content: center;
}

.card-button {
  width: 100%; /* 버튼이 카드 가로 너비에 꽉 차도록 설정 */
}
</style>