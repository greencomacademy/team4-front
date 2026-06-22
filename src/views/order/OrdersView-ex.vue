<script setup>
import { computed, ref } from 'vue';

// 플랫폼 필터
const selectedPlatform = ref('');

// 주문 상태 필터
const selectedStatus = ref('');

// 화면 구조 확인용 임시 주문 데이터
// 백엔드 API를 연결하면 나중에 제거한다.
const orders = ref([
  {
    id: 1,
    orderNo: 'ORD-00001',
    platformType: 'BAEMIN',
    menuSummary: '묵은지 김치찜 외 1개',
    totalQuantity: 2,
    orderStatus: 'WAITING',
    totalAmount: 24500,
    netProfit: 9200,
    totalCookingTime: 25,
    delayRiskLevel: 'SAFE',
  },
  {
    id: 2,
    orderNo: 'ORD-00002',
    platformType: 'COUPANG_EATS',
    menuSummary: '단체 도시락 세트',
    totalQuantity: 8,
    orderStatus: 'COOKING',
    totalAmount: 120000,
    netProfit: 41500,
    totalCookingTime: 60,
    delayRiskLevel: 'WARNING',
  },
  {
    id: 3,
    orderNo: 'ORD-00003',
    platformType: 'YOGIYO',
    menuSummary: '로제 파스타',
    totalQuantity: 1,
    orderStatus: 'DELIVERING',
    totalAmount: 14000,
    netProfit: 4600,
    totalCookingTime: 15,
    delayRiskLevel: 'DELAYED',
  },
]);

// 선택한 플랫폼과 상태에 맞는 주문만 반환
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const platformMatched =
      !selectedPlatform.value ||
      order.platformType === selectedPlatform.value;

    const statusMatched =
      !selectedStatus.value ||
      order.orderStatus === selectedStatus.value;

    return platformMatched && statusMatched;
  });
});

// 운영 요약 카드에서 사용할 값
const operationSummary = computed(() => {
  const progressStatuses = [
    'WAITING',
    'COOKING',
    'DELIVERING',
  ];

  return {
    progressOrderCount: orders.value.filter((order) =>
      progressStatuses.includes(order.orderStatus)
    ).length,

    waitingCount: orders.value.filter(
      (order) => order.orderStatus === 'WAITING'
    ).length,

    cookingCount: orders.value.filter(
      (order) => order.orderStatus === 'COOKING'
    ).length,

    delayRiskCount: orders.value.filter(
      (order) => order.delayRiskLevel !== 'SAFE'
    ).length,
  };
});

// 플랫폼 영문 값을 한글로 변경
const getPlatformName = (platformType) => {
  const platformNames = {
    BAEMIN: '배민',
    COUPANG_EATS: '쿠팡이츠',
    YOGIYO: '요기요',
    DDANGYO: '땡겨요',
  };

  return platformNames[platformType] || platformType;
};

// 주문 상태 영문 값을 한글로 변경
const getOrderStatusName = (orderStatus) => {
  const orderStatusNames = {
    WAITING: '접수대기',
    COOKING: '조리중',
    DELIVERING: '배달중',
    COMPLETED: '완료',
    CANCELED: '취소',
    REFUNDED: '환불',
  };

  return orderStatusNames[orderStatus] || orderStatus;
};

// 지연 위험 값을 한글로 변경
const getDelayRiskName = (delayRiskLevel) => {
  const delayRiskNames = {
    SAFE: '정상',
    WARNING: '주의',
    DELAYED: '지연',
  };

  return delayRiskNames[delayRiskLevel] || delayRiskLevel;
};

// 금액에 천 단위 쉼표와 원 표시
const formatMoney = (amount) => {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`;
};

// 필터 초기화
const clearFilters = () => {
  selectedPlatform.value = '';
  selectedStatus.value = '';
};
</script>

<template>
  <div class="orders-view">
    <header class="orders-header">
      <span class="category-text">ORDER API</span>

      <h1>주문 운영 현황</h1>

      <p>
        플랫폼과 주문 상태별로 주문을 조회하고
        현재 진행 중인 주문과 지연 위험을 확인합니다.
      </p>
    </header>

    <!-- 운영 요약 카드 -->
    <section class="summary-grid">
      <article class="summary-card">
        <span>진행 주문</span>

        <strong>
          {{ operationSummary.progressOrderCount }}건
        </strong>

        <p>접수대기, 조리중, 배달중</p>
      </article>

      <article class="summary-card">
        <span>접수대기</span>

        <strong>
          {{ operationSummary.waitingCount }}건
        </strong>

        <p>주문 접수 확인 필요</p>
      </article>

      <article class="summary-card">
        <span>조리중</span>

        <strong>
          {{ operationSummary.cookingCount }}건
        </strong>

        <p>주방에서 조리 중인 주문</p>
      </article>

      <article class="summary-card danger-card">
        <span>지연 위험</span>

        <strong>
          {{ operationSummary.delayRiskCount }}건
        </strong>

        <p>우선 확인이 필요한 주문</p>
      </article>
    </section>

    <!-- 검색 조건 -->
    <section class="filter-card">
      <div class="filter-title">
        <h2>주문 검색</h2>

        <p>
          플랫폼과 주문 상태를 선택하여
          필요한 주문만 확인합니다.
        </p>
      </div>

      <div class="filter-row">
        <label>
          플랫폼

          <select v-model="selectedPlatform">
            <option value="">전체 플랫폼</option>
            <option value="BAEMIN">배민</option>
            <option value="COUPANG_EATS">쿠팡이츠</option>
            <option value="YOGIYO">요기요</option>
            <option value="DDANGYO">땡겨요</option>
          </select>
        </label>

        <label>
          주문 상태

          <select v-model="selectedStatus">
            <option value="">전체 상태</option>
            <option value="WAITING">접수대기</option>
            <option value="COOKING">조리중</option>
            <option value="DELIVERING">배달중</option>
            <option value="COMPLETED">완료</option>
            <option value="CANCELED">취소</option>
            <option value="REFUNDED">환불</option>
          </select>
        </label>

        <button
          type="button"
          class="reset-button"
          @click="clearFilters"
        >
          필터 초기화
        </button>
      </div>
    </section>

    <!-- 주문 목록 -->
    <section class="orders-card">
      <div class="table-header">
        <div>
          <h2>주문 목록</h2>

          <p>
            총 {{ filteredOrders.length }}건의 주문이 조회되었습니다.
          </p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>플랫폼</th>
              <th>주문 메뉴</th>
              <th>수량</th>
              <th>주문 상태</th>
              <th>주문 금액</th>
              <th>예상 순수익</th>
              <th>조리시간</th>
              <th>지연 상태</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
            >
              <td>
                <button
                  type="button"
                  class="order-number-button"
                >
                  {{ order.orderNo }}
                </button>
              </td>

              <td>
                {{ getPlatformName(order.platformType) }}
              </td>

              <td>
                {{ order.menuSummary }}
              </td>

              <td>
                {{ order.totalQuantity }}개
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="`status-${order.orderStatus.toLowerCase()}`"
                >
                  {{ getOrderStatusName(order.orderStatus) }}
                </span>
              </td>

              <td>
                {{ formatMoney(order.totalAmount) }}
              </td>

              <td>
                {{ formatMoney(order.netProfit) }}
              </td>

              <td>
                {{ order.totalCookingTime }}분
              </td>

              <td>
                <span
                  class="delay-badge"
                  :class="`delay-${order.delayRiskLevel.toLowerCase()}`"
                >
                  {{ getDelayRiskName(order.delayRiskLevel) }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredOrders.length === 0">
              <td
                colspan="9"
                class="empty-message"
              >
                조건에 맞는 주문이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.orders-view {
  min-height: 100vh;
  padding: 30px;
  background-color: #f4f6fc;
}

.orders-header {
  margin-bottom: 24px;
}

.category-text {
  display: block;
  margin-bottom: 4px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.orders-header h1 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 28px;
}

.orders-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #ffffff;
}

.summary-card span {
  display: block;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-bottom: 8px;
  color: #111827;
  font-size: 27px;
}

.summary-card p {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
}

.danger-card strong {
  color: #dc2626;
}

.filter-card,
.orders-card {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #ffffff;
}

.filter-title h2,
.table-header h2 {
  margin: 0 0 5px;
  color: #111827;
  font-size: 18px;
}

.filter-title p,
.table-header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: end;
  margin-top: 18px;
}

.filter-row label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 190px;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.filter-row select {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background-color: #ffffff;
}

.reset-button {
  height: 42px;
  padding: 0 17px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
}

.table-header {
  margin-bottom: 16px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
}

table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  background-color: #ffffff;
}

th,
td {
  padding: 13px 14px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
  font-size: 13px;
}

th {
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 12px;
}

td {
  color: #374151;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.order-number-button {
  padding: 0;
  border: 0;
  background-color: transparent;
  color: #2563eb;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.status-badge,
.delay-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.status-waiting {
  background-color: #fff7ed;
  color: #c2410c;
}

.status-cooking {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.status-delivering {
  background-color: #ecfeff;
  color: #0f766e;
}

.status-completed {
  background-color: #ecfdf5;
  color: #15803d;
}

.status-canceled {
  background-color: #fef2f2;
  color: #dc2626;
}

.status-refunded {
  background-color: #f5f3ff;
  color: #6d28d9;
}

.delay-safe {
  background-color: #ecfdf5;
  color: #15803d;
}

.delay-warning {
  background-color: #fff7ed;
  color: #c2410c;
}

.delay-delayed {
  background-color: #fef2f2;
  color: #dc2626;
}

.empty-message {
  height: 120px;
  color: #9ca3af;
  text-align: center;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .orders-view {
    padding: 18px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-row label {
    min-width: auto;
  }
}
</style>
