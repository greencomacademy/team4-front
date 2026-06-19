<script setup>
import { ref, computed } from 'vue';

// 상단 폼 데이터
const platformSettings = ref([
  { id: 'baemin', name: '배달의민족', engName: 'BAEMIN', feeRate: 6.8, deliveryBurden: 2600, couponBurden: 800 },
  { id: 'coupang', name: '쿠팡이츠', engName: 'COUPANG_EATS', feeRate: 9.8, deliveryBurden: 3200, couponBurden: 1200 },
  { id: 'yogiyo', name: '요기요', engName: 'YOGIYO', feeRate: 8.5, deliveryBurden: 2800, couponBurden: 1000 },
  { id: 'ddangyo', name: '땡겨요', engName: 'DDANGYO', feeRate: 4.5, deliveryBurden: 1800, couponBurden: 500 },
]);

// 하단 테이블 데이터 (그래프 계산을 위한 원시 숫자 데이터 salesRaw, profitRaw 추가)
const summaryData = ref([
  { platform: '배달의민족', totalOrders: 1, completedOrders: 0, sales: '0원', salesRaw: 0, profit: '0원', profitRaw: 0, margin: '0%', profitRank: 2, marginRank: 2, summary: '완료 주문이 아직 없습니다.' },
  { platform: '쿠팡이츠', totalOrders: 4, completedOrders: 2, sales: '54,000원', salesRaw: 54000, profit: '18,108원', profitRaw: 18108, margin: '33.5%', profitRank: 1, marginRank: 1, summary: '쿠팡이츠 완료 주문 2건 기준입니다.' },
  { platform: '요기요', totalOrders: 3, completedOrders: 0, sales: '0원', salesRaw: 0, profit: '0원', profitRaw: 0, margin: '0%', profitRank: 3, marginRank: 3, summary: '완료 주문이 아직 없습니다.' },
  { platform: '땡겨요', totalOrders: 2, completedOrders: 0, sales: '0원', salesRaw: 0, profit: '0원', profitRaw: 0, margin: '0%', profitRank: 4, marginRank: 4, summary: '완료 주문이 아직 없습니다.' },
]);

// 그래프 렌더링을 위해 매출과 순수익의 최댓값 계산 (100% 기준점)
const maxSales = computed(() => {
  const max = Math.max(...summaryData.value.map(item => item.salesRaw));
  return max > 0 ? max : 1; 
});

const maxProfit = computed(() => {
  const max = Math.max(...summaryData.value.map(item => item.profitRaw));
  return max > 0 ? max : 1;
});

// 플랫폼별 컬러 클래스 부여 함수 (대시보드와 동일)
const getPlatformClass = (name) => {
  if(name.includes('배달의민족') || name.includes('배민')) return 'brand-baemin';
  if(name.includes('쿠팡이츠')) return 'brand-coupang';
  if(name.includes('요기요')) return 'brand-yogiyo';
  return 'brand-default';
};

// 수정 버튼 클릭 시 실행할 함수
const saveSettings = (platform) => {
  alert(`✅ [${platform.name}] 정산 조건이 수정되었습니다.\n- 수수료: ${platform.feeRate}%\n- 배달비: ${platform.deliveryBurden}원\n- 쿠폰: ${platform.couponBurden}원`);
  console.log('수정된 데이터:', platform);
};
</script>

<template>
  <div class="platforms-wrapper">
    <header class="page-header">
      <span class="category-text">PLATFORM SETTING API</span>
      <h1>플랫폼 수수료 관리</h1>
      <p class="header-desc">배달 플랫폼별 수수료율과 배달비, 쿠폰 부담금을 설정하고 관리하세요.</p>
    </header>

    <main class="content-area">
      
      <section class="card settings-card">
        <div class="card-header border-bottom">
          <div>
            <h2>수수료 / 배달비 / 쿠폰 수정</h2>
            <p>플랫폼 추가/삭제 없이 4개 플랫폼의 정산 조건만 수정합니다.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table form-table">
            <thead>
              <tr>
                <th style="width: 20%;">플랫폼</th>
                <th style="width: 22%;">수수료율</th>
                <th style="width: 22%;">배달비 부담금</th>
                <th style="width: 22%;">쿠폰 부담금</th>
                <th style="width: 14%; text-align: center;">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="platform in platformSettings" :key="platform.id">
                <td>
                  <div class="platform-info">
                    <div class="platform-logo" :class="getPlatformClass(platform.name)">
                      {{ platform.name.charAt(0) }}
                    </div>
                    <div class="platform-name">
                      <strong>{{ platform.name }}</strong>
                      <span class="eng-name">{{ platform.engName }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="input-wrapper">
                    <input type="number" step="0.1" v-model="platform.feeRate" class="input-field" />
                    <span class="input-unit">%</span>
                  </div>
                </td>
                <td>
                  <div class="input-wrapper">
                    <input type="number" step="100" v-model="platform.deliveryBurden" class="input-field" />
                    <span class="input-unit">원</span>
                  </div>
                </td>
                <td>
                  <div class="input-wrapper">
                    <input type="number" step="100" v-model="platform.couponBurden" class="input-field" />
                    <span class="input-unit">원</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <button class="btn btn-sm-primary" @click="saveSettings(platform)">수정 저장</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card summary-card">
        <div class="card-header border-bottom">
          <div>
            <h2>플랫폼별 순수익 요약</h2>
            <p>현재 설정된 정산 조건을 바탕으로 한 완료 주문 기준 순위입니다.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 12%;">플랫폼</th>
                <th style="width: 8%;">주문 수</th>
                <th style="width: 8%;">완료 주문</th>
                <th style="width: 18%;">매출</th>
                <th style="width: 18%;">순수익</th>
                <th style="width: 12%;">순수익률</th>
                <th style="width: 12%;">순위 (수익/율)</th>
                <th style="width: 12%;">요약</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in summaryData" :key="index" :class="{'empty-row': row.completedOrders === 0}">
                <td>
                  <span class="platform-badge" :class="getPlatformClass(row.platform)">
                    {{ row.platform }}
                  </span>
                </td>
                <td><strong>{{ row.totalOrders }}</strong>건</td>
                <td><span class="badge-soft">{{ row.completedOrders }}건</span></td>
                
                <td>
                  <div class="data-bar-wrap">
                    <span class="num-val">{{ row.sales }}</span>
                    <div class="data-bar-bg" v-if="row.completedOrders > 0">
                      <div class="data-bar-fill fill-sales" :style="{ width: `${(row.salesRaw / maxSales) * 100}%` }"></div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="data-bar-wrap">
                    <span class="num-val highlight">{{ row.profit }}</span>
                    <div class="data-bar-bg" v-if="row.completedOrders > 0">
                      <div class="data-bar-fill fill-profit" :style="{ width: `${(row.profitRaw / maxProfit) * 100}%` }"></div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="margin-bar-wrap" v-if="row.completedOrders > 0">
                    <span class="margin-text">{{ row.margin }}</span>
                    <div class="margin-bar-bg"><div class="margin-bar-fill" :style="{ width: row.margin }"></div></div>
                  </div>
                  <span v-else class="text-muted">0%</span>
                </td>

                <td>
                  <span v-if="row.completedOrders > 0">🏆 {{ row.profitRank }}위 / {{ row.marginRank }}위</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="summary-text">{{ row.summary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* ========================================
Design System Variables (SaaS Premium)
======================================== */
.platforms-wrapper {
  /* Brand Colors - 업데이트 됨 */
  --primary: #87CEEB;
  --strong: #2784B8;
  --soft: #EAF8FD;
  --primary-text: #164E68;
  
  --text-main: #111827; /* 기본 텍스트를 조금 더 진하게 조정 */
  --text-sub: #475569;
  --text-muted: #9ca3af;
  
  --border-color: #e5e7eb;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 2px 12px rgba(15, 23, 42, 0.04);
  --shadow-focus: 0 0 0 3px rgba(39, 132, 184, 0.15); /* Strong 컬러 기반 포커스 링 */
  
  /* 브랜드 컬러 */
  --color-baemin: #2ac1bc;
  --color-coupang: #00a2e8;
  --color-yogiyo: #fa0050;

  background-color: #f4f6fc;
  min-height: calc(100vh - 60px); /* 화면 꽉 채우기 */
  padding: 30px; 
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: 'Sejong hospital Light', 'Pretendard', sans-serif;
  color: var(--primary-text);
  -webkit-font-smoothing: antialiased;
}

/* ==========================================
Page Header
=========================================== */
.page-header {
  margin-bottom: 24px;
}

.category-text {
  color: var(--strong); /* 포인트 텍스트 색상 변경 */
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  color: #111827;
}

.header-desc {
  color: var(--text-sub);
  font-size: 15px;
  margin: 0;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px; /* 간격 살짝 좁힘 */
  flex: 1; /* 남은 공간 채우기 */
}

/* ==========================================
Card Style (공통)
=========================================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 28px 24px;
  box-shadow: var(--shadow-card);
}

.summary-card {
  flex: 1; /* 요약 카드가 남은 아래 공간을 꽉 채우도록 설정 */
}

.card-header { margin-bottom: 24px; }
.card-header.border-bottom { border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
.card-header h2 { font-size: 18px; font-weight: 800; color: var(--primary-text); margin: 0 0 6px 0; }
.card-header p { font-size: 14px; color: var(--text-sub); margin: 0; }

/* ==========================================
Table Style
=========================================== */
.table-responsive { overflow-x: auto; margin-top: 10px; }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }

.data-table th {
  background: #f8fafc; /* 헤더 배경색 미세조정 */
  padding: 16px;
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 700; /* 폰트 웨이트 증가 */
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.data-table th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
.data-table th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }

.data-table td {
  padding: 16px;
  font-size: 14px;
  color: var(--text-main);
  border-bottom: 1px solid #f1f5f9; /* 라인 색상 더 부드럽게 */
  vertical-align: middle;
}

.data-table tbody tr { transition: background 0.2s; }
.data-table tbody tr:hover { background: var(--soft); } /* 호버 시 브랜드 연한 배경색 */
.data-table tbody tr.empty-row td { color: var(--text-muted); }

/* ==========================================
폼 특화 스타일 (입력창 등)
=========================================== */
.form-table td {
  padding: 20px 16px;
}

/* 플랫폼 프로필 디자인 */
.platform-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 16px;
}
.platform-logo.brand-baemin { background: var(--color-baemin); }
.platform-logo.brand-coupang { background: var(--color-coupang); }
.platform-logo.brand-yogiyo { background: var(--color-yogiyo); }
.platform-logo.brand-default { background: var(--text-muted); }

.platform-name { display: flex; flex-direction: column; }
.platform-name strong { font-size: 15px; font-weight: 700; color: var(--text-main); }
.platform-name .eng-name { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; margin-top: 2px; }

/* 입력 필드 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 200px;
}

.input-field {
  width: 100%;
  padding: 12px 36px 12px 14px; 
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-main);
  outline: none;
  transition: all 0.2s ease;
}

.input-field:hover {
  border-color: #94a3b8;
}

.input-field:focus {
  background: white;
  border-color: var(--strong);
  box-shadow: var(--shadow-focus);
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-unit {
  position: absolute;
  right: 14px;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
  pointer-events: none;
}

/* 폼 버튼 디자인 */
.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-sm-primary {
  background: var(--soft);
  color: var(--strong);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800; /* 강조 */
}

.btn-sm-primary:hover {
  background: var(--strong);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* ==========================================
요약 테이블 - 데이터 바 차트 디자인 추가
=========================================== */
.platform-badge { font-weight: 700; font-size: 14px; }
.platform-badge.brand-baemin { color: var(--color-baemin); }
.platform-badge.brand-coupang { color: var(--color-coupang); }
.platform-badge.brand-yogiyo { color: var(--color-yogiyo); }

.badge-soft { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 700; border: 1px solid var(--border-color); color: var(--primary-text); }

/* 바 차트 위의 숫자 스타일 조정 */
.num-val { 
  font-family: 'Pretendard', monospace; 
  font-weight: 600; 
  display: block; 
  margin-bottom: 8px;
  font-size: 14px;
}
.highlight { color: var(--strong); font-weight: 800; font-size: 15px; }

/* 매출/순수익 바 차트 래퍼 및 배경 */
.data-bar-wrap { display: flex; flex-direction: column; width: 100%; max-width: 140px; }
.data-bar-bg { width: 100%; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }

/* 막대 채우기 애니메이션 및 색상 */
.data-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.fill-sales { background: #94a3b8; } 
.fill-profit { background: var(--strong); } /* 브랜드 색상 반영 */

/* 순수익률 프로그래스 바 */
.margin-bar-wrap { display: flex; align-items: center; gap: 10px; }
.margin-text { font-weight: 700; width: 45px; color: var(--strong); }
.margin-bar-bg { flex: 1; max-width: 80px; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.margin-bar-fill { height: 100%; background: var(--primary); border-radius: 4px; }

.summary-text { font-size: 13px; color: var(--text-sub); max-width: 250px; line-height: 1.4; }
</style>