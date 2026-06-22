<script setup>
import { ref } from 'vue';

// 하단 테이블용 데이터 (수익 분석 섹션에서 활용 가능)
const tableData = ref([
  { platform: '배민', totalOrders: 1, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 2, marginRank: 2, summary: '완료 주문이 아직 없습니다.' },
  { platform: '쿠팡이츠', totalOrders: 4, completedOrders: 2, sales: '54,000원', profit: '18,108원', margin: '33.53%', profitRank: 1, marginRank: 1, summary: '쿠팡이츠 완료 주문 2건 기준입니다.' },
  { platform: '요기요', totalOrders: 3, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 3, marginRank: 3, summary: '완료 주문이 아직 없습니다.' },
  { platform: '땡겨요', totalOrders: 2, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 4, marginRank: 4, summary: '완료 주문이 아직 없습니다.' },
]);
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="top-header-grid">
      <div class="title-area">
        <div class="api-status">
          <span class="status-dot"></span> API 정상
        </div>
        <h1>실시간 운영 대시보드</h1>
        <p>핵심 운영 지표와 배달 수익성을 확인하세요.</p>
      </div>
    </header>

    <main class="grid-12">
      <div class="kpi-card col-3 border-success">
        <div class="card-label">예상 매출</div>
        <div class="card-value">284,600원</div>
        <div class="card-sub">예상 순수익 18,108원</div>
      </div>
      
      <div class="kpi-card col-3">
        <div class="card-label">완료 주문 합계</div>
        <div class="card-value">905,000원</div>
        <div class="card-sub">완료 주문 2건</div>
      </div>

      <div class="kpi-card col-3">
        <div class="card-label">현재 진행 주문</div>
        <div class="card-value">12건</div>
        <div class="card-sub">대기 4 · 조리 5 · 배달 3</div>
      </div>

      <div class="kpi-card col-3 border-danger">
        <div class="card-label">지연 위험</div>
        <div class="card-value text-danger">3건</div>
        <div class="card-sub">조리 1 · 지연 2</div>
      </div>

      <div class="detail-card col-6">
        <div class="detail-header">
          <h3>우선 확인 주문</h3>
          <span class="text-muted">ORD-021 외 3건</span>
        </div>
        <div class="order-list">
          <div class="order-item"><strong>ORD-021</strong> 배민 · 예상 조리 완료 1분 전 · <span class="text-warning">지연 13%</span></div>
          <div class="order-item"><strong>ORD-035</strong> 요기요 · 결제 테스트 · <span class="text-info">준비 84%</span></div>
          <div class="order-item"><strong>ORD-017</strong> 쿠팡 · 요청사항 미확인 · <span class="text-info">조리 76%</span></div>
        </div>
      </div>

      <div class="detail-card col-6 highlight-card">
        <div class="detail-header">
          <h3>현재 운영 상태</h3>
        </div>
        <div class="status-content">
          <div class="status-circle">
            <span class="main-percent">133.3%</span>
            <span class="sub-text">조리/배달 7건 / 전체 12건</span>
          </div>
          <div class="status-desc">
            <p>취소/반품 7.5%</p>
            <p><strong>운영 안정성 주의 단계</strong></p>
          </div>
        </div>
      </div>

      <div class="analysis-card col-6 border-violet">
        <div class="detail-header">
          <h3>플랫폼 요약</h3>
        </div>
        <div class="analysis-list">
          <div class="analysis-item">배민 : 매출 12,000 / 예상 순수익 82,400</div>
          <div class="analysis-item">쿠팡 : 매출 245,000 / 예상 순수익 54,200</div>
          <div class="analysis-item">요기요 : 매출 25,000 / 예상 순수익 65,100</div>
          <div class="analysis-item footer">반올림 수치 적용 (배송비/수수료 요약 65,100)</div>
        </div>
      </div>

      <div class="analysis-card col-6 border-violet">
        <div class="detail-header">
          <h3>메뉴 수익 요약</h3>
        </div>
        <div class="analysis-list">
          <div class="analysis-item">1. 묵은지 김치찜 82,400원</div>
          <div class="analysis-item">2. 사이드 세트 61,000원</div>
          <div class="analysis-item">3. 로제 파스타 55,300원</div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* [Variables] 브랜드 가이드 컬러 적용 */
.dashboard-wrapper {
  --primary: #87CEEB;
  --strong: #2784B8;
  --soft: #EAF8FD;
  --primary-text: #1E4158;
  
  --success: #15BD30;
  --success-bg: #F0FFF4;
  --info: #00FDE4;
  --info-bg: #F0FEFF;
  --warning: #D97706;
  --warning-bg: #FFFBEB;
  --danger: #DC2626;
  --danger-bg: #FEF2F2;
  
  /* 복구된 보라색 계열 (수익/분석 강조용) */
  --violet: #7C3AED;
  --violet-bg: #F5F3FF;

  background-color: #f4f6fc;
  min-height: 100vh;
  padding: 30px;
  font-family: 'Sejong hospital Light', sans-serif;
  color: var(--primary-text);
}

/* [Header Layout] */
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
  font-size: 14px;
  color: var(--success);
  margin-bottom: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--success);
  border-radius: 50%;
}

.title-area h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 4px;
}

.title-area p {
  color: #6b7280;
}

/* [Grid-12 System] */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.col-3 { grid-column: span 3; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }

/* [Card Styles] */
.kpi-card, .detail-card, .analysis-card {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s;
}

.border-success { border-left: 5px solid var(--success); }
.border-danger { border-left: 5px solid var(--danger); }
.border-violet { border-left: 5px solid var(--violet); } /* 복구된 테두리 스타일 */

.card-label { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
.card-value { font-size: 26px; font-weight: 800; color: #111827; }
.card-sub { font-size: 13px; color: #6b7280; margin-top: 5px; }

/* [Details Styles] */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 { font-size: 18px; font-weight: 700; color: var(--primary-text); }

.order-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: var(--primary-text);
}

.highlight-card {
  background: var(--soft);
  border-color: var(--primary);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.status-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 8px solid var(--strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.main-percent { font-size: 18px; font-weight: 800; color: var(--strong); }
.sub-text { font-size: 9px; color: #9ca3af; text-align: center; }
.status-desc { color: var(--primary-text); }

/* [Analysis Styles - 복구됨] */
.analysis-list { display: flex; flex-direction: column; gap: 10px; }
.analysis-item {
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
}
.analysis-item.footer { background: none; font-size: 12px; color: #9ca3af; text-align: right; }

/* Utility */
.text-danger { color: var(--danger); }
.text-warning { color: var(--warning); font-weight: bold; }
.text-info { color: var(--strong); font-weight: bold; }
.text-muted { color: #9ca3af; font-size: 14px;}
.v-margin { margin-top: 10px; }
</style>