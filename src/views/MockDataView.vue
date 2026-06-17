<script setup>
import { ref } from 'vue';
import MyButton from '../components/button/MyButton.vue';
import axios from 'axios';

const delayCnt = ref(1);

const increaseDelayOrder = () => {
  if (delayCnt.value < 50) {
    delayCnt.value++;
  }
};

const decreaseDelayOrder = () => {
  if (delayCnt.value > 1) {
    delayCnt.value--;
  }
};

const createBaseMockData = async () => {
  try {
    await axios.post('/orders/mock', {
      scenario: generalScenario.value, 
      count: generalCnt.value
    })
    alert(`${generalScenario.value} 시나리오 주문 ${generalCnt.value}개가 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

const createScenario = async (scenarioType) => {
  try {
    await axios.post('/orders/mock', { scenario: scenarioType, count: 1 });
    alert(`${scenarioType} 주문이 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

const createDelayOrder = async () => {
  try {
    await axios.post('/orders/mock', { scenario: 'DELAY', count: delayCnt.value });
    alert(`지연 테스트 주문 ${delayCnt.value}개가 성공적으로 생성되었습니다.`);
  } catch (error) {
    handleError(error);
  }
};

const deleteMockOrders = async () => {
  if (!confirm('정말 로그인한 매장의 모든 Mock 주문을 삭제하시겠습니까?')) return;
  try {
    await axios.delete('/orders/mock');
    alert('Mock 주문이 완전히 삭제되었습니다.');
  } catch (error) {
    handleError(error);
  }
};

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
  alert('요청 중 오류가 발생했습니다: ' + error.message);
};
</script>

<template>
<div class="mock-wrapper">

  <header class="page-header">
    <span class="category-text">MOCK DATA API</span>
    <h1>Mock 데이터 생성 패널</h1>
  </header>

  <main class="content-area">
    <section class="card">
      <div class="card-header">
        <h2>기본 데이터</h2>
        <p>샘플 데이터 생성</p>
      </div>
      <MyButton
        class="card-button"
        :color="'blue'"
        :size="'big'"
        :content="'Mock 기본 데이터 생성'"
        @click="createBaseMockData"
      /> 
    </section>

    <section class="card input">
      <div class="card-header">
        <h2>일반 Mock 주문</h2>
        <p>일반/단체/프리미엄/지연 테스트용 주문을 섞어 생성</p>
      </div>

      <div class="input-group">
        <label>수량</label>
        <input v-model="generalCnt" type="number" class="input-field" />
      </div>

      <div class="input-group">
        <label>시나리오</label>
        <select v-model="generalScenario" class="input-field">
          <option value="MIXED">MIXED</option>
          <option value="GROUP">GROUP</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="DELAY">DELAY</option>
        </select>
      </div>

      <MyButton
        class="card-button"
        :color="'blue'"
        :size="'big'"
        :content="'Mock 주문 데이터 생성'"
        @click="createScenario('MIXED')"
      /> 
    </section>

    <section class="card">
      <div class="card-header">
        <h2>발표 시연용 주문</h2>
        <p>랜덤에 의존하지 않고 단체/프리미엄/지연 위험 주문을 직접 생성</p>
      </div>
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
      
      <div class="cnt-group">
          <p>지연 테스트 수량</p>
          <div class="counter-control">
            <button class="step-btn" @click="decreaseDelayOrder">-</button>
            <input
              v-model="delayCnt"
              type="number"
              min="1"
              max="50"
              readonly
              class="input-field"
            />
            <button class="step-btn" @click="increaseDelayOrder">+</button>
          </div>
          <MyButton
            class="card-button"
            :color="'blue'"
            :size="'big'"
            :content="'지연 테스트 주문 생성'"
            @click="createDelayOrder"
          /> 
      </div>
    </section>
    
    <section class="card">
        <div class="card-header">
          <h2>Mock 주문 초기화</h2>
          <p>로그인한 사용자의 매장 주문만 삭제</p>
        </div>
        <MyButton
          class="card-button"
          :color="'red'"
          :size="'big'"
          :content="'Mock 주문 삭제'"
          @click="deleteMockOrders"
        /> 
    </section>

  </main>

 </div>
</template>

<style scoped>
.mock-wrapper {
  background-color: #f4f6fc;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #333;
}

.content-area {
  margin: 10px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.card {
  background: white;
  border-radius: 10px;
  margin-bottom: 20px;
  flex: 1 1 350px;
  min-width: 350px; 
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin: 20px;
}

.counter-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.step-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.step-btn:hover {
  background: #e2e8f0;
}

.input-field {
  width: 140px;
  text-align: center;
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  border-top: 1px dashed #cbd5e1;
  padding-top: 15px;
}

.input-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.cnt-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  border-top: 1px dashed #cbd5e1;
  padding-top: 15px;
}

.cnt-group p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.card-button {
  margin: 10px 20px;
}

.card-button:hover {
  transform: translateY(-2px);
}

.page-header {
  margin-bottom: 24px;
}

.category-text {
  color: #3b82f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
  text-transform: uppercase;
}
</style>