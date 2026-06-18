<!--
DashboardView.vue: '오늘 운영 대시보드' 탭입니다. 
전체 주문 요약, 플랫폼 순위, 오늘의 운영 분석 메시지 등 가게의 전반적인 현황을 한눈에 보여주는 메인 화면입니다.
-->
<template>
  <div class="dashboard-wrapper">
    <header class="top-header">
      <div class="title-area">
        <span class="category-text">DELIVERY OPERATION PROFIT MVP</span>
        <h1>배달 운영 정산 대시보드</h1>
        <p>여러 배달 플랫폼의 주문, 순수익과 지연 위험을 한 화면에서 관리합니다.</p>
      </div>

      <div class="user-card">
        <div class="user-info">
          <span class="user-email">테스트 점주 / owner@test.com</span>
          <span class="badge-blue-light">운영 계정 연결됨</span>
        </div>
        <div class="user-actions">
          <button class="btn btn-outline">내 정보</button>
          <button class="btn btn-primary">전체 새로고침</button>
          <button class="btn btn-danger">로그아웃</button>
        </div>
      </div>
    </header>

    <div class="notice-banner">
      <strong>오늘의 운영 안내</strong>
      <p>진행 주문과 지연 위험을 먼저 확인한 뒤, 완료 주문 기준 매출과 순수익을 확인하세요. 발표 시연에서는 Mock 데이터 메뉴에서 주문을 추가할 수 있습니다.</p>
    </div>

    <main class="dashboard-content">
      <div class="section-header">
        <div>
          <span class="category-text">DASHBOARD API</span>
          <h2>오늘 운영 대시보드</h2>
        </div>
        <button class="btn btn-primary">대시보드 새로고침</button>
      </div>

      <section class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">오늘 주문</span>
          <strong class="kpi-value">10</strong>
          <span class="kpi-desc">전체 주문 수</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">완료 주문</span>
          <strong class="kpi-value">2</strong>
          <span class="kpi-desc">확정 매출 반영 대상</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">확정 매출</span>
          <strong class="kpi-value">54,000원</strong>
          <span class="kpi-desc">COMPLETED 기준</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">확정 순수익</span>
          <strong class="kpi-value">18,108원</strong>
          <span class="kpi-desc">비용 차감 후</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">진행 주문</span>
          <strong class="kpi-value">7</strong>
          <span class="kpi-desc">WAITING/COOKING 중심</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">지연 위험</span>
          <strong class="kpi-value">7</strong>
          <span class="kpi-desc">주방 확인 필요</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">주방 부하</span>
          <strong class="kpi-value">높음</strong>
          <span class="kpi-desc">HIGH</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">취소 주문</span>
          <strong class="kpi-value">1</strong>
          <span class="kpi-desc">매출 제외</span>
        </div>
      </section>

      <section class="middle-section">
        <div class="card platform-card">
          <div class="card-header">
            <h3>플랫폼 순위 카드</h3>
            <p>오늘 순수익 1위와 순수익률 1위를 비교합니다.</p>
          </div>
          <div class="inner-cards">
            <div class="inner-card">
              <span class="inner-label">순수익 1위 플랫폼</span>
              <strong class="inner-value">쿠팡이츠</strong>
              <span class="inner-desc">매출 1위와 다를 수 있음</span>
            </div>
            <div class="inner-card">
              <span class="inner-label">순수익률 1위 플랫폼</span>
              <strong class="inner-value">쿠팡이츠</strong>
              <span class="inner-desc">효율 좋은 플랫폼</span>
            </div>
          </div>
        </div>

        <div class="card margin-card">
          <div class="card-header">
            <h3>메뉴 마진 요약</h3>
            <p>마진율 우수 메뉴와 조리 부담 메뉴를 보여줍니다.</p>
          </div>
          <div class="menu-list">
            <div class="menu-item">
              <span class="menu-label">마진율 우수 메뉴</span>
              <span class="menu-value">묵은지 김치찜 / 60%</span>
            </div>
            <div class="menu-item">
              <span class="menu-label">조리 부담 메뉴</span>
              <span class="menu-value">매운 족발 플래터 / 35분 / batch 2</span>
            </div>
          </div>
          <div class="info-box">
            묵은지 김치찜은 마진율이 좋아 추천 노출 메뉴로 적합합니다. 매운 족발 플래터는 조리 부담이 높아 피크 시간 주문량을 확인하세요.
          </div>
        </div>
      </section>

      <section class="card alert-section">
        <div class="card-header">
          <h3>오늘의 운영 분석</h3>
          <p>실제 AI API 없이 백엔드 조건문 기반 메시지를 표시합니다.</p>
        </div>
        <div class="alert-summary">
          <strong>오늘 주문 10건, 진행 주문 7건, 지연 위험 7건입니다.</strong>
        </div>
        <div class="alert-list">
          <div class="alert-item">
            <span class="badge badge-warning">주의</span>
            <strong class="alert-key">DELAY_RISK</strong>
            <span class="alert-text">지연 위험 주문이 7건 있습니다. 조리중/배달중 주문을 먼저 확인하세요.</span>
          </div>
          <div class="alert-item">
            <span class="badge badge-danger">위험</span>
            <strong class="alert-key">KITCHEN_LOAD</strong>
            <span class="alert-text">주방 부하가 높음 상태입니다. 신규 주문 접수와 단체 주문을 주의하세요.</span>
          </div>
          <div class="alert-item">
            <span class="badge badge-success">좋음</span>
            <strong class="alert-key">PROFIT</strong>
            <span class="alert-text">완료 주문 기준 순수익은 18,108원입니다.</span>
          </div>
        </div>
      </section>

      <section class="card table-section">
        <div class="card-header">
          <h3>플랫폼별 요약</h3>
          <p>완료 주문 기준 매출, 순수익, 순수익률 순위를 확인합니다.</p>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>플랫폼</th>
                <th>주문 수</th>
                <th>완료 주문</th>
                <th>매출</th>
                <th>순수익</th>
                <th>순수익률</th>
                <th>순수익 순위</th>
                <th>순수익률 순위</th>
                <th>요약</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in tableData" :key="index">
                <td>{{ row.platform }}</td>
                <td>{{ row.totalOrders }}</td>
                <td>{{ row.completedOrders }}</td>
                <td>{{ row.sales }}</td>
                <td>{{ row.profit }}</td>
                <td>{{ row.margin }}</td>
                <td>{{ row.profitRank }}</td>
                <td>{{ row.marginRank }}</td>
                <td>{{ row.summary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 하단 테이블에 들어갈 데이터 (이미지와 동일하게 세팅)
const tableData = ref([
  { platform: '배민', totalOrders: 1, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 2, marginRank: 2, summary: '완료 주문이 아직 없습니다.' },
  { platform: '쿠팡이츠', totalOrders: 4, completedOrders: 2, sales: '54,000원', profit: '18,108원', margin: '33.53%', profitRank: 1, marginRank: 1, summary: '쿠팡이츠 완료 주문 2건 기준입니다.' },
  { platform: '요기요', totalOrders: 3, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 3, marginRank: 3, summary: '완료 주문이 아직 없습니다.' },
  { platform: '땡겨요', totalOrders: 2, completedOrders: 0, sales: '0원', profit: '0원', margin: '0%', profitRank: 4, marginRank: 4, summary: '완료 주문이 아직 없습니다.' },
]);
</script>

<style scoped>
/* 
=====================
공통 및 레이아웃 스타일
=====================


*/
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.dashboard-wrapper {
  background-color: #f4f6fc;
  min-height: 100vh;
  padding: 30px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #333;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-text {
  color: #3b82f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
}

/* 
======================
버튼 및 배지 공통 스타일
======================*/
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
.btn-primary { background: #3b82f6; color: white; }
.btn-danger { background: #ef4444; color: white; }

.badge-blue-light {
  background: #e0f2fe;
  color: #0284c7;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.badge-warning { background: #ffedd5; color: #ea580c; border: 1px solid #fdba74; }
.badge-danger { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.badge-success { background: #dcfce3; color: #16a34a; border: 1px solid #86efac; }

/*
========================
1. 상단 헤더 & 사용자 영역
========================
*/
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.title-area h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #111827;
}

.title-area p {
  color: #6b7280;
  font-size: 14px;
}

.user-card {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 12px;
  gap: 20px;
}

.user-email {
  font-weight: 600;
  color: #374151;
}

.user-actions {
  display: flex;
  gap: 8px;
}

/* 
===============
2. 탭 네비게이션
===============
*/
.tab-menu {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 
==============
3. 안내 배너
==============
*/
.notice-banner {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-banner p { color: #6b7280; font-size: 14px; }

/*
=======================
4. 대시보드 KPI 카드 영역
=======================
*/
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -8px;
}

.section-header h2 { font-size: 24px; color: #111827; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-label { font-size: 13px; color: #6b7280; }
.kpi-value { font-size: 28px; font-weight: 800; color: #111827; }
.kpi-desc { font-size: 12px; color: #9ca3af; }

/* 
=============================
5. 카드 공통 스타일 & 중간 섹션
=============================
*/
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.card-header {
  margin-bottom: 20px;
}
.card-header h3 { font-size: 18px; color: #111827; margin-bottom: 4px; }
.card-header p { font-size: 13px; color: #6b7280; }

.middle-section {
  display: flex;
  gap: 16px;
}

.platform-card, .margin-card { flex: 1; }

.inner-cards {
  display: flex;
  gap: 16px;
}

.inner-card {
  flex: 1;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inner-label { font-size: 12px; color: #6b7280; }
.inner-value { font-size: 24px; font-weight: 800; }
.inner-desc { font-size: 12px; color: #9ca3af; }

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}
.menu-label { font-weight: 600; color: #374151; }
.menu-value { color: #4b5563; }

.info-box {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

/* 
=====================
6. 알림(운영 분석) 영역
=====================
*/
.alert-summary {
  background: #eff6ff;
  color: #1e3a8a;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
}

.alert-key { width: 130px; font-size: 14px; color: #111827; }
.alert-text { font-size: 14px; color: #4b5563; flex: 1; }

/* 
==================
7. 하단 테이블 영역
==================
*/
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: #f9fafb;
  padding: 16px 12px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

</style>
