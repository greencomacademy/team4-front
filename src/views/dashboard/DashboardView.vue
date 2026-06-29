<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. 대시보드 요약 지표 데이터 (실제 연동 시 API 응답 데이터로 대체)
const summary = ref({});

// 2. 브리핑 및 액션 추천을 위한 주문 데이터 세트
const priorityOrders = ref([]);

// 3. 부하 상태에 따른 브리핑 메시지 동적 생성
const operationBrief = computed(() => {
  if (summary.value.level === '위험') {
    return {
      title: '지금 먼저 확인할 주문이 있습니다.',
      desc: `부하율 ${summary.value.loadRate}% · 지연 ${summary.value.delayRisk}건 · 요구확인 ${summary.value.requestRisk}건`,
      tone: 'danger'
    }
  }
  if (summary.value.level === '주의') {
    return {
      title: '피크타임 주의 단계입니다.',
      desc: `진행 주문 ${summary.value.activeCount}건 · 요구확인 ${summary.value.requestRisk}건 · 손실위험 ${summary.value.lossRisk}건`,
      tone: 'warning'
    }
  }
  return {
    title: '현재 운영은 안정적입니다.',
    desc: '지연 위험 주문이 없거나 낮은 수준입니다. 신규 주문과 알러지 요청만 확인하세요.',
    tone: 'safe'
  }
})

// 유틸: 금액 포맷팅
const formatMoney = (value) => `${Number(value || 0).toLocaleString('ko-KR')}원`

// 모의 동작 함수
const handleSimulate = () => alert('신규 주문 시뮬레이션 동작 (추후 구현)')
const handleExport = () => alert('매출 내보내기 동작 (추후 구현)')
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="top-header-grid">
      <div class="title-area">
        <div class="api-status">
          <span class="status-dot"></span> API 정상 · 방금 전 갱신
        </div>
        <h1>실시간 운영 대시보드</h1>
        <p>피크타임에 바로 확인해야 할 주문과 핵심 운영 지표만 확인하세요.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="sub-button" @click="router.push('/reports/sales')">매출 리포트</button>
        <button type="button" class="sub-button" @click="router.push('/reports/cancel')">취소 확인</button>
        <button type="button" class="sub-button" @click="handleSimulate">신규 주문 시뮬레이션</button>
        <button type="button" class="primary-button" @click="handleExport">매출 내보내기</button>
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
            @click="router.push(`/orders?id=${order.orderNo}`)"
          >
            <b>{{ index + 1 }}</b>
            <span>
              <strong>{{ order.platformNo }} · {{ order.issueLabel }}</strong>
              <small>{{ order.platform }} · 관리번호 {{ order.orderNo }} · {{ order.menuSummary }} · {{ order.issueReason }}</small>
            </span>
          </button>
          <div v-if="!priorityOrders.length" class="brief-empty">
            지금 바로 처리할 위험 주문은 없습니다.
          </div>
        </div>
      </section>

      <div class="kpi-card col-3 border-success">
        <div class="card-label">예상 매출</div>
        <div class="card-value">{{ formatMoney(summary.sales) }}</div>
        <div class="card-sub">예상 순수익 {{ formatMoney(summary.profit) }}</div>
      </div>
      
      <div class="kpi-card col-3">
        <div class="card-label">완료 주문 합계</div>
        <div class="card-value">{{ summary.completedCount }}건</div>
        <div class="card-sub">완료 주문 매출 {{ formatMoney(summary.sales) }}</div>
      </div>

      <div class="kpi-card col-3">
        <div class="card-label">현재 진행 주문</div>
        <div class="card-value">{{ summary.activeCount }}건</div>
        <div class="card-sub">대기 {{ summary.waiting }} · 조리 {{ summary.cooking }} · 배달 {{ summary.delivering }}</div>
      </div>

      <div class="kpi-card col-3 border-danger">
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
            v-for="order in priorityOrders" 
            :key="order.orderNo"
            type="button" 
            class="priority-order-item" 
            :class="order.issueLevel"
            @click="router.push(`/orders?id=${order.orderNo}`)"
          >
            <strong>{{ order.orderNo }}</strong>
            <span>{{ order.platform }} · {{ order.menuSummary }}</span>
            <b>{{ order.issueLabel }}</b>
          </button>
          <div v-if="!priorityOrders.length" class="order-item">현재 우선 확인 주문이 없습니다.</div>
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
</style>