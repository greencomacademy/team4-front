<script setup>
import { onBeforeMount, reactive, ref, computed } from 'vue';
import { useMenuStore } from '../../stores/menu/useMenuStore';

const store = useMenuStore();

// 탭 상태 관리 (base: 메뉴 기준정보, platform: 플랫폼별 수익 비교, loss: 숨은 손실 메뉴)
const activeMenuTab = ref('base');

const isModalOpen = ref(false);
const isEditMode = ref(false); 
const selectedMenuId = ref(null);

const formData = reactive({
  menuName: '',
  menuPrice: '',
  menuCost: '',
  packagingFee: '',
  expectedCookingTime: '',
  batchCapacity: ''
});

onBeforeMount(async () => {
  await store.fetchMenus();
});

const setMenuTab = (tab) => {
  activeMenuTab.value = tab;
};

// 모달 조작
const openAddModal = () => {
  isEditMode.value = false;
  selectedMenuId.value = null;
  Object.keys(formData).forEach(key => formData[key] = '');
  isModalOpen.value = true;
};

const openEditModal = (menu) => {
  isEditMode.value = true;
  selectedMenuId.value = menu.menuId || menu.id; 
  
  formData.menuName = menu.menuName || '';
  formData.menuPrice = menu.menuPrice || '';
  formData.menuCost = menu.menuCost || '';
  formData.packagingFee = menu.packagingFee || '';
  formData.expectedCookingTime = menu.expectedCookingTime || '';
  formData.batchCapacity = menu.batchCapacity || '';
  
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      await store.updateMenu(selectedMenuId.value, formData);
      alert('메뉴가 수정되었습니다.');
    } else {
      await store.createMenu(formData);
      alert('메뉴가 등록되었습니다.');
    }
    closeModal();
  } catch (error) {
    console.error(error);
  }
};

const handleDelete = async () => {
  if (confirm('이 메뉴를 정말 삭제하시겠습니까?')) {
    try {
      await store.deleteMenu(selectedMenuId.value);
      alert('메뉴가 삭제되었습니다.');
      closeModal();
    } catch (error) {
      console.error(error);
    }
  }
};

// ============================================================
// 분석 및 계산 로직 (HTML 시안 로직 Vue 전환)
// ============================================================

// 금액 포맷
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};

// 스토어 메뉴 데이터를 분석용 데이터로 확장 (Mock 주문 건수 및 수익률 계산)
const enrichedMenus = computed(() => {
  return store.menuList.map((menu, index) => {
    const price = menu.menuPrice || 0;
    const cost = menu.menuCost || 0;
    const packageCost = menu.packagingFee || 0;
    
    // 시연을 위한 가상의 주문 건수 부여 (실제 API 연동 시 실제 데이터 사용)
    const mockOrderCounts = [18, 11, 21, 24, 0];
    const orderCount = mockOrderCounts[index % mockOrderCounts.length];

    // 예상 수익률 (플랫폼 수수료 9%, 기본 배달비 가정)
    let profitRate = menu.expectedMarginRate;
    if (profitRate === undefined || profitRate === null) {
      profitRate = Math.max(0, Math.round(((price - cost - packageCost - price * 0.09 - 2500) / price) * 1000) / 10);
      if (isNaN(profitRate) || !isFinite(profitRate)) profitRate = 0;
    }

    return {
      ...menu,
      orderCount,
      profitRate,
      costRate: Math.round((cost / price) * 1000) / 10 || 0,
      packageRate: Math.round((packageCost / price) * 1000) / 10 || 0
    };
  });
});

// [탭 2] 플랫폼 비교 데이터
const platformCompareData = computed(() => {
  const compareMenu = enrichedMenus.value[0]; // 목록의 첫 번째 메뉴를 기준으로 비교
  if (!compareMenu) return null;

  const platformPolicies = [
    { name: '배민', rate: 6.8, delivery: 2600, coupon: 800 },
    { name: '쿠팡이츠', rate: 9.8, delivery: 3200, coupon: 1200 },
    { name: '요기요', rate: 8.5, delivery: 2800, coupon: 1000 },
    { name: '땡겨요', rate: 4.5, delivery: 1800, coupon: 500 },
  ];

  const comparisons = platformPolicies.map(policy => {
    const commission = Math.round(compareMenu.menuPrice * (policy.rate / 100));
    const totalCost = compareMenu.menuCost + compareMenu.packagingFee + commission + policy.delivery + policy.coupon;
    const profit = compareMenu.menuPrice - totalCost;
    const profitRate = Math.round((profit / compareMenu.menuPrice) * 1000) / 10;
    
    return { ...policy, commission, totalCost, profit, profitRate };
  });

  const maxProfit = Math.max(...comparisons.map(c => c.profit));
  const lowest = [...comparisons].sort((a, b) => a.profit - b.profit)[0];
  const highest = [...comparisons].sort((a, b) => b.profit - a.profit)[0];

  const recommendation = {
    title: `${compareMenu.menuName}은(는) ${lowest.name}에서 가장 낮게 남습니다.`,
    desc: `${highest.name} 대비 주문 1건당 ${formatPrice(highest.profit - lowest.profit)}원 차이가 납니다. 쿠폰 부담금과 배달비 부담을 먼저 확인하세요.`,
    actions: [
      `${lowest.name} 쿠폰 부담금 적용 여부 확인`,
      '포장비가 높은 메뉴는 묶음 판매 또는 세트 구성 검토',
      '플랫폼별 판매가 차등 적용 가능 여부 검토'
    ]
  };

  return { compareMenu, comparisons, maxProfit, recommendation };
});

// [탭 3] 손실 메뉴 데이터 판별
const lossMenus = computed(() => {
  return enrichedMenus.value.filter(menu => menu.profitRate < 12 || menu.orderCount > 20).map(menu => {
    const reasons = [];
    if (menu.profitRate < 12) reasons.push(`예상 순수익률이 ${menu.profitRate}%로 낮습니다.`);
    if (menu.costRate >= 35) reasons.push(`원가 비중이 ${menu.costRate}%로 높습니다.`);
    if (menu.packageRate >= 7) reasons.push(`포장비 비중이 ${menu.packageRate}%입니다.`);
    if (menu.orderCount >= 20 && menu.profitRate < 15) reasons.push('주문 수가 많아 낮은 마진이 누적될 가능성이 큽니다.');
    if (menu.expectedCookingTime >= 30) reasons.push(`예상 조리시간이 ${menu.expectedCookingTime}분으로 피크타임 부하를 높일 수 있습니다.`);
    if (reasons.length === 0) reasons.push('플랫폼 수수료와 배달비 조건을 확인해 주세요.');

    const actions = [];
    if (menu.costRate >= 35) actions.push('원재료 원가 또는 판매가 재검토');
    if (menu.packageRate >= 7) actions.push('포장비가 높은 메뉴는 묶음 주문 유도');
    if (menu.profitRate < 10) actions.push('쿠폰 부담금 적용 여부 확인');
    if (menu.expectedCookingTime >= 30) actions.push('피크타임에는 예상 조리시간 안내 강화');
    if (actions.length === 0) actions.push('플랫폼 수수료 설정과 메뉴 가격을 함께 확인');

    return { ...menu, reasons, actions };
  });
});
</script>

<template>
  <div class="menus-wrapper">
    <header class="page-header">
      <div>
        <span class="category-text">MENU PROFIT</span>
        <h1>메뉴 수익 관리</h1>
        <p class="header-desc">메뉴 기준정보와 플랫폼별 같은 메뉴 수익 차이를 확인합니다.</p>
      </div>
    </header>

    <div class="tabs-mock">
      <button class="tab" :class="{ 'active': activeMenuTab === 'base' }" @click="setMenuTab('base')">
        메뉴 기준정보
      </button>
      <button class="tab" :class="{ 'active': activeMenuTab === 'platform' }" @click="setMenuTab('platform')">
        플랫폼별 수익 비교
      </button>
      <button class="tab" :class="{ 'active': activeMenuTab === 'loss' }" @click="setMenuTab('loss')">
        숨은 손실 메뉴
      </button>
    </div>

    <section v-if="activeMenuTab === 'base'" class="card">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>메뉴 기준정보</h2>
          <p>판매가, 원가, 포장비, 예상 조리시간을 등록합니다.</p>
        </div>
        <button type="button" class="btn-sm-primary" @click="openAddModal">메뉴 등록</button>
      </div>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>메뉴</th>
              <th>판매가</th>
              <th>원가</th>
              <th>포장비</th>
              <th>조리시간</th>
              <th>처리량</th>
              <th>예상 수익률</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="enrichedMenus.length === 0">
              <td colspan="7" class="empty-state">등록된 메뉴가 없습니다. 우측 상단에서 메뉴를 등록해주세요.</td>
            </tr>
            <tr 
              v-else 
              v-for="menu in enrichedMenus" 
              :key="menu.menuId" 
              @click="openEditModal(menu)" 
              class="clickable-row"
            >
              <td>
                <strong>{{ menu.menuName }}</strong>
                <span class="eng-name">주문 {{ menu.orderCount }}건</span>
              </td>
              <td>{{ formatPrice(menu.menuPrice) }}원</td>
              <td>{{ formatPrice(menu.menuCost) }}원</td>
              <td>{{ formatPrice(menu.packagingFee) }}원</td>
              <td>{{ menu.expectedCookingTime }}분</td>
              <td>{{ menu.batchCapacity }}개</td>
              <td><span class="highlight">{{ menu.profitRate }}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeMenuTab === 'platform'" class="card platform-compare-section">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>플랫폼별 같은 메뉴 수익 차이</h2>
          <p>동일 메뉴를 각 플랫폼에서 판매했을 때, 메뉴 원가와 플랫폼 비용을 함께 반영한 예상 순수익입니다.</p>
        </div>
      </div>
      
      <template v-if="platformCompareData">
        <div class="compare-menu-summary">
          <div>
            <span>비교 메뉴</span>
            <strong>{{ platformCompareData.compareMenu.menuName }}</strong>
            <p>판매가 {{ formatPrice(platformCompareData.compareMenu.menuPrice) }}원 · 원가 {{ formatPrice(platformCompareData.compareMenu.menuCost) }}원 · 포장비 {{ formatPrice(platformCompareData.compareMenu.packagingFee) }}원</p>
          </div>
          <div>
            <span>운영 정보</span>
            <strong>{{ platformCompareData.compareMenu.expectedCookingTime }}분 / {{ platformCompareData.compareMenu.batchCapacity }}개</strong>
            <p>오늘 주문 {{ platformCompareData.compareMenu.orderCount }}건 · 현재 기준 수익률 {{ platformCompareData.compareMenu.profitRate }}%</p>
          </div>
        </div>

        <div class="platform-profit-grid refined">
          <article 
            v-for="item in platformCompareData.comparisons" 
            :key="item.name" 
            class="platform-profit-card refined-card"
          >
            <span class="platform-name">{{ item.name }}</span>
            <strong>{{ formatPrice(item.profit) }}원</strong>
            <small>예상 순수익률 {{ item.profitRate }}%</small>
            <div class="data-bar-bg">
              <div class="data-bar-fill fill-profit" :style="{ width: `${Math.max(8, (item.profit / platformCompareData.maxProfit) * 100)}%` }"></div>
            </div>
            <div class="platform-cost-breakdown">
              <div><span>수수료 {{ item.rate }}%</span><b>-{{ formatPrice(item.commission) }}원</b></div>
              <div><span>배달비 부담</span><b>-{{ formatPrice(item.delivery) }}원</b></div>
              <div><span>쿠폰 부담</span><b>-{{ formatPrice(item.coupon) }}원</b></div>
            </div>
          </article>
        </div>

        <div class="platform-recommendation-card">
          <div>
            <span>추천 확인</span>
            <strong>{{ platformCompareData.recommendation.title }}</strong>
            <p>{{ platformCompareData.recommendation.desc }}</p>
          </div>
          <ul>
            <li v-for="(action, idx) in platformCompareData.recommendation.actions" :key="idx">{{ action }}</li>
          </ul>
        </div>
        
        <div class="info-banner">
          같은 {{ platformCompareData.compareMenu.menuName }}이라도 플랫폼 수수료, 배달비 부담, 쿠폰 부담금 설정에 따라 남는 금액이 달라집니다.
        </div>
      </template>
      <div v-else class="empty-state" style="padding: 40px 0;">
        비교할 메뉴 데이터가 없습니다. 메뉴 기준정보를 먼저 등록해주세요.
      </div>
    </section>

    <section v-if="activeMenuTab === 'loss'" class="card">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>숨은 손실 메뉴</h2>
          <p>잘 팔리지만 실제 예상 순수익률이 낮은 메뉴와 원인을 함께 보여줍니다.</p>
        </div>
      </div>
      
      <div class="loss-criteria-box">
        <strong>판정 기준</strong>
        <p>매출·주문 수가 높은데 예상 순수익률이 12% 미만이거나, 주문 수 20건 이상이면서 마진이 낮은 메뉴를 우선 표시합니다.</p>
      </div>

      <div class="loss-menu-grid refined">
        <article 
          v-for="menu in lossMenus" 
          :key="menu.menuId" 
          class="loss-menu-card" 
          :class="{ 'danger': menu.profitRate < 12 }"
        >
          <span>{{ menu.orderCount > 20 ? '주문 많음' : '저마진' }}</span>
          <h3>{{ menu.menuName }}</h3>
          <strong>{{ menu.profitRate }}%</strong>
          
          <div class="loss-reason-list">
            <p v-for="(reason, idx) in menu.reasons" :key="idx">• {{ reason }}</p>
          </div>
          
          <div class="loss-action-list">
            <b>추천 조치</b>
            <p v-for="(action, idx) in menu.actions" :key="idx">→ {{ action }}</p>
          </div>
          
          <div class="loss-metric-row">
            <small>판매가 {{ formatPrice(menu.menuPrice) }}원</small>
            <small>원가율 {{ menu.costRate }}%</small>
            <small>포장비율 {{ menu.packageRate }}%</small>
          </div>
        </article>
        
        <div v-if="lossMenus.length === 0" class="empty-state" style="grid-column: span 2; padding: 40px 0;">
          현재 숨은 손실 메뉴가 없습니다. 안정적으로 운영 중입니다.
        </div>
      </div>
    </section>

    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="status-modal menu-modal">
        <div class="status-modal-header">
          <div class="title-area">
            <span class="category-text">MENU SETTING</span>
            <h2>{{ isEditMode ? '메뉴 정보 수정' : '메뉴 등록' }}</h2>
            <p>판매가, 원가, 포장비, 조리시간을 입력합니다.</p>
          </div>
          <button type="button" class="modal-close-button" @click="closeModal">×</button>
        </div>
        
        <div class="status-modal-body">
          <form class="grid-form" @submit.prevent="handleSubmit">
            <div class="form-group full-width">
              <label>메뉴명 <span>*</span></label>
              <input name="menuName" type="text" v-model="formData.menuName" placeholder="예: 제육 덮밥" required>
            </div>
            <div class="form-group">
              <label>판매가 (원) <span>*</span></label>
              <input name="menuPrice" type="number" v-model.number="formData.menuPrice" required>
            </div>
            <div class="form-group">
              <label>원가 (원)</label>
              <input name="menuCost" type="number" v-model.number="formData.menuCost">
            </div>
            <div class="form-group">
              <label>포장비 (원)</label>
              <input name="packagingFee" type="number" v-model.number="formData.packagingFee">
            </div>
            <div class="form-group">
              <label>예상 조리시간 (분) <span>*</span></label>
              <input name="expectedCookingTime" type="number" v-model.number="formData.expectedCookingTime" required>
            </div>
            <div class="form-group full-width">
              <label>한 번에 처리 가능 수량 (인분)</label>
              <input name="batchCapacity" type="number" v-model.number="formData.batchCapacity">
            </div>

            <div class="modal-actions full-width" :class="{'justify-between': isEditMode}">
              <button v-if="isEditMode" type="button" class="sub-button danger-outline" @click="handleDelete">
                메뉴 삭제
              </button>
              
              <div class="right-buttons">
                <button type="button" class="sub-button" @click="closeModal">취소</button>
                <button type="submit" class="primary-button">
                  {{ isEditMode ? '수정 완료' : '등록 완료' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   공통 레이아웃
   ============================================================ */
.menus-wrapper {
  min-height: calc(100vh - 70px);
  padding: 30px;
  background-color: #f4f6fc;
  font-family: 'Pretendard', sans-serif;
  color: #164E68;
}

.page-header {
  margin-bottom: 24px;
}

.category-text {
  color: #2784B8;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #111827;
}

.header-desc {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

/* 탭 스타일 (HTML 시안 반영) */
.tabs-mock {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 20px;
  border: 0;
  background: transparent;
  font-weight: 700;
  font-size: 15px;
  color: #9ca3af;
  cursor: pointer;
  outline: none;
}

.tab.active {
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
  margin-bottom: -2px;
}

/* 카드 및 테이블 공통 스타일 */
.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 28px 24px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
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
  font-size: 23px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px 0;
}

.title-area p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* 탭 1: 메뉴 기준정보 테이블 */
.table-responsive {
  overflow-x: auto;
  margin-top: 10px;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  padding: 16px 14px;
  font-size: 15px;
  color: #475569;
  font-weight: 900;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
.data-table th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }

.data-table td {
  padding: 17px 14px;
  font-size: 16px;
  color: #111827;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: #EAF8FD;
}

.data-table td strong {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
}

.eng-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-top: 4px;
}

.highlight {
  color: #2784B8;
  font-weight: 800;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px !important;
  color: #9ca3af;
  font-size: 16px;
}

/* 탭 2: 플랫폼별 수익 비교 */
.compare-menu-summary {
  display: grid;
  grid-template-columns: 1.2fr .9fr;
  gap: 14px;
  margin: 16px 0;
}

.compare-menu-summary > div {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #f8fafc;
}

.compare-menu-summary span {
  display: block;
  margin-bottom: 5px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
}

.compare-menu-summary strong {
  display: block;
  color: #111827;
  font-size: 20px;
}

.compare-menu-summary p {
  margin: 5px 0 0;
  color: #4b5563;
  font-size: 16px;
  line-height: 1.6;
}

.platform-profit-grid.refined {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.platform-profit-card.refined-card {
  padding: 20px;
  border: 1px solid #d8dee9;
  border-radius: 14px;
  background: #ffffff;
  align-content: start;
  min-height: 230px;
}

.platform-name {
  color: #164E68;
  font-size: 15px;
  font-weight: 900;
}

.platform-profit-card strong {
  display: block;
  margin: 10px 0 12px;
  color: #111827;
  font-size: 24px;
  font-weight: 900;
}

.platform-profit-card small {
  display: block;
  margin-top: -2px;
  color: #6b7280;
  font-size: 12px;
}

.data-bar-bg {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.data-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s;
}

.fill-profit { background: #3b82f6; }

.platform-cost-breakdown {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid #e5e7eb;
}

.platform-cost-breakdown div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.platform-cost-breakdown b {
  color: #dc2626;
}

.platform-recommendation-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr);
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  background: #fff7ed;
}

.platform-recommendation-card span {
  color: #c2410c;
  font-size: 12px;
  font-weight: 900;
}

.platform-recommendation-card strong {
  display: block;
  margin: 4px 0;
  color: #111827;
  font-size: 20px;
}

.platform-recommendation-card p {
  margin: 0;
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
}

.platform-recommendation-card ul {
  margin: 0;
  padding-left: 18px;
  color: #7c2d12;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.6;
}

.platform-recommendation-card li + li { margin-top: 4px; }

.info-banner {
  background-color: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0f766e;
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 18px;
  line-height: 1.55;
}

/* 탭 3: 숨은 손실 메뉴 */
.loss-criteria-box {
  margin: 16px 0;
  padding: 20px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: #f8fafc;
}

.loss-criteria-box strong {
  display: block;
  margin-bottom: 4px;
  color: #334155;
  font-size: 20px;
}

.loss-criteria-box p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
}

.loss-menu-grid.refined {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.loss-menu-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.loss-menu-card span {
  color: #64748b;
  font-size: 13px;
  font-weight: 900;
}

.loss-menu-card h3 {
  margin: 10px 0 6px;
  color: #111827;
  font-size: 22px;
}

.loss-menu-card strong {
  display: block;
  color: #3b82f6;
  font-size: 28px;
}

.loss-menu-card.danger {
  border-color: #fecaca;
  background: #fff7f7;
}

.loss-menu-card.danger strong {
  color: #dc2626;
}

.loss-reason-list {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 16px;
  background: #f8fafc;
}

.loss-menu-card.danger .loss-reason-list {
  background: #fff7f7;
}

.loss-reason-list p {
  margin: 0;
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
}

.loss-menu-card.danger .loss-reason-list p {
  color: #7f1d1d;
}

.loss-action-list {
  margin-top: 12px;
  padding: 20px;
  border-radius: 16px;
  background: #f8fafc;
}

.loss-action-list b {
  display: block;
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 20px;
}

.loss-action-list p {
  margin: 4px 0;
  color: #164E68;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.6;
}

.loss-metric-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.loss-metric-row small {
  padding: 5px 8px;
  border-radius: 999px;
  color: #475569;
  background: #f3f4f6;
  font-weight: 700;
  font-size: 15px;
}

/* 버튼 스타일 */
.btn-sm-primary,
.primary-button,
.sub-button {
  font: inherit;
  cursor: pointer;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  font-size: 16px;
  font-weight: 900;
  transition: all 0.2s;
}

.btn-sm-primary { background: #EAF8FD; color: #2784B8; }
.btn-sm-primary:hover { background: #2784B8; color: white; }

.primary-button { border: 0; color: #ffffff; background: #3b82f6; }
.primary-button:hover { background: #2563eb; }

.sub-button { border: 1px solid #dbe3ee; color: #334155; background: #ffffff; }
.sub-button:hover { background: #f8fafc; color: #164e68; border-color: #87ceeb; }

.danger-outline { color: #b91c1c !important; border-color: #fecaca !important; }
.danger-outline:hover { background: #fef2f2 !important; }

/* 모달 스타일 */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 28px; background: rgba(15, 23, 42, 0.45);
}

.status-modal {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
}
.menu-modal { width: min(760px, 100%); }

.status-modal-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 18px;
  padding: 26px 28px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;
}
.status-modal-header h2 { margin: 6px 0; color: #111827; font-size: 30px; font-weight: 900; }
.status-modal-header p { margin: 0; color: #64748b; font-size: 16px; }

.modal-close-button {
  width: 44px; height: 44px; font-size: 30px;
  background: #ffffff; color: #475569; border: 0; border-radius: 10px;
  display: grid; place-items: center; cursor: pointer;
}
.modal-close-button:hover { background: #eaf8fd; color: #164e68; }

.status-modal-body {
  padding: 28px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }

.form-group { display: grid; gap: 8px; }
.form-group label { color: #374151; font-size: 16px; font-weight: 800; }
.form-group label span { color: #ef4444; }
.form-group input {
  width: 100%; min-height: 46px; padding: 0 14px;
  border: 1px solid #d1d5db; border-radius: 12px;
  font-size: 17px; color: #111827; background: #fff;
  outline: none; transition: all 0.2s;
}
.form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }

.modal-actions {
  display: flex; align-items: center; justify-content: flex-end;
  margin-top: 14px; padding-top: 24px; border-top: 1px solid #e5e7eb;
}
.justify-between { justify-content: space-between; }
.right-buttons { display: flex; gap: 12px; }

@media (max-width: 1100px) {
  .platform-profit-grid.refined,
  .loss-menu-grid.refined,
  .compare-menu-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .menus-wrapper { padding: 18px; }
  .grid-form { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
  .modal-actions { flex-direction: column; align-items: stretch; gap: 12px; }
  .right-buttons { display: flex; flex-direction: column; width: 100%; gap: 12px; }
}
</style>