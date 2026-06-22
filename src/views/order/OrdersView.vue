<script setup>
import { computed, ref } from 'vue';

// 플랫폼 필터
const selectedPlatform = ref('');

// 주문 상태 필터
const selectedStatus = ref('');

// 검색어 필터
const searchKeyword = ref('');

// 선택된 주문 상세
const selectedOrder = ref(null);

// 요약 카드 모달
const isStatusModalOpen = ref(false);
const selectedSummaryType = ref('');

// 화면 구조 확인용 임시 주문 데이터
// 백엔드 API 연결 후에는 GET /api/orders 응답값으로 교체한다.
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
    orderedAt: '12:31',
    cookingStartedAt: null,
    completedAt: null,
    items: [
      { menuName: '묵은지 김치찜', quantity: 1 },
      { menuName: '치킨 덮밥', quantity: 1 },
    ],
    commissionAmount: 1960,
    deliveryFeeAmount: 2000,
    couponAmount: 1000,
    menuCostAmount: 9300,
    packagingAmount: 1040,
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
    orderedAt: '12:05',
    cookingStartedAt: '12:08',
    completedAt: null,
    items: [
      { menuName: '단체 도시락 세트', quantity: 8 },
    ],
    commissionAmount: 9600,
    deliveryFeeAmount: 4500,
    couponAmount: 3000,
    menuCostAmount: 56000,
    packagingAmount: 5400,
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
    orderedAt: '11:58',
    cookingStartedAt: '12:00',
    completedAt: null,
    items: [
      { menuName: '로제 파스타', quantity: 1 },
    ],
    commissionAmount: 1120,
    deliveryFeeAmount: 1500,
    couponAmount: 500,
    menuCostAmount: 5200,
    packagingAmount: 1080,
  },
  {
    id: 4,
    orderNo: 'ORD-00004',
    platformType: 'DDANGYO',
    menuSummary: '모듬 세트',
    totalQuantity: 4,
    orderStatus: 'COMPLETED',
    totalAmount: 76000,
    netProfit: 28400,
    totalCookingTime: 40,
    delayRiskLevel: 'SAFE',
    orderedAt: '11:42',
    cookingStartedAt: '11:45',
    completedAt: '12:28',
    items: [
      { menuName: '모듬 세트', quantity: 4 },
    ],
    commissionAmount: 4560,
    deliveryFeeAmount: 2500,
    couponAmount: 2000,
    menuCostAmount: 35000,
    packagingAmount: 3540,
  },
]);

// 최초 화면에서 보여줄 주문
selectedOrder.value = orders.value[0];

// 선택한 플랫폼, 상태, 검색어에 맞는 주문만 반환
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const platformMatched =
      !selectedPlatform.value ||
      order.platformType === selectedPlatform.value;

    const statusMatched =
      !selectedStatus.value ||
      order.orderStatus === selectedStatus.value;

    const keyword = searchKeyword.value.trim().toLowerCase();

    const keywordMatched =
      !keyword ||
      order.orderNo.toLowerCase().includes(keyword) ||
      order.menuSummary.toLowerCase().includes(keyword);

    return platformMatched && statusMatched && keywordMatched;
  });
});

// 운영 요약 카드에서 사용할 값
const operationSummary = computed(() => {
  return {
    waitingCount: orders.value.filter(
      (order) => order.orderStatus === 'WAITING'
    ).length,

    cookingCount: orders.value.filter(
      (order) => order.orderStatus === 'COOKING'
    ).length,

    deliveringCount: orders.value.filter(
      (order) => order.orderStatus === 'DELIVERING'
    ).length,

    delayRiskCount: orders.value.filter(
      (order) => order.delayRiskLevel !== 'SAFE'
    ).length,
  };
});

// 신규 주문 강조 카드에서 사용할 주문
const latestWaitingOrder = computed(() => {
  return orders.value.find((order) => order.orderStatus === 'WAITING');
});

// 요약 카드 모달 제목
const statusModalTitle = computed(() => {
  const titles = {
    WAITING: '접수대기 주문',
    COOKING: '조리중 주문',
    DELIVERING: '배달중 주문',
    DELAY_RISK: '지연 위험 주문',
  };

  return titles[selectedSummaryType.value] || '주문 목록';
});

// 요약 카드 모달에 표시할 주문 목록
const statusModalOrders = computed(() => {
  if (selectedSummaryType.value === 'DELAY_RISK') {
    return orders.value.filter((order) => order.delayRiskLevel !== 'SAFE');
  }

  return orders.value.filter((order) => {
    return order.orderStatus === selectedSummaryType.value;
  });
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

// 플랫폼별 CSS 클래스
const getPlatformClass = (platformType) => {
  const platformClasses = {
    BAEMIN: 'baemin',
    COUPANG_EATS: 'coupang',
    YOGIYO: 'yogiyo',
    DDANGYO: 'ddangyo',
  };

  return platformClasses[platformType] || 'default';
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
  searchKeyword.value = '';
};

// 주문 선택
const selectOrder = (order) => {
  selectedOrder.value = order;
};

// 요약 카드 클릭 시 모달 열기
const openStatusModal = (summaryType) => {
  selectedSummaryType.value = summaryType;
  isStatusModalOpen.value = true;
};

// 모달 닫기
const closeStatusModal = () => {
  isStatusModalOpen.value = false;
  selectedSummaryType.value = '';
};

// 모달에서 상세 보기
const openDetailFromModal = (order) => {
  selectOrder(order);
  closeStatusModal();
};

// 현재 상태에서 다음 상태 반환
const getNextStatus = (orderStatus) => {
  const nextStatuses = {
    WAITING: 'COOKING',
    COOKING: 'DELIVERING',
    DELIVERING: 'COMPLETED',
  };

  return nextStatuses[orderStatus] || null;
};

// 현재 상태에서 버튼 문구 반환
const getNextActionName = (orderStatus) => {
  const actionNames = {
    WAITING: '조리 시작',
    COOKING: '배달 시작',
    DELIVERING: '완료 처리',
  };

  return actionNames[orderStatus] || '';
};

// 임시 상태 변경
// 백엔드 연결 후 PATCH /api/orders/{orderId}/status 호출로 교체한다.
const changeOrderStatus = (order) => {
  const nextStatus = getNextStatus(order.orderStatus);

  if (!nextStatus) {
    return;
  }

  order.orderStatus = nextStatus;

  if (nextStatus === 'COOKING') {
    order.cookingStartedAt = '방금 전';
  }

  if (nextStatus === 'COMPLETED') {
    order.completedAt = '방금 전';
    order.delayRiskLevel = 'SAFE';
  }

  selectOrder(order);
};

// 임시 취소 처리
// 백엔드 연결 후 PATCH /api/orders/{orderId}/status { orderStatus: 'CANCELED' } 호출로 교체한다.
const cancelOrder = (order) => {
  if (!['WAITING', 'COOKING'].includes(order.orderStatus)) {
    return;
  }

  order.orderStatus = 'CANCELED';
  order.delayRiskLevel = 'SAFE';
  selectOrder(order);
};
</script>

<template>
  <div class="orders-view">
    <header class="page-header">
      <div>
        <span class="category-text">ORDER</span>

        <h1>통합 주문 관리</h1>

        <p>
          플랫폼별 주문을 한 화면에서 확인하고
          주문 상태와 지연 위험을 관리합니다.
        </p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="sub-button"
        >
          새로고침
        </button>

        <button
          type="button"
          class="primary-button"
        >
          Mock 주문 생성
        </button>
      </div>
    </header>

    <!-- 신규 주문 강조 영역 -->
    <section
      v-if="latestWaitingOrder"
      class="new-order-section"
    >
      <div class="new-order-head">
        <div>
          <span class="new-label">신규 주문</span>

          <strong>
            {{ getPlatformName(latestWaitingOrder.platformType) }}
            {{ latestWaitingOrder.orderNo }}
          </strong>
        </div>

        <span class="queue-badge">
          접수대기 {{ operationSummary.waitingCount }}건
        </span>
      </div>

      <div class="new-order-body">
        <div class="new-order-main">
          <h2>
            {{ latestWaitingOrder.menuSummary }}
          </h2>

          <p>
            총 {{ latestWaitingOrder.totalQuantity }}개 ·
            {{ formatMoney(latestWaitingOrder.totalAmount) }} ·
            예상 조리 {{ latestWaitingOrder.totalCookingTime }}분
          </p>
        </div>

        <div class="new-order-actions">
          <button
            type="button"
            class="sub-button"
          >
            나중에 확인
          </button>

          <button
            type="button"
            class="sub-button"
            @click="selectOrder(latestWaitingOrder)"
          >
            주문 상세
          </button>

          <button
            type="button"
            class="primary-button"
            @click="changeOrderStatus(latestWaitingOrder)"
          >
            조리 시작
          </button>
        </div>
      </div>
    </section>

    <!-- 상태 요약 카드 -->
    <section class="summary-grid">
      <article
        class="summary-card waiting clickable"
        @click="openStatusModal('WAITING')"
      >
        <div class="summary-card-head">
          <span>접수대기</span>
          <small>WAITING</small>
        </div>

        <strong>
          {{ operationSummary.waitingCount }}건
        </strong>

        <p>클릭하면 접수대기 주문만 확인</p>
      </article>

      <article
        class="summary-card cooking clickable"
        @click="openStatusModal('COOKING')"
      >
        <div class="summary-card-head">
          <span>조리중</span>
          <small>COOKING</small>
        </div>

        <strong>
          {{ operationSummary.cookingCount }}건
        </strong>

        <p>조리 진행 중인 주문</p>
      </article>

      <article
        class="summary-card delivering clickable"
        @click="openStatusModal('DELIVERING')"
      >
        <div class="summary-card-head">
          <span>배달중</span>
          <small>DELIVERING</small>
        </div>

        <strong>
          {{ operationSummary.deliveringCount }}건
        </strong>

        <p>배달 완료 대기 주문</p>
      </article>

      <article
        class="summary-card risk clickable"
        @click="openStatusModal('DELAY_RISK')"
      >
        <div class="summary-card-head">
          <span>지연 위험</span>
          <small>RISK</small>
        </div>

        <strong>
          {{ operationSummary.delayRiskCount }}건
        </strong>

        <p>주의·지연 주문만 확인</p>
      </article>
    </section>

    <!-- 검색 조건 -->
    <section class="filter-panel">
      <div class="filter-group">
        <label>플랫폼</label>

        <select v-model="selectedPlatform">
          <option value="">전체 플랫폼</option>
          <option value="BAEMIN">배민</option>
          <option value="COUPANG_EATS">쿠팡이츠</option>
          <option value="YOGIYO">요기요</option>
          <option value="DDANGYO">땡겨요</option>
        </select>
      </div>

      <div class="filter-group">
        <label>주문 상태</label>

        <select v-model="selectedStatus">
          <option value="">전체 상태</option>
          <option value="WAITING">접수대기</option>
          <option value="COOKING">조리중</option>
          <option value="DELIVERING">배달중</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELED">취소</option>
          <option value="REFUNDED">환불</option>
        </select>
      </div>

      <div class="filter-group grow">
        <label>검색</label>

        <input
          v-model="searchKeyword"
          type="text"
          placeholder="주문번호 또는 메뉴명을 입력하세요"
        />
      </div>

      <button
        type="button"
        class="sub-button filter-button"
        @click="clearFilters"
      >
        초기화
      </button>
    </section>

    <!-- 본문: 목록 + 상세 -->
    <section class="orders-content">
      <div class="order-list-panel">
        <div class="panel-title-row">
          <div>
            <h2>주문 목록</h2>

            <p>
              주문을 선택하면 오른쪽에서 상세 정보를 확인할 수 있습니다.
            </p>
          </div>

          <span class="count-text">
            총 {{ filteredOrders.length }}건
          </span>
        </div>

        <div class="table-scroll">
          <table class="order-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>플랫폼</th>
                <th>메뉴</th>
                <th>수량</th>
                <th>금액</th>
                <th>예상 순수익</th>
                <th>상태</th>
                <th>지연</th>
                <th>주문시각</th>
                <th>처리</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                :class="{ selected: selectedOrder?.id === order.id }"
                @click="selectOrder(order)"
              >
                <td>
                  <button
                    type="button"
                    class="order-number-button"
                    @click.stop="selectOrder(order)"
                  >
                    {{ order.orderNo }}
                  </button>
                </td>

                <td>
                  <span
                    class="platform-badge"
                    :class="getPlatformClass(order.platformType)"
                  >
                    {{ getPlatformName(order.platformType) }}
                  </span>
                </td>

                <td>
                  <strong>{{ order.menuSummary }}</strong>
                  <small>예상 {{ order.totalCookingTime }}분</small>
                </td>

                <td>{{ order.totalQuantity }}개</td>

                <td>{{ formatMoney(order.totalAmount) }}</td>

                <td>{{ formatMoney(order.netProfit) }}</td>

                <td>
                  <span
                    class="status-badge"
                    :class="`status-${order.orderStatus.toLowerCase()}`"
                  >
                    {{ getOrderStatusName(order.orderStatus) }}
                  </span>
                </td>

                <td>
                  <span
                    class="delay-badge"
                    :class="`delay-${order.delayRiskLevel.toLowerCase()}`"
                  >
                    {{ getDelayRiskName(order.delayRiskLevel) }}
                  </span>
                </td>

                <td>{{ order.orderedAt }}</td>

                <td>
                  <button
                    v-if="getNextStatus(order.orderStatus)"
                    type="button"
                    class="table-button"
                    @click.stop="changeOrderStatus(order)"
                  >
                    {{ getNextActionName(order.orderStatus) }}
                  </button>

                  <span
                    v-else
                    class="done-text"
                  >
                    -
                  </span>
                </td>
              </tr>

              <tr v-if="filteredOrders.length === 0">
                <td
                  colspan="10"
                  class="empty-message"
                >
                  조건에 맞는 주문이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 상세 패널 -->
      <aside
        v-if="selectedOrder"
        class="order-detail-panel"
      >
        <div class="detail-head">
          <div>
            <span class="detail-label">주문 상세</span>

            <h2>{{ selectedOrder.orderNo }}</h2>
          </div>

          <span
            class="status-badge"
            :class="`status-${selectedOrder.orderStatus.toLowerCase()}`"
          >
            {{ getOrderStatusName(selectedOrder.orderStatus) }}
          </span>
        </div>

        <div class="detail-section">
          <h3>상태 타임라인</h3>

          <div class="timeline">
            <div class="timeline-item done">
              <span></span>

              <div>
                <strong>주문 접수</strong>
                <small>{{ selectedOrder.orderedAt }}</small>
              </div>
            </div>

            <div
              class="timeline-item"
              :class="{
                done: ['COOKING', 'DELIVERING', 'COMPLETED'].includes(selectedOrder.orderStatus),
                current: selectedOrder.orderStatus === 'WAITING',
              }"
            >
              <span></span>

              <div>
                <strong>조리 시작</strong>
                <small>
                  {{ selectedOrder.cookingStartedAt || '아직 조리 시작 전입니다.' }}
                </small>
              </div>
            </div>

            <div
              class="timeline-item"
              :class="{
                done: ['DELIVERING', 'COMPLETED'].includes(selectedOrder.orderStatus),
                current: selectedOrder.orderStatus === 'COOKING',
              }"
            >
              <span></span>

              <div>
                <strong>배달 시작</strong>
                <small>
                  {{ selectedOrder.orderStatus === 'COOKING' ? '조리 완료 대기 중입니다.' : '-' }}
                </small>
              </div>
            </div>

            <div
              class="timeline-item"
              :class="{
                done: selectedOrder.orderStatus === 'COMPLETED',
                current: selectedOrder.orderStatus === 'DELIVERING',
              }"
            >
              <span></span>

              <div>
                <strong>완료</strong>
                <small>
                  {{ selectedOrder.completedAt || '-' }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>메뉴 · 수량</h3>

          <div
            v-for="item in selectedOrder.items"
            :key="item.menuName"
            class="detail-row"
          >
            <span>{{ item.menuName }}</span>
            <strong>{{ item.quantity }}개</strong>
          </div>
        </div>

        <div class="detail-section">
          <h3>예상 수익 내역</h3>

          <div class="cost-row">
            <span>주문금액</span>
            <strong>{{ formatMoney(selectedOrder.totalAmount) }}</strong>
          </div>

          <div class="cost-row minus">
            <span>플랫폼 수수료</span>
            <strong>-{{ formatMoney(selectedOrder.commissionAmount) }}</strong>
          </div>

          <div class="cost-row minus">
            <span>배달비 부담</span>
            <strong>-{{ formatMoney(selectedOrder.deliveryFeeAmount) }}</strong>
          </div>

          <div class="cost-row minus">
            <span>쿠폰 부담</span>
            <strong>-{{ formatMoney(selectedOrder.couponAmount) }}</strong>
          </div>

          <div class="cost-row minus">
            <span>메뉴 원가</span>
            <strong>-{{ formatMoney(selectedOrder.menuCostAmount) }}</strong>
          </div>

          <div class="cost-row minus">
            <span>포장비</span>
            <strong>-{{ formatMoney(selectedOrder.packagingAmount) }}</strong>
          </div>

          <div class="cost-row total">
            <span>예상 순수익</span>
            <strong>{{ formatMoney(selectedOrder.netProfit) }}</strong>
          </div>
        </div>

        <div class="detail-actions">
          <button
            type="button"
            class="sub-button danger-outline"
            :disabled="!['WAITING', 'COOKING'].includes(selectedOrder.orderStatus)"
            @click="cancelOrder(selectedOrder)"
          >
            주문 취소
          </button>

          <button
            v-if="getNextStatus(selectedOrder.orderStatus)"
            type="button"
            class="primary-button"
            @click="changeOrderStatus(selectedOrder)"
          >
            {{ getNextActionName(selectedOrder.orderStatus) }}
          </button>
        </div>
      </aside>
    </section>

    <!-- 요약 카드 상세 모달 -->
    <div
      v-if="isStatusModalOpen"
      class="modal-backdrop"
      @click.self="closeStatusModal"
    >
      <section class="status-modal">
        <header class="status-modal-header">
          <div>
            <span class="category-text">ORDER STATUS</span>

            <h2>{{ statusModalTitle }}</h2>

            <p>
              해당 조건에 맞는 주문만 빠르게 확인합니다.
            </p>
          </div>

          <button
            type="button"
            class="modal-close-button"
            @click="closeStatusModal"
          >
            ×
          </button>
        </header>

        <div class="status-modal-body">
          <div
            v-for="order in statusModalOrders"
            :key="order.id"
            class="modal-order-card"
          >
            <div class="modal-order-main">
              <div>
                <strong>{{ order.orderNo }}</strong>

                <p>{{ order.menuSummary }}</p>
              </div>

              <span
                class="status-badge"
                :class="`status-${order.orderStatus.toLowerCase()}`"
              >
                {{ getOrderStatusName(order.orderStatus) }}
              </span>
            </div>

            <div class="modal-order-meta">
              <span>{{ getPlatformName(order.platformType) }}</span>
              <span>{{ order.totalQuantity }}개</span>
              <span>{{ formatMoney(order.totalAmount) }}</span>
              <span>{{ order.totalCookingTime }}분</span>

              <span
                class="delay-badge"
                :class="`delay-${order.delayRiskLevel.toLowerCase()}`"
              >
                {{ getDelayRiskName(order.delayRiskLevel) }}
              </span>
            </div>

            <div class="modal-order-actions">
              <button
                type="button"
                class="sub-button"
                @click="openDetailFromModal(order)"
              >
                상세 보기
              </button>

              <button
                v-if="getNextStatus(order.orderStatus)"
                type="button"
                class="primary-button"
                @click="changeOrderStatus(order)"
              >
                {{ getNextActionName(order.orderStatus) }}
              </button>
            </div>
          </div>

          <div
            v-if="statusModalOrders.length === 0"
            class="modal-empty"
          >
            해당 조건에 맞는 주문이 없습니다.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.orders-view {
  min-height: 100vh;
  padding: 30px;
  background-color: #f4f6fb;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.category-text {
  display: block;
  margin-bottom: 4px;
  color: #2784b8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.primary-button,
.sub-button,
.table-button,
.order-number-button,
.modal-close-button {
  font: inherit;
  cursor: pointer;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  background-color: #2784b8;
  font-size: 13px;
  font-weight: 800;
}

.primary-button:hover {
  background-color: #1f6f99;
}

.sub-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  color: #334155;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.sub-button:hover {
  background-color: #f8fafc;
}

.sub-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.danger-outline {
  color: #b91c1c;
  border-color: #fecaca;
}

.new-order-section {
  overflow: hidden;
  margin-bottom: 16px;
  border: 2px solid #2784b8;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 18px 44px rgba(37, 132, 184, 0.16);
}

.new-order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #164e68, #2784b8);
}

.new-order-head div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-label {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  color: #164e68;
  background-color: #eaf8fd;
  font-size: 12px;
  font-weight: 900;
}

.new-order-head strong {
  font-size: 17px;
}

.queue-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 800;
}

.new-order-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
}

.new-order-main h2 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 20px;
}

.new-order-main p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.new-order-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  min-width: 0;
  padding: 17px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background-color: #ffffff;
}

.summary-card.clickable {
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.summary-card.clickable:hover {
  transform: translateY(-2px);
  border-color: #87ceeb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.summary-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.summary-card-head span {
  color: #475569;
  font-size: 13px;
  font-weight: 900;
}

.summary-card-head small {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.summary-card strong {
  display: block;
  margin-bottom: 4px;
  color: #111827;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.summary-card p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.summary-card.waiting {
  border-color: #87ceeb;
  background-color: #eaf8fd;
}

.summary-card.cooking {
  border-color: #bfdbfe;
}

.summary-card.delivering {
  border-color: #bbf7d0;
}

.summary-card.risk {
  border-color: #fecaca;
  background-color: #fff7f7;
}

.summary-card.risk strong {
  color: #dc2626;
}

.filter-panel {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background-color: #ffffff;
}

.filter-group {
  display: grid;
  gap: 6px;
  min-width: 150px;
}

.filter-group.grow {
  flex: 1;
}

.filter-group label {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.filter-group select,
.filter-group input {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  color: #334155;
  background-color: #ffffff;
  font-size: 13px;
  outline: none;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #87ceeb;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.24);
}

.filter-button {
  min-width: 72px;
}

.orders-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;
}

.order-list-panel,
.order-detail-panel {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.order-list-panel {
  min-width: 0;
  padding: 18px;
}

.panel-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title-row h2 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 18px;
  font-weight: 900;
}

.panel-title-row p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.count-text {
  color: #2784b8;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}

.table-scroll {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

.order-table th,
.order-table td {
  padding: 13px 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
}

.order-table th {
  color: #64748b;
  background-color: #f8fafc;
  font-size: 12px;
  font-weight: 900;
}

.order-table tbody tr {
  cursor: pointer;
}

.order-table tbody tr:hover,
.order-table tbody tr.selected {
  background-color: #eaf8fd;
}

.order-table td strong {
  display: block;
  color: #111827;
  font-size: 13px;
}

.order-table td small {
  display: block;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
}

.order-number-button {
  padding: 0;
  border: 0;
  background-color: transparent;
  color: #2784b8;
  font-weight: 900;
  text-decoration: underline;
}

.platform-badge,
.status-badge,
.delay-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 25px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.platform-badge.baemin {
  color: #164e68;
  background-color: #eaf8fd;
}

.platform-badge.coupang {
  color: #991b1b;
  background-color: #fee2e2;
}

.platform-badge.yogiyo {
  color: #6d28d9;
  background-color: #ede9fe;
}

.platform-badge.ddangyo {
  color: #166534;
  background-color: #dcfce7;
}

.platform-badge.default {
  color: #334155;
  background-color: #f1f5f9;
}

.status-badge.status-waiting {
  color: #164e68;
  background-color: #eaf8fd;
}

.status-badge.status-cooking {
  color: #92400e;
  background-color: #fffbeb;
}

.status-badge.status-delivering {
  color: #166534;
  background-color: #dcfce7;
}

.status-badge.status-completed {
  color: #334155;
  background-color: #f1f5f9;
}

.status-badge.status-canceled {
  color: #991b1b;
  background-color: #fee2e2;
}

.status-badge.status-refunded {
  color: #6d28d9;
  background-color: #ede9fe;
}

.delay-badge.delay-safe {
  color: #166534;
  background-color: #dcfce7;
}

.delay-badge.delay-warning {
  color: #9a3412;
  background-color: #ffedd5;
}

.delay-badge.delay-delayed {
  color: #991b1b;
  background-color: #fee2e2;
}

.table-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  color: #2784b8;
  background-color: #eaf8fd;
  font-size: 12px;
  font-weight: 900;
}

.table-button:hover {
  background-color: #d9f0fa;
}

.done-text {
  color: #94a3b8;
  font-size: 13px;
}

.empty-message {
  height: 120px;
  color: #9ca3af;
  text-align: center;
}

.order-detail-panel {
  position: sticky;
  top: 86px;
  padding: 18px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.detail-head h2 {
  margin: 4px 0 0;
  color: #111827;
  font-size: 21px;
  font-weight: 900;
}

.detail-section {
  padding-top: 16px;
}

.detail-section h3 {
  margin: 0 0 10px;
  color: #111827;
  font-size: 14px;
  font-weight: 900;
}

.timeline {
  display: grid;
  gap: 10px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 9px;
  color: #94a3b8;
}

.timeline-item > span {
  width: 11px;
  height: 11px;
  margin-top: 3px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
}

.timeline-item.done > span {
  border-color: #15803d;
  background-color: #15803d;
}

.timeline-item.current > span {
  border-color: #2784b8;
  background-color: #eaf8fd;
}

.timeline-item strong {
  display: block;
  color: #334155;
  font-size: 13px;
}

.timeline-item small {
  display: block;
  margin-top: 2px;
  font-size: 12px;
}

.detail-row,
.cost-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 13px;
}

.detail-row strong,
.cost-row strong {
  color: #111827;
}

.cost-row.minus strong {
  color: #dc2626;
}

.cost-row.total {
  margin-top: 4px;
  padding-top: 12px;
  border-bottom: 0;
  border-top: 1px solid #dbe3ee;
  color: #111827;
  font-weight: 900;
}

.cost-row.total strong {
  color: #15803d;
  font-size: 16px;
}

.detail-actions {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  margin-top: 18px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background-color: rgba(15, 23, 42, 0.45);
}

.status-modal {
  width: min(860px, 100%);
  max-height: 82vh;
  overflow: hidden;
  border-radius: 18px;
  background-color: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
}

.status-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8fafc;
}

.status-modal-header h2 {
  margin: 4px 0;
  color: #111827;
  font-size: 22px;
  font-weight: 900;
}

.status-modal-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.modal-close-button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  color: #475569;
  background-color: #ffffff;
  font-size: 24px;
  line-height: 1;
}

.modal-close-button:hover {
  color: #164e68;
  background-color: #eaf8fd;
}

.status-modal-body {
  display: grid;
  gap: 10px;
  max-height: calc(82vh - 104px);
  overflow-y: auto;
  padding: 18px 24px 24px;
}

.modal-order-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background-color: #ffffff;
}

.modal-order-card:hover {
  border-color: #87ceeb;
  background-color: #fbfdff;
}

.modal-order-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.modal-order-main strong {
  color: #111827;
  font-size: 15px;
}

.modal-order-main p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.modal-order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.modal-order-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  color: #475569;
  background-color: #f1f5f9;
  font-size: 12px;
  font-weight: 800;
}

.modal-order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.modal-empty {
  display: grid;
  place-items: center;
  min-height: 180px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .orders-content {
    grid-template-columns: 1fr;
  }

  .order-detail-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .orders-view {
    padding: 18px;
  }

  .page-header,
  .new-order-body,
  .filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions,
  .new-order-actions {
    justify-content: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-group {
    min-width: 0;
  }

  .detail-actions {
    grid-template-columns: 1fr;
  }

  .modal-backdrop {
    align-items: stretch;
    padding: 12px;
  }

  .status-modal {
    max-height: 100%;
  }

  .status-modal-header {
    padding: 18px;
  }

  .status-modal-body {
    padding: 14px 18px 18px;
  }

  .modal-order-main,
  .modal-order-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>