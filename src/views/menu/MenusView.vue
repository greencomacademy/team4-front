<script setup>
import { onBeforeMount, reactive, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '../../stores/menu/useMenuStore.js';
import { usePlatformSettingStore } from '../../stores/platform/usePlatformSettingStore.js';

const store = useMenuStore();
const platformSettingStore = usePlatformSettingStore();
const route = useRoute();

// 탭 상태 관리 (base: 메뉴 기준정보, platform: 플랫폼 수수료 기준 단품 수익 비교, loss: 숨은 손실 메뉴)
const activeMenuTab = ref('base');

const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedMenuId = ref(null);

const baseSearchKeyword = ref('');
const baseSortOption = ref('priceDesc');
const platformSearchKeyword = ref('');
const platformSortOption = ref('profitDesc');
const selectedCompareMenuId = ref('');
const lossSearchKeyword = ref('');
const lossSortOption = ref('riskDesc');
const showDismissedLossMenus = ref(false);

const baseCurrentPage = ref(1);
const basePageSize = 10;
const lossCurrentPage = ref(1);
const lossPageSize = 4;
const changingLossDismissMenuId = ref(null);

const formData = reactive({
  menuName: '',
  menuPrice: '',
  menuCost: '',
  packagingFee: '',
  expectedCookingTime: '',
  batchCapacity: ''
});

const applyRouteQuery = () => {
  const tab = String(route.query.tab || '');

  if (['base', 'platform', 'loss'].includes(tab)) {
    activeMenuTab.value = tab;
  }

  if (route.query.menuId) {
    selectedCompareMenuId.value = String(route.query.menuId);
  }

  if (route.query.keyword) {
    const keyword = String(route.query.keyword);
    baseSearchKeyword.value = keyword;
    platformSearchKeyword.value = keyword;
    lossSearchKeyword.value = keyword;
  }
};

onBeforeMount(async () => {
  await Promise.all([
    store.fetchMenus(),
    store.fetchLossDismissals().catch(() => []),
    platformSettingStore.findAll().catch(() => [])
  ]);

  applyRouteQuery();
});

watch(
  () => route.query,
  () => {
    applyRouteQuery();
  },
  { deep: true }
);

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
// 분석 및 계산 로직
// ============================================================
const platformNames = {
  BAEMIN: '배민',
  COUPANG_EATS: '쿠팡이츠',
  YOGIYO: '요기요',
  DDANGYO: '땡겨요',
};

const fallbackPlatformPolicies = [
  { platformType: 'BAEMIN', name: '배민', commissionRate: 6.8 },
  { platformType: 'COUPANG_EATS', name: '쿠팡이츠', commissionRate: 9.8 },
  { platformType: 'YOGIYO', name: '요기요', commissionRate: 8.5 },
  { platformType: 'DDANGYO', name: '땡겨요', commissionRate: 4.5 },
];

const toNumber = (value) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const calculateCommissionAmount = (amount, commissionRate) => {
  const rawCommission = amount * (toNumber(commissionRate) / 100);
  return Math.ceil(rawCommission / 10) * 10;
};

// 금액 포맷
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};

const getProfitBarWidth = (profit, maxProfit) => {
  if (maxProfit <= 0) {
    return 8;
  }

  return Math.max(8, Math.min(100, (profit / maxProfit) * 100));
};

const getMenuId = (menu) => {
  return menu.menuId || menu.id;
};

const lossDismissalMap = computed(() => {
  return new Map(
    store.lossDismissals.map((dismissal) => {
      return [String(dismissal.menuId), dismissal];
    })
  );
});

const getLossDismissal = (menu) => {
  return lossDismissalMap.value.get(String(getMenuId(menu)));
};

const isLossMenuDismissed = (menu) => {
  return Boolean(getLossDismissal(menu));
};

const formatDateTimeText = (dateTime) => {
  if (!dateTime) {
    return '';
  }

  return String(dateTime).replace('T', ' ').slice(0, 16);
};

const getPlatformSalesQuantity = (menu, platformType) => {
  const fieldMap = {
    BAEMIN: 'baeminSalesQuantity',
    COUPANG_EATS: 'coupangEatsSalesQuantity',
    YOGIYO: 'yogiyoSalesQuantity',
    DDANGYO: 'ddangyoSalesQuantity',
  };

  return toNumber(menu[fieldMap[platformType]]);
};

// 스토어 메뉴 데이터를 분석용 데이터로 확장
const enrichedMenus = computed(() => {
  return store.menuList.map((menu) => {
    const price = toNumber(menu.menuPrice);
    const cost = toNumber(menu.menuCost);
    const packageCost = toNumber(menu.packagingFee);
    const expectedMargin = toNumber(menu.expectedMargin ?? (price - cost - packageCost));

    let profitRate = menu.expectedMarginRate;
    if (profitRate === undefined || profitRate === null) {
      profitRate = price > 0
        ? Math.round((expectedMargin / price) * 10000) / 100
        : 0;
    }

    const totalSalesQuantity =
      toNumber(menu.totalSalesQuantity) ||
      toNumber(menu.baeminSalesQuantity) +
      toNumber(menu.coupangEatsSalesQuantity) +
      toNumber(menu.yogiyoSalesQuantity) +
      toNumber(menu.ddangyoSalesQuantity);

    return {
      ...menu,
      menuId: getMenuId(menu),
      expectedMargin,
      totalSalesQuantity,
      profitRate: toNumber(profitRate),
      costRate: price > 0 ? Math.round((cost / price) * 1000) / 10 : 0,
      packageRate: price > 0 ? Math.round((packageCost / price) * 1000) / 10 : 0
    };
  });
});

const filterMenusByKeyword = (menus, keyword) => {
  const trimmedKeyword = keyword.trim().toLowerCase();

  if (!trimmedKeyword) {
    return menus;
  }

  return menus.filter((menu) => {
    return String(menu.menuName || '').toLowerCase().includes(trimmedKeyword);
  });
};

const sortMenus = (menus, sortOption) => {
  return [...menus].sort((a, b) => {
    if (sortOption === 'priceAsc') {
      return toNumber(a.menuPrice) - toNumber(b.menuPrice);
    }

    if (sortOption === 'priceDesc') {
      return toNumber(b.menuPrice) - toNumber(a.menuPrice);
    }

    if (sortOption === 'profitAsc') {
      return toNumber(a.expectedMargin) - toNumber(b.expectedMargin);
    }

    if (sortOption === 'profitDesc') {
      return toNumber(b.expectedMargin) - toNumber(a.expectedMargin);
    }

    return String(a.menuName || '').localeCompare(String(b.menuName || ''), 'ko-KR');
  });
};

const filteredBaseMenus = computed(() => {
  return sortMenus(
    filterMenusByKeyword(enrichedMenus.value, baseSearchKeyword.value),
    baseSortOption.value
  );
});

const baseTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredBaseMenus.value.length / basePageSize));
});

const pagedBaseMenus = computed(() => {
  const startIndex = (baseCurrentPage.value - 1) * basePageSize;

  return filteredBaseMenus.value.slice(startIndex, startIndex + basePageSize);
});

const basePageNumbers = computed(() => {
  return Array.from({ length: baseTotalPages.value }, (_, index) => index + 1);
});

const changeBasePage = (page) => {
  if (page < 1 || page > baseTotalPages.value) {
    return;
  }

  baseCurrentPage.value = page;
};

watch([baseSearchKeyword, baseSortOption], () => {
  baseCurrentPage.value = 1;
});

watch(baseTotalPages, () => {
  if (baseCurrentPage.value > baseTotalPages.value) {
    baseCurrentPage.value = baseTotalPages.value;
  }
});

const platformCandidateMenus = computed(() => {
  return sortMenus(
    filterMenusByKeyword(enrichedMenus.value, platformSearchKeyword.value),
    platformSortOption.value
  );
});

const platformPolicies = computed(() => {
  const settings = platformSettingStore.platformSettings || [];

  if (!settings.length) {
    return fallbackPlatformPolicies;
  }

  return settings.map((setting) => {
    return {
      platformType: setting.platformType,
      name: platformNames[setting.platformType] || setting.platformType,
      commissionRate: toNumber(setting.commissionRate),
    };
  });
});

const selectedCompareMenu = computed(() => {
  if (selectedCompareMenuId.value) {
    const selected = enrichedMenus.value.find((menu) => {
      return String(menu.menuId) === String(selectedCompareMenuId.value);
    });

    if (selected) {
      return selected;
    }
  }

  return platformCandidateMenus.value[0] || enrichedMenus.value[0] || null;
});

const selectCompareMenu = (menu) => {
  selectedCompareMenuId.value = String(menu.menuId);
  activeMenuTab.value = 'platform';
};

// [탭 2] 플랫폼 비교 데이터
const platformCompareData = computed(() => {
  const compareMenu = selectedCompareMenu.value;
  if (!compareMenu) return null;

  const comparisons = platformPolicies.value.map(policy => {
    const commission = calculateCommissionAmount(
      toNumber(compareMenu.menuPrice),
      policy.commissionRate
    );
    const totalCost = toNumber(compareMenu.menuCost)
      + toNumber(compareMenu.packagingFee)
      + commission;
    const profit = toNumber(compareMenu.menuPrice) - totalCost;
    const profitRate = toNumber(compareMenu.menuPrice) > 0
      ? Math.round((profit / compareMenu.menuPrice) * 1000) / 10
      : 0;
    const salesQuantity = getPlatformSalesQuantity(compareMenu, policy.platformType);

    return {
      ...policy,
      rate: policy.commissionRate,
      commission,
      totalCost,
      profit,
      profitRate,
      salesQuantity,
    };
  });

  const maxProfit = Math.max(...comparisons.map(c => c.profit));
  const lowest = [...comparisons].sort((a, b) => a.profit - b.profit)[0];
  const highest = [...comparisons].sort((a, b) => b.profit - a.profit)[0];
  const totalSalesQuantity = comparisons.reduce((sum, item) => sum + item.salesQuantity, 0);

  const recommendation = {
    title: `${compareMenu.menuName}은(는) ${lowest.name}에서 가장 낮게 남습니다.`,
    desc: `${highest.name} 대비 주문 1건당 ${formatPrice(highest.profit - lowest.profit)}원 차이가 납니다. 판매건수가 많은 플랫폼은 수수료율 차이가 누적 손익에 더 크게 반영됩니다.`,
    actions: [
      `${lowest.name} 수수료율 설정 확인`,
      '판매건수가 높은 플랫폼은 수수료 차이를 우선 확인',
      '실제 배달비·쿠폰 반영 순수익은 운영 리포트에서 확인'
    ]
  };

  return {
    compareMenu,
    comparisons: comparisons.map(item => ({
      ...item,
      profitGapFromBest: maxProfit - item.profit,
    })),
    maxProfit,
    totalSalesQuantity,
    recommendation,
  };
});

// [탭 3] 손실 메뉴 데이터 판별
const getLossRiskBadges = (menu) => {
  const badges = [];

  if (menu.expectedMargin <= 0 || menu.profitRate < 15) {
    badges.push({ code: 'LOW_PROFIT', label: '낮은 수익률' });
  }

  if (menu.costRate >= 45) {
    badges.push({ code: 'HIGH_COST', label: '높은 원가' });
  }

  if (menu.packageRate >= 10) {
    badges.push({ code: 'HIGH_PACKAGE', label: '높은 포장비' });
  }

  if (menu.totalSalesQuantity >= 10 && menu.profitRate < 18) {
    badges.push({ code: 'HIGH_SALES_LOW_MARGIN', label: '마진 누적' });
  }

  if (menu.expectedCookingTime >= 45 && menu.profitRate < 15) {
    badges.push({ code: 'LONG_COOKING', label: '조리 부하' });
  }

  return badges;
};

const isHiddenLossCandidate = (menu) => {
  return menu.expectedMargin <= 0 ||
    menu.profitRate < 15 ||
    menu.costRate >= 45 ||
    menu.packageRate >= 10 ||
    (menu.totalSalesQuantity >= 10 && menu.profitRate < 18) ||
    (menu.expectedCookingTime >= 45 && menu.profitRate < 15);
};

const getLossRiskScore = (menu) => {
  let score = 0;

  if (menu.expectedMargin <= 0) score += 60;
  if (menu.profitRate < 8) score += 35;
  else if (menu.profitRate < 12) score += 22;
  else if (menu.profitRate < 15) score += 12;

  if (menu.costRate >= 55) score += 32;
  else if (menu.costRate >= 45) score += 18;

  if (menu.packageRate >= 15) score += 24;
  else if (menu.packageRate >= 10) score += 12;

  if (menu.totalSalesQuantity >= 10 && menu.profitRate < 12) score += 20;
  else if (menu.totalSalesQuantity >= 10 && menu.profitRate < 18) score += 10;
  if (menu.expectedCookingTime >= 45 && menu.profitRate < 15) score += 8;

  return score;
};

const getLossRiskLevel = (menu) => {
  const score = getLossRiskScore(menu);

  if (
    menu.expectedMargin <= 0 ||
    menu.profitRate < 8 ||
    menu.costRate >= 55 ||
    menu.packageRate >= 15 ||
    (menu.totalSalesQuantity >= 10 && menu.profitRate < 12) ||
    score >= 45
  ) {
    return 'DANGER';
  }

  return 'WARNING';
};

const getLossRiskLabel = (level) => {
  return {
    DANGER: '우선 확인',
    WARNING: '확인 필요',
  }[level] || '확인 필요';
};

const getLossRiskClass = (level) => {
  return {
    DANGER: 'danger',
    WARNING: 'warning',
  }[level] || 'warning';
};

const lossMenus = computed(() => {
  return enrichedMenus.value
    .map((menu) => {
      const reasons = [];

      if (menu.expectedMargin <= 0) {
        reasons.push(`단품 예상 순수익이 ${formatPrice(menu.expectedMargin)}원으로 손실입니다.`);
      }

      if (menu.profitRate < 15) {
        reasons.push(`예상 순수익률이 ${menu.profitRate}%로 낮습니다.`);
      }

      if (menu.costRate >= 45) {
        reasons.push(`원가 비중이 ${menu.costRate}%로 높습니다.`);
      }

      if (menu.packageRate >= 10) {
        reasons.push(`포장비 비중이 ${menu.packageRate}%입니다.`);
      }

      if (menu.totalSalesQuantity >= 10 && menu.profitRate < 18) {
        reasons.push('판매 수량이 있어 낮은 마진이 누적될 가능성이 있습니다.');
      }

      if (menu.expectedCookingTime >= 45 && menu.profitRate < 15) {
        reasons.push(`예상 조리시간이 ${menu.expectedCookingTime}분으로 피크타임 부하를 높일 수 있습니다.`);
      }

      if (reasons.length === 0) {
        reasons.push('수익률, 원가율, 포장비율을 다시 확인해 주세요.');
      }

      const actions = [];

      if (menu.expectedMargin <= 0 || menu.profitRate < 12) {
        actions.push('판매가 또는 원가 구조 재검토');
      }

      if (menu.costRate >= 45) {
        actions.push('원재료 원가 또는 판매가 재검토');
      }

      if (menu.packageRate >= 10) {
        actions.push('포장비가 높은 메뉴는 묶음 주문 유도');
      }

      if (menu.totalSalesQuantity >= 10 && menu.profitRate < 18) {
        actions.push('판매건수가 많은 플랫폼의 수수료 차이 우선 확인');
      }

      if (menu.expectedCookingTime >= 45 && menu.profitRate < 15) {
        actions.push('피크타임에는 예상 조리시간 안내 강화');
      }

      if (actions.length === 0) {
        actions.push('플랫폼 수수료 설정과 메뉴 가격을 함께 확인');
      }

      const riskLevel = getLossRiskLevel(menu);
      const riskScore = getLossRiskScore(menu);
      const riskBadges = getLossRiskBadges(menu);
      const dismissal = getLossDismissal(menu);

      return {
        ...menu,
        reasons,
        actions,
        riskLevel,
        riskScore,
        riskBadges,
        isDismissed: Boolean(dismissal),
        dismissedAt: dismissal?.dismissedAt || '',
        hideUntil: dismissal?.hideUntil || '',
        hideUntilText: formatDateTimeText(dismissal?.hideUntil),
      };
    })
    .filter((menu) => {
      return isHiddenLossCandidate(menu) && menu.riskBadges.length > 0;
    });
});

const filteredLossMenus = computed(() => {
  const keyword = lossSearchKeyword.value.trim().toLowerCase();

  const filtered = lossMenus.value.filter((menu) => {
    const keywordMatched = !keyword ||
      String(menu.menuName || '').toLowerCase().includes(keyword);

    const dismissedMatched =
      showDismissedLossMenus.value || !menu.isDismissed;

    return keywordMatched && dismissedMatched;
  });

  return [...filtered].sort((a, b) => {
    if (lossSortOption.value === 'riskDesc') {
      return b.riskScore - a.riskScore;
    }

    if (lossSortOption.value === 'profitRateAsc') {
      return a.profitRate - b.profitRate;
    }

    if (lossSortOption.value === 'expectedMarginAsc') {
      return a.expectedMargin - b.expectedMargin;
    }

    if (lossSortOption.value === 'salesDesc') {
      return b.totalSalesQuantity - a.totalSalesQuantity;
    }

    if (lossSortOption.value === 'costRateDesc') {
      return b.costRate - a.costRate;
    }

    if (lossSortOption.value === 'packageRateDesc') {
      return b.packageRate - a.packageRate;
    }

    return String(a.menuName || '').localeCompare(String(b.menuName || ''), 'ko-KR');
  });
});

const lossTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredLossMenus.value.length / lossPageSize));
});

const pagedLossMenus = computed(() => {
  const startIndex = (lossCurrentPage.value - 1) * lossPageSize;

  return filteredLossMenus.value.slice(startIndex, startIndex + lossPageSize);
});

const lossPageNumbers = computed(() => {
  return Array.from({ length: lossTotalPages.value }, (_, index) => index + 1);
});

const changeLossPage = (page) => {
  if (page < 1 || page > lossTotalPages.value) {
    return;
  }

  lossCurrentPage.value = page;
};

watch([lossSearchKeyword, lossSortOption, showDismissedLossMenus], () => {
  lossCurrentPage.value = 1;
});

watch(lossTotalPages, () => {
  if (lossCurrentPage.value > lossTotalPages.value) {
    lossCurrentPage.value = lossTotalPages.value;
  }
});

const activeLossMenus = computed(() => {
  return lossMenus.value.filter((menu) => !menu.isDismissed);
});

const dismissedLossMenus = computed(() => {
  return lossMenus.value.filter((menu) => menu.isDismissed);
});

const lossSummary = computed(() => {
  return {
    total: activeLossMenus.value.length,
    danger: activeLossMenus.value.filter((menu) => menu.riskLevel === 'DANGER').length,
    warning: activeLossMenus.value.filter((menu) => menu.riskLevel === 'WARNING').length,
    dismissed: dismissedLossMenus.value.length,
    filtered: filteredLossMenus.value.length,
  };
});

const dismissLossMenuForDays = async (menu) => {
  const confirmed = confirm(
    `${menu.menuName} 메뉴를 7일간 숨은 손실 후보에서 숨길까요?`
  );

  if (!confirmed) {
    return;
  }

  try {
    changingLossDismissMenuId.value = menu.menuId;
    await store.dismissLossMenu(menu.menuId, 7);
  } catch (error) {
    console.error(error);
    alert('숨은 손실 메뉴 확인 완료 처리에 실패했습니다.');
  } finally {
    changingLossDismissMenuId.value = null;
  }
};

const restoreDismissedLossMenu = async (menu) => {
  try {
    changingLossDismissMenuId.value = menu.menuId;
    await store.restoreLossMenu(menu.menuId);
  } catch (error) {
    console.error(error);
    alert('확인 완료한 메뉴를 다시 표시하지 못했습니다.');
  } finally {
    changingLossDismissMenuId.value = null;
  }
};
</script>


<template>
  <div class="menus-wrapper">
    <header class="page-header">
      <div>
        <span class="category-text">MENU PROFIT</span>
        <h1>메뉴 수익 관리</h1>
        <p class="header-desc">메뉴 기준정보, 플랫폼 수수료 기준 단품 수익, 숨은 손실 후보를 확인합니다.</p>
      </div>
    </header>

    <div class="tabs-mock">
      <button class="tab" :class="{ 'active': activeMenuTab === 'base' }" @click="setMenuTab('base')">
        메뉴 기준정보
      </button>
      <button class="tab" :class="{ 'active': activeMenuTab === 'platform' }" @click="setMenuTab('platform')">
        플랫폼 수수료 비교
      </button>
      <button class="tab" :class="{ 'active': activeMenuTab === 'loss' }" @click="setMenuTab('loss')">
        숨은 손실 메뉴
      </button>
    </div>

    <section v-if="activeMenuTab === 'base'" class="card">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>메뉴 기준정보</h2>
          <p>판매가, 원가, 포장비, 예상 조리시간을 등록하고 메뉴를 검색합니다.</p>
        </div>
        <button type="button" class="btn-sm-primary" @click="openAddModal">메뉴 등록</button>
      </div>

      <div class="menu-filter-panel">
        <label class="filter-field search-field">
          <span>메뉴 검색</span>
          <input
            type="text"
            v-model="baseSearchKeyword"
            placeholder="메뉴명을 입력하세요"
          >
        </label>

        <label class="filter-field sort-field">
          <span>정렬</span>
          <select v-model="baseSortOption">
            <option value="priceDesc">판매가 높은순</option>
            <option value="priceAsc">판매가 낮은순</option>
            <option value="profitDesc">예상 순수익 높은순</option>
            <option value="profitAsc">예상 순수익 낮은순</option>
          </select>
        </label>
      </div>

      <div class="menu-page-result-line">
        조건에 맞는 메뉴 <strong>{{ filteredBaseMenus.length }}개</strong>
        <span>· {{ baseCurrentPage }}/{{ baseTotalPages }}페이지 · 한 페이지 {{ basePageSize }}개</span>
      </div>

      <div class="table-responsive">
        <table class="data-table base-menu-table">
          <thead>
            <tr>
              <th>메뉴</th>
              <th>판매가</th>
              <th>원가</th>
              <th>포장비</th>
              <th>조리시간</th>
              <th>처리량</th>
              <th>예상 순수익</th>
              <th>예상 수익률</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBaseMenus.length === 0">
              <td colspan="9" class="empty-state">조건에 맞는 메뉴가 없습니다.</td>
            </tr>
            <tr
              v-else
              v-for="menu in pagedBaseMenus"
              :key="menu.menuId"
              class="clickable-row"
              @click="openEditModal(menu)"
            >
              <td>
                <strong>{{ menu.menuName }}</strong>
              </td>
              <td>{{ formatPrice(menu.menuPrice) }}원</td>
              <td>{{ formatPrice(menu.menuCost) }}원</td>
              <td>{{ formatPrice(menu.packagingFee) }}원</td>
              <td>{{ menu.expectedCookingTime }}분</td>
              <td>{{ menu.batchCapacity }}개</td>
              <td>{{ formatPrice(menu.expectedMargin) }}원</td>
              <td><span class="highlight">{{ menu.profitRate }}%</span></td>
              <td>
                <button
                  type="button"
                  class="table-action-button"
                  @click.stop="selectCompareMenu(menu)"
                >
                  수익 비교
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredBaseMenus.length > basePageSize" class="menu-pagination">
        <button
          type="button"
          class="pagination-button"
          :disabled="baseCurrentPage === 1"
          @click="changeBasePage(baseCurrentPage - 1)"
        >
          이전
        </button>

        <button
          v-for="page in basePageNumbers"
          :key="`base-page-${page}`"
          type="button"
          class="pagination-number"
          :class="{ active: baseCurrentPage === page }"
          @click="changeBasePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="pagination-button"
          :disabled="baseCurrentPage === baseTotalPages"
          @click="changeBasePage(baseCurrentPage + 1)"
        >
          다음
        </button>
      </div>
    </section>

    <section v-if="activeMenuTab === 'platform'" class="card platform-compare-section">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>플랫폼 수수료 기준 단품 수익 비교</h2>
          <p>동일 메뉴를 각 플랫폼에서 판매했을 때, 플랫폼 수수료만 반영한 단품 예상 순수익과 판매건수를 확인합니다.</p>
        </div>
      </div>

      <div class="menu-filter-panel platform-filter-panel">
        <label class="filter-field search-field">
          <span>메뉴 검색</span>
          <input
            type="text"
            v-model="platformSearchKeyword"
            placeholder="비교할 메뉴명을 입력하세요"
          >
        </label>

        <label class="filter-field sort-field">
          <span>정렬</span>
          <select v-model="platformSortOption">
            <option value="priceDesc">판매가 높은순</option>
            <option value="priceAsc">판매가 낮은순</option>
            <option value="profitDesc">예상 순수익 높은순</option>
            <option value="profitAsc">예상 순수익 낮은순</option>
          </select>
        </label>

        <label class="filter-field select-field">
          <span>비교 메뉴</span>
          <select v-model="selectedCompareMenuId">
            <option value="">검색 결과 첫 번째 메뉴</option>
            <option
              v-for="menu in platformCandidateMenus"
              :key="menu.menuId"
              :value="String(menu.menuId)"
            >
              {{ menu.menuName }} · {{ formatPrice(menu.menuPrice) }}원
            </option>
          </select>
        </label>
      </div>

      <template v-if="platformCompareData">
        <div class="compare-menu-summary">
          <div>
            <span>비교 메뉴</span>
            <strong>{{ platformCompareData.compareMenu.menuName }}</strong>
            <p>
              판매가 {{ formatPrice(platformCompareData.compareMenu.menuPrice) }}원 ·
              원가 {{ formatPrice(platformCompareData.compareMenu.menuCost) }}원 ·
              포장비 {{ formatPrice(platformCompareData.compareMenu.packagingFee) }}원
            </p>
          </div>
          <div>
            <span>판매 정보</span>
            <strong>완료 판매 {{ platformCompareData.totalSalesQuantity }}건</strong>
            <p>
              예상 순수익 {{ formatPrice(platformCompareData.compareMenu.expectedMargin) }}원 ·
              기준 수익률 {{ platformCompareData.compareMenu.profitRate }}%
            </p>
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
            <small class="sales-count-text">판매건수 {{ item.salesQuantity }}건</small>
            <small class="profit-gap-text">
              {{ item.profitGapFromBest === 0 ? '가장 높게 남음' : `최고 대비 ${formatPrice(item.profitGapFromBest)}원 낮음` }}
            </small>
            <div class="data-bar-bg">
              <div class="data-bar-fill fill-profit" :style="{ width: `${getProfitBarWidth(item.profit, platformCompareData.maxProfit)}%` }"></div>
            </div>
            <div class="platform-cost-breakdown">
              <div><span>수수료 {{ item.rate }}%</span><b>-{{ formatPrice(item.commission) }}원</b></div>
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
          배달비와 쿠폰 부담금은 주문 단위 비용이므로 단품 비교에서는 제외했습니다. 실제 주문 기준 순수익은 운영 리포트에서 확인하세요.
        </div>
      </template>
      <div v-else class="empty-state" style="padding: 40px 0;">
        비교할 메뉴 데이터가 없습니다. 메뉴 기준정보를 먼저 등록해주세요.
      </div>
    </section>

    <section v-if="activeMenuTab === 'loss'" class="card loss-analysis-section">
      <div class="card-header border-bottom">
        <div class="title-area">
          <h2>숨은 손실 메뉴</h2>
          <p>전체 메뉴가 아니라 수익성 확인이 필요한 후보만 보여줍니다.</p>
        </div>
        <div class="loss-summary-pill">
          후보 {{ lossSummary.total }}개 · 우선확인 {{ lossSummary.danger }}개 · 확인필요 {{ lossSummary.warning }}개 · 확인완료 {{ lossSummary.dismissed }}개
        </div>
      </div>

      <div class="loss-criteria-box">
        <strong>판정 기준</strong>
        <p>단품 예상 순수익률 15% 미만, 원가율 45% 이상, 포장비율 10% 이상, 판매량이 있지만 마진이 낮은 메뉴를 참고 후보로 표시합니다. 음료·사이드·이벤트 메뉴처럼 전략적으로 운영하는 메뉴는 확인 완료 처리할 수 있습니다.</p>
      </div>

      <div class="menu-filter-panel loss-filter-panel">
        <label class="filter-field search-field">
          <span>메뉴 검색</span>
          <input
            type="text"
            v-model="lossSearchKeyword"
            placeholder="손실 메뉴명을 입력하세요"
          >
        </label>

        <label class="filter-field sort-field">
          <span>정렬</span>
          <select v-model="lossSortOption">
            <option value="riskDesc">확인 우선순위 높은순</option>
            <option value="profitRateAsc">수익률 낮은순</option>
            <option value="expectedMarginAsc">예상 순수익 낮은순</option>
            <option value="salesDesc">판매 수량 많은순</option>
            <option value="costRateDesc">원가율 높은순</option>
            <option value="packageRateDesc">포장비율 높은순</option>
          </select>
        </label>

        <label class="loss-dismiss-check">
          <input
            type="checkbox"
            v-model="showDismissedLossMenus"
          >
          <span>확인 완료한 메뉴도 보기</span>
        </label>
      </div>

      <div class="filter-result-line loss-result-line">
        현재 조건에 맞는 손실 후보 <strong>{{ lossSummary.filtered }}개</strong>
        <span>· {{ lossCurrentPage }}/{{ lossTotalPages }}페이지 · 한 페이지 {{ lossPageSize }}개</span>
        <span>· 확인 완료 {{ lossSummary.dismissed }}개는 기본 목록에서 제외</span>
        <span>· 전체 메뉴는 메뉴 기준정보 탭에서 확인</span>
      </div>

      <div class="loss-menu-grid refined">
        <article
          v-for="menu in pagedLossMenus"
          :key="menu.menuId"
          class="loss-menu-card"
          :class="[getLossRiskClass(menu.riskLevel), { dismissed: menu.isDismissed }]"
        >
          <div class="loss-card-top">
            <span class="loss-level-badge" :class="getLossRiskClass(menu.riskLevel)">
              {{ getLossRiskLabel(menu.riskLevel) }}
            </span>
            <span v-if="menu.isDismissed" class="loss-dismissed-badge">
              확인 완료
            </span>
            <div class="loss-badge-row">
              <span
                v-for="badge in menu.riskBadges"
                :key="badge.code"
                class="loss-reason-badge"
              >
                {{ badge.label }}
              </span>
            </div>
          </div>

          <div class="loss-card-title-row">
            <div>
              <h3>{{ menu.menuName }}</h3>
              <p>
                판매가 {{ formatPrice(menu.menuPrice) }}원 · 완료 판매 {{ menu.totalSalesQuantity }}건
              </p>
            </div>
            <strong>{{ menu.profitRate }}%</strong>
          </div>

          <div class="loss-metric-row emphasis">
            <small>예상 순수익 {{ formatPrice(menu.expectedMargin) }}원</small>
            <small>원가율 {{ menu.costRate }}%</small>
            <small>포장비율 {{ menu.packageRate }}%</small>
            <small>조리 {{ menu.expectedCookingTime }}분</small>
          </div>

          <div v-if="menu.isDismissed" class="loss-dismissed-info">
            {{ menu.hideUntilText }}까지 숨김 처리된 메뉴입니다.
          </div>

          <div class="loss-reason-list">
            <b>손실 원인</b>
            <p v-for="(reason, idx) in menu.reasons" :key="idx">• {{ reason }}</p>
          </div>

          <div class="loss-action-list">
            <b>추천 조치</b>
            <p v-for="(action, idx) in menu.actions" :key="idx">→ {{ action }}</p>
          </div>

          <div class="loss-card-actions">
            <button
              v-if="!menu.isDismissed"
              type="button"
              class="sub-button"
              :disabled="changingLossDismissMenuId === menu.menuId"
              @click="dismissLossMenuForDays(menu)"
            >
              {{ changingLossDismissMenuId === menu.menuId ? '처리 중...' : '7일간 숨기기' }}
            </button>

            <button
              v-else
              type="button"
              class="sub-button"
              :disabled="changingLossDismissMenuId === menu.menuId"
              @click="restoreDismissedLossMenu(menu)"
            >
              {{ changingLossDismissMenuId === menu.menuId ? '처리 중...' : '다시 표시' }}
            </button>

            <button
              type="button"
              class="sub-button"
              @click="openEditModal(menu)"
            >
              메뉴 수정
            </button>
            <button
              type="button"
              class="primary-button"
              @click="selectCompareMenu(menu)"
            >
              수익 비교 보기
            </button>
          </div>
        </article>

        <div v-if="filteredLossMenus.length === 0" class="empty-state loss-empty-state">
          현재 조건에 맞는 숨은 손실 메뉴가 없습니다.
        </div>
      </div>

      <div v-if="filteredLossMenus.length > lossPageSize" class="menu-pagination loss-pagination">
        <button
          type="button"
          class="pagination-button"
          :disabled="lossCurrentPage === 1"
          @click="changeLossPage(lossCurrentPage - 1)"
        >
          이전
        </button>

        <button
          v-for="page in lossPageNumbers"
          :key="`loss-page-${page}`"
          type="button"
          class="pagination-number"
          :class="{ active: lossCurrentPage === page }"
          @click="changeLossPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="pagination-button"
          :disabled="lossCurrentPage === lossTotalPages"
          @click="changeLossPage(lossCurrentPage + 1)"
        >
          다음
        </button>
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

/* 탭 2: 플랫폼 수수료 비교 */
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
.loss-analysis-section {
  overflow: hidden;
}

.loss-summary-pill {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  color: #164e68;
  background: #eaf8fd;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.loss-criteria-box {
  margin: 16px 0;
  padding: 18px 20px;
  border: 1px solid #ccfbf1;
  border-radius: 16px;
  background: #f0fdfa;
}

.loss-criteria-box strong {
  display: block;
  margin-bottom: 4px;
  color: #0f766e;
  font-size: 17px;
  font-weight: 800;
}

.loss-criteria-box p {
  margin: 0;
  color: #0f766e;
  font-size: 15px;
  line-height: 1.6;
}

.loss-filter-panel {
  grid-template-columns: minmax(260px, 1fr) 240px 240px;
  margin-top: 18px;
}

.loss-dismiss-check {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  color: #334155;
  background: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-sizing: border-box;
}

.loss-dismiss-check input {
  width: 16px;
  height: 16px;
  accent-color: #2784b8;
}

.loss-result-line {
  margin: 14px 0 18px;
  padding: 14px 16px;
  border-radius: 14px;
  color: #334155;
  background: #f8fafc;
  font-size: 15px;
  font-weight: 700;
}

.loss-result-line strong {
  color: #2784b8;
  font-size: 17px;
  font-weight: 900;
}

.loss-menu-grid.refined {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.loss-menu-card {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 20px;
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  background: #ffffff;
}

.loss-menu-card.danger {
  border-color: #fecaca;
  background: #fff7f7;
}

.loss-menu-card.warning {
  border-color: #fed7aa;
  background: #fff7ed;
}

.loss-menu-card.dismissed {
  opacity: 0.72;
  border-style: dashed;
  background: #f8fafc;
}

.loss-menu-card.caution {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.loss-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.loss-level-badge,
.loss-reason-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.loss-level-badge.danger {
  color: #b91c1c;
  background: #fee2e2;
}

.loss-level-badge.warning {
  color: #c2410c;
  background: #ffedd5;
}

.loss-level-badge.caution {
  color: #1d4ed8;
  background: #dbeafe;
}

.loss-badge-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.loss-reason-badge {
  color: #475569;
  background: #f1f5f9;
}

.loss-dismissed-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  color: #475569;
  background: #e2e8f0;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.loss-dismissed-info {
  padding: 11px 13px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
  background: #ffffff;
  font-size: 13px;
  font-weight: 750;
}

.loss-card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.loss-card-title-row h3 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.3;
}

.loss-card-title-row p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
}

.loss-card-title-row strong {
  flex-shrink: 0;
  color: #dc2626;
  font-size: 30px;
  font-weight: 900;
  white-space: nowrap;
}

.loss-menu-card.caution .loss-card-title-row strong {
  color: #2563eb;
}

.loss-menu-card.warning .loss-card-title-row strong {
  color: #c2410c;
}

.loss-reason-list,
.loss-action-list {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.9);
}

.loss-reason-list b,
.loss-action-list b {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.loss-reason-list p,
.loss-action-list p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.55;
  word-break: keep-all;
}

.loss-action-list p {
  color: #164e68;
}

.loss-metric-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.loss-metric-row small {
  padding: 6px 9px;
  border-radius: 999px;
  color: #475569;
  background: #f3f4f6;
  font-weight: 750;
  font-size: 13px;
  white-space: nowrap;
}

.loss-metric-row.emphasis small:first-child {
  color: #164e68;
  background: #eaf8fd;
}

.loss-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.loss-empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
}


.menu-page-result-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0 0 14px;
  padding: 13px 15px;
  border-radius: 14px;
  color: #334155;
  background: #f8fafc;
  font-size: 15px;
  font-weight: 700;
}

.menu-page-result-line strong {
  color: #2784b8;
  font-size: 17px;
  font-weight: 900;
}

.menu-page-result-line span {
  color: #64748b;
}

.menu-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
}

.pagination-button,
.pagination-number {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  color: #475569;
  background: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.pagination-number.active {
  color: #ffffff;
  border-color: #2784b8;
  background: #2784b8;
}

.pagination-button:disabled,
.pagination-number:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loss-pagination {
  margin-top: 20px;
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

/* ============================================================
   2026-06-27 01:39 메뉴 모달 입력창 넘침 보정
   ============================================================ */
.menu-modal,
.status-modal-body,
.grid-form,
.form-group,
.form-group input {
  box-sizing: border-box;
}

.menu-modal {
  max-width: calc(100vw - 56px);
  overflow: hidden;
}

.status-modal-body {
  overflow-x: hidden;
}

.grid-form {
  width: 100%;
}

.form-group {
  min-width: 0;
}

.form-group input {
  width: 100%;
  max-width: 100%;
}


/* ============================================================
   메뉴 기준정보 표 중앙정렬
   - 메뉴 기준정보 탭은 비교형 데이터라 헤더/값을 중앙 기준으로 맞춘다.
   - 다른 탭의 설명형 카드/문장은 기존 왼쪽 정렬을 유지한다.
   ============================================================ */
.base-menu-table {
  min-width: 860px;
}

.base-menu-table th,
.base-menu-table td {
  text-align: center;
  vertical-align: middle;
}

.base-menu-table td strong,
.base-menu-table .eng-name,
.base-menu-table .highlight {
  text-align: center;
}

.base-menu-table td:not(:first-child),
.base-menu-table .highlight {
  white-space: nowrap;
}


/* ============================================================
   2026-06-27 메뉴 수익 관리 필터/플랫폼 판매건수 보정
   ============================================================ */
.menu-filter-panel {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 220px;
  gap: 14px;
  align-items: end;
  margin: 0 0 18px;
  padding: 18px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: #f8fafc;
}

.platform-filter-panel {
  grid-template-columns: minmax(260px, 1fr) 220px minmax(280px, .9fr);
}

.filter-field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.filter-field span {
  color: #475569;
  font-size: 14px;
  font-weight: 800;
}

.filter-field input,
.filter-field select {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #111827;
  background: #ffffff;
  font-size: 16px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;
}

.filter-field input::placeholder {
  color: #aebbd0;
  font-weight: 500;
}

.base-menu-table {
  min-width: 1080px;
}

.base-menu-table th,
.base-menu-table td {
  text-align: center;
  vertical-align: middle;
}

.base-menu-table td strong,
.base-menu-table .highlight {
  text-align: center;
}

.base-menu-table td:not(:first-child),
.base-menu-table .highlight {
  white-space: nowrap;
}

.table-action-button {
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  color: #2784b8;
  background: #eaf8fd;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.table-action-button:hover {
  color: #ffffff;
  background: #2784b8;
}

.platform-profit-card .sales-count-text {
  margin-top: 6px;
  color: #164e68;
  font-size: 13px;
  font-weight: 800;
}

.platform-profit-card .profit-gap-text {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.platform-cost-breakdown em {
  color: #059669;
  font-style: normal;
  font-weight: 900;
}

@media (max-width: 1100px) {
  .platform-filter-panel,
  .menu-filter-panel {
    grid-template-columns: 1fr;
  }
}

</style>