<!--
MockDataView.vue: 'Mock 데이터' 탭입니다. 
테스트를 위한 단체 주문, 지연 주문 등 가짜 데이터를 주입하거나 초기화하는 컨트롤 패널 화면입니다.
-->

<script setup>
import { ref } from 'vue';
import MyButton from '../components/button/MyButton.vue';

const delayCnt = ref(1)

const createDelayOrder = () => {
  if (delayCnt.value < 10) {
    delayCnt.value++
  }
}
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
      /> 
    </section>

    <section class="card">
      <div class="card-header">
        <h2>일반 Mock 주문</h2>
        <p>일반/단체/프리미엄/지연 테스트용 주문을 섞어 생성</p>
      </div>
      <MyButton
        class="card-button"
        :color="'blue'"
        :size="'big'"
        :content="'Mock 주문 데이터 생성'"
      /> 
    </section>

    <section class="card">
      <div class="card-header">
        <h2>발표 시연용 주문</h2>
        <p>랜덤에 의존하지 않고 단체/프리미엄/지연 위험 주문을 직접 생성</p>
      </div>
      <MyButton
        class="card-button"
        :color="'blue'"
        :size="'big'"
        :content="'단체 주문 1건 생성'"
      /> 
      <MyButton
        class="card-button"
        :color="'blue'"
        :size="'big'"
        :content="'프리미엄 주문 1건 생성'"
      /> 
      <div class="cnt-group">
          <p>지연 테스트 수량</p>
          <input
            v-model="delayCnt"
            type="number"
            class="input-field"
          />
          <MyButton
            class="card-button"
            :color="'gray'"
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
}

.card {
  background: white;
  border-radius: 10px;
  margin-bottom: 20px;
  flex: 1 1 300px;
  min-width: 280px;
  max-width: 400px;
}

.card-header {
  margin: 20px;
}

.input-field {
  width: 60%;
}

.cnt-group {
  display: flex;
  flex-direction: column;
  margin: 10px;
}

.card-button {
  margin: 20px;
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