<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore.js'

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])
const router = useRouter()
const dashboardStore = useDashboardStore()

// 1. HTML 시안 및 캡처 이미지 기준 메뉴 리스트
const navItems = ref([
  { name: '실시간 운영 대시보드', path: '/dashboard' },
  { name: '통합 주문 관리', path: '/orders' },
  { name: '메뉴 수익 관리', path: '/menus' },
  { name: '매장 관리', path: '/store' },
  { name: '운영 리포트', path: '/reports' },
  { name: 'Mock 데이터', path: '/mockdata' }
])

const REQUEST_ATTENTION_TYPES = [
  'ALLERGY',
  'DISPUTE',
  'EXCESSIVE',
  'GROUP',
  'REQUEST',
  'REQUEST_RISK',
]

const REQUEST_ATTENTION_LEVELS = ['WARNING', 'DANGER']

const normalizeRiskValue = (value) => {
  return String(value || '').trim().toUpperCase()
}

const isRequestRiskOrder = (order = {}) => {
  if (order.orderStatus !== 'WAITING') {
    return false
  }

  const riskType = normalizeRiskValue(order.requestRiskType)
  const riskLevel = normalizeRiskValue(order.requestRiskLevel)

  return (
    REQUEST_ATTENTION_TYPES.includes(riskType) ||
    REQUEST_ATTENTION_LEVELS.includes(riskLevel)
  )
}

const getOperationLevel = (summary) => {
  const loadRate = Number(summary.loadRate || 0)
  const delayRisk = Number(summary.delayRisk || 0)
  const requestRisk = Number(summary.requestRisk || 0)
  const lossRisk = Number(summary.lossRisk || 0)
  const kitchenLoadLevel = summary.kitchenLoadLevel || ''

  if (kitchenLoadLevel === 'OVERLOAD' || loadRate >= 100 || delayRisk >= 3) {
    return '위험'
  }

  if (
    kitchenLoadLevel === 'HIGH' ||
    loadRate >= 70 ||
    delayRisk >= 1 ||
    requestRisk >= 2 ||
    lossRisk >= 1
  ) {
    return '주의'
  }

  return '정상'
}

const operationSummary = computed(() => {
  const data = dashboardStore.operationSummary

  if (!data) {
    return {
      level: '정상',
      loadRate: 0,
      delayRisk: 0,
      requestRisk: 0,
      lossRisk: 0,
      orderCount: 0,
      sales: 0,
      profit: 0,
      completedCount: 0,
      cancelCount: 0,
      cancelRate: 0,
      kitchenLoadLevel: ''
    }
  }

  const requestRisk =
    dashboardStore.todayOrders.filter(isRequestRiskOrder).length

  const summary = {
    loadRate: data.loadRate || 0,
    orderCount: data.todayOrderCount || 0,
    delayRisk: data.delayRiskCount || 0,
    requestRisk,
    lossRisk: data.lossRiskCount || 0,
    sales: data.todaySales || 0,
    profit: data.todayNetProfit || 0,
    completedCount: data.completedCount || 0,
    cancelCount: data.canceledCount || data.cancelCount || 0,
    cancelRate: data.cancelRate || 0,
    kitchenLoadLevel: data.kitchenLoadLevel || ''
  }

  return {
    ...summary,
    level: getOperationLevel(summary)
  }
})

const updatedAtText = computed(() => {
  if (!dashboardStore.lastUpdatedAt) {
    return '동기화 전'
  }

  return `${dashboardStore.lastUpdatedAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })} 기준`
})

// 돈 단위 포맷 함수
const formatMoney = (val) => `${Number(val || 0).toLocaleString('ko-KR')}원`

onMounted(async () => {
  if (dashboardStore.operationSummary) {
    return
  }

  try {
    await dashboardStore.loadDashboard({ showAlert: false })
  } catch (error) {
    console.error('사이드바 운영 요약 조회 실패:', error)
  }
})
</script>

<template>
  <aside class="side-bar" :class="{ 'is-collapsed': !isOpen }">
    
    <button class="toggle-btn" @click="emit('toggle')" aria-label="사이드바 토글">
      <span class="arrow-icon" :class="{ 'rotated': !isOpen }">‹</span>
    </button>
    
    <div class="sidebar-content">
      <div class="logo-area">
        <img src="/logo.png" alt="배프(BAEF) 로고" class="main-logo" />
      </div>

      <section class="side-operation-card" :class="`level-${operationSummary.level}`">
        <span class="side-card-label">
          현재 운영 <em>{{ updatedAtText }}</em>
        </span>
        <strong>{{ operationSummary.level }}</strong>
        <p class="side-load-text">부하율 {{ operationSummary.loadRate }}%</p>
        <div class="side-risk-lines">
          <span>주문 {{ operationSummary.orderCount }}</span>
          <span>지연 {{ operationSummary.delayRisk }}</span>
          <span>요청 {{ operationSummary.requestRisk }}</span>
        </div>
        <div class="side-load">
          <span :style="{ width: `${Math.min(operationSummary.loadRate, 100)}%` }"></span>
        </div>
      </section>

      <section class="side-metric-card side-performance-card">
        <span class="side-performance-title">오늘 실적</span>
        <strong class="side-sales-amount">{{ formatMoney(operationSummary.sales) }}</strong>
        <div class="side-profit-row">
          <span>예상 순수익</span>
          <strong>{{ formatMoney(operationSummary.profit) }}</strong>
        </div>
        <div class="side-performance-grid">
          <div>
            <span>완료</span>
            <strong>{{ operationSummary.completedCount }}건</strong>
          </div>
          <div>
            <span>취소율</span>
            <strong>{{ operationSummary.cancelRate }}%</strong>
          </div>
        </div>
        <div class="side-report-shortcuts">
          <button type="button" @click="router.push({ path: '/reports', query: { tab: 'sales' } })">매출 리포트</button>
          <button type="button" @click="router.push({ path: '/reports', query: { tab: 'cancel' } })">취소 리포트</button>
        </div>
      </section>

      <section class="side-action-card">
        <span>확인 필요</span>
        <button type="button" @click="router.push({ path: '/orders', query: { attention: 'REQUEST' } })">
          요청사항 <strong>{{ operationSummary.requestRisk }}건</strong>
        </button>
        <button type="button" @click="router.push({ path: '/orders', query: { attention: 'DELAY' } })">
          지연위험 <strong>{{ operationSummary.delayRisk }}건</strong>
        </button>
        <button type="button" @click="router.push({ path: '/orders', query: { attention: 'LOSS' } })">
          손실위험 <strong>{{ operationSummary.lossRisk }}건</strong>
        </button>
        <button type="button" @click="router.push({ path: '/reports', query: { tab: 'cancel' } })">
          취소 확인 <strong>{{ operationSummary.cancelCount }}건</strong>
        </button>
      </section>

      <nav class="side-list">
        <router-link
          class="menu-item"
          v-for="(item, index) in navItems" 
          :key="index"
          :to="item.path"
        >
          <span class="menu-name">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
/* ============================================================
   디자인 시스템 변수 (배프1차.html 기준 완벽 이식)
   ============================================================ */
.side-bar {
  --bg-sidebar: #ffffff;
  --border-color: #e2e8f0;
  --primary: #2784B8;
  --primary-light: #EAF8FD;
  --text-main: #164E68;
  --text-sub: #475569;
  --text-muted: #94a3b8;
  --hover-bg: #f8fafc;
  
  --sidebar-width: 326px;
  --transition-speed: 0.22s;

  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
  overflow: visible; 
  transition: width var(--transition-speed) ease;
}

.side-bar.is-collapsed { width: 64px !important; }

.sidebar-content {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  transition: opacity 0.18s ease;
}

.side-bar.is-collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

/* ============================================================
   로고 영역 (가운데 정렬 및 크기 확대)
   ============================================================ */
.logo-area { 
  /* 상하 여백 유지, 좌우 여백 자동(center 정렬)을 위해 수정 */
  padding: 30px 16px 24px; 
  display: flex;
  justify-content: center; /* 로고를 완벽하게 가로 중앙으로 정렬 */
  align-items: center;
  width: 100%;
}

.main-logo {
  height: 100px; /* 기존 38px에서 60px로 대폭 확대 (원하시는 크기에 맞게 조절 가능) */
  width: auto;
  max-width: 100%; /* 부모 요소를 넘지 않도록 방지 */
  object-fit: contain;
}

/* ============================================================
   사이드바 공통 대시보드 카드 스타일
   ============================================================ */
.side-operation-card,
.side-metric-card,
.side-action-card {
  margin: 0 14px 12px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.side-card-label,
.side-metric-card > span,
.side-action-card > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 16px;
  font-weight: 900;
}
.side-card-label em { color: #94a3b8; font-size: 13px; font-style: normal; font-weight: 800; }

.side-operation-card strong { display: block; color: #111827; font-size: 30px; font-weight: 900; line-height: 1.1; }
.side-operation-card p,
.side-metric-card p,
.side-metric-card small { margin-top: 8px; color: #475569; font-size: 15px; font-weight: 800; line-height: 1.45; }

.side-operation-card .side-load-text { margin-top: 8px; }
.side-risk-lines {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 6px;
  color: #164e68;
}
.side-risk-lines span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
}

/* 배경색 분기: 실시간 운영 대시보드의 운영 브리핑 색상과 동일하게 사용 */
.side-operation-card { background: #f0fdf4; border-color: #bbf7d0; }
.side-operation-card.level-정상 { background: #f0fdf4; border-color: #bbf7d0; }
.side-operation-card.level-주의 { background: #fff7ed; border-color: #fed7aa; }
.side-operation-card.level-위험 { background: #fff5f5; border-color: #fecaca; }

.side-load { height: 8px; margin-top: 12px; overflow: hidden; border-radius: 999px; background: #e5e7eb; }
.side-load span { display: block; height: 100%; border-radius: inherit; background: #16a34a; }
.side-operation-card.level-주의 .side-load span { background: #d97706; }
.side-operation-card.level-위험 .side-load span { background: #dc2626; }
.side-card-help { display: block; margin-top: 8px; color: #64748b; font-size: 15px; font-weight: 700; }

/* ============================================================
   오늘 실적 그라디언트 카드
   ============================================================ */
.side-performance-card {
  padding: 22px 20px;
  border: 2px solid #dbeafe;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 10px 24px rgba(39, 132, 184, 0.11);
}

.side-performance-title { display: block; margin-bottom: 10px; color: #164E68; font-size: 19px; font-weight: 950; letter-spacing: -0.03em; }
.side-sales-amount { display: block; color: #0f172a; font-size: 36px; line-height: 1.05; font-weight: 950; letter-spacing: -0.06em; }

.side-profit-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; padding: 12px 13px; border-radius: 14px; background: #ecfdf5; border: 1px solid #bbf7d0; }
.side-profit-row span { color: #166534; font-size: 16px; font-weight: 900; margin-bottom: 0; }
.side-profit-row strong { color: #15803d; font-size: 25px; line-height: 1.05; font-weight: 950; margin-bottom: 0; }

.side-performance-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.side-performance-grid div { padding: 12px 10px; border-radius: 14px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
.side-performance-grid span { display: block; color: #64748b; font-size: 15px; font-weight: 850; margin-bottom: 0; }
.side-performance-grid strong { display: block; margin-top: 4px; color: #0f172a; font-size: 25px; line-height: 1.05; font-weight: 950; margin-bottom: 0; }

.side-report-shortcuts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
.side-report-shortcuts button { min-height: 38px; border: 1px solid #dbe3ee; border-radius: 12px; background: #ffffff; color: #334155; font-size: 13px; font-weight: 900; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.side-report-shortcuts button:hover { border-color: #2784b8; color: #164e68; background: #f8fafc; }

/* ============================================================
   액션 리스트
   ============================================================ */
.side-action-card button { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; margin-top: 7px; padding: 0 14px; border: 1px solid #dbe3ee; border-radius: 12px; color: #334155; background: #f8fafc; font-size: 15px; font-weight: 800; cursor: pointer; }
.side-action-card button:hover { color: #164E68; background: #EAF8FD; }
.side-action-card button strong { font-size: 16px; font-weight: 900; }

/* ============================================================
   메뉴 링크 리스트 영역
   ============================================================ */
.side-list {
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none; 
  padding: 0 16px;
  min-height: 52px;
  color: var(--text-sub); 
  cursor: pointer;
  font-size: 17px;
  font-weight: 800;
  border-radius: 14px;
  transition: all 0.2s ease;
  position: relative;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.router-link-active {
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
}
.router-link-active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background-color: var(--primary);
  border-radius: 0 4px 4px 0;
}

/* ============================================================
   사다리꼴 토글 버튼
   ============================================================ */
.toggle-btn {
  position: absolute;
  right: -24px; 
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 80px; 
  background-color: var(--bg-sidebar);
  clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%);
  border-radius: 0 8px 8px 0; 
  filter: drop-shadow(3px 0 4px rgba(0, 0, 0, 0.08));
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
}

.side-bar.is-collapsed .toggle-btn {
  right: -28px;
  width: 30px;
  height: 92px;
  color: #2784B8;
}

.arrow-icon { font-size: 20px; font-weight: 1000; display: flex; transition: transform var(--transition-speed) ease; }
.arrow-icon.rotated { transform: rotate(180deg); }
</style>