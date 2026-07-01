<script setup>
import { computed, nextTick, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useOrderStore } from '../../stores/order/useOrderStore';

// 필터 상태 관리
const selectedPlatform = ref('');
const selectedStatus = ref('');
const selectedAttention = ref(''); // 확인 필요(위험) 필터 추가
const searchKeyword = ref('');
const detailBottomRef = ref(null);
const ordersContentRef = ref(null);
const showDetailTopButton = ref(false);

let detailScrollContainer = null;

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const selectedActiveOnly = ref(false);

const currentPage = ref(1);
const pageSize = 10;

// 선택된 주문 상세
const selectedOrder = ref(null);
const detailPanelRef = ref(null);

// 요약 카드 모달 상태
const isStatusModalOpen = ref(false);
const selectedSummaryType = ref('');

// 취소/환불 사유 공통 모달 상태
const isReasonModalOpen = ref(false);
const reasonMode = ref('CANCEL'); // CANCEL | REFUND
const reasonTargetOrder = ref(null);
const reasonCategory = ref('');
const reasonInput = ref('');

// 1. 화면 구조 확인용 임시 주문 데이터 (HTML 시안과 동일한 데이터 속성 반영)
const orders = ref([]);

// 오늘 주문 관리에서 실제로 점주가 처리해야 하는 진행 상태
const activeOrderStatuses = ['WAITING', 'COOKING', 'DELIVERING'];
const requestAttentionStatuses = ['WAITING'];

const isActiveOrder = (order) => {
  return activeOrderStatuses.includes(order.orderStatus);
};

const isRequestAttentionOrder = (order) => {
  return requestAttentionStatuses.includes(order.orderStatus);
};

const refreshHeaderNotifications = () => {
  window.dispatchEvent(new CustomEvent('deliveryinsider:notifications-refresh'));
};

// 2. 검색 및 필터 로직 (확인 필요 필터 추가)
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const riskBadges = order.riskBadges || [];

    const platformMatched =
      !selectedPlatform.value ||
      order.platformType === selectedPlatform.value;

    const statusMatched =
      !selectedStatus.value ||
      order.orderStatus === selectedStatus.value;

    const activeMatched =
      !selectedActiveOnly.value ||
      ['WAITING', 'COOKING', 'DELIVERING'].includes(order.orderStatus);

    let attentionMatched = true;

    if (selectedAttention.value === 'REQUEST') {
      attentionMatched = isRequestAttentionOrder(order) && riskBadges.length > 0;
    }

    if (selectedAttention.value === 'DELAY') {
      attentionMatched = isActiveOrder(order) && order.delayRiskLevel !== 'SAFE';
    }

    if (selectedAttention.value === 'LOSS') {
      attentionMatched = isActiveOrder(order) && order.lossRisk;
    }

    if (selectedAttention.value === 'CANCEL') {
      attentionMatched = order.orderStatus === 'CANCELED';
    }

    if (selectedAttention.value === 'REFUND') {
      attentionMatched = order.orderStatus === 'REFUNDED';
    }

    const keyword = searchKeyword.value.trim().toLowerCase();

    const keywordMatched =
      !keyword ||
      String(order.orderNo || '').toLowerCase().includes(keyword) ||
      String(order.platformOrderNo || '').toLowerCase().includes(keyword) ||
      String(order.menuSummary || '').toLowerCase().includes(keyword) ||
      String(order.deliveryAddress || '').toLowerCase().includes(keyword) ||
      String(order.requestText || '').toLowerCase().includes(keyword);

    return platformMatched && statusMatched && activeMatched && attentionMatched && keywordMatched;
  });
});

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredOrders.value.length / pageSize)
  );
});

const pagedOrders = computed(() => {
  const startIndex =
    (currentPage.value - 1) * pageSize;

  return filteredOrders.value.slice(
    startIndex,
    startIndex + pageSize
  );
});

const pageNumbers = computed(() => {
  return Array.from(
    { length: totalPages.value },
    (_, index) => index + 1
  );
});

const changePage = async (page) => {
  if (page < 1 || page > totalPages.value) {
    return;
  }

  currentPage.value = page;

  const firstOrder = pagedOrders.value[0];

  if (firstOrder) {
    await selectOrder(firstOrder);
  }
};

watch(
  [
    selectedPlatform,
    selectedStatus,
    selectedAttention,
    selectedActiveOnly,
    searchKeyword,
  ],
  () => {
    currentPage.value = 1;
  }
);


// 요청사항 확인은 접수대기 주문만 대상으로 삼는다.
// 조리 시작 이후에는 점주가 요청사항을 확인하고 접수한 것으로 보고 알림에서 제외한다.
const requestAttentionOrders = computed(() => {
  return orders.value.filter((order) => {
    return isRequestAttentionOrder(order) && (order.riskBadges || []).length > 0;
  });
});

// 운영 요약 카드에서 사용할 값
const operationSummary = computed(() => {
  return {
    waitingCount: orders.value.filter((o) => o.orderStatus === 'WAITING').length,
    cookingCount: orders.value.filter((o) => o.orderStatus === 'COOKING').length,
    deliveringCount: orders.value.filter((o) => o.orderStatus === 'DELIVERING').length,
    requestRiskCount: requestAttentionOrders.value.length,
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
    REQUEST_RISK: '요청사항 확인 필요',
  };
  return titles[selectedSummaryType.value] || '주문 목록';
});

const statusModalOrders = computed(() => {
  if (selectedSummaryType.value === 'REQUEST_RISK') {
    return requestAttentionOrders.value;
  }
  return orders.value.filter((order) => order.orderStatus === selectedSummaryType.value);
});

// 유틸리티 함수들
const getPlatformName = (type) => ({ BAEMIN: '배민', COUPANG_EATS: '쿠팡이츠', YOGIYO: '요기요', DDANGYO: '땡겨요' }[type] || type);
const getPlatformClass = (type) => ({ BAEMIN: 'baemin', COUPANG_EATS: 'coupang', YOGIYO: 'yogiyo', DDANGYO: 'ddangyo' }[type] || 'default');
const getOrderStatusName = (status) => ({ WAITING: '접수대기', COOKING: '조리중', DELIVERING: '배달중', COMPLETED: '완료', CANCELED: '취소', REFUNDED: '환불' }[status] || status);
const getDelayRiskName = (level) => ({ SAFE: '정상', WARNING: '주의', DELAYED: '지연' }[level] || level);
const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('ko-KR')} 원`;
const formatTime = (dateTime) => {
  if (!dateTime) {
    return '';
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return String(dateTime).slice(11, 16);
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getOrderItemName = (item) => {
  return item.orderedMenuName || item.menuName || '-';
};

const getOrderItemTotalAmount = (item) => {
  const savedAmount = Number(item.itemMenuAmount || 0);

  if (savedAmount > 0) {
    return savedAmount;
  }

  return Number(item.orderedMenuPrice || 0) * Number(item.quantity || 0);
};
// 최신 주문 정렬 기준값
const getOrderSortValue = (order) => {
  const rawDateTime =
    order.orderedAtRaw ||
    order.orderedAt ||
    '';

  const time = new Date(rawDateTime).getTime();

  if (!Number.isNaN(time)) {
    return time;
  }

  return Number(order.id || 0);
};

// 최신 주문이 앞쪽 페이지, 이전 주문이 뒤쪽 페이지로 가게 정렬
const sortFifoOrders = (orderList) => {
  return [...orderList].sort((a, b) => {
    return getOrderSortValue(b) - getOrderSortValue(a);
  });
};

const REQUEST_ATTENTION_TYPES = [
  'ALLERGY',
  'DISPUTE',
  'EXCESSIVE',
  'GROUP',
  'REQUEST',
  'REQUEST_RISK',
];

const REQUEST_ATTENTION_LEVELS = ['WARNING', 'DANGER'];

const normalizeRiskValue = (value) => {
  return String(value || '').trim().toUpperCase();
};

const getRiskBadges = (order) => {
  const badges = [];
  const riskType = normalizeRiskValue(order.requestRiskType);
  const riskLevel = normalizeRiskValue(order.requestRiskLevel);

  if (riskType === 'ALLERGY') {
    badges.push('알러지 주의');
  }

  if (riskType === 'DISPUTE') {
    badges.push('분쟁 가능');
  }

  if (riskType === 'EXCESSIVE') {
    badges.push('과도 요청');
  }

  if (riskType === 'GROUP') {
    badges.push('배달사항 확인');
  }

  if (
    ['REQUEST', 'REQUEST_RISK'].includes(riskType) ||
    (REQUEST_ATTENTION_LEVELS.includes(riskLevel) && badges.length === 0)
  ) {
    badges.push(riskLevel === 'DANGER' ? '위험 요청' : '요청사항 확인');
  }

  if (Number(order.netProfit || 0) < 0) {
    badges.push('손실 위험');
  }

  return badges;
};

const toOrderViewData = (order) => {
  return {
    id: order.id,
    orderNo: order.orderNo,
    platformOrderNo: order.platformOrderNumber,
    platformType: order.platformType,
    menuSummary: order.menuSummary,
    totalQuantity: order.totalQuantity,
    orderStatus: order.orderStatus,
    totalAmount: order.totalAmount,
    netProfit: order.netProfit,
    totalCookingTime: order.totalCookingTime,

    /*
     * 지연 위험은 별도 API /api/orders/delay-risks에서 정확히 계산한다.
     * 목록 최초 연결 단계에서는 기본 SAFE로 둔다.
     */
    delayRiskLevel: 'SAFE',

    orderedAtRaw : order.orderedAt,
    orderedAt: formatTime(order.orderedAt),
    cookingStartedAt: formatTime(order.cookingStartedAt),
    completedAt: '',
    deliveryAddress: order.deliveryAddress,

    requestText: order.requestText || '',
    riskBadges: getRiskBadges(order),
    lossRisk: Number(order.netProfit || 0) < 0,

    cancelType: order.cancelType || '',
    cancelReason: order.cancelReason || '',
    canceledAt: formatTime(order.canceledAt),

    refundType: order.refundType || '',
    refundReason: order.refundReason || '',
    refundedAt: formatTime(order.refundedAt),

    /*
     * 목록 API에는 상세 비용 항목이 없음.
     * 주문 상세 조회 API에서 실제 값으로 채운다.
     */
    items: [],
    commissionAmount: 0,
    deliveryFeeAmount: 0,
    couponAmount: 0,
    menuCostAmount: 0,
    packagingAmount: 0,
  };
};

const toOrderDetailViewData = (detail, baseOrder = {}) => {
  const request = detail.request || {};
  const cancellation = detail.cancellation || {};
  const refund = detail.refund || {};

  return {
    ...baseOrder,

    id: detail.id,
    orderNo: detail.orderNo,
    platformOrderNo: detail.platformOrderNumber,
    platformType: detail.platformType,
    orderStatus: detail.orderStatus,

    totalAmount: Number(detail.totalAmount || 0),
    commissionAmount: Number(detail.commissionAmount || 0),
    deliveryFeeAmount: Number(detail.deliveryFee || 0),
    couponAmount: Number(detail.couponCost || 0),
    platformSupportAmount: Number(detail.platformSupportAmount || 0),
    menuCostAmount: Number(detail.totalMenuCost || 0),
    packagingAmount: Number(detail.totalPackagingFee || 0),
    netProfit: Number(detail.netProfit || 0),

    totalCookingTime: detail.totalCookingTime,
    deliveryAddress: detail.deliveryAddress,
    
    orderedAtRaw: detail.orderedAt || baseOrder.orderedAtRaw || '',
    orderedAt: formatTime(detail.orderedAt),
    cookingStartedAt: formatTime(detail.cookingStartedAt),
    completedAt: formatTime(detail.completedAt),
    canceledAt: formatTime(detail.canceledAt),
    refundedAt: formatTime(detail.refundedAt || refund.refundedAt),

    menuSummary:
      baseOrder.menuSummary ||
      detail.items?.map((item) => item.orderedMenuName).join(', ') ||
      '',

    totalQuantity:
      baseOrder.totalQuantity ||
      detail.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ||
      0,

    requestText:
      request.requestText ||
      baseOrder.requestText ||
      '',

    requestRiskType:
      request.riskType ||
      baseOrder.requestRiskType ||
      '',

    requestRiskLevel:
      request.riskLevel ||
      baseOrder.requestRiskLevel ||
      '',

    riskBadges: getRiskBadges({
      requestRiskType: request.riskType || baseOrder.requestRiskType,
      requestRiskLevel: request.riskLevel || baseOrder.requestRiskLevel,
      netProfit: detail.netProfit,
    }),

    lossRisk: Number(detail.netProfit || 0) < 0,

    cancelType:
      cancellation.cancelType ||
      baseOrder.cancelType ||
      '',

    cancelReason:
      cancellation.cancelReason ||
      baseOrder.cancelReason ||
      '',

    refundType:
      refund.refundType ||
      baseOrder.refundType ||
      '',

    refundReason:
      refund.refundReason ||
      baseOrder.refundReason ||
      '',

    items: detail.items || [],
  };
};
const shortAddress = (address) => address && address.length > 18 ? `${address.slice(0, 18)}...` : address || '-';

// 요청사항 주의 안내 문구 생성
const getRequestAttentionMessage = (order) => {
  const badges = order.riskBadges || [];
  if (badges.includes('알러지 주의')) return '알러지 관련 단어가 포함되어 있습니다. 조리 전 재료와 제외 요청을 먼저 확인하세요.';
  if (badges.includes('분쟁 가능')) return '취소·환불·리뷰 관련 표현이 포함되어 있습니다. 접수 전 제공 가능 범위를 확인하세요.';
  if (badges.includes('과도 요청')) return '추가 제공 요청이 포함되어 있습니다. 매장 제공 기준을 확인하세요.';
  if (badges.includes('배달 전달 주의')) return '전달 방식이나 시간 관련 요청이 포함되어 있습니다.';
  return '';
};
const applyRouteQueryFilters = () => {
  const query = route.query;

  selectedPlatform.value = String(query.platform || '');
  selectedStatus.value = String(query.status || '');
  selectedAttention.value = String(query.attention || query.filter || '');
  selectedActiveOnly.value = query.active === 'true';

  if (query.keyword) {
    searchKeyword.value = String(query.keyword);
  }
};
// 주문목록조회
const loadTodayOrders = async () => {
  try {
    const [
      todayResult,
      delayRiskResult,
    ] = await Promise.all([
      orderStore.findToday(),
      orderStore.findDelayRisks(),
    ]);

    const delayRiskMap = new Map(
      delayRiskResult.map((delayOrder) => {
        return [delayOrder.id, delayOrder];
      })
    );

    orders.value = sortFifoOrders(
      todayResult.map((order) => {
        const viewOrder = toOrderViewData(order);
        const delayInfo = delayRiskMap.get(order.id);

        return {
          ...viewOrder,
          delayRiskLevel:
            delayInfo?.delayRiskLevel ||
            viewOrder.delayRiskLevel ||
            'SAFE',

          elapsedMinutes:
            delayInfo?.elapsedMinutes ||
            0,

          progressRate:
            delayInfo?.progressRate ||
            0,
        };
      })
    );

    const routeOrderId = Number(route.query.id || 0);

    const targetOrder =
      routeOrderId
        ? orders.value.find((order) => Number(order.id) === routeOrderId)
        : pagedOrders.value[0] || orders.value[0];

    if (targetOrder) {
      await selectOrder(targetOrder);
    } else {
      selectedOrder.value = null;
    }
  } catch (error) {
    console.error('오늘 주문 목록 조회 실패:', error);
  }
};

onMounted(async () => {
  applyRouteQueryFilters();
  await loadTodayOrders();
  await bindDetailScrollContainer();
});
onBeforeUnmount(() => {
  const pageArea = getPageScrollContainer();

  if (pageArea) {
    pageArea.removeEventListener('scroll', updateDetailTopButtonVisible);
  }

  window.removeEventListener('scroll', updateDetailTopButtonVisible);
});
/*
 * 같은 OrdersView 안에서 query만 바뀌는 이동을 처리한다.
 * 예: /orders?active=true → /orders
 * Vue Router는 같은 컴포넌트를 재사용하므로 onMounted가 다시 실행되지 않는다.
 */
watch(
  () => route.fullPath,
  async () => {
    applyRouteQueryFilters();
    currentPage.value = 1;

    if (!orders.value.length) {
      await loadTodayOrders();
      return;
    }

    const routeOrderId = Number(route.query.id || 0);
    const targetOrder = routeOrderId
      ? orders.value.find((order) => Number(order.id) === routeOrderId)
      : pagedOrders.value[0] || orders.value[0];

    if (targetOrder) {
      await selectOrder(targetOrder);
    } else {
      selectedOrder.value = null;
    }
  }
);

// 필터 및 주문 선택 조작
const clearFilters = () => {
  selectedPlatform.value = '';
  selectedStatus.value = '';
  selectedAttention.value = '';
  selectedActiveOnly.value = false;
  searchKeyword.value = '';
  currentPage.value = 1;
};

const selectOrder = async (order) => {
  selectedOrder.value = order;

  try {
    const detail =
      await orderStore.findOne(order.id);

    applyUpdatedOrder(detail, order);
  } catch (error) {
    console.error('주문 상세 조회 실패:', error);
  }
};

const scrollToDetailPanel = async () => {
  await nextTick();

  const scrollTarget = detailBottomRef.value || detailPanelRef.value;

  if (!scrollTarget) {
    return;
  }

  scrollTarget.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
};

const selectOrderAndScroll = async (order) => {
  await selectOrder(order);
  await scrollToDetailPanel();
  await bindDetailScrollContainer();
};

const setOrderFilter = (type, value) => {
  selectedActiveOnly.value = false;

  if (type === 'status') {
    selectedStatus.value = value;
    selectedAttention.value = '';
  } else if (type === 'attention') {
    selectedAttention.value = value;
    selectedStatus.value = '';
  }
  currentPage.value = 1;
  closeStatusModal();
};

const getPageScrollContainer = () => {
  return document.querySelector('.page-area');
};

const getCurrentPageScrollTop = () => {
  const pageArea = getPageScrollContainer();

  if (pageArea) {
    return pageArea.scrollTop;
  }

  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

const updateDetailTopButtonVisible = () => {
  showDetailTopButton.value = selectedOrder.value && getCurrentPageScrollTop() > 260;
};

const scrollToPageTop = () => {
  const pageArea = getPageScrollContainer();

  if (pageArea) {
    pageArea.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  document.documentElement.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  document.body.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  window.setTimeout(() => {
    updateDetailTopButtonVisible();
  }, 350);
};
const bindDetailScrollContainer = async () => {
  await nextTick();

  const pageArea = getPageScrollContainer();

  if (pageArea) {
    pageArea.removeEventListener('scroll', updateDetailTopButtonVisible);
    pageArea.addEventListener('scroll', updateDetailTopButtonVisible, {
      passive: true,
    });
  }

  window.removeEventListener('scroll', updateDetailTopButtonVisible);
  window.addEventListener('scroll', updateDetailTopButtonVisible, {
    passive: true,
  });

  updateDetailTopButtonVisible();
};

const openStatusModal = (summaryType) => {
  selectedSummaryType.value = summaryType;
  isStatusModalOpen.value = true;
};

const closeStatusModal = () => {
  isStatusModalOpen.value = false;
  selectedSummaryType.value = '';
};

const openDetailFromModal = async (order) => {
  await selectOrderAndScroll(order);
  closeStatusModal();
};

// 상태 변경 로직
const getNextStatus = (status) => ({ WAITING: 'COOKING', COOKING: 'DELIVERING', DELIVERING: 'COMPLETED' }[status] || null);
const getNextActionName = (status) => ({ WAITING: '조리 시작', COOKING: '배달 시작', DELIVERING: '완료 처리' }[status] || '');

const cancelPresets = [
  '고객 요청',
  '재료 소진',
  '조리 지연',
  '요청사항 처리 불가',
  '배달 문제',
  '기타',
];

const refundPresets = [
  '고객 요청',
  '음식 문제',
  '배달 문제',
  '매장 실수',
  '플랫폼 정책',
  '기타',
];

const reasonPresets = computed(() => {
  return reasonMode.value === 'REFUND'
    ? refundPresets
    : cancelPresets;
});

const reasonModalText = computed(() => {
  if (reasonMode.value === 'REFUND') {
    return {
      category: 'REFUND REASON',
      titleSuffix: '환불 처리',
      description: '빠른 유형 선택 후 사장이 직접 입력한 상세 사유는 주문 환불 이력으로 남습니다.',
      typeLabel: '환불사유 유형',
      placeholder: '예: 음식 누락으로 고객 요청에 따라 환불 처리',
      helpText: '유형은 환불 분석에, 상세 사유는 주문 이력 확인에 사용됩니다.',
      saveButton: '환불사유 저장',
      savingButton: '환불 저장 중...',
      missingTypeMessage: '환불사유 유형을 선택해 주세요.',
      missingReasonMessage: '환불 상세 사유를 입력해야 이력이 남습니다.',
      missingOrderMessage: '환불할 주문을 찾을 수 없습니다.',
    };
  }

  return {
    category: 'CANCEL REASON',
    titleSuffix: '취소 처리',
    description: '빠른 유형 선택 후 사장이 직접 입력한 상세 사유는 주문 취소 이력으로 남습니다.',
    typeLabel: '취소사유 유형',
    placeholder: '예: 알러지 요청을 매장에서 안전하게 처리할 수 없어 점주 취소 처리',
    helpText: '유형은 취소율 분석에, 상세 사유는 주문 이력 확인에 사용됩니다.',
    saveButton: '취소사유 저장',
    savingButton: '저장 중...',
    missingTypeMessage: '취소사유 유형을 선택해 주세요.',
    missingReasonMessage: '상세 사유를 입력해야 이력이 남습니다.',
    missingOrderMessage: '취소할 주문을 찾을 수 없습니다.',
  };
});

const getCancelTypeValue = (label) => {
  return {
    '고객 요청': 'CUSTOMER_REQUEST',
    '재료 소진': 'OUT_OF_STOCK',
    '조리 지연': 'COOKING_DELAY',
    '요청사항 처리 불가': 'REQUEST_UNAVAILABLE',
    '배달 문제': 'DELIVERY_ISSUE',
    '기타': 'ETC',
  }[label] || 'ETC';
};

const getRefundTypeValue = (label) => {
  return {
    '고객 요청': 'CUSTOMER_REQUEST',
    '음식 문제': 'FOOD_ISSUE',
    '배달 문제': 'DELIVERY_ISSUE',
    '매장 실수': 'STORE_MISTAKE',
    '플랫폼 정책': 'PLATFORM_POLICY',
    '기타': 'ETC',
  }[label] || 'ETC';
};

const canCancelOrder = (status) => {
  return ['WAITING', 'COOKING'].includes(status);
};

const canRefundOrder = (status) => {
  return status === 'COMPLETED';
};

const applyUpdatedOrder = (updatedDetail, baseOrder = {}) => {
  const updatedOrder =
    toOrderDetailViewData(updatedDetail, baseOrder);

  selectedOrder.value = updatedOrder;

  const index =
    orders.value.findIndex((item) => item.id === updatedOrder.id);

  if (index !== -1) {
    orders.value[index] = updatedOrder;
    orders.value = sortFifoOrders(orders.value);
  }

  return updatedOrder;
};

const changeOrderStatus = async (order) => {
  const nextStatus = getNextStatus(order.orderStatus);

  if (!nextStatus) {
    return;
  }

  try {
    const updatedDetail =
      await orderStore.updateStatus(
        order.id,
        {
          orderStatus: nextStatus,
        }
      );

    applyUpdatedOrder(updatedDetail, order);
    refreshHeaderNotifications();
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
  }
};

// 취소/환불 사유 공통 모달 로직
const openReasonModal = (mode, order) => {
  if (mode === 'CANCEL' && !canCancelOrder(order.orderStatus)) {
    alert('접수대기 또는 조리중 주문만 취소할 수 있습니다.');
    return;
  }

  if (mode === 'REFUND' && !canRefundOrder(order.orderStatus)) {
    alert('완료 주문만 환불 처리할 수 있습니다.');
    return;
  }

  reasonMode.value = mode;
  reasonTargetOrder.value = order;
  reasonCategory.value = '';
  reasonInput.value = '';
  isReasonModalOpen.value = true;
};

const closeReasonModal = () => {
  isReasonModalOpen.value = false;
  reasonTargetOrder.value = null;
  reasonCategory.value = '';
  reasonInput.value = '';
};

const setReasonPreset = (preset) => {
  reasonCategory.value = preset;

  if (reasonInput.value.trim()) {
    return;
  }

  if (reasonMode.value === 'REFUND') {
    reasonInput.value = `${preset}으로 인해 주문을 환불 처리했습니다.`;
    return;
  }

  reasonInput.value = `${preset}으로 인해 점주가 주문을 취소 처리했습니다.`;
};

const saveReason = async () => {
  if (!reasonCategory.value) {
    alert(reasonModalText.value.missingTypeMessage);
    return;
  }

  if (!reasonInput.value.trim()) {
    alert(reasonModalText.value.missingReasonMessage);
    return;
  }

  const order = reasonTargetOrder.value;

  if (!order) {
    alert(reasonModalText.value.missingOrderMessage);
    return;
  }

  const payload =
    reasonMode.value === 'REFUND'
      ? {
          orderStatus: 'REFUNDED',
          refundType: getRefundTypeValue(reasonCategory.value),
          refundReason: reasonInput.value.trim(),
        }
      : {
          orderStatus: 'CANCELED',
          cancelType: getCancelTypeValue(reasonCategory.value),
          cancelReason: reasonInput.value.trim(),
        };

  try {
    const updatedDetail =
      await orderStore.updateStatus(
        order.id,
        payload
      );

    applyUpdatedOrder(updatedDetail, order);
    closeReasonModal();
    refreshHeaderNotifications();
  } catch (error) {
    console.error(
      reasonMode.value === 'REFUND'
        ? '주문 환불 처리 실패:'
        : '주문 취소 처리 실패:',
      error
    );
  }
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
        <button
          type="button"
          class="sub-button"
          @click="loadTodayOrders"
        >
          새로고침
        </button>

        <button
          type="button"
          class="primary-button"
          @click="router.push('/mockdata')"
        >
          Mock 주문 생성
        </button>
      </div>
    </header>

    <section v-if="latestWaitingOrder" class="new-order-section">
      <div class="new-order-head">
        <div>
          <span class="new-label">다음 접수 주문</span>
          <strong>{{ getPlatformName(latestWaitingOrder.platformType) }} {{ latestWaitingOrder.platformOrderNo }}</strong>
        </div>
        <span class="queue-badge">접수대기 {{ operationSummary.waitingCount }}건</span>
      </div>

      <div class="new-order-body new-order-split">
        <div class="new-order-main">
          <h2>{{ latestWaitingOrder.menuSummary }}</h2>
          <p>
            총 {{ latestWaitingOrder.totalQuantity }}개 ·
            {{ formatMoney(latestWaitingOrder.totalAmount) }} ·
            예상 조리 {{ latestWaitingOrder.totalCookingTime }}분
          </p>
        </div>

        <div
          class="new-order-request-box"
          :class="{ attention: (latestWaitingOrder.riskBadges || []).length > 0 }"
        >
          <span>요청사항</span>
          <strong>
            {{ latestWaitingOrder.requestText || '요청사항 없음' }}
          </strong>

          <small v-if="(latestWaitingOrder.riskBadges || []).length">
            {{ latestWaitingOrder.riskBadges.join(' · ') }}
          </small>
        </div>

        <div class="new-order-actions">
          <button
            type="button"
            class="sub-button"
            @click="selectOrderAndScroll(latestWaitingOrder)"
          >
            주문 상세
          </button>

          <button
            type="button"
            class="sub-button danger-outline"
            :disabled="orderStore.changingOrderId === latestWaitingOrder.id"
            @click="openReasonModal('CANCEL', latestWaitingOrder)"
          >
            주문 취소
          </button>

          <button
            type="button"
            class="primary-button"
            :disabled="orderStore.changingOrderId === latestWaitingOrder.id"
            @click="changeOrderStatus(latestWaitingOrder)"
          >
            {{ orderStore.changingOrderId === latestWaitingOrder.id ? '변경 중...' : '조리 시작' }}
          </button>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card waiting clickable" @click="setOrderFilter('status', 'WAITING')">
        <div class="summary-card-head">
          <span>접수대기</span>
        </div>
        <strong>{{ operationSummary.waitingCount }}건</strong>
        <p>클릭하면 접수대기 주문만 확인</p>
      </article>

      <article class="summary-card cooking clickable" @click="setOrderFilter('status', 'COOKING')">
        <div class="summary-card-head">
          <span>조리중</span>
        </div>
        <strong>{{ operationSummary.cookingCount }}건</strong>
        <p>조리 진행 중인 주문</p>
      </article>

      <article class="summary-card delivering clickable" @click="setOrderFilter('status', 'DELIVERING')">
        <div class="summary-card-head">
          <span>배달중</span>
        </div>
        <strong>{{ operationSummary.deliveringCount }}건</strong>
        <p>배달 완료 대기 주문</p>
      </article>

      <article class="summary-card risk clickable" @click="setOrderFilter('attention', 'REQUEST')">
        <div class="summary-card-head">
          <span>요청사항 확인</span>
        </div>
        <strong>{{ operationSummary.requestRiskCount }}건</strong>
        <p>확인이 필요한 요청사항</p>
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
          <option value="REFUNDED">환불</option>
        </select>
      </div>

      <div class="filter-group">
        <label>확인 필요</label>
        <select v-model="selectedAttention" @change="selectedStatus = ''">
          <option value="">전체</option>
          <option value="REQUEST">요청사항 확인</option>
          <option value="DELAY">지연 위험</option>
          <option value="LOSS">손실 위험</option>
          <option value="CANCEL">취소 이력</option>
          <option value="REFUND">환불 이력</option>
        </select>
      </div>

      <div class="filter-group grow">
        <label>검색</label>
        <input v-model="searchKeyword" type="text" placeholder="주문번호, 메뉴명, 주소, 요청사항 검색" />
      </div>

      <button type="button" class="sub-button filter-button" @click="clearFilters">초기화</button>
    </section>

    <section class="orders-content" ref="ordersContentRef">
      
      <article class="order-list-panel">
        <div class="panel-title-row">
          <div>
            <h2>당일 주문 목록</h2>
            <p>오늘 기준 주문만 표시합니다.</p>
          </div>
          <span class="count-text">
           총 {{ filteredOrders.length }}건 · {{ currentPage }}/{{ totalPages }}페이지 </span>
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
                <th>요청사항</th>
                <th>위험</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="order in pagedOrders" 
                :key="order.id"
                :class="{ selected: selectedOrder?.id === order.id }"
                @click="selectOrderAndScroll(order)"
              >
                <td class="order-no-cell">
                  <button
                    type="button"
                    class="order-number-button platform-order-number"
                    @click.stop="selectOrderAndScroll(order)"
                  >
                    {{ order.platformOrderNo }}
                  </button>
                  <small>{{ order.orderedAt }}</small>
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
                  <span
                    class="status-badge"
                    :class="`status-${String(order.orderStatus || '').toLowerCase()}`"
                  >
                    {{ getOrderStatusName(order.orderStatus) }}
                  </span>
                </td>

                <td class="menu-cell">
                  <strong>{{ order.menuSummary }}</strong>
                  <small>{{ order.totalQuantity }}개 · {{ formatMoney(order.totalAmount) }}</small>
                </td>

                <td class="text-cell address-cell">
                  <strong :title="order.deliveryAddress">
                    {{ shortAddress(order.deliveryAddress) }}
                  </strong>
                </td>

                <td class="text-cell request-cell">
                  <small class="request-text-preview">
                    {{ order.requestText || '요청사항 없음' }}
                  </small>
                </td>

                <td>
                  <template v-if="(order.riskBadges || []).length">
                    <span
                      v-for="badge in order.riskBadges"
                      :key="badge"
                      class="risk-badge"
                    >
                      {{ badge }}
                    </span>
                  </template>

                  <span
                    v-else
                    class="delay-badge"
                    :class="`delay-${String(order.delayRiskLevel || 'SAFE').toLowerCase()}`"
                  >
                    {{ getDelayRiskName(order.delayRiskLevel || 'SAFE') }}
                  </span>
                </td>

                <td>
                  <button
                    v-if="getNextStatus(order.orderStatus)"
                    type="button"
                    class="table-button"
                    :disabled="orderStore.changingOrderId === order.id"
                    @click.stop="changeOrderStatus(order)"
                  >
                    {{ orderStore.changingOrderId === order.id ? '변경 중...' : getNextActionName(order.orderStatus) }}
                  </button>
                  <span v-else class="done-text">완료</span>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="8" class="empty-message">조건에 맞는 주문이 없습니다.</td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="filteredOrders.length > pageSize"
            class="pagination"
          >
            <button
              type="button"
              class="page-button"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              이전
            </button>

            <button
              v-for="page in pageNumbers"
              :key="page"
              type="button"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="page-button"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              다음
            </button>
          </div>
        </div>
      </article>

      <aside
        v-if="selectedOrder"
        ref="detailPanelRef"
        class="order-detail-panel"
      >
        <div class="detail-head">
          <div>
            <span class="detail-label">주문 상세</span>
            <h2>{{ selectedOrder.platformOrderNo }}</h2>
            <p class="detail-sub-id">{{ getPlatformName(selectedOrder.platformType) }} 주문</p>
          </div>
          <span
            class="status-badge"
            :class="`status-${String(selectedOrder.orderStatus || '').toLowerCase()}`"
          >
            {{ getOrderStatusName(selectedOrder.orderStatus) }}
          </span>
        </div>

        <div class="detail-section">
          <h3>주문 정보</h3>
          <div class="detail-row"><span>플랫폼</span><strong>{{ getPlatformName(selectedOrder.platformType) }}</strong></div>
          <div class="detail-menu-block">
          <div class="detail-menu-title">
            <span>메뉴</span>
            <strong>총 {{ selectedOrder.totalQuantity }}개</strong>
          </div>

          <div
            v-if="(selectedOrder.items || []).length"
            class="detail-menu-list"
          >
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="detail-menu-item"
            >
              <div>
                <strong>{{ getOrderItemName(item) }}</strong>
                <small>
                  {{ Number(item.quantity || 0) }}개 ·
                  단가 {{ formatMoney(item.orderedMenuPrice) }}
                </small>
              </div>

              <b>{{ formatMoney(getOrderItemTotalAmount(item)) }}</b>
            </div>
          </div>

          <strong v-else class="detail-menu-fallback">
            {{ selectedOrder.menuSummary }}
          </strong>
        </div>
          <div class="detail-row"><span>배달주소</span><strong>{{ selectedOrder.deliveryAddress }}</strong></div>
          <div class="detail-row request-row"><span>요청사항</span><strong>{{ selectedOrder.requestText || '없음' }}</strong></div>
        </div>

        <div class="detail-section request-guide" :class="(selectedOrder.riskBadges||[]).length ? 'attention' : 'plain'">
          <h3>고객 요청사항</h3>
          <p class="request-text-large">{{ selectedOrder.requestText || '요청사항이 없습니다.' }}</p>
          
          <div v-if="(selectedOrder.riskBadges||[]).length" class="request-risk-summary">
            <strong>{{ (selectedOrder.riskBadges||[]).join(' · ') }}</strong>
            <span>{{ getRequestAttentionMessage(selectedOrder) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>비용 스냅샷</h3>

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

          <div
            v-if="selectedOrder.platformSupportAmount"
            class="cost-row plus"
          >
            <span>플랫폼 지원금</span>
            <strong>+{{ formatMoney(selectedOrder.platformSupportAmount) }}</strong>
          </div>

          <div
            class="cost-row total"
            :class="{ negative: Number(selectedOrder.netProfit || 0) < 0 }"
          >
            <span>예상 순수익</span>
            <strong>{{ formatMoney(selectedOrder.netProfit) }}</strong>
          </div>
        </div>

        <div v-if="selectedOrder.cancelReason" class="detail-section cancel-history">
          <h3>취소 이력</h3>
          <p>{{ selectedOrder.canceledAt }} · {{ selectedOrder.cancelReason }}</p>
        </div>

        <div v-if="selectedOrder.refundReason" class="detail-section refund-history">
          <h3>환불 이력</h3>
          <p>{{ selectedOrder.refundedAt }} · {{ selectedOrder.refundReason }}</p>
        </div>

        <div class="detail-actions">
          <button
            v-if="canCancelOrder(selectedOrder.orderStatus)"
            type="button"
            class="sub-button danger-outline"
            :disabled="orderStore.changingOrderId === selectedOrder.id"
            @click="openReasonModal('CANCEL', selectedOrder)"
          >
            주문 취소
          </button>

          <button
            v-else-if="canRefundOrder(selectedOrder.orderStatus)"
            type="button"
            class="sub-button danger-outline"
            :disabled="orderStore.changingOrderId === selectedOrder.id"
            @click="openReasonModal('REFUND', selectedOrder)"
          >
            환불 처리
          </button>

          <button
            v-else-if="selectedOrder.orderStatus === 'CANCELED'"
            type="button"
            class="sub-button"
            disabled
          >
            취소 완료
          </button>

          <button
            v-else-if="selectedOrder.orderStatus === 'REFUNDED'"
            type="button"
            class="sub-button"
            disabled
          >
            환불 완료
          </button>

          <button
            v-if="getNextStatus(selectedOrder.orderStatus)"
            type="button"
            class="primary-button state-action-button"
            :disabled="orderStore.changingOrderId === selectedOrder.id"
            @click="changeOrderStatus(selectedOrder)"
          >
            {{ orderStore.changingOrderId === selectedOrder.id ? '변경 중...' : getNextActionName(selectedOrder.orderStatus) }}
          </button>
          <button v-else type="button" class="sub-button state-action-button" disabled>상태 변경 불가</button>
        </div>
        <div ref="detailBottomRef" class="detail-bottom-anchor"></div>
      </aside>
    </section>
         <button
      v-if="showDetailTopButton"
      type="button"
      class="detail-floating-top-button"
      title="주문 상세 상단으로"
      aria-label="주문 상세 상단으로 이동"
      @click="scrollToPageTop"
        >
          ↑
       </button>


    <div v-if="isReasonModalOpen && reasonTargetOrder" class="modal-backdrop" @click.self="closeReasonModal">
      <div class="status-modal cancel-modal">
        <div class="status-modal-header">
          <div>
            <span class="category-text">{{ reasonModalText.category }}</span>
            <h2>{{ reasonTargetOrder.platformOrderNo }} {{ reasonModalText.titleSuffix }}</h2>
            <p class="modal-sub-id">{{ getPlatformName(reasonTargetOrder.platformType) }} 주문</p>
            <p>{{ reasonModalText.description }}</p>
          </div>
          <button class="modal-close-button" @click="closeReasonModal">×</button>
        </div>
        
        <div class="status-modal-body">
          <div class="modal-order-card">
            <div class="modal-order-main">
              <div>
                <strong>{{ reasonTargetOrder.menuSummary }}</strong>
                <p>{{ getPlatformName(reasonTargetOrder.platformType) }} · {{ formatMoney(reasonTargetOrder.totalAmount) }}</p>
              </div>
              <span
                class="status-badge"
                :class="`status-${String(reasonTargetOrder.orderStatus || '').toLowerCase()}`"
              >
                {{ getOrderStatusName(reasonTargetOrder.orderStatus) }}
              </span>
            </div>
            
            <div class="cancel-preset-grid">
              <button
                v-for="preset in reasonPresets" 
                :key="preset"
                type="button"
                @click="setReasonPreset(preset)"
              >
                {{ preset }}
              </button>
            </div>
            
            <div class="cancel-reason-area">
              <label>{{ reasonModalText.typeLabel }} <span>*</span></label>
              <select v-model="reasonCategory">
                <option value="">유형 선택</option>
                <option
                  v-for="preset in reasonPresets"
                  :key="preset"
                >
                  {{ preset }}
                </option>
              </select>
              
              <label>상세 사유 직접 입력 <span>*</span></label>
              <textarea
                v-model="reasonInput"
                :placeholder="reasonModalText.placeholder"
              ></textarea>
              <small>{{ reasonModalText.helpText }}</small>
            </div>
            
            <div class="modal-order-actions">
              <button class="sub-button" @click="closeReasonModal">닫기</button>
              <button
                class="primary-button"
                :disabled="reasonTargetOrder && orderStore.changingOrderId === reasonTargetOrder.id"
                @click="saveReason"
              >
                {{ reasonTargetOrder && orderStore.changingOrderId === reasonTargetOrder.id ? reasonModalText.savingButton : reasonModalText.saveButton }}
              </button>
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
  font-size: 18px;
  font-weight: 400;
  transition: all 0.2s;
}
.detail-bottom-anchor {
  height: 1px;
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
/* .new-order-section {
  overflow: hidden;
  margin-bottom: 16px;
  border: 2px solid #2784b8;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 18px 44px rgba(37, 132, 184, 0.16);
} */
 .new-order-section {
  overflow: hidden;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
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
  border-radius: 999px; color: #164e68; background-color: #eaf8fd; font-size: 14px; font-weight: 400;
}
.new-order-head strong { font-size: 20px; font-weight: 300; }
.queue-badge { display: inline-flex; align-items: center; min-height: 30px; padding: 0 12px; border-radius: 999px; color: #ffffff; background-color: rgba(255,255,255,0.16); font-size: 14px; font-weight: 400; }
.new-order-body { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px; }
.new-order-main h2 { margin: 0 0 6px; color: #111827; font-size: 24px; font-weight: 400; }
.new-order-main p { margin: 0; color: #64748b; font-size: 16px; }
.new-order-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }

.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
/* .summary-card { min-width: 0; padding: 22px; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; } */
.summary-card {
  min-width: 0;
  box-sizing: border-box;
  height: 152px;
  padding: 19px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background-color: #fbfdff;
  box-shadow: none;
}
.summary-card.clickable { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
.summary-card.clickable:hover { transform: translateY(-2px); border-color: #87ceeb; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08); }
.summary-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.summary-card-head span { color: #475569; font-size: 16px; font-weight: 900; }
.summary-card-head small { color: #94a3b8; font-size: 14px; font-weight: 800; }
.summary-card strong { display: block; margin-bottom: 6px; color: #111827; font-size: 34px; font-weight: 400; letter-spacing: -0.04em; }
.summary-card p { margin: 0; color: #64748b; font-size: 15px; }
.summary-card.waiting { border-color: #87ceeb; background-color: #eaf8fd; }
.summary-card.cooking { border-color: #bfdbfe; }
.summary-card.delivering { border-color: #bbf7d0; }
.summary-card.risk { border-color: #fecaca; background-color: #fff7f7; }
.summary-card.risk strong { color: #dc2626; }

/* ============================================================
   검색 필터 패널
   ============================================================ */
/* .filter-panel { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 16px; padding: 18px; border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; } */
.filter-panel {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  box-sizing: border-box;
  margin-bottom: 16px;
  padding: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
}
.filter-group { display: grid; gap: 8px; min-width: 150px; }
.filter-group.grow { flex: 1; }
.filter-group label { color: #64748b; font-size: 16px; font-weight: 900; }
.filter-group select, .filter-group input { width: 100%; min-height: 46px; padding: 0 14px; border: 1px solid #dbe3ee; border-radius: 12px; color: #334155; background-color: #ffffff; font-size: 17px; outline: none; }
.filter-group select:focus, .filter-group input:focus { border-color: #87ceeb; box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.24); }

/* ============================================================
   메인 테이블 & 상세 패널 (가독성 향상)
   ============================================================ */
.orders-content { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 16px; align-items: start; }
/* .order-list-panel, .order-detail-panel { border: 1px solid #e5e7eb; border-radius: 18px; background-color: #ffffff; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); } */
.order-list-panel,
.order-detail-panel {
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
}
/* .order-list-panel { min-width: 0; padding: 22px; } */
.order-list-panel {
  min-width: 0;
  padding: 30px;
}
.panel-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.panel-title-row h2 { margin: 0 0 6px; color: #111827; font-size: 23px; font-weight: 900; }
.panel-title-row p { margin: 0; color: #64748b; font-size: 16px; }
.count-text { color: #000000; font-size: 16px; font-weight: 400; white-space: nowrap; }

.table-scroll {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;
  table-layout: fixed;
}

.order-table th,
.order-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  vertical-align: middle;
  font-size: 15px;
}

.order-table th {
  color: #64748b;
  background-color: #f8fafc;
  font-weight: 900;
  white-space: nowrap;
}

.order-table td {
  font-size: 16px;
  line-height: 1.45;
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
  font-size: 14px;
  font-weight: 400;
}

.order-table td small {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 14px;
}

.order-table th:nth-child(1),
.order-table td:nth-child(1) {
  width: 190px;
}

.order-table th:nth-child(2),
.order-table td:nth-child(2) {
  width: 105px;
}

.order-table th:nth-child(3),
.order-table td:nth-child(3) {
  width: 105px;
}

.order-table th:nth-child(4),
.order-table td:nth-child(4) {
  width: 150px;
}

.order-table th:nth-child(5),
.order-table td:nth-child(5) {
  width: 190px;
}

.order-table th:nth-child(6),
.order-table td:nth-child(6) {
  width: 160px;
}

.order-table th:nth-child(7),
.order-table td:nth-child(7) {
  width: 105px;
}

.order-table th:nth-child(8),
.order-table td:nth-child(8) {
  width: 105px;
}

.text-cell {
  text-align: left !important;
}

.menu-cell {
  text-align: center !important;
}

.order-no-cell {
  text-align: center;
}

.order-number-button {
  display: inline-block;
  max-width: 165px;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: #000000;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.35;
  text-decoration: underline;
  word-break: break-all;
}

.menu-cell strong {
  display: block;
  width: 100%;
  overflow: hidden;
  color: #111827;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-cell small {
  display: block;
  width: 100%;
  margin-top: 4px;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.address-cell strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.request-text-preview {
  display: -webkit-box !important;
  overflow: hidden;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
/* 신규 주문 패널 */
.new-order-split {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr) auto;
  align-items: stretch;
}

.new-order-request-box {
  display: grid;
  align-content: center;
  gap: 6px;
  min-height: 86px;
  padding: 16px;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  background-color: #f8fafc;
}

.new-order-request-box.attention {
  border-color: #fed7aa;
  background-color: #fff7ed;
}

.new-order-request-box span {
  color: #64748b;
  font-size: 14px;
  font-weight: 400;
}

.new-order-request-box strong {
  color: #111827;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.45;
  word-break: keep-all;
}

.new-order-request-box small {
  color: #c2410c;
  font-size: 14px;
  font-weight: 400;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
}

.page-button,
.page-number {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  color: #475569;
  background-color: #ffffff;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
}

.page-number.active {
  color: #ffffff;
  border-color: #2784b8;
  background-color: #2784b8;
}

.page-button:disabled,
.page-number:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 뱃지 통일 (플랫폼 중립화 포함) */
.platform-badge, .status-badge, .delay-badge, .risk-badge { 
  display: inline-flex; align-items: center; justify-content: center; min-height: 30px; 
  padding: 0 12px; margin: 2px 2px 2px 0; border-radius: 999px; font-size: 14px; font-weight: 900; white-space: nowrap; 
}

.status-badge.status-waiting { color: #121213; background-color: #eaf8fd; }
.status-badge.status-cooking { color: #92400e; background-color: #fffbeb; }
.status-badge.status-delivering { color: #166534; background-color: #dcfce7; }
.status-badge.status-completed { color: #334155; background-color: #f1f5f9; }
.status-badge.status-canceled { color: #991b1b; background-color: #fee2e2; }
.status-badge.status-refunded { color: #92400e; background-color: #fef3c7; }
.delay-badge.delay-safe { color: #166534; background-color: #dcfce7; }
.delay-badge.delay-warning { color: #9a3412; background-color: #ffedd5; }
.delay-badge.delay-delayed { color: #991b1b; background-color: #fee2e2; }
.risk-badge { color: #9a3412; background-color: #ffedd5; }

.table-button { min-height: 36px; padding: 0 10px; border: 0; background-color: #eaf8fd; color: #1f1f20; font-size: 14px; font-weight: 900; transition: all 0.2s; }
.table-button:hover { background-color: #d9f0fa; }
.table-button:disabled { opacity: 0.55; cursor: not-allowed; }
.done-text { color: #94a3b8; font-size: 15px; font-weight: 800; }
.empty-message { height: 120px; color: #9ca3af; text-align: center; }

/* ============================================================
   상세 패널
   ============================================================ */
/* .order-detail-panel { position: sticky; top: 86px; padding: 22px; } */
.order-detail-panel {
  position: sticky;
  top: 86px;
  padding: 30px;
}
.detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.detail-label { color: #64748b; font-size: 14px; font-weight: 900; }
.detail-head h2 { margin: 6px 0 0; color: #111827; font-size: 13px; font-weight: 900; }
.detail-sub-id { margin: 6px 0 0; color: #64748b; font-size: 15px; font-weight: 750; }

.detail-section { padding-top: 20px; }
.detail-section h3 { margin: 0 0 12px; color: #111827; font-size: 17px; font-weight: 900; }

.detail-row,
.cost-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 16px;
}

.cost-row strong {
  color: #111827;
  font-weight: 700;
  text-align: right;
  word-break: keep-all;
}

.detail-row strong {
  max-width: 220px;
  line-height: 1.45;
  color: #111827;
  font-weight: 400;
  text-align: right;
  word-break: keep-all;
}

.detail-row:nth-child(4) strong {
  word-break: break-word;
}

.request-row strong {
  max-width: 220px;
  line-height: 1.4;
}

.cost-row.minus strong {
  color: #dc2626;
}

.cost-row.plus strong {
  color: #15803d;
}
.cost-row.total { margin-top: 6px; padding-top: 16px; border-bottom: 0; border-top: 1px solid #dbe3ee; font-weight: 900; }
.cost-row.total strong { color: #15803d; font-size: 19px; }
.cost-row.total.negative strong { color: #dc2626; }

/* 요청사항 / 취소 가이드 영역 */
.request-guide, .cancel-history, .refund-history { padding: 16px; margin-top: 18px; border-radius: 14px; background: #f8fafc; }
.request-guide.plain { border: 1px solid #e5e7eb; background: #ffffff; }
.request-guide.attention { border: 1px solid #e5e7eb; border-left: 5px solid #f59e0b; background: #ffffff; }
.request-guide h3, .cancel-history h3, .refund-history h3 { margin-bottom: 10px; }
.request-text-large { margin: 0; color: #334155; font-size: 17px; font-weight: 800; line-height: 1.6; }
.request-risk-summary { display: grid; gap: 6px; margin-top: 14px; padding: 12px 14px; border-radius: 12px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e; }
.request-risk-summary strong { font-size: 15px; }
.request-risk-summary span { color: #78350f; font-size: 15px; line-height: 1.5; }
.cancel-history { background: #fef2f2; border: 1px solid #fecaca; }
.refund-history { background: #fffbeb; border: 1px solid #fde68a; }
.cancel-history p, .refund-history p { margin: 0; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 700; }

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

/* ============================================================
   2026-06-27 화면 보정
   - 다음 접수 주문 카드 중앙 정렬
   - 주문 목록 테이블 가로 스크롤 최소화
   - 플랫폼 주문번호/액션 칼럼 한 화면 표시
   ============================================================ */
.new-order-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
}

.new-order-split {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 0.95fr) auto;
  align-items: stretch;
}

.new-order-main {
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 86px;
  text-align: center;
}

.new-order-main h2 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.25;
}

.new-order-main p {
  margin: 0;
  color: #64748b;
  font-size: 19px;
  font-weight: 750;
  line-height: 1.45;
}

.new-order-actions {
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  justify-content: flex-end;
  gap: 10px;
}

.new-order-actions .primary-button,
.new-order-actions .sub-button {
  min-height: 86px;
  min-width: 108px;
  padding: 0 20px;
  font-size: 19px;
}

.table-scroll {
  overflow-x: visible;
}

.order-table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.order-table th,
.order-table td {
  padding: 12px 7px;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
}

.order-table td {
  font-size: 14px;
  line-height: 1.4;
}

.order-table th:nth-child(1),
.order-table td:nth-child(1) {
  width: 132px;
}

.order-table th:nth-child(2),
.order-table td:nth-child(2) {
  width: 82px;
}

.order-table th:nth-child(3),
.order-table td:nth-child(3) {
  width: 82px;
}

.order-table th:nth-child(4),
.order-table td:nth-child(4) {
  width: 145px;
}

.order-table th:nth-child(5),
.order-table td:nth-child(5) {
  width: 135px;
}

.order-table th:nth-child(6),
.order-table td:nth-child(6) {
  width: 120px;
}

.order-table th:nth-child(7),
.order-table td:nth-child(7) {
  width: 82px;
}

.order-table th:nth-child(8),
.order-table td:nth-child(8) {
  width: 88px;
}

.order-number-button {
  display: inline-block;
  max-width: 118px;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: #000000;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.25;
  text-decoration: none;
  word-break: break-all;
  cursor: pointer;
}

.order-no-cell small {
  display: block;
  margin-top: 3px;
  font-size: 12px !important;
  line-height: 1.25;
}

.menu-cell strong {
  display: block;
  width: 100%;
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.3;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-cell small {
  display: block;
  width: 100%;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}

.request-text-preview {
  display: -webkit-box !important;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.table-button {
  min-height: 34px;
  padding: 0 8px;
  border: 0;
  background-color: #eaf8fd;
  color: #1f1f20;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  transition: all 0.2s;
}

@media (max-width: 1280px) {
  .new-order-split {
    grid-template-columns: 1fr;
  }

  .new-order-actions {
    justify-content: stretch;
  }

  .new-order-actions .primary-button,
  .new-order-actions .sub-button {
    flex: 1;
  }
}
.detail-menu-block {
  display: grid;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-menu-title span {
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
}

.detail-menu-title strong {
  color: #111827;
  font-size: 15px;
  font-weight: 400;
}

.detail-menu-list {
  display: grid;
  gap: 8px;
}

.detail-menu-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f8fafc;
}

.detail-menu-item strong {
  display: block;
  color: #111827;
  font-size: 15px;
  font-weight: 400;
}

.detail-menu-item small {
  display: block;
  margin-top: 3px;
  color: #6b7280;
  font-size: 13px;
}

.detail-menu-item b {
  flex-shrink: 0;
  color: #164E68;
  font-size: 14px;
}

.detail-menu-fallback {
  color: #111827;
  font-size: 15px;
}

/* ============================================================
   2026-06-27 주문 상세 액션 위치 보정
   - 배달중 상태의 완료 처리 버튼이 왼쪽으로 밀리지 않게 오른쪽 칸 고정
   ============================================================ */
.detail-actions {
  grid-template-columns: minmax(120px, 1fr) minmax(120px, 1fr);
  align-items: stretch;
}

.detail-actions .state-action-button {
  grid-column: 2;
}

.detail-actions .primary-button.state-action-button,
.detail-actions .sub-button.state-action-button {
  width: 100%;
}



/* ============================================================
   2026-06-27 주문 화면 버튼/모달/글자 굵기 보정
   ============================================================ */
.orders-view {
  font-weight: 500;
}

.page-header h1,
.panel-title-row h2,
.detail-section h3,
.detail-head h2,
.new-order-main h2 {
  font-weight: 400;
}

.category-text,
.filter-group label,
.summary-card-head span,
.detail-label,
.card-label {
  font-weight: 500;
}

.new-order-main h2 {
  font-size: 26px;
}

.new-order-main p {
  font-size: 17px;
  font-weight: 500;
  white-space: nowrap;
}

.new-order-request-box strong,
.request-text-large {
  font-weight: 400;
}

.new-order-actions .primary-button,
.new-order-actions .sub-button {
  min-width: 102px;
  font-size: 17px;
  font-weight: 700;
}

.order-table th {
  font-weight: 700;
}

.order-number-button,
.menu-cell strong,
.table-button,
.status-badge,
.platform-badge,
.risk-badge,
.delay-badge {
  font-weight: 500;
}

.menu-cell small,
.request-text-preview,
.text-cell strong,
.order-no-cell small {
  font-weight: 500;
}

.detail-actions {
  grid-template-columns: minmax(120px, 1fr) minmax(120px, 1fr);
}

.detail-actions .state-action-button {
  grid-column: 2;
}

.modal-order-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.modal-order-actions .sub-button,
.modal-order-actions .primary-button {
  min-width: 132px;
  font-weight: 700;
}

.status-modal-header h2,
.modal-order-main strong,
.cancel-reason-area label,
.cancel-preset-grid button {
  font-weight: 700;
}

.cancel-reason-area select,
.cancel-reason-area textarea {
  font-weight: 500;
}


/* ============================================================
   2026-06-27 01:39 취소/환불 사유 모달 입력창 넘침 보정
   ============================================================ */
.cancel-modal,
.status-modal-body,
.modal-order-card,
.cancel-reason-area,
.cancel-reason-area select,
.cancel-reason-area textarea {
  box-sizing: border-box;
}

.cancel-modal {
  max-width: calc(100vw - 56px);
  overflow: hidden;
}

.status-modal-body {
  overflow-x: hidden;
}

.modal-order-card,
.cancel-reason-area {
  min-width: 0;
  width: 100%;
}

.cancel-reason-area select,
.cancel-reason-area textarea {
  width: 100%;
  max-width: 100%;
}

.modal-order-actions {
  width: 100%;
}
.detail-floating-top-button {
  position: fixed;
  right: 28px;
  bottom: 110px;
  z-index: 60;

  width: 44px;
  height: 44px;
  border: 1px solid #dbe3ee;
  border-radius: 999px;

  background-color: rgba(255, 255, 255, 0.96);
  color: #164e68;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);

  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  backdrop-filter: blur(8px);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.detail-floating-top-button:hover {
  transform: translateY(-2px);
  border-color: #87ceeb;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
}

@media (max-width: 1200px) {
  .detail-floating-top-button {
    right: 18px;
    bottom: 88px;
  }
}


</style>