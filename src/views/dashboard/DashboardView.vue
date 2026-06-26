<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';

const router = useRouter();
const dashboardStore = useDashboardStore();

const priorityCurrentPage = ref(1);
const priorityPageSize = 3;

const platformNames = {
  BAEMIN: '배민',
  COUPANG_EATS: '쿠팡이츠',
  YOGIYO: '요기요',
  DDANGYO: '땡겨요',
};

const defaultSummary = {
  sales: 0,
  profit: 0,
  completedCount: 0,
  activeCount: 0,
  waiting: 0,
  cooking: 0,
  delivering: 0,
  delayRisk: 0,
  requestRisk: 0,
  lossRisk: 0,
  cancelRate: 0,
  loadRate: 0,
  level: '정상',
  message: '대시보드 데이터를 불러오는 중입니다.',
};

const getPlatformName = (platformType) => {
  return platformNames[platformType] || platformType || '-';
};

const getOperationLevel = (data = {}) => {
  const loadRate = Number(data.loadRate || 0);
  const delayRisk = Number(data.delayRiskCount || 0);
  const requestRisk = Number(data.requestRiskCount || 0);
  const lossRisk = Number(data.lossRiskCount || 0);
  const kitchenLoadLevel = data.kitchenLoadLevel || '';

  if (kitchenLoadLevel === 'OVERLOAD' || loadRate >= 100 || delayRisk >= 3) {
    return '위험';
  }

  if (
    kitchenLoadLevel === 'HIGH' ||
    loadRate >= 70 ||
    delayRisk >= 1 ||
    requestRisk >= 2 ||
    lossRisk >= 1
  ) {
    return '주의';
  }

  return '정상';
};

const getBriefTone = (level) => {
  if (level === '위험') {
    return 'danger';
  }

  if (level === '주의') {
    return 'warning';
  }

  return 'safe';
};

const summary = computed(() => {
  const data = dashboardStore.operationSummary;

  if (!data) {
    return defaultSummary;
  }

  const level = getOperationLevel(data);

  return {
    sales: data.todaySales || 0,
    profit: data.todayNetProfit || 0,

    completedCount: data.completedCount || 0,
    activeCount: data.progressOrderCount || 0,

    waiting: data.waitingCount || 0,
    cooking: data.cookingCount || 0,
    delivering: data.deliveringCount || 0,

    delayRisk: data.delayRiskCount || 0,
    requestRisk: data.requestRiskCount || 0,
    lossRisk: data.lossRiskCount || 0,

    cancelRate: data.cancelRate || 0,
    loadRate: data.loadRate || 0,
    level,
    message: data.message || '',
  };
});

/*
 * 오늘 주문 목록에서 id가 같은 주문을 찾는다.
 * delay-risks API에는 platformOrderNumber가 없어서
 * todayOrders와 합쳐서 화면 표시값을 보강한다.
 */
const findTodayOrderById = (orderId) => {
  return dashboardStore.todayOrders.find((order) => {
    return order.id === orderId;
  });
};

const isRequestRiskOrder = (order) => {
  return (
    ['ALLERGY', 'DISPUTE', 'EXCESSIVE'].includes(order.requestRiskType) ||
    ['CAUTION', 'WARNING', 'DANGER'].includes(order.requestRiskLevel)
  );
};

const getRequestIssueLabel = (order) => {
  if (order.requestRiskType === 'ALLERGY') {
    return {
      issueLevel: 'critical',
      issueLabel: '알러지 주의',
      issueReason: '알러지 관련 요청',
    };
  }

  if (order.requestRiskType === 'DISPUTE') {
    return {
      issueLevel: 'critical',
      issueLabel: '분쟁 가능',
      issueReason: '취소·환불·별점 관련 요청',
    };
  }

  if (order.requestRiskType === 'EXCESSIVE') {
    return {
      issueLevel: 'warning',
      issueLabel: '과도 요청',
      issueReason: '추가 제공 기준 확인 필요',
    };
  }

  return {
    issueLevel: 'warning',
    issueLabel: '요구 확인',
    issueReason: '요구사항 확인 필요',
  };
};

const toDelayPriorityOrder = (delayOrder) => {
  const todayOrder =
    findTodayOrderById(delayOrder.id);

  const isDelayed =
    delayOrder.delayRiskLevel === 'DELAYED';

  return {
    id: delayOrder.id,
    orderNo: delayOrder.orderNo,
    platformNo:
      todayOrder?.platformOrderNumber ||
      delayOrder.orderNo,
    platform: getPlatformName(delayOrder.platformType),
    menuSummary: delayOrder.menuSummary || '-',
    issueLevel: isDelayed ? 'critical' : 'warning',
    issueLabel: isDelayed ? '지연 발생' : '지연 주의',
    issueReason:
      `진행률 ${delayOrder.progressRate || 0}% · ` +
      `경과 ${delayOrder.elapsedMinutes || 0}분 / ` +
      `예상 ${delayOrder.adjustedCookingTime || delayOrder.totalCookingTime || 0}분`,
  };
};

const toRequestPriorityOrder = (order) => {
  const issue =
    getRequestIssueLabel(order);

  return {
    id: order.id,
    orderNo: order.orderNo,
    platformNo: order.platformOrderNumber,
    platform: getPlatformName(order.platformType),
    menuSummary: order.menuSummary || '-',
    ...issue,
  };
};

const toLossPriorityOrder = (order) => {
  return {
    id: order.id,
    orderNo: order.orderNo,
    platformNo: order.platformOrderNumber,
    platform: getPlatformName(order.platformType),
    menuSummary: order.menuSummary || '-',
    issueLevel: 'warning',
    issueLabel: '손실 위험',
    issueReason: `예상 순수익 ${formatMoney(order.netProfit)}`,
  };
};

/*
 * 우선 확인 주문
 *
 * 1순위: 조리 지연 위험 주문
 * 2순위: 요구사항 위험 주문
 * 3순위: 손실 위험 주문
 */
const priorityOrders = computed(() => {
  const result = [];

  const pushIfNotExists = (order) => {
    const exists =
      result.some((item) => item.id === order.id);

    if (!exists) {
      result.push(order);
    }
  };

  dashboardStore.delayRiskOrders
    .filter((order) => {
      return order.delayRiskLevel !== 'SAFE';
    })
    .map(toDelayPriorityOrder)
    .forEach(pushIfNotExists);

  dashboardStore.todayOrders
    .filter((order) => {
      return ['WAITING', 'COOKING', 'DELIVERING'].includes(order.orderStatus);
    })
    .filter(isRequestRiskOrder)
    .map(toRequestPriorityOrder)
    .forEach(pushIfNotExists);

  dashboardStore.todayOrders
    .filter((order) => {
      return ['WAITING', 'COOKING', 'DELIVERING'].includes(order.orderStatus);
    })
    .filter((order) => {
      return Number(order.netProfit || 0) <= 0;
    })
    .map(toLossPriorityOrder)
    .forEach(pushIfNotExists);

  return result;
});

const priorityTotalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(priorityOrders.value.length / priorityPageSize)
  );
});

const pagedPriorityOrders = computed(() => {
  const startIndex =
    (priorityCurrentPage.value - 1) * priorityPageSize;

  return priorityOrders.value.slice(
    startIndex,
    startIndex + priorityPageSize
  );
});

const priorityDisplaySlots = computed(() => {
  const slots =
    pagedPriorityOrders.value.map((order) => {
      return {
        ...order,
        isPlaceholder: false,
      };
    });

  while (slots.length < priorityPageSize) {
    const slotIndex = slots.length + 1;

    slots.push({
      id: `priority-empty-${priorityCurrentPage.value}-${slotIndex}`,
      orderNo: '대기 중',
      platform: '우선 확인',
      menuSummary: '현재 표시할 주문이 없습니다.',
      issueLevel: 'empty',
      issueLabel: '대기',
      isPlaceholder: true,
    });
  }

  return slots;
});

const priorityPageNumbers = computed(() => {
  return Array.from(
    { length: priorityTotalPages.value },
    (_, index) => index + 1
  );
});

const changePriorityPage = (page) => {
  if (page < 1 || page > priorityTotalPages.value) {
    return;
  }

  priorityCurrentPage.value = page;
};

const operationBrief = computed(() => {
  if (summary.value.level === '위험') {
    return {
      title: '지금 먼저 확인할 주문이 있습니다.',
      desc:
        summary.value.message ||
        `부하율 ${summary.value.loadRate}% · 지연 ${summary.value.delayRisk}건 · 요구확인 ${summary.value.requestRisk}건`,
      tone: 'danger',
    };
  }

  if (summary.value.level === '주의') {
    return {
      title: '피크타임 주의 단계입니다.',
      desc:
        summary.value.message ||
        `진행 주문 ${summary.value.activeCount}건 · 지연 ${summary.value.delayRisk}건 · 요구확인 ${summary.value.requestRisk}건 · 손실위험 ${summary.value.lossRisk}건`,
      tone: 'warning',
    };
  }

  return {
    title: '현재 운영은 안정적입니다.',
    desc:
      summary.value.message ||
      '지연 위험 주문이 없거나 낮은 수준입니다. 신규 주문과 알러지 요청만 확인하세요.',
    tone: 'safe',
  };
});

const apiStatusText = computed(() => {
  if (dashboardStore.isLoading) {
    return 'API 조회 중...';
  }

  if (!dashboardStore.lastUpdatedAt) {
    return 'API 연결 대기 중';
  }

  return `API 정상 · ${dashboardStore.lastUpdatedAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} 갱신`;
});

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString('ko-KR')} 원`;
};

const loadDashboard = async () => {
  try {
    await dashboardStore.loadDashboard();
  } catch (error) {
    console.error('대시보드 조회 실패:', error);
  }
};

const goToOrderPage = (order) => {
  router.push({
    path: '/orders',
    query: {
      id: order.id,
    },
  });
};
const goToActiveOrders = () => {
  router.push({
    path: '/orders',
    query: {
      active: 'true',
    },
  });
};

const goToDelayOrders = () => {
  router.push({
    path: '/orders',
    query: {
      attention: 'DELAY',
    },
  });
};

const goToSalesReport = () => {
  router.push({
    path: '/reports',
    query: {
      tab: 'sales',
      status: 'COMPLETED',
    },
  });
};

const handleSimulate = () => {
  router.push('/mockdata');
};

const handleExport = () => {
  router.push('/reports');
};

onMounted(async () => {
  await loadDashboard();
});
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="top-header-grid">
      <div class="title-area">
        <div class="api-status">
          <span class="status-dot"></span>
          {{ apiStatusText }}
         </div>
        <h1>실시간 운영 대시보드</h1>
        <p>피크타임에 바로 확인해야 할 주문과 핵심 운영 지표만 확인하세요.</p>
      </div>
      <div class="header-actions">
          <button
          type="button"
          class="sub-button"
          @click="router.push('/reports')"
        >
          운영 리포트
        </button>

        <button
          type="button"
          class="sub-button"
          @click="loadDashboard"
        >
          새로고침
        </button>

        <button
          type="button"
          class="sub-button"
          @click="handleSimulate"
        >
          Mock 주문 생성
        </button>

        <button
          type="button"
          class="primary-button"
          @click="handleExport"
        >
          리포트/CSV 확인
        </button>
      </div>
    </header>

    <main class="grid-12">
      
      <section class="operation-brief-card col-12" :class="operationBrief.tone">
        <div class="brief-main">
          <span>오늘의 운영 브리핑</span>
          <h2>{{ operationBrief.title }}</h2>
          <p>{{ operationBrief.desc }}</p>
        </div>
        <div class="brief-action-list">
          <button 
            v-for="(order, index) in priorityOrders.slice(0, 3)" 
            :key="order.orderNo"
            type="button" 
            @click="goToOrderPage(order)"
          >
            <b>{{ index + 1 }}</b>
            <span>
              <strong>{{ order.platformNo }} · {{ order.issueLabel }}</strong>
              <small>{{ order.platform }} · {{ order.menuSummary }} · {{ order.issueReason }}</small>
            </span>
          </button>
          <div v-if="!priorityOrders.length" class="brief-empty">
            지금 바로 처리할 위험 주문은 없습니다.
          </div>
        </div>
      </section>

      <div
        class="kpi-card col-3 border-success clickable-card"
        @click="goToSalesReport"
      >
        <div class="card-label">예상 매출</div>
        <div class="card-value">{{ formatMoney(summary.sales) }}</div>
        <div class="card-sub">예상 순수익 {{ formatMoney(summary.profit) }}</div>
      </div>

      <div
        class="kpi-card col-3 clickable-card"
        @click="goToSalesReport"
      >
        <div class="card-label">완료 주문 합계</div>
        <div class="card-value">{{ summary.completedCount }}건</div>
        <div class="card-sub">완료 주문 매출 {{ formatMoney(summary.sales) }}</div>
      </div>

      <div
        class="kpi-card col-3 clickable-card"
        @click="goToActiveOrders"
      >
        <div class="card-label">현재 진행 주문</div>
        <div class="card-value">{{ summary.activeCount }}건</div>
        <div class="card-sub">대기 {{ summary.waiting }} · 조리 {{ summary.cooking }} · 배달 {{ summary.delivering }}</div>
      </div>

      <div
        class="kpi-card col-3 border-danger clickable-card"
        @click="goToDelayOrders"
      >
        <div class="card-label">지연 위험</div>
        <div class="card-value text-danger">{{ summary.delayRisk }}건</div>
        <div class="card-sub">요구확인 {{ summary.requestRisk }} · 손실 {{ summary.lossRisk }}</div>
      </div>

      <div class="detail-card col-6">
        <div class="detail-header">
          <h3>우선 확인 주문</h3>
          <span class="text-muted">긴급도 순 {{ priorityOrders.length }}건</span>
        </div>
        <div class="order-list priority-list">
          <button 
            v-for="order in priorityDisplaySlots" 
            :key="order.id || order.orderNo"
            type="button" 
            class="priority-order-item" 
            :class="[order.issueLevel, { empty: order.isPlaceholder }]"
            :disabled="order.isPlaceholder"
            @click="!order.isPlaceholder && goToOrderPage(order)"
          >
            <strong>{{ order.orderNo }}</strong>
            <span>{{ order.platform }} · {{ order.menuSummary }}</span>
            <b>{{ order.issueLabel }}</b>
          </button>
        </div>

        <div
          v-if="priorityOrders.length > priorityPageSize"
          class="priority-pagination"
        >
          <button
            v-for="page in priorityPageNumbers"
            :key="page"
            type="button"
            :class="{ active: priorityCurrentPage === page }"
            @click="changePriorityPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <div class="detail-card col-6 highlight-card">
        <div class="detail-header">
          <h3>현재 운영 상태</h3>
          <small class="text-muted">실시간 동기화</small>
        </div>
        <div class="status-content">
          <div class="status-circle">
            <span class="main-percent">{{ summary.loadRate }}%</span>
            <span class="sub-text">부하율</span>
          </div>
          <div class="status-desc">
            <p>취소율 {{ summary.cancelRate }}%</p>
            <p><strong>운영 안정성 {{ summary.level }} 단계</strong></p>
            <p>요구확인 {{ summary.requestRisk }}건 · 손실위험 {{ summary.lossRisk }}건</p>
          </div>
        </div>
      </div>
      
    </main>
  </div>
</template>

<style scoped>
/* ============================================================
   디자인 시스템 변수 & 기본 레이아웃 설정
   ============================================================ */
.dashboard-wrapper {
  --primary: #87CEEB;
  --strong: #2784B8;
  --soft: #EAF8FD;
  --primary-text: #164E68;
  --success: #15BD30;
  --danger: #DC2626;
  --warning: #D97706;

  background-color: #f4f6fc;
  min-height: calc(100vh - 78px);
  padding: 30px;
  color: var(--primary-text);
  box-sizing: border-box;
}

/* ============================================================
   헤더 영역
   ============================================================ */
.top-header-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.api-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: var(--success);
  margin-bottom: 8px;
  font-weight: 700;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--success);
  border-radius: 50%;
}

.title-area h1 {
  font-size: 38px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.18;
}

.title-area p {
  color: #6b7280;
  font-size: 18px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ============================================================
   공통 버튼 (Readability Pass 적용: 넓은 터치 영역, 큰 글씨)
   ============================================================ */
.primary-button,
.sub-button {
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
  transition: all 0.2s;
}

.primary-button {
  border: 0;
  color: #ffffff;
  background-color: #2784b8;
}
.primary-button:hover { background-color: #1f6f99; }

.sub-button {
  border: 1px solid #dbe3ee;
  color: #334155;
  background-color: #ffffff;
}
.sub-button:hover { background-color: #f8fafc; color: #164e68; border-color: #87ceeb; }

/* ============================================================
   그리드 시스템
   ============================================================ */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.col-3 { grid-column: span 3; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }

/* ============================================================
   카드 스타일
   ============================================================ */
.kpi-card,
.detail-card {
  background: #fff;
  padding: 26px;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.border-success { border-left: 6px solid var(--success); }
.border-danger { border-left: 6px solid var(--danger); }

.card-label { font-size: 17px; color: #6b7280; margin-bottom: 12px; font-weight: 800; }
.card-value { font-size: 34px; font-weight: 900; color: #111827; letter-spacing: -0.5px; }
.card-sub { font-size: 16px; color: #6b7280; margin-top: 8px; font-weight: 700; }
.text-danger { color: #dc2626 !important; }

.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  border-color: #87ceeb;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}
/* ============================================================
   1. 운영 브리핑 카드
   ============================================================ */
.operation-brief-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, .9fr);
  gap: 26px;
  align-items: center;
  padding: 30px;
  border: 1px solid #dbe3ee;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(15, 23, 42, .05);
}

.operation-brief-card.warning { border-color: #fed7aa; background: #fff7ed; }
.operation-brief-card.danger { border-color: #fecaca; background: #fff5f5; }
.operation-brief-card.safe { border-color: #bbf7d0; background: #f0fdf4; }

.brief-main span { color: #64748b; font-size: 16px; font-weight: 900; letter-spacing: .04em; display: block; margin-bottom: 8px;}
.brief-main h2 { margin: 0 0 10px; color: #111827; font-size: 34px; font-weight: 900; letter-spacing: -.035em; }
.brief-main p { margin: 0; color: #475569; font-size: 18px; font-weight: 800; }

.brief-action-list { display: grid; gap: 10px; }
.brief-action-list button {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}
.brief-action-list button:hover { border-color: #87ceeb; background: #eaf8fd; transform: translateX(4px); }
.brief-action-list b {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
  background: #2784B8;
  font-size: 18px;
}
.brief-action-list strong { display: block; color: #111827; font-size: 18px; }
.brief-action-list small { display: block; margin-top: 4px; color: #64748b; font-size: 15px; }
.brief-empty { padding: 16px; color: #047857; background: #fff; border-radius: 14px; font-weight: 800; font-size: 16px; }

/* ============================================================
   3. 우선 확인 주문 리스트
   ============================================================ */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.detail-header h3 { font-size: 23px; font-weight: 800; color: #111827; margin: 0; }
.text-muted { color: #94a3b8; font-size: 16px; font-weight: 700; }

.priority-list { display: grid; gap: 10px; }
.priority-order-item {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 116px;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}
.priority-order-item:hover { filter: brightness(0.97); }
.priority-order-item.critical { border-color: #fecaca; background: #fff5f5; }
.priority-order-item.warning { border-color: #fed7aa; background: #fff7ed; }
.priority-order-item.info { border-color: #bfdbfe; background: #eff6ff; }

.priority-order-item strong { color: #0f172a; font-size: 17px; font-weight: 900; }
.priority-order-item span { color: #475569; font-size: 16px; font-weight: 700; }
.priority-order-item b { justify-self: end; color: #164E68; font-size: 16px; font-weight: 900; }

/* ============================================================
   현재 운영 상태 (원형 차트)
   ============================================================ */
.highlight-card { background: var(--soft); border-color: var(--primary); }
.status-content { display: flex; align-items: center; gap: 36px; margin-top: 10px; }
.status-circle {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 10px solid var(--strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  flex-shrink: 0;
}
.main-percent { font-size: 28px; font-weight: 900; color: var(--strong); }
.sub-text { font-size: 12px; color: #9ca3af; text-align: center; font-weight: 700; margin-top: 2px; }
.status-desc { color: var(--primary-text); display: grid; gap: 8px; }
.status-desc p { margin: 0; font-size: 17px; font-weight: 700; }
.status-desc strong { font-size: 19px; font-weight: 900; color: #111827; }

/* 반응형 처리 */
@media (max-width: 1280px) {
  .col-3 { grid-column: span 6; }
  .col-6 { grid-column: span 12; }
  .operation-brief-card { grid-template-columns: 1fr; gap: 20px; }
}

@media (max-width: 760px) {
  .dashboard-wrapper { padding: 18px; }
  .top-header-grid { flex-direction: column; align-items: stretch; gap: 16px; }
  .header-actions { flex-direction: column; }
  .primary-button, .sub-button { width: 100%; }
}


/* ============================================================
   2026-06-27 대시보드 압축 레이아웃 / 글자 굵기 보정
   ============================================================ */
.dashboard-wrapper {
  min-height: auto;
  padding: 18px 24px;
}

.top-header-grid {
  margin-bottom: 14px;
}

.title-area h1 {
  font-size: 30px;
  font-weight: 700;
}

.title-area p,
.api-status {
  font-size: 14px;
  font-weight: 500;
}

.primary-button,
.sub-button {
  min-height: 38px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
}

.grid-12 {
  gap: 14px;
}

.operation-brief-card {
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr);
  gap: 18px;
  padding: 18px 22px;
}

.brief-main span {
  font-size: 13px;
  font-weight: 700;
}

.brief-main h2 {
  font-size: 26px;
  font-weight: 700;
}

.brief-main p {
  font-size: 15px;
  font-weight: 600;
}

.brief-action-list {
  gap: 8px;
}

.brief-action-list button {
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
}

.brief-action-list b {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
}

.brief-action-list strong {
  font-size: 15px;
  font-weight: 700;
}

.brief-action-list small {
  font-size: 13px;
  font-weight: 500;
}

.kpi-card,
.detail-card {
  padding: 18px 22px;
  border-radius: 16px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-value {
  font-size: 29px;
  font-weight: 700;
}

.card-sub {
  font-size: 14px;
  font-weight: 500;
}

.detail-header {
  margin-bottom: 12px;
}

.detail-header h3 {
  font-size: 20px;
  font-weight: 700;
}

.text-muted {
  font-size: 14px;
  font-weight: 500;
}

.priority-list {
  gap: 8px;
}

.priority-order-item {
  grid-template-columns: 116px minmax(0, 1fr) 90px;
  gap: 10px;
  min-height: 58px;
  padding: 11px 14px;
  border-radius: 12px;
}

.priority-order-item strong {
  font-size: 15px;
  font-weight: 700;
  word-break: break-all;
}

.priority-order-item span {
  font-size: 14px;
  font-weight: 500;
}

.priority-order-item b {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.priority-pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
}

.priority-pagination button {
  min-width: 30px;
  height: 30px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
}

.priority-pagination button.active {
  color: #fff;
  border-color: #2784b8;
  background: #2784b8;
}

.status-content {
  gap: 22px;
  margin-top: 2px;
}

.status-circle {
  width: 104px;
  height: 104px;
  border-width: 8px;
}

.main-percent {
  font-size: 24px;
  font-weight: 700;
}

.sub-text {
  font-weight: 500;
}

.status-desc {
  gap: 5px;
}

.status-desc p {
  font-size: 15px;
  font-weight: 500;
}

.status-desc strong {
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 1280px) {
  .operation-brief-card {
    grid-template-columns: 1fr;
  }
}



/* ============================================================
   2026-06-27 대시보드 우선 확인 주문 3칸 고정 보정
   ============================================================ */
.priority-list {
  grid-template-rows: repeat(3, minmax(64px, auto)) !important;
  min-height: 220px;
}

.priority-order-item {
  min-height: 64px;
  box-sizing: border-box;
}

.priority-order-item.empty {
  border-color: #e5e7eb !important;
  background: #f8fafc !important;
  opacity: 0.68;
  cursor: default;
}

.priority-order-item.empty strong,
.priority-order-item.empty span,
.priority-order-item.empty b {
  color: #94a3b8 !important;
}

.priority-order-item.empty:hover {
  filter: none !important;
}

.highlight-card {
  min-height: 0;
}

</style>