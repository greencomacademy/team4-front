<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ==========================================
// 1. 상태 관리 (탭 및 필터)
// ==========================================
const activeTab = ref('sales');

const today = new Date().toISOString().split('T')[0];
const filters = ref({
  startDate: '2026-06-17',
  endDate: '2026-06-23',
  platform: '',
  status: '',
  risk: '',
  keyword: ''
});

// ==========================================
// 2. Mock 데이터 세팅 (이미지 시안 기준)
// ==========================================
const platformNames = { BAEMIN: '배민', COUPANG_EATS: '쿠팡이츠', YOGIYO: '요기요', DDANGYO: '땡겨요' };
const statusNames = { WAITING: '접수대기', COOKING: '조리중', DELIVERING: '배달중', COMPLETED: '완료', CANCELED: '취소', REFUNDED: '환불' };
const riskNames = { REQUEST: '요구사항 확인', DELAY: '지연 위험', LOSS: '손실 위험', CANCEL: '취소 이력' };

// 손실 메뉴 분석용 더미 메뉴 데이터
const menus = ref([
  { name: '묵은지 김치찜', price: 24500, cost: 9300, packageCost: 1040, cookingTime: 25, orderCount: 18, profitRate: 31.4 },
  { name: '단체 도시락 세트', price: 15000, cost: 7000, packageCost: 700, cookingTime: 60, orderCount: 11, profitRate: 19.8 },
  { name: '로제 파스타', price: 14000, cost: 5200, packageCost: 1080, cookingTime: 15, orderCount: 21, profitRate: 8.2 },
  { name: '치킨 덮밥', price: 12000, cost: 4800, packageCost: 600, cookingTime: 18, orderCount: 24, profitRate: 27.5 },
]);

const orders = ref([
  {
    orderDate: '2026-06-23', orderNo: 'ORD-00004', platformOrderNo: 'D-2901', platformType: 'DDANGYO', 
    menuSummary: '모듬 세트', orderStatus: 'COMPLETED', totalAmount: 76000, netProfit: 28400,
    commissionAmount: 4560, deliveryFeeAmount: 2500, couponAmount: 2000, menuCostAmount: 35000, packagingAmount: 3540,
    completedAt: '12:28', cancelReason: '', riskBadges: [], lossRisk: false
  },
  {
    orderDate: '2026-06-22', orderNo: 'ORD-90001', platformOrderNo: 'B-9017', platformType: 'BAEMIN', 
    menuSummary: '묵은지 김치찜', orderStatus: 'COMPLETED', totalAmount: 24500, netProfit: 9200,
    commissionAmount: 1960, deliveryFeeAmount: 2000, couponAmount: 1000, menuCostAmount: 9300, packagingAmount: 1040,
    completedAt: '19:13', cancelReason: '', riskBadges: [], lossRisk: false
  },
  {
    orderDate: '2026-06-21', orderNo: 'ORD-90002', platformOrderNo: 'C-6132', platformType: 'COUPANG_EATS', 
    menuSummary: '단체 도시락 세트', orderStatus: 'CANCELED', totalAmount: 90000, netProfit: 0,
    commissionAmount: 7200, deliveryFeeAmount: 4500, couponAmount: 3000, menuCostAmount: 42000, packagingAmount: 4200,
    canceledAt: '12:15', cancelReason: '고객 요청 · 회의 일정 변경으로 고객이 취소를 요청했습니다.', riskBadges: ['배달 전달 주의'], lossRisk: false
  },
  {
    orderDate: '2026-06-20', orderNo: 'ORD-90003', platformOrderNo: 'Y-3842', platformType: 'YOGIYO', 
    menuSummary: '로제 파스타 세트', orderStatus: 'COMPLETED', totalAmount: 28000, netProfit: 1800,
    commissionAmount: 2240, deliveryFeeAmount: 2500, couponAmount: 2000, menuCostAmount: 10400, packagingAmount: 2160,
    completedAt: '19:48', cancelReason: '', riskBadges: ['과도 요청'], lossRisk: true
  },
  {
    orderDate: '2026-06-23', orderNo: 'ORD-00006', platformOrderNo: 'Y-9281', platformType: 'YOGIYO', 
    menuSummary: '치즈 돈까스 세트', orderStatus: 'CANCELED', totalAmount: 18500, netProfit: 0,
    commissionAmount: 1570, deliveryFeeAmount: 2800, couponAmount: 1000, menuCostAmount: 8200, packagingAmount: 750,
    canceledAt: '12:19', cancelReason: '재료 소진 · 치즈 재고 부족으로 점주가 취소 처리했습니다.', riskBadges: [], lossRisk: false
  }
]);

// ==========================================
// 3. Computed (필터링 및 요약 연산)
// ==========================================
const formatMoney = (val) => `${Number(val || 0).toLocaleString('ko-KR')}원`;

// 전체 필터 적용 로직
const filteredOrders = computed(() => {
  const { startDate, endDate, platform, status, risk, keyword } = filters.value;
  const lowerKeyword = keyword.trim().toLowerCase();

  return orders.value.filter(order => {
    const dateMatched = (!startDate || order.orderDate >= startDate) && (!endDate || order.orderDate <= endDate);
    const platformMatched = !platform || order.platformType === platform;
    const statusMatched = !status || order.orderStatus === status;
    const keywordMatched = !lowerKeyword ||
      order.orderNo.toLowerCase().includes(lowerKeyword) ||
      order.platformOrderNo.toLowerCase().includes(lowerKeyword) ||
      order.menuSummary.toLowerCase().includes(lowerKeyword) ||
      (order.cancelReason || '').toLowerCase().includes(lowerKeyword);

    let riskMatched = true;
    if (risk === 'REQUEST') riskMatched = order.riskBadges.length > 0;
    if (risk === 'LOSS') riskMatched = order.lossRisk;
    if (risk === 'CANCEL') riskMatched = order.orderStatus === 'CANCELED';

    return dateMatched && platformMatched && statusMatched && keywordMatched && riskMatched;
  });
});

const salesOrders = computed(() => filteredOrders.value.filter(o => o.orderStatus === 'COMPLETED'));
const cancelOrders = computed(() => filteredOrders.value.filter(o => o.orderStatus === 'CANCELED'));

// 상단 매출/취소 카드 요약
const summaryStats = computed(() => {
  const completed = salesOrders.value;
  const canceled = cancelOrders.value;
  const totalSales = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProfit = completed.reduce((sum, o) => sum + o.netProfit, 0);
  const cancelRate = filteredOrders.value.length ? Math.round((canceled.length / filteredOrders.value.length) * 1000) / 10 : 0;
  
  return { 
    totalSales, 
    totalProfit, 
    cancelCount: canceled.length, 
    cancelRate, 
    totalCount: filteredOrders.value.length,
    completedCount: completed.length
  };
});

// 취소 유형 통계
const cancelTypeSummary = computed(() => {
  return cancelOrders.value.reduce((acc, order) => {
    const key = order.cancelReason ? order.cancelReason.split('·')[0].trim() : '기타';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
});

// 플랫폼 정산 통계
const platformStats = computed(() => {
  return Object.keys(platformNames).map(platform => {
    const pOrders = filteredOrders.value.filter(o => o.platformType === platform);
    const pCompleted = pOrders.filter(o => o.orderStatus === 'COMPLETED');
    const pCanceled = pOrders.filter(o => o.orderStatus === 'CANCELED');
    const sales = pCompleted.reduce((sum, o) => sum + o.totalAmount, 0);
    const profit = pCompleted.reduce((sum, o) => sum + o.netProfit, 0);
    const cancelRate = pOrders.length ? Math.round((pCanceled.length / pOrders.length) * 1000) / 10 : 0;
    
    return { 
      name: platformNames[platform], 
      total: pOrders.length, 
      completed: pCompleted.length, 
      canceled: pCanceled.length, 
      cancelRate, 
      sales, 
      profit 
    };
  });
});

// 손실 메뉴 분석 로직
const analyzedLossMenus = computed(() => {
  return menus.value.map(menu => {
    const costRate = Math.round((menu.cost / menu.price) * 1000) / 10;
    const packageRate = Math.round((menu.packageCost / menu.price) * 1000) / 10;
    
    const reasons = [];
    if (menu.profitRate < 12) reasons.push(`예상 순수익률이 ${menu.profitRate}%로 낮습니다.`);
    if (costRate >= 35) reasons.push(`원가 비중이 ${costRate}%로 높습니다.`);
    if (packageRate >= 7) reasons.push(`포장비 비중이 ${packageRate}%입니다.`);
    if (menu.orderCount >= 20 && menu.profitRate < 15) reasons.push('주문 수가 많아 낮은 마진이 누적될 가능성이 큽니다.');

    const actions = [];
    if (costRate >= 35) actions.push('원재료 원가 또는 판매가 재검토');
    if (packageRate >= 7) actions.push('포장비가 높은 메뉴는 묶음 주문 유도');
    if (menu.profitRate < 10) actions.push('쿠폰 부담금 적용 여부 확인');

    return { ...menu, costRate, packageRate, reasons, actions };
  }).filter(m => m.profitRate < 12 || (m.orderCount >= 20 && m.profitRate < 15));
});

// 필터 안내 문구
const filterSummaryText = computed(() => {
  const f = filters.value;
  const pName = f.platform ? platformNames[f.platform] : '전체 플랫폼';
  const sName = f.status ? statusNames[f.status] : '전체 상태';
  const rName = f.risk ? riskNames[f.risk] : '전체 위험/확인';
  const kw = f.keyword.trim() ? `검색어 '${f.keyword.trim()}'` : '검색어 없음';
  return `기간 ${f.startDate || '전체'} ~ ${f.endDate || '전체'} · ${pName} · ${sName} · ${rName} · ${kw}`;
});

// ==========================================
// 4. 유틸리티 함수
// ==========================================
const getPlatformClass = (type) => ({ BAEMIN: 'baemin', COUPANG_EATS: 'coupang', YOGIYO: 'yogiyo', DDANGYO: 'ddangyo' }[type] || 'default');

const clearFilters = () => {
  filters.value = { startDate: '2026-06-17', endDate: today, platform: '', status: '', risk: '', keyword: '' };
};

const getCancelCategory = (reason) => reason ? reason.split('·')[0].trim() : '-';
const getCancelDetail = (reason) => reason && reason.includes('·') ? reason.split('·').slice(1).join('·').trim() : reason || '-';

const exportExcel = (type) => {
  alert(`${type} 데이터를 엑셀로 내보냅니다. (Mock)`);
};

const goToMenuManagement = () => {
  router.push('/menus');
};
</script>

<template>
  <section class="report-page page-section">
    <header class="page-header report-page-header">
      <div>
        <span class="category-text">OPERATION REPORT</span>
        <h1>운영 리포트</h1>
        <p class="header-desc">매출, 취소, 플랫폼 정산, 손실 메뉴를 날짜와 조건별로 확인하고 파일로 내보냅니다.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="sub-button" @click="activeTab = 'cancel'">취소 리포트</button>
        <button type="button" class="primary-button" @click="activeTab = 'export'">필터/엑셀 내보내기</button>
      </div>
    </header>

    <div class="tabs-mock report-tabs report-tabs-under-title">
      <button class="tab" :class="{ active: activeTab === 'sales' }" @click="activeTab = 'sales'">매출 리포트</button>
      <button class="tab" :class="{ active: activeTab === 'cancel' }" @click="activeTab = 'cancel'">취소 리포트</button>
      <button class="tab" :class="{ active: activeTab === 'platform' }" @click="activeTab = 'platform'">플랫폼별 정산 요약</button>
      <button class="tab" :class="{ active: activeTab === 'loss' }" @click="activeTab = 'loss'">손실 메뉴 분석</button>
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
              <th>수수료</th>
              <th>배달비</th>
              <th>쿠폰</th>
              <th>예상 순수익</th>
              <th>완료시각</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in salesOrders" :key="order.orderNo">
              <td class="text-muted">{{ order.orderDate }}</td>
              <td>
                <strong class="order-no-main">{{ order.platformOrderNo }}</strong>
                <small class="order-no-sub">관리번호 {{ order.orderNo }}</small>
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
              <td><strong class="profit-strong">{{ formatMoney(order.netProfit) }}</strong></td>
              <td class="text-muted">{{ order.completedAt }}</td>
            </tr>
            <tr v-if="salesOrders.length === 0">
              <td colspan="10" class="empty-message">조건에 맞는 완료 주문이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <section v-if="activeTab === 'cancel'" class="grid-12 report-cancel-layout">
      <article class="card col-4 cancel-summary-card">
        <div class="card-header">
          <div class="title-area">
            <h2>취소 사유 요약</h2>
            <p class="required-note">취소 유형별 건수</p>
          </div>
        </div>
        <div class="cancel-type-list">
          <div v-for="(count, type) in cancelTypeSummary" :key="type">
            <span>{{ type }}</span><strong>{{ count }}건</strong>
          </div>
          <div v-if="Object.keys(cancelTypeSummary).length === 0">
            <span>취소 이력 없음</span><strong>0건</strong>
          </div>
        </div>
        <div class="info-banner">어떤 이유로 매출 손실이 발생했는지 빠르게 확인할 수 있습니다.</div>
      </article>

      <article class="card col-8 report-card">
        <div class="card-header">
          <div class="title-area">
            <h2>취소 이력 모음</h2>
            <p class="required-note">주문 상세에 흩어진 취소 이력을 한 곳에서 확인합니다.</p>
          </div>
          <button class="primary-button" @click="exportExcel('취소')">취소 내보내기</button>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>플랫폼 주문번호</th>
                <th>플랫폼</th>
                <th>메뉴</th>
                <th>취소유형</th>
                <th>상세사유</th>
                <th>취소시각</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in cancelOrders" :key="order.orderNo">
                <td class="text-muted">{{ order.orderDate }}</td>
                <td>
                  <strong class="order-no-main">{{ order.platformOrderNo }}</strong>
                  <small class="order-no-sub">관리번호 {{ order.orderNo }}</small>
                </td>
                <td>
                  <span class="platform-badge" :class="getPlatformClass(order.platformType)">
                    {{ platformNames[order.platformType] }}
                  </span>
                </td>
                <td class="text-main">{{ order.menuSummary }}</td>
                <td><span class="status-badge status-canceled">{{ getCancelCategory(order.cancelReason) }}</span></td>
                <td class="text-main cancel-reason-text">{{ getCancelDetail(order.cancelReason) }}</td>
                <td class="text-muted">{{ order.canceledAt }}</td>
              </tr>
              <tr v-if="cancelOrders.length === 0">
                <td colspan="7" class="empty-message">조건에 맞는 취소 이력이 없습니다.</td>
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
              <th>취소율</th>
              <th>완료 매출</th>
              <th>예상 순수익</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in platformStats" :key="stat.name">
              <td>
                <span class="platform-badge default">
                  {{ stat.name }}
                </span>
              </td>
              <td><strong class="order-no-main">{{ stat.total }}건</strong></td>
              <td><strong class="order-no-main">{{ stat.completed }}건</strong></td>
              <td><strong class="order-no-main">{{ stat.canceled }}건</strong></td>
              <td><span class="text-main">{{ stat.cancelRate }}%</span></td>
              <td>{{ formatMoney(stat.sales) }}</td>
              <td><strong class="profit-strong">{{ formatMoney(stat.profit) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article v-if="activeTab === 'loss'" class="card report-card">
      <div class="card-header">
        <div class="title-area">
          <h2>손실 메뉴 분석</h2>
          <p class="required-note">손실 위험 메뉴를 리포트에서 자세히 확인합니다.</p>
        </div>
        <button class="primary-button" @click="goToMenuManagement">메뉴 수익 관리로 이동</button>
      </div>
      
      <div class="info-banner">판정 기준: 주문 수가 많으면서 순수익률이 낮거나, 원가·포장비·플랫폼 비용 비중이 높은 메뉴를 우선 확인 대상으로 봅니다.</div>
      
      <div class="loss-menu-grid">
        <article v-for="(menu, idx) in analyzedLossMenus" :key="idx" class="loss-menu-card" :class="{ danger: menu.profitRate < 12 }">
          <span>{{ menu.orderCount > 20 ? '주문 많음' : '저마진' }}</span>
          <h3>{{ menu.name }}</h3>
          <strong>{{ menu.profitRate }}%</strong>
          
          <div class="loss-reason-list">
            <p v-for="(reason, rIdx) in menu.reasons" :key="rIdx">• {{ reason }}</p>
          </div>
          
          <div class="loss-action-list">
            <b>추천 조치</b>
            <p v-for="(action, aIdx) in menu.actions" :key="aIdx">→ {{ action }}</p>
          </div>
          
          <div class="loss-metric-row">
            <small>판매가 {{ formatMoney(menu.price) }}</small>
            <small>원가율 {{ menu.costRate }}%</small>
            <small>포장비율 {{ menu.packageRate }}%</small>
          </div>
        </article>
        <div v-if="analyzedLossMenus.length === 0" class="empty-message" style="grid-column: span 4;">
          현재 숨은 손실 메뉴가 없습니다. 안정적으로 운영 중입니다.
        </div>
      </div>
    </article>

    <section v-if="activeTab === 'export'" class="report-filter-export-layout">
      <section class="card">
        <div class="card-header border-bottom">
          <div class="title-area">
            <h2>필터 설정</h2>
            <p class="required-note">조건을 잡은 뒤, 같은 조건으로 화면 조회와 엑셀 내보내기를 진행합니다.</p>
          </div>
          <button type="button" class="sub-button" @click="clearFilters">필터 초기화</button>
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
          <div class="filter-group">
            <label>플랫폼</label>
            <select v-model="filters.platform">
              <option value="">전체</option>
              <option value="BAEMIN">배달의민족</option>
              <option value="COUPANG_EATS">쿠팡이츠</option>
              <option value="YOGIYO">요기요</option>
              <option value="DDANGYO">땡겨요</option>
            </select>
          </div>
          <div class="filter-group">
            <label>상태</label>
            <select v-model="filters.status">
              <option value="">전체</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELED">취소</option>
            </select>
          </div>
          <div class="filter-group">
            <label>위험/확인</label>
            <select v-model="filters.risk">
              <option value="">전체</option>
              <option value="REQUEST">요구사항 확인</option>
              <option value="LOSS">손실 위험</option>
              <option value="CANCEL">취소 이력</option>
            </select>
          </div>
          <div class="filter-group wide">
            <label>검색어</label>
            <input type="text" v-model="filters.keyword" placeholder="주문번호, 메뉴, 주소, 요구사항, 취소사유 검색">
          </div>
        </div>
        
        <div class="filter-result-line">
          현재 조건에 맞는 주문 <strong>{{ filteredOrders.length }}건</strong> · 
          완료 {{ salesOrders.length }}건 · 취소 {{ cancelOrders.length }}건 · 주문 이력 저장기한 90일
        </div>
        
        <div class="filter-export-row">
          <div>적용 필터: <strong>{{ filterSummaryText }}</strong></div>
          <button type="button" class="primary-button" @click="exportExcel('전체')">현재 필터 결과 엑셀 내보내기</button>
        </div>
      </section>

      <section class="grid-12 export-grid">
        <article class="card col-12 export-master-card">
          <div class="card-header">
            <div class="title-area">
              <h2>현재 필터 결과 전체 내보내기</h2>
              <p class="required-note">기간, 플랫폼, 상태, 위험/확인, 검색어 조건을 그대로 적용합니다.</p>
            </div>
            <button class="primary-button" @click="exportExcel('전체')">필터 결과 전체 생성</button>
          </div>
          <div class="info-banner" style="margin-bottom:0;">{{ filterSummaryText }} · 총 {{ filteredOrders.length }}건</div>
        </article>
        
        <article class="card col-4 export-card">
          <h3>매출 내보내기</h3>
          <p>현재 필터 결과 중 완료 주문 {{ salesOrders.length }}건의 상세 매출 항목을 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('매출')">필터 매출 생성</button>
        </article>
        
        <article class="card col-4 export-card">
          <h3>취소 이력 내보내기</h3>
          <p>현재 필터 결과 중 취소 주문 {{ cancelOrders.length }}건의 상세 사유를 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('취소')">필터 취소 생성</button>
        </article>
        
        <article class="card col-4 export-card">
          <h3>플랫폼 정산 요약</h3>
          <p>현재 필터 결과 기준 플랫폼별 요약 통계를 저장합니다.</p>
          <button class="primary-button card-button" @click="exportExcel('플랫폼 정산')">필터 정산 생성</button>
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
  text-align: left;
}

.data-table th {
  padding: 18px 16px;
  background-color: #f8fafc;
  color: #475569;
  font-size: 15px;
  font-weight: 900;
  border-top: 1px solid #f1f5f9;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.text-muted { color: #64748b; font-size: 16px; font-weight: 600; }
.text-main { color: #111827; font-size: 16px; font-weight: 800; }
.cancel-reason-text { white-space: normal; line-height: 1.5; min-width: 250px; }

.order-no-main { display: block; color: #111827; font-size: 17px; font-weight: 900; }
.order-no-sub { display: block; margin-top: 4px; color: #94a3b8; font-size: 14px; font-weight: 700; }
.profit-strong { color: #111827; font-size: 18px; font-weight: 900; }

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
</style>