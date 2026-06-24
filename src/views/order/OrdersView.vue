<script setup>
import { computed, ref } from 'vue';

// 필터 상태 관리
const selectedPlatform = ref('');
const selectedStatus = ref('');
const selectedAttention = ref(''); // 확인 필요(위험) 필터 추가
const searchKeyword = ref('');

// 선택된 주문 상세
const selectedOrder = ref(null);

// 요약 카드 모달 상태
const isStatusModalOpen = ref(false);
const selectedSummaryType = ref('');

// 취소 사유 모달 상태
const isCancelModalOpen = ref(false);
const cancelTargetOrder = ref(null);
const cancelReasonCategory = ref('');
const cancelReasonInput = ref('');

// 1. 화면 구조 확인용 임시 주문 데이터 (HTML 시안과 동일한 데이터 속성 반영)
const orders = ref([
  {
    id: 1,
    orderNo: 'ORD-00001',
    platformOrderNo: 'B-1834',
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
    deliveryAddress: '대구광역시 동구 동대구로 475 101동 1203호',
    requestText: '문 앞에 두고 벨은 누르지 말아주세요.',
    riskBadges: ['배달 전달 주의'],
    lossRisk: false,
    cancelReason: '',
    canceledAt: '',
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
    platformOrderNo: 'C-7719',
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
    deliveryAddress: '대구광역시 수성구 달구벌대로 2400 회의실 B',
    requestText: '10분 안에 안 오면 취소할게요. 수저 많이 주세요.',
    riskBadges: ['분쟁 가능', '과도 요청'],
    lossRisk: false,
    cancelReason: '',
    canceledAt: '',
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
    platformOrderNo: 'Y-4428',
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
    deliveryAddress: '대구광역시 중구 중앙대로 88 4층',
    requestText: '땅콩 알러지 있습니다. 견과류 절대 빼주세요.',
    riskBadges: ['알러지 주의'],
    lossRisk: false,
    cancelReason: '',
    canceledAt: '',
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
    id: 5,
    orderNo: 'ORD-00005',
    platformOrderNo: 'B-5842',
    platformType: 'BAEMIN',
    menuSummary: '로제 파스타 세트',
    totalQuantity: 2,
    orderStatus: 'WAITING',
    totalAmount: 28000,
    netProfit: -800,
    totalCookingTime: 30,
    delayRiskLevel: 'SAFE',
    orderedAt: '12:38',
    cookingStartedAt: null,
    completedAt: null,
    deliveryAddress: '대구광역시 동구 첨단로 77 101호',
    requestText: '리뷰 쓸테니 소스랑 사이드 서비스 많이 주세요.',
    riskBadges: ['과도 요청', '손실 위험'],
    lossRisk: true,
    cancelReason: '',
    canceledAt: '',
    items: [
      { menuName: '로제 파스타', quantity: 2 },
    ],
    commissionAmount: 2240,
    deliveryFeeAmount: 3200,
    couponAmount: 3000,
    menuCostAmount: 14800,
    packagingAmount: 1560,
  }
]);

selectedOrder.value = orders.value[0];

// 2. 검색 및 필터 로직 (확인 필요 필터 추가)
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const platformMatched = !selectedPlatform.value || order.platformType === selectedPlatform.value;
    const statusMatched = !selectedStatus.value || order.orderStatus === selectedStatus.value;
    
    let attentionMatched = true;
    if (selectedAttention.value === 'REQUEST') attentionMatched = order.riskBadges.length > 0;
    if (selectedAttention.value === 'DELAY') attentionMatched = order.delayRiskLevel !== 'SAFE';
    if (selectedAttention.value === 'LOSS') attentionMatched = order.lossRisk;
    if (selectedAttention.value === 'CANCEL') attentionMatched = order.orderStatus === 'CANCELED';

    const keyword = searchKeyword.value.trim().toLowerCase();
    const keywordMatched =
      !keyword ||
      order.orderNo.toLowerCase().includes(keyword) ||
      order.platformOrderNo.toLowerCase().includes(keyword) ||
      order.menuSummary.toLowerCase().includes(keyword) ||
      order.deliveryAddress.toLowerCase().includes(keyword) ||
      order.requestText.toLowerCase().includes(keyword);

    return platformMatched && statusMatched && attentionMatched && keywordMatched;
  });
});

// 운영 요약 카드에서 사용할 값
const operationSummary = computed(() => {
  return {
    waitingCount: orders.value.filter((o) => o.orderStatus === 'WAITING').length,
    cookingCount: orders.value.filter((o) => o.orderStatus === 'COOKING').length,
    deliveringCount: orders.value.filter((o) => o.orderStatus === 'DELIVERING').length,
    requestRiskCount: orders.value.filter((o) => o.riskBadges.length > 0).length,
  };
});

const latestWaitingOrder = computed(() => {
  return orders.value.find((order) => order.orderStatus === 'WAITING');
});

const statusModalTitle = computed(() => {
  const titles = {
    WAITING: '접수대기 주문',
    COOKING: '조리중 주문',
    DELIVERING: '배달중 주문',
    REQUEST_RISK: '요구사항 확인 필요',
  };
  return titles[selectedSummaryType.value] || '주문 목록';
});

const statusModalOrders = computed(() => {
  if (selectedSummaryType.value === 'REQUEST_RISK') {
    return orders.value.filter((order) => order.riskBadges.length > 0);
  }
  return orders.value.filter((order) => order.orderStatus === selectedSummaryType.value);
});

// 유틸리티 함수들
const getPlatformName = (type) => ({ BAEMIN: '배민', COUPANG_EATS: '쿠팡이츠', YOGIYO: '요기요', DDANGYO: '땡겨요' }[type] || type);
const getPlatformClass = (type) => ({ BAEMIN: 'baemin', COUPANG_EATS: 'coupang', YOGIYO: 'yogiyo', DDANGYO: 'ddangyo' }[type] || 'default');
const getOrderStatusName = (status) => ({ WAITING: '접수대기', COOKING: '조리중', DELIVERING: '배달중', COMPLETED: '완료', CANCELED: '취소', REFUNDED: '환불' }[status] || status);
const getDelayRiskName = (level) => ({ SAFE: '정상', WARNING: '주의', DELAYED: '지연' }[level] || level);
const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('ko-KR')}원`;
const shortAddress = (address) => address && address.length > 18 ? `${address.slice(0, 18)}...` : address || '-';

// 요구사항 주의 안내 문구 생성
const getRequestAttentionMessage = (order) => {
  const badges = order.riskBadges || [];
  if (badges.includes('알러지 주의')) return '알러지 관련 단어가 포함되어 있습니다. 조리 전 재료와 제외 요청을 먼저 확인하세요.';
  if (badges.includes('분쟁 가능')) return '취소·환불·리뷰 관련 표현이 포함되어 있습니다. 접수 전 제공 가능 범위를 확인하세요.';
  if (badges.includes('과도 요청')) return '추가 제공 요청이 포함되어 있습니다. 매장 제공 기준을 확인하세요.';
  if (badges.includes('배달 전달 주의')) return '전달 방식이나 시간 관련 요청이 포함되어 있습니다.';
  return '';
};

// 필터 및 주문 선택 조작
const clearFilters = () => {
  selectedPlatform.value = '';
  selectedStatus.value = '';
  selectedAttention.value = '';
  searchKeyword.value = '';
};

const selectOrder = (order) => { selectedOrder.value = order; };

const setOrderFilter = (type, value) => {
  if (type === 'status') {
    selectedStatus.value = value;
    selectedAttention.value = '';
  } else if (type === 'attention') {
    selectedAttention.value = value;
    selectedStatus.value = '';
  }
  closeStatusModal();
};

const openStatusModal = (summaryType) => {
  selectedSummaryType.value = summaryType;
  isStatusModalOpen.value = true;
};

const closeStatusModal = () => {
  isStatusModalOpen.value = false;
  selectedSummaryType.value = '';
};

const openDetailFromModal = (order) => {
  selectOrder(order);
  closeStatusModal();
};

// 상태 변경 로직
const getNextStatus = (status) => ({ WAITING: 'COOKING', COOKING: 'DELIVERING', DELIVERING: 'COMPLETED' }[status] || null);
const getNextActionName = (status) => ({ WAITING: '조리 시작', COOKING: '배달 시작', DELIVERING: '완료 처리' }[status] || '');

const changeOrderStatus = (order) => {
  const nextStatus = getNextStatus(order.orderStatus);
  if (!nextStatus) return;
  order.orderStatus = nextStatus;
  if (nextStatus === 'COOKING') order.cookingStartedAt = '방금 전';
  if (nextStatus === 'COMPLETED') {
    order.completedAt = '방금 전';
    order.delayRiskLevel = 'SAFE';
  }
  selectOrder(order);
};

// 취소 모달 로직
const openCancelModal = (order) => {
  if (!['WAITING', 'COOKING'].includes(order.orderStatus)) return;
  cancelTargetOrder.value = order;
  cancelReasonCategory.value = '';
  cancelReasonInput.value = '';
  isCancelModalOpen.value = true;
};

const closeCancelModal = () => {
  isCancelModalOpen.value = false;
  cancelTargetOrder.value = null;
};

const setCancelPreset = (preset) => {
  cancelReasonCategory.value = preset;
  if (!cancelReasonInput.value.trim()) {
    cancelReasonInput.value = `${preset}으로 인해 점주가 주문을 취소 처리했습니다.`;
  }
};

const saveCancelReason = () => {
  if (!cancelReasonCategory.value) {
    alert('취소사유 유형을 선택해 주세요.');
    return;
  }
  if (!cancelReasonInput.value.trim()) {
    alert('상세 사유를 입력해야 이력이 남습니다.');
    return;
  }
  const order = cancelTargetOrder.value;
  order.orderStatus = 'CANCELED';
  order.delayRiskLevel = 'SAFE';
  order.cancelReason = `${cancelReasonCategory.value} · ${cancelReasonInput.value}`;
  order.canceledAt = '방금 전';
  
  selectOrder(order);
  closeCancelModal();
};
</script>

<template>
  <div class="orders-view">
    <header class="page-header">
      <div>
        <span class="category-text">TODAY ORDER</span>
        <h1>통합 주문 관리</h1>
        <p>당일 주문만 빠르게 처리합니다. 이전 주문 내역은 운영 리포트에서 조회하세요.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="sub-button">새로고침</button>
        <button type="button" class="primary-button">Mock 주문 생성</button>
      </div>
    </header>

    <section v-if="latestWaitingOrder" class="new-order-section">
      <div class="new-order-head">
        <div>
          <span class="new-label">신규 주문</span>
          <strong>{{ getPlatformName(latestWaitingOrder.platformType) }} {{ latestWaitingOrder.platformOrderNo }}</strong>
        </div>
        <span class="queue-badge">접수대기 {{ operationSummary.waitingCount }}건</span>
      </div>

      <div class="new-order-body">
        <div class="new-order-main">
          <h2>{{ latestWaitingOrder.menuSummary }}</h2>
          <p>
            총 {{ latestWaitingOrder.totalQuantity }}개 ·
            {{ formatMoney(latestWaitingOrder.totalAmount) }} ·
            예상 조리 {{ latestWaitingOrder.totalCookingTime }}분
          </p>
        </div>

        <div class="new-order-actions">
          <button type="button" class="sub-button" @click="selectOrder(latestWaitingOrder)">주문 상세</button>
          <button type="button" class="primary-button" @click="changeOrderStatus(latestWaitingOrder)">조리 시작</button>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card waiting clickable" @click="setOrderFilter('status', 'WAITING')">
        <div class="summary-card-head">
          <span>접수대기</span>
          <small>WAITING</small>
        </div>
        <strong>{{ operationSummary.waitingCount }}건</strong>
        <p>클릭하면 접수대기 주문만 확인</p>
      </article>

      <article class="summary-card cooking clickable" @click="setOrderFilter('status', 'COOKING')">
        <div class="summary-card-head">
          <span>조리중</span>
          <small>COOKING</small>
        </div>
        <strong>{{ operationSummary.cookingCount }}건</strong>
        <p>조리 진행 중인 주문</p>
      </article>

      <article class="summary-card delivering clickable" @click="setOrderFilter('status', 'DELIVERING')">
        <div class="summary-card-head">
          <span>배달중</span>
          <small>DELIVERING</small>
        </div>
        <strong>{{ operationSummary.deliveringCount }}건</strong>
        <p>배달 완료 대기 주문</p>
      </article>

      <article class="summary-card risk clickable" @click="setOrderFilter('attention', 'REQUEST')">
        <div class="summary-card-head">
          <span>요구사항 확인</span>
          <small>ATTENTION</small>
        </div>
        <strong>{{ operationSummary.requestRiskCount }}건</strong>
        <p>알러지·분쟁 가능 요청</p>
      </article>
    </section>

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
        <select v-model="selectedStatus" @change="selectedAttention = ''">
          <option value="">전체 상태</option>
          <option value="WAITING">접수대기</option>
          <option value="COOKING">조리중</option>
          <option value="DELIVERING">배달중</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELED">취소</option>
        </select>
      </div>

      <div class="filter-group">
        <label>확인 필요</label>
        <select v-model="selectedAttention" @change="selectedStatus = ''">
          <option value="">전체</option>
          <option value="REQUEST">요구사항 확인</option>
          <option value="DELAY">지연 위험</option>
          <option value="LOSS">손실 위험</option>
          <option value="CANCEL">취소 이력</option>
        </select>
      </div>

      <div class="filter-group grow">
        <label>검색</label>
        <input v-model="searchKeyword" type="text" placeholder="주문번호, 메뉴명, 주소, 요구사항 검색" />
      </div>

      <button type="button" class="sub-button filter-button" @click="clearFilters">초기화</button>
    </section>

    <section class="orders-content">
      
      <article class="order-list-panel">
        <div class="panel-title-row">
          <div>
            <h2>당일 주문 목록</h2>
            <p>오늘 기준 주문만 표시합니다.</p>
          </div>
          <span class="count-text">총 {{ filteredOrders.length }}건</span>
        </div>

        <div class="table-scroll">
          <table class="order-table">
            <thead>
              <tr>
                <th>플랫폼 주문번호</th>
                <th>플랫폼</th>
                <th>상태</th>
                <th>메뉴</th>
                <th>배달주소</th>
                <th>요구사항</th>
                <th>위험</th>
                <th>액션</th>
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
                  <button type="button" class="order-number-button platform-order-number" @click.stop="selectOrder(order)">
                    {{ order.platformOrderNo }}
                  </button>
                  <small>관리번호 {{ order.orderNo }}</small>
                  <small>{{ order.orderedAt }}</small>
                </td>
                <td>
                  <span class="platform-badge" :class="getPlatformClass(order.platformType)">
                    {{ getPlatformName(order.platformType) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="`status-${order.orderStatus.toLowerCase()}`">
                    {{ getOrderStatusName(order.orderStatus) }}
                  </span>
                </td>
                <td>
                  <strong>{{ order.menuSummary }}</strong>
                  <small>{{ order.totalQuantity }}개 · {{ formatMoney(order.totalAmount) }}</small>
                </td>
                <td>
                  <strong :title="order.deliveryAddress">{{ shortAddress(order.deliveryAddress) }}</strong>
                </td>
                <td>
                  <small class="request-text-preview">{{ order.requestText || '요구사항 없음' }}</small>
                </td>
                <td>
                  <template v-if="order.riskBadges.length">
                    <span v-for="badge in order.riskBadges" :key="badge" class="risk-badge">{{ badge }}</span>
                  </template>
                  <span v-else class="delay-badge" :class="`delay-${order.delayRiskLevel.toLowerCase()}`">
                    {{ getDelayRiskName(order.delayRiskLevel) }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="getNextStatus(order.orderStatus)" 
                    type="button" 
                    class="table-button" 
                    @click.stop="changeOrderStatus(order)"
                  >
                    {{ getNextActionName(order.orderStatus) }}
                  </button>
                  <span v-else class="done-text">완료</span>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="8" class="empty-message">조건에 맞는 주문이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside v-if="selectedOrder" class="order-detail-panel">
        <div class="detail-head">
          <div>
            <span class="detail-label">주문 상세</span>
            <h2>{{ selectedOrder.platformOrderNo }}</h2>
            <p class="detail-sub-id">{{ getPlatformName(selectedOrder.platformType) }} 주문 · 내부 관리번호 {{ selectedOrder.orderNo }}</p>
          </div>
          <span class="status-badge" :class="`status-${selectedOrder.orderStatus.toLowerCase()}`">
            {{ getOrderStatusName(selectedOrder.orderStatus) }}
          </span>
        </div>

        <div class="detail-section">
          <h3>주문 정보</h3>
          <div class="detail-row"><span>플랫폼</span><strong>{{ getPlatformName(selectedOrder.platformType) }}</strong></div>
          <div class="detail-row"><span>메뉴</span><strong>{{ selectedOrder.menuSummary }}</strong></div>
          <div class="detail-row"><span>배달주소</span><strong>{{ selectedOrder.deliveryAddress }}</strong></div>
          <div class="detail-row request-row"><span>요구사항</span><strong>{{ selectedOrder.requestText || '없음' }}</strong></div>
        </div>

        <div class="detail-section request-guide" :class="selectedOrder.riskBadges.length ? 'attention' : 'plain'">
          <h3>고객 요구사항</h3>
          <p class="request-text-large">{{ selectedOrder.requestText || '요구사항이 없습니다.' }}</p>
          
          <div v-if="selectedOrder.riskBadges.length" class="request-risk-summary">
            <strong>{{ selectedOrder.riskBadges.join(' · ') }}</strong>
            <span>{{ getRequestAttentionMessage(selectedOrder) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>비용 스냅샷</h3>
          <div class="cost-row"><span>주문금액</span><strong>{{ formatMoney(selectedOrder.totalAmount) }}</strong></div>
          <div class="cost-row minus"><span>플랫폼 수수료</span><strong>-{{ formatMoney(selectedOrder.commissionAmount) }}</strong></div>
          <div class="cost-row minus">
            <span>배달비/쿠폰/원가/포장비</span>
            <strong>-{{ formatMoney(selectedOrder.deliveryFeeAmount + selectedOrder.couponAmount + selectedOrder.menuCostAmount + selectedOrder.packagingAmount) }}</strong>
          </div>
          <div class="cost-row total"><span>예상 순수익</span><strong>{{ formatMoney(selectedOrder.netProfit) }}</strong></div>
        </div>

        <div v-if="selectedOrder.cancelReason" class="detail-section cancel-history">
          <h3>취소 이력</h3>
          <p>{{ selectedOrder.canceledAt }} · {{ selectedOrder.cancelReason }}</p>
        </div>

        <div class="detail-actions">
          <button 
            type="button" 
            class="sub-button danger-outline" 
            @click="openCancelModal(selectedOrder)"
          >
            취소 처리
          </button>
          <button 
            v-if="getNextStatus(selectedOrder.orderStatus)" 
            type="button" 
            class="primary-button" 
            @click="changeOrderStatus(selectedOrder)"
          >
            상태 변경
          </button>
          <button v-else type="button" class="sub-button" disabled>상태 변경 불가</button>
        </div>
      </aside>
    </section>

    <div v-if="isCancelModalOpen" class="modal-backdrop" @click.self="closeCancelModal">
      <div class="status-modal cancel-modal">
        <div class="status-modal-header">
          <div>
            <span class="category-text">CANCEL REASON</span>
            <h2>{{ cancelTargetOrder.platformOrderNo }} 취소 처리</h2>
            <p class="modal-sub-id">{{ getPlatformName(cancelTargetOrder.platformType) }} 주문 · 관리번호 {{ cancelTargetOrder.orderNo }}</p>
            <p>빠른 유형 선택 후 사장이 직접 입력한 상세 사유는 주문 취소 이력으로 남습니다.</p>
          </div>
          <button class="modal-close-button" @click="closeCancelModal">×</button>
        </div>
        
        <div class="status-modal-body">
          <div class="modal-order-card">
            <div class="modal-order-main">
              <div>
                <strong>{{ cancelTargetOrder.menuSummary }}</strong>
                <p>{{ getPlatformName(cancelTargetOrder.platformType) }} · {{ formatMoney(cancelTargetOrder.totalAmount) }}</p>
              </div>
              <span class="status-badge" :class="`status-${cancelTargetOrder.orderStatus.toLowerCase()}`">
                {{ getOrderStatusName(cancelTargetOrder.orderStatus) }}
              </span>
            </div>
            
            <div class="cancel-preset-grid">
              <button v-for="preset in ['고객 요청', '재료 소진', '조리 지연', '요구사항 처리 불가', '배달 문제', '기타']" 
                      :key="preset" type="button" @click="setCancelPreset(preset)">
                {{ preset }}
              </button>
            </div>
            
            <div class="cancel-reason-area">
              <label>취소사유 유형 <span>*</span></label>
              <select v-model="cancelReasonCategory">
                <option value="">유형 선택</option>
                <option>고객 요청</option>
                <option>재료 소진</option>
                <option>조리 지연</option>
                <option>요구사항 처리 불가</option>
                <option>배달 문제</option>
                <option>기타</option>
              </select>
              
              <label>상세 사유 직접 입력 <span>*</span></label>
              <textarea v-model="cancelReasonInput" placeholder="예: 알러지 요청을 매장에서 안전하게 처리할 수 없어 점주 취소 처리"></textarea>
              <small>유형은 취소율 분석에, 상세 사유는 주문 이력 확인에 사용됩니다.</small>
            </div>
            
            <div class="modal-order-actions" style="margin-top: 18px;">
              <button class="sub-button" @click="closeCancelModal">닫기</button>
              <button class="primary-button" @click="saveCancelReason">취소사유 저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   공통 및 레이아웃 시스템
   ============================================================ */
.orders-view {
  min-height: calc(100vh - 78px);
  padding: 30px;
  background-color: #f4f6fc;
  color: #164E68;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.category-text {
  color: #2784B8;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
  display: block;
}

.page-header h1 {
  font-size: 38px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #111827;
  line-height: 1.18;
}

.page-header p {
  color: #6b7280;
  font-size: 18px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ============================================================
   Readability Pass 버튼 및 인풋
   ============================================================ */
.primary-button,
.sub-button,
.table-button,
.order-number-button,
.modal-close-button {
  font: inherit;
  cursor: pointer;
  border-radius: 12px;
}

.primary-button, .sub-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  font-size: 16px;
  font-weight: 900;
  transition: all 0.2s;
}

.primary-button { border: 0; color: #ffffff; background-color: #2784b8; }
.primary-button:hover { background-color: #1f6f99; }
.sub-button { border: 1px solid #dbe3ee; color: #334155; background-color: #ffffff; }
.sub-button:hover { background-color: #f8fafc; }
.sub-button:disabled { opacity: 0.45; cursor: not-allowed; }

.danger-outline { color: #b91c1c; border-color: #fecaca; }

/* ============================================================
   신규 주문 및 요약 카드
   ============================================================ */
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
.new-order-head div { display: flex; align-items: center; gap: 10px; }
.new-label {
  display: inline-flex; align-items: center; min-height: 30px; padding: 0 12px; 
  border-radius: 999px; color: #164e68; background-color: #eaf8fd; font-size: 14px; font-weight: 900;
}
.new-order-head strong { font-size: 20px; font-weight: 900; }
.queue-badge { display: inline-flex; align-items: center; min-height: 30px; padding: 0 12px; border-radius: 999px; color: #ffffff; background-color: rgba(255,255,255,0.16); font-size: 14px; font-weight: 800; }
.new-order-body { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px; }
.new-order-main h2 { margin: 0 0 6px; color: #111827; font-size: 24px; font-weight: 900; }
.new-order-main p { margin: 0; color: #64748b; font-size: 16px; }
.new-order-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }

.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.summary-card { min-width: 0; padding: 22px; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; }
.summary-card.clickable { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
.summary-card.clickable:hover { transform: translateY(-2px); border-color: #87ceeb; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08); }
.summary-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.summary-card-head span { color: #475569; font-size: 16px; font-weight: 900; }
.summary-card-head small { color: #94a3b8; font-size: 14px; font-weight: 800; }
.summary-card strong { display: block; margin-bottom: 6px; color: #111827; font-size: 34px; font-weight: 900; letter-spacing: -0.04em; }
.summary-card p { margin: 0; color: #64748b; font-size: 15px; }
.summary-card.waiting { border-color: #87ceeb; background-color: #eaf8fd; }
.summary-card.cooking { border-color: #bfdbfe; }
.summary-card.delivering { border-color: #bbf7d0; }
.summary-card.risk { border-color: #fecaca; background-color: #fff7f7; }
.summary-card.risk strong { color: #dc2626; }

/* ============================================================
   검색 필터 패널
   ============================================================ */
.filter-panel { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 16px; padding: 18px; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; }
.filter-group { display: grid; gap: 8px; min-width: 150px; }
.filter-group.grow { flex: 1; }
.filter-group label { color: #64748b; font-size: 16px; font-weight: 900; }
.filter-group select, .filter-group input { width: 100%; min-height: 46px; padding: 0 14px; border: 1px solid #dbe3ee; border-radius: 12px; color: #334155; background-color: #ffffff; font-size: 17px; outline: none; }
.filter-group select:focus, .filter-group input:focus { border-color: #87ceeb; box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.24); }

/* ============================================================
   메인 테이블 & 상세 패널 (가독성 향상)
   ============================================================ */
.orders-content { display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 16px; align-items: start; }
.order-list-panel, .order-detail-panel { border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
.order-list-panel { min-width: 0; padding: 22px; }
.panel-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.panel-title-row h2 { margin: 0 0 6px; color: #111827; font-size: 23px; font-weight: 900; }
.panel-title-row p { margin: 0; color: #64748b; font-size: 16px; }
.count-text { color: #2784b8; font-size: 16px; font-weight: 900; white-space: nowrap; }

.table-scroll { overflow-x: auto; }
.order-table { width: 100%; min-width: 1150px; border-collapse: collapse; }
.order-table th, .order-table td { padding: 16px 14px; border-bottom: 1px solid #f1f5f9; text-align: left; vertical-align: middle; font-size: 15px; }
.order-table th { color: #64748b; background-color: #f8fafc; font-weight: 900; }
.order-table td { font-size: 16px; line-height: 1.45; }
.order-table tbody tr { cursor: pointer; }
.order-table tbody tr:hover, .order-table tbody tr.selected { background-color: #eaf8fd; }
.order-table td strong { display: block; color: #111827; font-size: 17px; font-weight: 800; }
.order-table td small { display: block; margin-top: 4px; color: #64748b; font-size: 14px; }
.order-number-button { padding: 0; border: 0; background-color: transparent; color: #2784b8; font-weight: 900; font-size: 18px; text-decoration: underline; }

/* 뱃지 통일 (플랫폼 중립화 포함) */
.platform-badge, .status-badge, .delay-badge, .risk-badge { 
  display: inline-flex; align-items: center; justify-content: center; min-height: 30px; 
  padding: 0 12px; margin: 2px 2px 2px 0; border-radius: 999px; font-size: 14px; font-weight: 900; white-space: nowrap; 
}
.platform-badge { color: #334155; background: #ffffff; border: 1px solid #94a3b8; }
.platform-badge::before { content: ""; width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; background: #64748b; }
.status-badge.status-waiting { color: #164e68; background-color: #eaf8fd; }
.status-badge.status-cooking { color: #92400e; background-color: #fffbeb; }
.status-badge.status-delivering { color: #166534; background-color: #dcfce7; }
.status-badge.status-completed { color: #334155; background-color: #f1f5f9; }
.status-badge.status-canceled { color: #991b1b; background-color: #fee2e2; }
.delay-badge.delay-safe { color: #166534; background-color: #dcfce7; }
.delay-badge.delay-warning { color: #9a3412; background-color: #ffedd5; }
.delay-badge.delay-delayed { color: #991b1b; background-color: #fee2e2; }
.risk-badge { color: #9a3412; background-color: #ffedd5; }

.table-button { min-height: 36px; padding: 0 14px; background-color: #eaf8fd; color: #2784b8; font-size: 14px; }
.table-button:hover { background-color: #d9f0fa; }
.done-text { color: #94a3b8; font-size: 15px; font-weight: 800; }
.empty-message { height: 120px; color: #9ca3af; text-align: center; }

/* ============================================================
   상세 패널
   ============================================================ */
.order-detail-panel { position: sticky; top: 86px; padding: 22px; }
.detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.detail-label { color: #64748b; font-size: 14px; font-weight: 900; }
.detail-head h2 { margin: 6px 0 0; color: #111827; font-size: 24px; font-weight: 900; }
.detail-sub-id { margin: 6px 0 0; color: #64748b; font-size: 15px; font-weight: 750; }

.detail-section { padding-top: 20px; }
.detail-section h3 { margin: 0 0 12px; color: #111827; font-size: 17px; font-weight: 900; }

.detail-row, .cost-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 16px; }
.detail-row strong, .cost-row strong { color: #111827; font-weight: 800; text-align: right; }
.request-row strong { max-width: 220px; line-height: 1.4; }
.cost-row.minus strong { color: #dc2626; }
.cost-row.total { margin-top: 6px; padding-top: 16px; border-bottom: 0; border-top: 1px solid #dbe3ee; font-weight: 900; }
.cost-row.total strong { color: #15803d; font-size: 19px; }

/* 요구사항 / 취소 가이드 영역 */
.request-guide, .cancel-history { padding: 16px; margin-top: 18px; border-radius: 14px; background: #f8fafc; }
.request-guide.plain { border: 1px solid #e5e7eb; background: #ffffff; }
.request-guide.attention { border: 1px solid #e5e7eb; border-left: 5px solid #f59e0b; background: #ffffff; }
.request-guide h3, .cancel-history h3 { margin-bottom: 10px; }
.request-text-large { margin: 0; color: #334155; font-size: 17px; font-weight: 800; line-height: 1.6; }
.request-risk-summary { display: grid; gap: 6px; margin-top: 14px; padding: 12px 14px; border-radius: 12px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e; }
.request-risk-summary strong { font-size: 15px; }
.request-risk-summary span { color: #78350f; font-size: 15px; line-height: 1.5; }
.cancel-history { background: #fef2f2; border: 1px solid #fecaca; }
.cancel-history p { margin: 0; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 700; }

.detail-actions { display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 24px; }

/* ============================================================
   취소 사유 모달
   ============================================================ */
.modal-backdrop { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 28px; background-color: rgba(15, 23, 42, 0.45); }
.status-modal { background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28); }
.cancel-modal { width: min(720px, 100%); }
.status-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 26px 28px; border-bottom: 1px solid #e5e7eb; background-color: #f8fafc; }
.status-modal-header h2 { margin: 6px 0; color: #111827; font-size: 30px; font-weight: 900; }
.status-modal-header p { margin: 0; color: #64748b; font-size: 16px; }
.modal-sub-id { margin-bottom: 6px !important; font-weight: 750; }
.modal-close-button { width: 44px; height: 44px; font-size: 30px; background-color: #ffffff; color: #475569; display: grid; place-items: center; border: 0; }
.modal-close-button:hover { background-color: #eaf8fd; color: #164e68; }

.status-modal-body { padding: 24px 28px 28px; max-height: calc(82vh - 120px); overflow-y: auto; }
.modal-order-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; }
.modal-order-main { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.modal-order-main strong { color: #111827; font-size: 18px; font-weight: 800; }
.modal-order-main p { margin: 6px 0 0; color: #64748b; font-size: 16px; }

.cancel-preset-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
.cancel-preset-grid button { min-height: 48px; border: 1px solid #dbe3ee; border-radius: 12px; color: #334155; background: #f8fafc; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
.cancel-preset-grid button:hover { color: #164E68; border-color: #87CEEB; background: #EAF8FD; }

.cancel-reason-area { display: grid; gap: 10px; margin-top: 18px; }
.cancel-reason-area label { color: #374151; font-size: 16px; font-weight: 800; }
.cancel-reason-area label span { color: #ef4444; }
.cancel-reason-area select, .cancel-reason-area textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 12px; font-size: 17px; background: #fff; padding: 0 14px; outline: none; }
.cancel-reason-area select { height: 48px; }
.cancel-reason-area textarea { min-height: 120px; padding: 16px; resize: vertical; line-height: 1.5; }
.cancel-reason-area select:focus, .cancel-reason-area textarea:focus { border-color: #87ceeb; box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.24); }
.cancel-reason-area small { color: #64748b; font-size: 15px; margin-top: 4px; }

/* ============================================================
   반응형
   ============================================================ */
@media (max-width: 1280px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .orders-content { grid-template-columns: 1fr; }
  .order-detail-panel { position: static; }
}

@media (max-width: 760px) {
  .orders-view { padding: 18px; }
  .page-header, .new-order-body, .filter-panel { flex-direction: column; align-items: stretch; }
  .header-actions, .new-order-actions { justify-content: flex-start; }
  .summary-grid { grid-template-columns: 1fr; }
  .cancel-preset-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-actions { grid-template-columns: 1fr; }
}
</style>