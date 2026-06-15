<!--
PlatformsView.vue: '플랫폼 정산 조건' 탭입니다. 
배민, 쿠팡이츠 등 배달 플랫폼별 수수료와 배달비를 설정하고 관리하는 화면입니다.
-->

<template>
  <div class="platforms-wrapper">
    
    <header class="page-header">
      <span class="category-text">PLATFORM SETTING API</span>
      <h1>플랫폼 정산 조건</h1>
    </header>

    <main class="content-area">
      <section class="card settings-card">
        <div class="card-header">
          <h2>수수료/배달비/쿠폰 수정</h2>
          <p>플랫폼 추가/삭제 없이 4개 플랫폼의 정산 조건만 수정합니다.</p>
        </div>

        <div class="table-responsive">
          <table class="data-table form-table">
            <thead>
              <tr>
                <th style="width: 15%;">플랫폼</th>
                <th style="width: 25%;">수수료율(%)</th>
                <th style="width: 25%;">배달비 부담금</th>
                <th style="width: 25%;">쿠폰 부담금</th>
                <th style="width: 10%; text-align: center;">저장</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="platform in platformSettings" :key="platform.id">
                <td>
                  <div class="platform-name">
                    <strong>{{ platform.name }}</strong>
                    <span class="eng-name">{{ platform.engName }}</span>
                  </div>
                </td>
                <td>
                  <input type="number" step="0.1" v-model="platform.feeRate" class="input-field" />
                </td>
                <td>
                  <input type="number" v-model="platform.deliveryBurden" class="input-field" />
                </td>
                <td>
                  <input type="number" v-model="platform.couponBurden" class="input-field" />
                </td>
                <td style="text-align: center;">
                  <button class="btn btn-sm-primary" @click="saveSettings(platform)">수정</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card summary-card">
        <div class="card-header">
          <h2>플랫폼별 순수익 요약</h2>
          <p>완료 주문 기준 순위입니다.</p>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>플랫폼</th>
                <th>주문 수</th>
                <th>완료 주문</th>
                <th>매출</th>
                <th>순수익</th>
                <th>순수익률</th>
                <th>순수익 순위</th>
                <th>순수익률 순위</th>
                <th>요약</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in summaryData" :key="index">
                <td>{{ row.platform }}</td>
                <td>{{ row.totalOrders }}</td>
                <td>{{ row.completedOrders }}</td>
                <td>{{ row.sales }}</td>
                <td>{{ row.profit }}</td>
                <td>{{ row.margin }}</td>
                <td>{{ row.profitRank }}</td>
                <td>{{ row.marginRank }}</td>
                <td>{{ row.summary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 상단 폼 데이터
const platformSettings = ref([
  { id: 'baemin', name: '배민', engName: 'BAEMIN', feeRate: 6.8, deliveryBurden: 2600, couponBurden: 800 },
  { id: 'coupang', name: '쿠팡이츠', engName: 'COUPANG_EATS', feeRate: 9.8, deliveryBurden: 3200, couponBurden: 1200 },
  { id: 'yogiyo', name: '요기요', engName: 'YOGIYO', feeRate: 8.5, deliveryBurden: 2800, couponBurden: 1000 },
  { id: 'ddangyo', name: '땡겨요', engName: 'DDANGYO', feeRate: 4.5, deliveryBurden: 1800, couponBurden: 500 },
]);

// 하단 테이블 데이터 (이전 페이지와 동일)
const summaryData = ref([
  { platform: '배민', totalOrders: 1, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 2, marginRank: 2, summary: '완료 주문이 아직 없습니다.' },
  { platform: '쿠팡이츠', totalOrders: 4, completedOrders: 2, sales: '54,000원', profit: '18,108원', margin: '33.53%', profitRank: 1, marginRank: 1, summary: '쿠팡이츠 완료 주문 2건 기준입니다.' },
  { platform: '요기요', totalOrders: 3, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 3, marginRank: 3, summary: '완료 주문이 아직 없습니다.' },
  { platform: '땡겨요', totalOrders: 2, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 4, marginRank: 4, summary: '완료 주문이 아직 없습니다.' },
]);

// 수정 버튼 클릭 시 실행할 함수
const saveSettings = (platform) => {
  // 실제 백엔드 연동 전까지는 얼럿 창으로 확인!
  alert(`${platform.name} 정산 조건이 수정되었습니다.\n수수료: ${platform.feeRate}%, 배달비: ${platform.deliveryBurden}원, 쿠폰: ${platform.couponBurden}원`);
  console.log('수정된 데이터:', platform);
};
</script>

<style scoped>
/* ==========================================
   공통 및 레이아웃 스타일
=========================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.platforms-wrapper {
  background-color: #f4f6fc;
  min-height: 100vh;
  padding: 30px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #333;
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

.page-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ==========================================
   카드 공통 스타일
=========================================== */
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 18px;
  color: #111827;
  margin-bottom: 4px;
}

.card-header p {
  font-size: 13px;
  color: #6b7280;
}

/* ==========================================
   테이블 공통 스타일 (이전 페이지와 호환)
=========================================== */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: #f9fafb;
  padding: 16px 12px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

/* ==========================================
   상단 폼(입력) 영역 특화 스타일
=========================================== */
.platform-name {
  display: flex;
  flex-direction: column;
}

.platform-name strong {
  font-size: 14px;
  color: #111827;
}

.platform-name .eng-name {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

/* 입력 필드 (input) 디자인 */
.input-field {
  width: 90%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 폼 안의 수정 버튼 */
.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-sm-primary {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  font-size: 13px;
}

.btn-sm-primary:hover {
  background: #2563eb;
}
</style>