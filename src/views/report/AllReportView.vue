<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReportStore } from '../../stores/report/useReportStore.js';

const router = useRouter();
const route = useRoute();
const reportStore = useReportStore();

/*
 * 날짜 input에 넣기 위한 yyyy-MM-dd 변환 함수
 * toISOString()은 UTC 기준이라 한국 시간 새벽에는 날짜가 하루 밀릴 수 있어서 직접 만든다.
 */
const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const todayDate = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(todayDate.getDate() - 7);

const today = toDateInputValue(todayDate);
const defaultStartDate = toDateInputValue(sevenDaysAgo);

// ==========================================
// 1. 상태 관리
// ==========================================
const activeTab = ref('sales');

const filters = ref({
  startDate: defaultStartDate,
  endDate: today,
  platform: '',
  status: '',
  risk: '',
  keyword: '',
});

// ==========================================
// 2. 화면 표시용 이름 매핑
// ==========================================
const platformNames = {
  BAEMIN: '배민',
  COUPANG_EATS: '쿠팡이츠',
  YOGIYO: '요기요',
  DDANGYO: '땡겨요',
};

const statusNames = {
  WAITING: '접수대기',
  COOKING: '조리중',
  DELIVERING: '배달중',
  COMPLETED: '완료',
  CANCELED: '취소',
  REFUNDED: '환불',
};

const riskNames = {
  REQUEST: '요구사항 확인',
  LOSS: '손실 위험',
  CANCEL: '취소 이력',
  REFUND: '환불 이력',
};

const cancelTypeNames = {
  CUSTOMER_REQUEST: '고객 요청',
  OUT_OF_STOCK: '재료 소진',
  COOKING_DELAY: '조리 지연',
  REQUEST_UNAVAILABLE: '요구사항 처리 불가',
  DELIVERY_ISSUE: '배달 문제',
  ETC: '기타',
};

const refundTypeNames = {
  CUSTOMER_REQUEST: '고객 요청',
  FOOD_ISSUE: '음식 문제',
  DELIVERY_ISSUE: '배달 문제',
  STORE_MISTAKE: '매장 실수',
  PLATFORM_POLICY: '플랫폼 정책',
  ETC: '기타',
};

const reasonTypeLabels = [
  '고객 요청',
  '재료 소진',
  '조리 지연',
  '요구사항 처리 불가',
  '배달 문제',
  '음식 문제',
  '매장 실수',
  '플랫폼 정책',
  '기타',
];

// ==========================================
// 3. Store 데이터 연결
// ==========================================
const orders = computed(() => reportStore.reportOrders);

const filteredOrders = computed(() => {
  return orders.value;
});

const salesOrders = computed(() => {
  return filteredOrders.value.filter((order) => {
    return order.orderStatus === 'COMPLETED';
  });
});

const cancelOrders = computed(() => {
  return filteredOrders.value.filter((order) => {
    return order.orderStatus === 'CANCELED';
  });
});

const refundOrders = computed(() => {
  return filteredOrders.value.filter((order) => {
    return order.orderStatus === 'REFUNDED';
  });
});

const historyOrders = computed(() => {
  return filteredOrders.value.filter((order) => {
    return order.orderStatus === 'CANCELED' ||
      order.orderStatus === 'REFUNDED';
  });
});

const previewOrders = computed(() => {
  return filteredOrders.value.slice(0, 5);
});

const hiddenPreviewCount = computed(() => {
  const hiddenCount = filteredOrders.value.length - previewOrders.value.length;

  return hiddenCount > 0 ? hiddenCount : 0;
});

// ==========================================
// 4. 요약 계산
// ==========================================
const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString('ko-KR')} 원`;
};

const summaryStats = computed(() => {
  const completed = salesOrders.value;
  const canceled = cancelOrders.value;
  const refunded = refundOrders.value;

  const totalSales = completed.reduce((sum, order) => {
    return sum + Number(order.totalAmount || 0);
  }, 0);

  const totalProfit = completed.reduce((sum, order) => {
    return sum + Number(order.netProfit || 0);
  }, 0);

  const closedCount = canceled.length + refunded.length;

  const closedRate = filteredOrders.value.length
    ? Math.round((closedCount / filteredOrders.value.length) * 1000) / 10
    : 0;

  return {
    totalSales,
    totalProfit,
    cancelCount: canceled.length,
    refundCount: refunded.length,
    closedCount,
    closedRate,
    totalCount: filteredOrders.value.length,
    completedCount: completed.length,
  };
});

const historyTypeSummary = computed(() => {
  return historyOrders.value.reduce((acc, order) => {
    const category = getHistoryCategory(order);
    const key = `${statusNames[order.orderStatus]} · ${category}`;

    acc[key] = (acc[key] || 0) + 1;

    return acc;
  }, {});
});

const platformStats = computed(() => {
  return Object.keys(platformNames).map((platform) => {
    const platformOrders = filteredOrders.value.filter((order) => {
      return order.platformType === platform;
    });

    const completed = platformOrders.filter((order) => {
      return order.orderStatus === 'COMPLETED';
    });

    const canceled = platformOrders.filter((order) => {
      return order.orderStatus === 'CANCELED';
    });

    const refunded = platformOrders.filter((order) => {
      return order.orderStatus === 'REFUNDED';
    });

    const sales = completed.reduce((sum, order) => {
      return sum + Number(order.totalAmount || 0);
    }, 0);

    const profit = completed.reduce((sum, order) => {
      return sum + Number(order.netProfit || 0);
    }, 0);

    const closedRate = platformOrders.length
      ? Math.round(((canceled.length + refunded.length) / platformOrders.length) * 1000) / 10
      : 0;

    return {
      platformType: platform,
      name: platformNames[platform],
      total: platformOrders.length,
      completed: completed.length,
      canceled: canceled.length,
      refunded: refunded.length,
      closedRate,
      sales,
      profit,
    };
  });
});

const filterSummaryText = computed(() => {
  const currentFilters = filters.value;

  const platformName = currentFilters.platform
    ? platformNames[currentFilters.platform]
    : '전체 플랫폼';

  const statusName = currentFilters.status
    ? statusNames[currentFilters.status]
    : '전체 상태';

  const riskName = currentFilters.risk
    ? riskNames[currentFilters.risk]
    : '전체 위험/확인';

  const keywordText = currentFilters.keyword.trim()
    ? `검색어 '${currentFilters.keyword.trim()}'`
    : '검색어 없음';

  return `기간 ${currentFilters.startDate || '전체'} ~ ${currentFilters.endDate || '전체'} · ${platformName} · ${statusName} · ${riskName} · ${keywordText}`;
});

const applyRouteQueryToReport = () => {
  const query = route.query;

  const requestedTab = String(query.tab || '');
  const availableTabs = ['sales', 'cancel', 'platform', 'export'];

  if (availableTabs.includes(requestedTab)) {
    activeTab.value = requestedTab;
  }

  if (query.status) {
    filters.value.status = String(query.status);
  }

  if (query.platform) {
    filters.value.platform = String(query.platform);
  }

  if (query.keyword) {
    filters.value.keyword = String(query.keyword);
  }
};

// ==========================================
// 5. API 호출 함수
// ==========================================
const searchReports = async () => {
  await reportStore.findOrders(filters.value);
};

const clearFilters = async () => {
  filters.value = {
    startDate: defaultStartDate,
    endDate: today,
    platform: '',
    status: '',
    risk: '',
    keyword: '',
  };

  await searchReports();
};

const exportExcel = async (type = '전체') => {
  const exportFilters = {
    ...filters.value,
  };

  /*
   * 각 탭의 내보내기는 현재 필터를 기본으로 하되,
   * 매출/취소/환불 버튼은 상태 조건을 자동으로 덮어쓴다.
   */
  if (type === '매출') {
    exportFilters.status = 'COMPLETED';
  }

  if (type === '취소') {
    exportFilters.status = 'CANCELED';
  }

  if (type === '환불') {
    exportFilters.status = 'REFUNDED';
  }

  await reportStore.downloadOrdersCsv(exportFilters);
};

// ==========================================
// 6. 화면 유틸 함수
// ==========================================
const getPlatformClass = (type) => {
  return {
    BAEMIN: 'baemin',
    COUPANG_EATS: 'coupang',
    YOGIYO: 'yogiyo',
    DDANGYO: 'ddangyo',
  }[type] || 'default';
};

const getHistoryBadgeClass = (status) => {
  if (status === 'COMPLETED') {
    return 'status-completed';
  }

  if (status === 'REFUNDED') {
    return 'status-refunded';
  }

  if (status === 'CANCELED') {
    return 'status-canceled';
  }

  return 'status-default';
};

const normalizeReasonType = (value) => {
  if (!value) {
    return '';
  }

  const text = String(value).trim();

  if (cancelTypeNames[text]) {
    return cancelTypeNames[text];
  }

  if (refundTypeNames[text]) {
    return refundTypeNames[text];
  }

  const matchedLabel = reasonTypeLabels.find((label) => {
    return text === label || text.startsWith(`${label}으로`) || text.startsWith(`${label}로`);
  });

  if (matchedLabel) {
    return matchedLabel;
  }

  if (text.includes('·')) {
    return text.split('·')[0].trim();
  }

  return '';
};

const getHistoryCategory = (order) => {
  if (order.orderStatus === 'REFUNDED') {
    return refundTypeNames[order.refundType] ||
      normalizeReasonType(order.refundType) ||
      normalizeReasonType(order.refundReason) ||
      '기타';
  }

  return cancelTypeNames[order.cancelType] ||
    normalizeReasonType(order.cancelType) ||
    normalizeReasonType(order.cancelReason) ||
    '기타';
};

const getHistoryDetail = (order) => {
  if (order.orderStatus === 'REFUNDED') {
    return order.refundReason || '-';
  }

  return getCancelDetail(order.cancelReason);
};

const getHistoryAt = (order) => {
  if (order.orderStatus === 'REFUNDED') {
    return order.refundedAt || '-';
  }

  return order.canceledAt || '-';
};

const getCancelCategory = (reason) => {
  return normalizeReasonType(reason) || '기타';
};

const getPreviewHistoryText = (order) => {
  if (order.orderStatus === 'CANCELED') {
    return order.cancelReason || order.cancelType || '-';
  }

  if (order.orderStatus === 'REFUNDED') {
    return order.refundReason || order.refundType || '-';
  }

  return '-';
};

const getCancelDetail = (reason) => {
  if (!reason) {
    return '-';
  }

  if (!reason.includes('·')) {
    return reason;
  }

  return reason.split('·').slice(1).join('·').trim();
};

onMounted(() => {
  applyRouteQueryToReport();
  searchReports();
});
</script>

<template>
  <section class="report-page page-section">
    <header class="page-header report-page-header">
      <div>
        <span class="category-text">OPERATION REPORT</span>
        <h1>운영 리포트</h1>
        <p class="header-desc">매출, 취소, 플랫폼 정산을 날짜와 조건별로 확인하고 파일로 내보냅니다.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="sub-button" @click="activeTab = 'cancel'">취소/환불 리포트</button>
        <button type="button" class="primary-button" @click="activeTab = 'export'">필터/엑셀 내보내기</button>
      </div>
    </header>

    <div class="tabs-mock report-tabs report-tabs-under-title">
      <button class="tab" :class="{ active: activeTab === 'sales' }" @click="activeTab = 'sales'">매출 리포트</button>
      <button class="tab" :class="{ active: activeTab === 'cancel' }" @click="activeTab = 'cancel'">취소/환불 리포트</button>
      <button class="tab" :class="{ active: activeTab === 'platform' }" @click="activeTab = 'platform'">플랫폼별 정산 요약</button>
      <button class="tab" :class="{ active: activeTab === 'export' }" @click="activeTab = 'export'">필터/엑셀 내보내기</button>
    </div>

    <article v-if="activeTab === 'sales'" class="card report-card sales-report-combined-card">
      <div class="card-header">
        <div class="title-area">
          <h2>매출 리포트</h2>
          <p class="required-note">완료 주문 기준으로 매출과 예상 순수익을 확인합니다.</p>
        </div>
        <button class="primary-button" @click="exportExcel('매출')">매출 내보내기</button>
      </div>

      <section class="report-summary-grid">
        <article class="summary-box">
          <span>완료 매출</span>
          <strong>{{ formatMoney(summaryStats.totalSales) }}</strong>
          <p>완료 주문 {{ summaryStats.completedCount }}건 기준</p>
        </article>
        <article class="summary-box">
          <span>예상 순수익</span>
          <strong>{{ formatMoney(summaryStats.totalProfit) }}</strong>
          <p>수수료·배달비·원가 반영</p>
        </article>
        <article class="summary-box cancel-box">
          <span>취소 주문</span>
          <strong>{{ summaryStats.cancelCount }}건</strong>
          <p>취소율 {{ summaryStats.cancelRate }}%</p>
        </article>
        <article class="summary-box">
          <span>조회 주문</span>
          <strong>{{ summaryStats.totalCount }}건</strong>
          <p>현재 필터 기준</p>
        </article>
      </section>

      <div class="table-scroll">
        <table class="data-table">
         <thead>
          <tr>
            <th>날짜</th>
            <th>플랫폼 주문번호</th>
            <th>플랫폼</th>
            <th>메뉴</th>
            <th>주문금액</th>
            <th>플랫폼 수수료</th>
            <th>배달비 부담</th>
            <th>쿠폰 부담</th>
            <th>플랫폼 지원금</th>
            <th>메뉴 원가</th>
            <th>포장비</th>
            <th>예상 순수익</th>
            <th>완료일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in salesOrders" :key="order.orderNo">
            <td class="text-muted cancel-date-cell">{{ order.orderDate }}</td>
            <td class="cancel-status-cell">
              <strong class="order-no-main">{{ order.platformOrderNo }}</strong>
            </td>
            <td>
              <span class="platform-badge" :class="getPlatformClass(order.platformType)">
                {{ platformNames[order.platformType] }}
              </span>
            </td>
            <td class="text-main">{{ order.menuSummary }}</td>
            <td class="text-muted">{{ formatMoney(order.totalAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.commissionAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.deliveryFeeAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.couponAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.platformSupportAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.menuCostAmount) }}</td>
            <td class="text-muted">{{ formatMoney(order.packagingAmount) }}</td>
            <td>
              <strong class="profit-strong">{{ formatMoney(order.netProfit) }}</strong>
            </td>
            <td class="text-muted">{{ order.completedAt || '-' }}</td>
          </tr>
          <tr v-if="salesOrders.length === 0">
            <td colspan="13" class="empty-message">
              조건에 맞는 완료 주문이 없습니다.
            </td>
          </tr>
        </tbody>
        </table>
      </div>
    </article>

   <section v-if="activeTab === 'cancel'" class="grid-12 report-cancel-layout">
  <article class="card col-4 cancel-summary-card">
    <div class="card-header">
      <div class="title-area">
        <h2>취소/환불 유형 요약</h2>
        <p class="required-note">취소와 환불 유형별 건수</p>
      </div>
    </div>

    <div class="cancel-type-list">
      <div v-for="(count, type) in historyTypeSummary" :key="type">
        <span>{{ type }}</span>
        <strong>{{ count }}건</strong>
      </div>

      <div v-if="Object.keys(historyTypeSummary).length === 0">
        <span>취소/환불 이력 없음</span>
        <strong>0건</strong>
      </div>
    </div>

    <div class="info-banner">
      완료 이후 문제가 생긴 주문은 취소가 아니라 환불 이력으로 분리해 확인합니다.
    </div>
  </article>

  <article class="card col-8 report-card">
    <div class="card-header">
      <div class="title-area">
        <h2>취소/환불 이력 모음</h2>
        <p class="required-note">
          취소일시, 환불일시, 유형, 상세 사유를 한 곳에서 확인합니다.
        </p>
      </div>

      <div class="header-actions">
        <button class="sub-button" @click="exportExcel('취소')">
          취소 CSV
        </button>
        <button class="primary-button" @click="exportExcel('환불')">
          환불 CSV
        </button>
      </div>
    </div>

    <div class="table-scroll cancel-history-scroll">
      <table class="data-table cancel-history-table">
        <colgroup>
          <col class="cancel-col-date">
          <col class="cancel-col-status">
          <col class="cancel-col-order-no">
          <col class="cancel-col-platform">
          <col class="cancel-col-menu">
          <col class="cancel-col-type">
          <col class="cancel-col-reason">
          <col class="cancel-col-processed-at">
        </colgroup>
        <thead>
          <tr>
            <th>날짜</th>
            <th>상태</th>
            <th>플랫폼 주문번호</th>
            <th>플랫폼</th>
            <th>메뉴</th>
            <th>유형</th>
            <th>상세사유</th>
            <th>처리일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in historyOrders" :key="order.orderNo">
            <td class="text-muted">{{ order.orderDate }}</td>
            <td>
              <span
                class="status-badge"
                :class="getHistoryBadgeClass(order.orderStatus)"
              >
                {{ statusNames[order.orderStatus] }}
              </span>
            </td>
            <td class="cancel-order-no-cell">
              <strong class="order-no-main">{{ order.platformOrderNo }}</strong>
            </td>
            <td class="cancel-platform-cell">
              <span class="platform-badge" :class="getPlatformClass(order.platformType)">
                {{ platformNames[order.platformType] }}
              </span>
            </td>
            <td class="text-main cancel-menu-cell">{{ order.menuSummary }}</td>
            <td class="cancel-type-cell">
              <span
                class="status-badge cancel-type-badge"
                :class="getHistoryBadgeClass(order.orderStatus)"
              >
                {{ getHistoryCategory(order) }}
              </span>
            </td>
            <td class="text-main cancel-reason-text">
              {{ getHistoryDetail(order) }}
            </td>
            <td class="text-muted cancel-processed-at-cell">
              {{ getHistoryAt(order) }}
            </td>
          </tr>

          <tr v-if="historyOrders.length === 0">
            <td colspan="8" class="empty-message">
              조건에 맞는 취소/환불 이력이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</section>

    <article v-if="activeTab === 'platform'" class="card report-card">
      <div class="card-header">
        <div class="title-area">
          <h2>플랫폼별 정산 요약</h2>
          <p class="required-note">플랫폼별 주문 수, 취소율, 완료 매출, 예상 순수익을 비교합니다.</p>
        </div>
        <button class="primary-button" @click="exportExcel('플랫폼 정산')">플랫폼 정산 내보내기</button>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>플랫폼</th>
              <th>전체 주문</th>
              <th>완료 주문</th>
              <th>취소 주문</th>
              <th>환불 주문</th>
              <th>취소/환불률</th>
              <th>완료 매출</th>
              <th>예상 순수익</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="stat in platformStats" :key="stat.platformType">
              <td>
                <span class="platform-badge" :class="getPlatformClass(stat.platformType)">
                  {{ stat.name }}
                </span>
              </td>
              <td><strong class="order-no-main">{{ stat.total }}건</strong></td>
              <td><strong class="order-no-main">{{ stat.completed }}건</strong></td>
              <td><strong class="order-no-main">{{ stat.canceled }}건</strong></td>
              <td><strong class="order-no-main">{{ stat.refunded }}건</strong></td>
              <td><span class="text-main">{{ stat.closedRate }}%</span></td>
              <td>{{ formatMoney(stat.sales) }}</td>
              <td><strong class="profit-strong">{{ formatMoney(stat.profit) }}</strong></td>
            </tr>
            </tbody>
        </table>
      </div>
    </article>

    <section v-if="activeTab === 'export'" class="report-filter-export-layout">
      <section class="card">
        <div class="card-header border-bottom">
      <div class="title-area">
        <h2>필터 설정</h2>
        <p class="required-note">
          조건을 잡은 뒤, 같은 조건으로 화면 조회와 CSV 내보내기를 진행합니다.
        </p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="sub-button"
          @click="clearFilters"
          :disabled="reportStore.isLoading"
        >
          필터 초기화
        </button>

        <button
          type="button"
          class="primary-button"
          @click="searchReports"
          :disabled="reportStore.isLoading"
        >
          {{ reportStore.isLoading ? '조회 중...' : '조회' }}
          </button>
        </div>
      </div>
        
        <div class="report-filter-grid">
          <div class="filter-group">
            <label>시작일</label>
            <input type="date" v-model="filters.startDate">
          </div>
          <div class="filter-group">
            <label>종료일</label>
            <input type="date" v-model="filters.endDate">
          </div>
          <div class="filter-group compact">
            <label>플랫폼</label>
            <select v-model="filters.platform">
              <option value="">전체</option>
              <option value="BAEMIN">배달의민족</option>
              <option value="COUPANG_EATS">쿠팡이츠</option>
              <option value="YOGIYO">요기요</option>
              <option value="DDANGYO">땡겨요</option>
            </select>
          </div>
          <div class="filter-group compact">
            <label>상태</label>
            <select v-model="filters.status">
              <option value="">전체</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELED">취소</option>
              <option value="REFUNDED">환불</option>
            </select>
          </div>
          <div class="filter-group compact">
            <label>위험/확인</label>
            <select v-model="filters.risk">
              <option value="">전체</option>
              <option value="REQUEST">요구사항 확인</option>
              <option value="LOSS">손실 위험</option>
              <option value="CANCEL">취소 이력</option>
              <option value="REFUND">환불 이력</option>
            </select>
          </div>
          <div class="filter-group wide keyword-filter">
            <label>검색어</label>
            <input type="text" v-model="filters.keyword" placeholder="주문번호, 메뉴, 주소, 요구사항, 취소/환불 사유 검색">
          </div>
        </div>
        
        <div class="filter-result-line">
          현재 조건에 맞는 주문 <strong>{{ filteredOrders.length }}건</strong> ·
          완료 {{ salesOrders.length }}건 ·
          취소 {{ cancelOrders.length }}건 ·
          환불 {{ refundOrders.length }}건
        </div>
        <div class="export-preview-box">
        <div class="export-preview-header">
          <div>
            <h3>CSV 내보내기 미리보기</h3>
            <p>
              현재 필터 조건으로 조회된 주문 중 최대 5건을 먼저 보여줍니다.
            </p>
          </div>

          <span>
            총 {{ filteredOrders.length }}건
            <template v-if="hiddenPreviewCount > 0">
              · 외 {{ hiddenPreviewCount }}건
            </template>
          </span>
        </div>

        <div class="table-scroll">
          <table class="data-table preview-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>상태</th>
                <th>플랫폼 주문번호</th>
                <th>플랫폼</th>
                <th>메뉴</th>
                <th>주문금액</th>
                <th>예상 순수익</th>
                <th>취소/환불 사유</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in previewOrders" :key="order.orderNo">
                <td class="text-muted">{{ order.orderDate || '-' }}</td>

                <td>
                  <span
                    class="status-badge"
                    :class="getHistoryBadgeClass(order.orderStatus)"
                  >
                    {{ statusNames[order.orderStatus] || order.orderStatus }}
                  </span>
                </td>

                <td>
                  <strong class="order-no-main">
                    {{ order.platformOrderNo || '-' }}
                  </strong>
                </td>

                <td>
                  <span class="platform-badge" :class="getPlatformClass(order.platformType)">
                    {{ platformNames[order.platformType] || order.platformType }}
                  </span>
                </td>

                <td class="text-main">
                  {{ order.menuSummary }}
                </td>

                <td class="text-muted">
                  {{ formatMoney(order.totalAmount) }}
                </td>

                <td>
                  <strong
                    class="profit-strong"
                    :class="{ 'loss-text': Number(order.netProfit || 0) < 0 }"
                  >
                    {{ formatMoney(order.netProfit) }}
                  </strong>
                </td>

                <td class="text-main preview-reason">
                  {{ getPreviewHistoryText(order) }}
                </td>
              </tr>

              <tr v-if="previewOrders.length === 0">
                <td colspan="8" class="empty-message">
                  현재 필터 조건에 맞는 주문이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
        
        <div class="filter-export-row">
          <div>적용 필터: <strong>{{ filterSummaryText }}</strong></div>
          <button
            type="button"
            class="primary-button"
            @click="exportExcel('전체')"
            :disabled="reportStore.isExporting"
          >
            {{ reportStore.isExporting ? 'CSV 생성 중...' : '현재 필터 결과 CSV 내보내기' }}
          </button>
        </div>
      </section>

      <section class="grid-12 export-grid">
        <article class="card col-12 export-master-card">
          <div class="card-header">
            <div class="title-area">
              <h2>현재 필터 결과 전체 내보내기</h2>
              <p class="required-note">기간, 플랫폼, 상태, 위험/확인, 검색어 조건을 그대로 적용합니다.</p>
            </div>
            <button class="primary-button" @click="exportExcel('전체')">필터 결과 전체 CSV 생성</button>
          </div>
          <div class="info-banner" style="margin-bottom:0;">{{ filterSummaryText }} · 총 {{ filteredOrders.length }}건</div>
        </article>
        
        <article class="card col-4 export-card">
          <h3>매출 내보내기</h3>
          <p>현재 필터 결과 중 완료 주문 {{ salesOrders.length }}건의 상세 매출 항목을 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('매출')">필터 매출 CSV 생성</button>
        </article>
        
        <article class="card col-4 export-card">
          <h3>취소 이력 내보내기</h3>
          <p>현재 필터 결과 중 취소 주문 {{ cancelOrders.length }}건의 상세 사유를 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('취소')">필터 취소 CSV 생성</button>
        </article>

        <article class="card col-4 export-card">
          <h3>환불 이력 내보내기</h3>
          <p>현재 필터 결과 중 환불 주문 {{ refundOrders.length }}건의 상세 사유를 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('환불')">
            필터 환불 CSV 생성
          </button>
        </article>
        
        <article class="card col-4 export-card">
          <h3>플랫폼 정산 요약</h3>
          <p>현재 필터 결과 기준 플랫폼별 요약 통계를 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('플랫폼 정산')">필터 정산 CSV 생성</button>
        </article>

        <article class="card col-12">
          <div class="info-banner" style="margin-bottom:0;">
            HTML 시안에서는 브라우저 단독 실행을 위해 엑셀에서 열 수 있는 .xls 형식으로 내려받습니다. 실제 Spring Boot 구현에서는 Apache POI로 .xlsx 파일을 생성하면 됩니다.
          </div>
        </article>
      </section>
    </section>

  </section>
</template>

<style scoped>
/* ============================================================
   기본 레이아웃 및 폰트 시스템
   ============================================================ */
.report-page {
  min-height: calc(100vh - 70px);
  padding: 30px 40px;
  background-color: #f4f6fc;
  font-family: 'Pretendard', sans-serif;
  color: #164E68;
  box-sizing: border-box;
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
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  display: block;
}

.page-header h1 {
  font-size: 38px;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: #111827;
  line-height: 1.18;
}

.header-desc {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* ============================================================
   공통 버튼 스타일
   ============================================================ */
.primary-button,
.sub-button {
  font: inherit;
  cursor: pointer;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 900;
  transition: all 0.2s;
}

.primary-button { border: 0; color: #ffffff; background-color: #2784b8; }
.primary-button:hover { background-color: #1f6f99; }

.sub-button { border: 1px solid #dbe3ee; color: #334155; background-color: #ffffff; }
.sub-button:hover { background-color: #f8fafc; color: #164e68; border-color: #87ceeb; }

/* ============================================================
   탭 메뉴
   ============================================================ */
.report-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
  overflow-x: auto;
}

.report-tabs-under-title {
  margin-top: -4px;
  margin-bottom: 24px;
}

.tab {
  padding: 14px 22px;
  border: 0;
  background: transparent;
  font-weight: 800;
  font-size: 17px;
  color: #9ca3af;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
}

.tab.active {
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
  margin-bottom: -2px;
}

/* ============================================================
   메인 카드 프레임
   ============================================================ */
.card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-header.border-bottom {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
}

.title-area h2 {
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  margin: 0 0 8px 0;
}

.required-note {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.info-banner {
  background-color: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0f766e;
  padding: 18px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* ============================================================
   요약 카드 그리드 (매출 리포트용 4단)
   ============================================================ */
.report-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.summary-box {
  padding: 26px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fbfdff;
}

.summary-box.cancel-box {
  border-color: #fecaca;
  background: #fffafa;
}

.summary-box span {
  display: block;
  margin-bottom: 10px;
  color: #475569;
  font-size: 16px;
  font-weight: 800;
}

.summary-box strong {
  display: block;
  color: #111827;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.summary-box.cancel-box strong { color: #dc2626; }

.summary-box p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 15px;
  font-weight: 700;
}

/* ============================================================
   데이터 테이블 스타일 (전 탭 공통)
   ============================================================ */
.table-scroll { overflow-x: auto; }

.data-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
  text-align: center;
}

.data-table th {
  padding: 18px 16px;
  background-color: #f8fafc;
  color: #475569;
  font-size: 15px;
  font-weight: 900;
  border-top: 1px solid #f1f5f9;
  border-bottom: 2px solid #e5e7eb;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}

.data-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  vertical-align: middle;
}

.text-muted { color: #64748b; font-size: 16px; font-weight: 600; }
.text-main { color: #111827; font-size: 16px; font-weight: 800; }
.cancel-reason-text { white-space: normal; line-height: 1.5; min-width: 250px; }

.order-no-main { display: block; color: #111827; font-size: 17px; font-weight: 900; }
.order-no-sub { display: block; margin-top: 4px; color: #94a3b8; font-size: 14px; font-weight: 700; }
.profit-strong { color: #111827; font-size: 18px; font-weight: 900; }

.data-table .text-muted,
.data-table .text-main,
.data-table .order-no-main,
.data-table .order-no-sub,
.data-table .profit-strong,
.data-table .cancel-reason-text,
.data-table .preview-reason {
  text-align: center;
}

.data-table .platform-badge,
.data-table .status-badge {
  margin: 0 auto;
}

.platform-badge, .status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
}

.platform-badge {
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  color: #334155;
}

.platform-badge::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: #64748b;
}

.status-canceled { color: #b91c1c; background-color: #fee2e2; }

.status-refunded {
  color: #6d28d9;
  background-color: #ede9fe;
}

.empty-message {
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 16px;
  font-weight: 800;
}


/* ============================================================
   [탭 2] 취소 리포트 전용 레이아웃
   ============================================================ */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }

.report-cancel-layout { align-items: stretch; }

.cancel-summary-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cancel-type-list {
  display: grid;
  gap: 12px;
}

.cancel-type-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.cancel-type-list span { color: #334155; font-size: 16px; font-weight: 800; }
.cancel-type-list strong { color: #dc2626; font-size: 22px; font-weight: 900; }

/* ============================================================
   [탭 4] 손실 메뉴 리스트
   ============================================================ */
.loss-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.loss-menu-card {
  padding: 26px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
}

.loss-menu-card span { color: #64748b; font-size: 14px; font-weight: 900; }
.loss-menu-card h3 { margin: 10px 0 6px; color: #111827; font-size: 24px; }
.loss-menu-card strong { display: block; color: #3b82f6; font-size: 32px; font-weight: 900; }

.loss-menu-card.danger { border-color: #fecaca; background: #fff7f7; }
.loss-menu-card.danger strong { color: #dc2626; }

.loss-reason-list {
  display: grid;
  gap: 6px;
  margin-top: 16px;
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
}

.loss-menu-card.danger .loss-reason-list { background: #fff7f7; }

.loss-reason-list p { margin: 0; color: #475569; font-size: 15px; line-height: 1.6; font-weight: 700; }
.loss-menu-card.danger .loss-reason-list p { color: #7f1d1d; }

.loss-action-list {
  margin-top: 12px;
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
}
.loss-action-list b { display: block; margin-bottom: 8px; color: #0f172a; font-size: 18px; font-weight: 900; }
.loss-action-list p { margin: 6px 0; color: #164E68; font-size: 16px; font-weight: 800; line-height: 1.6; }

.loss-metric-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}
.loss-metric-row small {
  padding: 6px 12px;
  border-radius: 999px;
  color: #475569;
  background: #f3f4f6;
  font-weight: 800;
  font-size: 14px;
}

/* ============================================================
   [탭 5] 필터 / 내보내기 탭
   ============================================================ */
.report-filter-export-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-group.wide { min-width: 240px; }
.filter-group label { color: #64748b; font-size: 16px; font-weight: 900; }

.filter-group input,
.filter-group select {
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  color: #111827;
  background-color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  outline: none;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #87ceeb;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.24);
}

/* 화살표 커스텀 (select) */
.filter-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 40px;
  cursor: pointer;
}

.filter-result-line {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  font-size: 16px;
  font-weight: 800;
}

.filter-result-line strong { color: #164E68; font-size: 18px; font-weight: 1000; }

.filter-export-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 18px 24px;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  background: #f8fafc;
  color: #475569;
  font-size: 16px;
  font-weight: 800;
}
.filter-export-row strong { color: #164e68; }

.export-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.export-grid .export-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.export-card h3 { margin: 0; color: #111827; font-size: 22px; font-weight: 900; }
.export-card p { flex: 1; color: #64748b; font-size: 15px; line-height: 1.6; font-weight: 700; }

.card-button { width: 100%; margin-top: auto; }

.export-preview-box {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background-color: #f8fbff;
}

.export-preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.export-preview-header h3 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 17px;
}

.export-preview-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.export-preview-header span {
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 999px;
  color: #164e68;
  background-color: #eaf8fd;
  font-size: 12px;
  font-weight: 800;
}

.preview-table {
  min-width: 960px;
}

.preview-reason {
  max-width: 260px;
  line-height: 1.5;
}

.status-completed {
  color: #166534;
  background-color: #dcfce7;
}

.status-default {
  color: #475569;
  background-color: #f1f5f9;
}

.loss-text {
  color: #dc2626;
}

/* ============================================================
   반응형
   ============================================================ */
@media (max-width: 1400px) {
  .report-filter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .report-filter-grid .filter-group.wide { grid-column: span 3; }
}

@media (max-width: 1100px) {
  .report-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .report-cancel-layout .col-4,
  .report-cancel-layout .col-8 { grid-column: span 12; }
  .loss-menu-grid { grid-template-columns: 1fr; }
  .export-grid .col-4 { grid-column: span 12; }
}

@media (max-width: 768px) {
  .report-page { padding: 20px; }
  .page-header { flex-direction: column; align-items: stretch; gap: 16px; }
  .header-actions { justify-content: flex-start; }
  .report-filter-grid,
  .report-filter-grid .filter-group.wide { grid-template-columns: 1fr; grid-column: span 1; }
  .report-summary-grid { grid-template-columns: 1fr; }
  .filter-export-row { flex-direction: column; align-items: stretch; }
  .filter-export-row .primary-button { width: 100%; }
}



/* ============================================================
   2026-06-27 리포트 테이블 / 필터 / 글자 굵기 보정
   ============================================================ */
.report-page {
  padding: 22px 28px;
}

.page-header.report-page-header {
  gap: 16px;
}

.page-header h1 {
  font-weight: 700;
}

.header-desc,
.required-note {
  font-weight: 500;
}

.primary-button,
.sub-button,
.tab {
  font-weight: 700;
}

.report-summary-grid {
  gap: 12px;
  margin-bottom: 22px;
}

.summary-box {
  padding: 20px 22px;
}

.summary-box span,
.summary-box p {
  font-weight: 500;
}

.summary-box strong {
  font-size: 30px;
  font-weight: 700;
  white-space: nowrap;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  table-layout: fixed;
}

.data-table th {
  padding: 15px 12px;
  font-weight: 700;
  white-space: nowrap;
}

.data-table td {
  padding: 15px 12px;
  white-space: nowrap;
}

.data-table .text-muted,
.data-table .text-main,
.data-table .profit-strong {
  white-space: nowrap;
}

.text-muted {
  font-weight: 500;
}

.text-main,
.order-no-main,
.profit-strong {
  font-weight: 700;
}

.order-no-main {
  word-break: break-all;
  white-space: normal;
}

.profit-strong {
  white-space: nowrap;
}

.platform-badge,
.status-badge {
  font-weight: 700;
}

.sales-report-combined-card .data-table {
  min-width: 1180px;
}

.sales-report-combined-card .data-table th:nth-child(1),
.sales-report-combined-card .data-table td:nth-child(1) { width: 78px; }
.sales-report-combined-card .data-table th:nth-child(2),
.sales-report-combined-card .data-table td:nth-child(2) { width: 145px; }
.sales-report-combined-card .data-table th:nth-child(3),
.sales-report-combined-card .data-table td:nth-child(3) { width: 90px; }
.sales-report-combined-card .data-table th:nth-child(4),
.sales-report-combined-card .data-table td:nth-child(4) { width: 145px; }
.sales-report-combined-card .data-table th:nth-child(5),
.sales-report-combined-card .data-table td:nth-child(5),
.sales-report-combined-card .data-table th:nth-child(6),
.sales-report-combined-card .data-table td:nth-child(6),
.sales-report-combined-card .data-table th:nth-child(7),
.sales-report-combined-card .data-table td:nth-child(7),
.sales-report-combined-card .data-table th:nth-child(8),
.sales-report-combined-card .data-table td:nth-child(8),
.sales-report-combined-card .data-table th:nth-child(9),
.sales-report-combined-card .data-table td:nth-child(9),
.sales-report-combined-card .data-table th:nth-child(10),
.sales-report-combined-card .data-table td:nth-child(10),
.sales-report-combined-card .data-table th:nth-child(11),
.sales-report-combined-card .data-table td:nth-child(11),
.sales-report-combined-card .data-table th:nth-child(12),
.sales-report-combined-card .data-table td:nth-child(12) { width: 92px; }
.sales-report-combined-card .data-table th:nth-child(13),
.sales-report-combined-card .data-table td:nth-child(13) { width: 108px; }

.report-cancel-layout .data-table {
  min-width: 1180px;
  table-layout: fixed;
}

.report-cancel-layout .data-table th:nth-child(1),
.report-cancel-layout .data-table td:nth-child(1) { width: 78px; }
.report-cancel-layout .data-table th:nth-child(2),
.report-cancel-layout .data-table td:nth-child(2) { width: 78px; }
.report-cancel-layout .data-table th:nth-child(3),
.report-cancel-layout .data-table td:nth-child(3) { width: 150px; }
.report-cancel-layout .data-table th:nth-child(4),
.report-cancel-layout .data-table td:nth-child(4) { width: 90px; }
.report-cancel-layout .data-table th:nth-child(5),
.report-cancel-layout .data-table td:nth-child(5) { width: 170px; }
.report-cancel-layout .data-table th:nth-child(6),
.report-cancel-layout .data-table td:nth-child(6) { width: 120px; }
.report-cancel-layout .data-table th:nth-child(7),
.report-cancel-layout .data-table td:nth-child(7) { width: 360px; }
.report-cancel-layout .data-table th:nth-child(8),
.report-cancel-layout .data-table td:nth-child(8) { width: 120px; }

.cancel-reason-text,
.report-cancel-layout .data-table td:nth-child(7) {
  min-width: 0;
  white-space: normal;
  word-break: keep-all;
  line-height: 1.45;
}

.report-cancel-layout .data-table td:nth-child(5) {
  white-space: normal;
  word-break: keep-all;
  line-height: 1.45;
}

.cancel-type-list > div {
  gap: 14px;
  padding: 18px 22px;
}

.cancel-type-list span {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  line-height: 1.45;
}

.cancel-type-list strong {
  flex-shrink: 0;
  font-weight: 700;
  white-space: nowrap;
}

.report-filter-grid {
  grid-template-columns: minmax(130px, .8fr) minmax(130px, .8fr) minmax(130px, .8fr) minmax(260px, 2.4fr);
  gap: 14px;
}

.filter-group label,
.filter-result-line,
.filter-export-row,
.export-card p,
.export-preview-header span {
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  font-weight: 500;
}

.filter-export-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.filter-export-row .primary-button {
  min-width: 180px;
  white-space: nowrap;
}

.export-card h3,
.export-preview-header h3 {
  font-weight: 700;
}

.preview-table {
  min-width: 1040px;
}

.preview-reason {
  max-width: none;
  white-space: normal;
  word-break: keep-all;
}

@media (max-width: 1400px) {
  .report-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .report-filter-grid .filter-group.wide {
    grid-column: span 3;
  }
}


/* ============================================================
   2026-06-27 01:39 최신 기준 리포트 레이아웃 보정
   ============================================================ */
.report-filter-grid {
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
}

.report-filter-grid .filter-group.wide,
.report-filter-grid .keyword-filter {
  grid-column: span 3;
  min-width: 0;
}

.filter-group input,
.filter-group select {
  width: 100%;
  box-sizing: border-box;
}

.report-cancel-layout .data-table {
  min-width: 1120px;
  table-layout: fixed;
}

.report-cancel-layout .data-table th:nth-child(1),
.report-cancel-layout .data-table td:nth-child(1) { width: 86px; }
.report-cancel-layout .data-table th:nth-child(2),
.report-cancel-layout .data-table td:nth-child(2) { width: 76px; }
.report-cancel-layout .data-table th:nth-child(3),
.report-cancel-layout .data-table td:nth-child(3) { width: 150px; }
.report-cancel-layout .data-table th:nth-child(4),
.report-cancel-layout .data-table td:nth-child(4) { width: 96px; }
.report-cancel-layout .data-table th:nth-child(5),
.report-cancel-layout .data-table td:nth-child(5) { width: 150px; }
.report-cancel-layout .data-table th:nth-child(6),
.report-cancel-layout .data-table td:nth-child(6) { width: 110px; }
.report-cancel-layout .data-table th:nth-child(7),
.report-cancel-layout .data-table td:nth-child(7) { width: 330px; }
.report-cancel-layout .data-table th:nth-child(8),
.report-cancel-layout .data-table td:nth-child(8) { width: 122px; }

.report-cancel-layout .data-table td:nth-child(6),
.report-cancel-layout .data-table td:nth-child(6) .status-badge {
  white-space: nowrap;
}

.cancel-reason-text,
.report-cancel-layout .data-table td:nth-child(7) {
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.cancel-type-list > div {
  gap: 14px;
}

.cancel-type-list span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.cancel-type-list strong {
  white-space: nowrap;
}

@media (max-width: 1400px) {
  .report-filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .report-filter-grid .filter-group.wide,
  .report-filter-grid .keyword-filter {
    grid-column: span 3;
  }
}

@media (max-width: 900px) {
  .report-filter-grid,
  .report-filter-grid .filter-group.wide,
  .report-filter-grid .keyword-filter {
    grid-template-columns: 1fr;
    grid-column: span 1;
  }
}



/* ============================================================
   2026-06-27 취소/환불 이력 테이블 실제 적용 보정
   - 작은 화면에서는 테이블 내부 가로 스크롤을 사용한다.
   - 유형/상세사유가 겹치지 않도록 colgroup으로 폭을 고정한다.
   ============================================================ */
.report-cancel-layout .report-card {
  min-width: 0;
  overflow: hidden;
}

.cancel-history-scroll {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden;
  padding-bottom: 8px;
}

.cancel-history-table {
  width: 100%;
  min-width: 1380px !important;
  table-layout: fixed !important;
  border-collapse: collapse;
}

.cancel-history-table .cancel-col-date { width: 120px; }
.cancel-history-table .cancel-col-status { width: 86px; }
.cancel-history-table .cancel-col-order-no { width: 210px; }
.cancel-history-table .cancel-col-platform { width: 140px; }
.cancel-history-table .cancel-col-menu { width: 220px; }
.cancel-history-table .cancel-col-type { width: 190px; }
.cancel-history-table .cancel-col-reason { width: 300px; }
.cancel-history-table .cancel-col-processed-at { width: 160px; }

.cancel-history-table th,
.cancel-history-table td {
  text-align: center !important;
  vertical-align: middle !important;
  box-sizing: border-box;
}

.cancel-history-table th {
  padding: 16px 12px !important;
  white-space: nowrap !important;
}

.cancel-history-table td {
  padding: 18px 12px !important;
}

.cancel-date-cell,
.cancel-status-cell,
.cancel-platform-cell,
.cancel-type-cell,
.cancel-processed-at-cell {
  white-space: nowrap !important;
}

.cancel-order-no-cell .order-no-main {
  max-width: 190px;
  margin: 0 auto;
  white-space: normal !important;
  word-break: break-all;
  line-height: 1.35;
}

.cancel-menu-cell {
  white-space: normal !important;
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.cancel-type-cell .status-badge,
.cancel-type-badge {
  max-width: 170px;
  margin: 0 auto !important;
  padding: 0 12px !important;
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cancel-reason-text {
  min-width: 0 !important;
  max-width: none !important;
  white-space: normal !important;
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-height: 1.55 !important;
  text-align: center !important;
}

.cancel-processed-at-cell {
  min-width: 150px;
}


/* ============================================================
   손실 메뉴 분석 통합 안내 카드
   ============================================================ */
.report-loss-redirect-card {
  overflow: hidden;
}

.report-loss-unified-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 18px;
  margin-top: 10px;
}

.report-loss-unified-main,
.report-loss-unified-points {
  min-width: 0;
  padding: 24px;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: #f8fbff;
}

.report-loss-unified-main span {
  color: #2784b8;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.report-loss-unified-main h3 {
  margin: 10px 0 10px;
  color: #111827;
  font-size: 25px;
  font-weight: 850;
  line-height: 1.35;
}

.report-loss-unified-main p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.65;
}

.report-loss-unified-points {
  display: grid;
  gap: 12px;
  background: #ffffff;
}

.report-loss-unified-points div {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  column-gap: 12px;
  row-gap: 4px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f8fafc;
}

.report-loss-unified-points strong {
  grid-row: span 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #ffffff;
  background: #2784b8;
  font-size: 17px;
  font-weight: 900;
}

.report-loss-unified-points span {
  color: #111827;
  font-size: 16px;
  font-weight: 850;
}

.report-loss-unified-points p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .report-loss-unified-layout {
    grid-template-columns: 1fr;
  }
}

</style>