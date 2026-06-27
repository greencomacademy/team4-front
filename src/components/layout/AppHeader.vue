<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth/useAuthStore.js'
import myAxios from '../../api/myAxios.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 알림 드롭다운 상태 관리
const isNotiOpen = ref(false)
const dropdownContainer = ref(null)
const notifications = ref([])
const isNotificationLoading = ref(false)

const DISMISSED_NOTIFICATION_STORAGE_KEY = 'deliveryinsider.dismissedHeaderNotifications.v1'
const ACTIVE_ORDER_STATUSES = ['WAITING', 'COOKING', 'DELIVERING']
const REQUEST_ATTENTION_STATUSES = ['WAITING', 'COOKING']

const isActiveOrder = (order = {}) => {
  return ACTIVE_ORDER_STATUSES.includes(order.orderStatus)
}

const readDismissedNotificationKeys = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_NOTIFICATION_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const writeDismissedNotificationKeys = (keys) => {
  const normalizedKeys = Array.from(new Set(keys)).slice(-80)
  localStorage.setItem(
    DISMISSED_NOTIFICATION_STORAGE_KEY,
    JSON.stringify(normalizedKeys)
  )
}

const dismissNotification = (notification) => {
  if (!notification?.dismissKey) {
    return
  }

  writeDismissedNotificationKeys([
    ...readDismissedNotificationKeys(),
    notification.dismissKey,
  ])
}

const normalizeNotificationText = (value) => {
  return String(value || '')
    .replaceAll('요구사항', '요청사항')
    .replaceAll('요구확인', '요청확인')
}

const getOrderTimeValue = (order = {}) => {
  const rawDateTime =
    order.orderedAt ||
    order.createdAt ||
    order.cookingStartedAt ||
    order.completedAt ||
    ''

  const time = new Date(rawDateTime).getTime()

  if (!Number.isNaN(time)) {
    return time
  }

  return Number(order.id || 0)
}

const sortLatestOrders = (orderList = []) => {
  return [...orderList].sort((a, b) => {
    return getOrderTimeValue(b) - getOrderTimeValue(a)
  })
}

const hasRequestAttention = (order = {}) => {
  if (!REQUEST_ATTENTION_STATUSES.includes(order.orderStatus)) {
    return false
  }

  return Boolean(
    order.requestRiskType ||
    ['WARNING', 'DANGER'].includes(order.requestRiskLevel)
  )
}

const isDelayAttention = (order = {}, todayOrderMap = new Map()) => {
  const baseOrder = todayOrderMap.get(order.id) || {}

  if (!isActiveOrder(baseOrder)) {
    return false
  }

  const delayRiskLevel = order.delayRiskLevel || baseOrder.delayRiskLevel || 'SAFE'

  return delayRiskLevel !== 'SAFE'
}

const createNotificationKey = (type, orderList = []) => {
  const firstOrder = sortLatestOrders(orderList)[0]
  const firstId = firstOrder?.id || firstOrder?.orderNo || 'none'

  return `${type}:${orderList.length}:${firstId}`
}

const buildVisibleNotifications = (candidateNotifications = []) => {
  const dismissedKeys = new Set(readDismissedNotificationKeys())

  return candidateNotifications.filter((notification) => {
    return !dismissedKeys.has(notification.dismissKey)
  })
}

const buildNotificationsFromOrders = (todayOrders = [], delayRiskOrders = []) => {
  const activeOrders = todayOrders.filter(isActiveOrder)
  const waitingOrders = sortLatestOrders(
    activeOrders.filter((order) => order.orderStatus === 'WAITING')
  )
  const requestOrders = sortLatestOrders(
    activeOrders.filter(hasRequestAttention)
  )
  const todayOrderMap = new Map(
    todayOrders.map((order) => [order.id, order])
  )
  const delayOrders = sortLatestOrders(
    delayRiskOrders.filter((order) => isDelayAttention(order, todayOrderMap))
  )

  const result = []

  if (waitingOrders.length > 0) {
    result.push({
      type: 'WAITING_ORDER',
      title: '신규 주문 접수',
      description: `접수대기 주문 ${waitingOrders.length}건이 있습니다. 주문을 확인해 주세요.`,
      path: '/orders?status=WAITING',
      dismissKey: createNotificationKey('WAITING_ORDER', waitingOrders),
    })
  }

  if (requestOrders.length > 0) {
    result.push({
      type: 'REQUEST_ATTENTION',
      title: '요청사항 확인 필요',
      description: `${requestOrders.length}건의 주문에 알러지 · 분쟁 가능 표현이 있습니다.`,
      path: '/orders?attention=REQUEST',
      dismissKey: createNotificationKey('REQUEST_ATTENTION', requestOrders),
    })
  }

  if (delayOrders.length > 0) {
    result.push({
      type: 'DELAY_RISK',
      title: '지연 위험 주문',
      description: `${delayOrders.length}건의 주문이 조리 지연 위험 상태입니다.`,
      path: '/orders?attention=DELAY',
      dismissKey: createNotificationKey('DELAY_RISK', delayOrders),
    })
  }

  return buildVisibleNotifications(
    result.map((notification) => ({
      ...notification,
      title: normalizeNotificationText(notification.title),
      description: normalizeNotificationText(notification.description),
    }))
  )
}

const findHeaderNotifications = async () => {
  if (!authStore.isLoggedIn && !authStore.accessToken) {
    notifications.value = []
    return
  }

  try {
    isNotificationLoading.value = true

    const [todayOrdersResult, delayRiskResult] = await Promise.allSettled([
      myAxios.get('/api/orders/today'),
      myAxios.get('/api/orders/delay-risks'),
    ])

    const todayOrders =
      todayOrdersResult.status === 'fulfilled'
        ? todayOrdersResult.value.data.data || []
        : []

    const delayRiskOrders =
      delayRiskResult.status === 'fulfilled'
        ? delayRiskResult.value.data.data || []
        : []

    notifications.value = buildNotificationsFromOrders(
      todayOrders,
      delayRiskOrders
    )
  } catch (error) {
    notifications.value = []
    console.error(error)
  } finally {
    isNotificationLoading.value = false
  }
}

const handleNotificationRefreshRequest = async () => {
  await findHeaderNotifications()
}

// 알림 메뉴 토글
const toggleNoti = () => {
  isNotiOpen.value = !isNotiOpen.value
}

const moveNotification = (noti) => {
  dismissNotification(noti)
  notifications.value = notifications.value.filter((item) => item.dismissKey !== noti.dismissKey)
  router.push(noti.path || '/orders')
  isNotiOpen.value = false
}

// 외부 영역 클릭 시 알림 메뉴 닫기
const closeNoti = (e) => {
  if (isNotiOpen.value && dropdownContainer.value && !dropdownContainer.value.contains(e.target)) {
    isNotiOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', closeNoti)
  window.addEventListener('deliveryinsider:notifications-refresh', handleNotificationRefreshRequest)

  await findHeaderNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', closeNoti)
  window.removeEventListener('deliveryinsider:notifications-refresh', handleNotificationRefreshRequest)
})

const logout = async () => {
  await authStore.logout()
  router.replace('/')
}
</script>

<template>
  <header class="main-header">
    
    <!-- 왼쪽: 빈 공간 (타이틀 중앙 정렬을 위한 Flex 영역 유지) -->
    <div class="header-left"></div>

    <!-- 중앙: 페이지 타이틀 -->
    <div class="header-center">
      <h1 class="header-title">{{ route.meta.title || '헤더' }}</h1>
    </div>

    <!-- 오른쪽: 알림 및 액션 버튼 -->
    <div class="header-right">
      
      <!-- 알림 드롭다운 영역 -->
      <div class="header-icon-wrap" ref="dropdownContainer">
        <button type="button" class="header-icon-button" @click.stop="toggleNoti" aria-label="알림 보기">
          🔔<b v-if="notifications.length">{{ notifications.length }}</b>
        </button>
        
        <div v-if="isNotiOpen" class="notification-dropdown">
          <div class="notification-head">
            <strong>알림</strong>
            <span>현재 운영 기준</span>
          </div>

          <div v-if="isNotificationLoading" class="notification-empty">
            알림을 불러오는 중입니다.
          </div>
          
          <button 
            v-for="(noti, index) in notifications" 
            :key="`${noti.title}-${index}`"
            type="button" 
            class="notification-item" 
            @click="moveNotification(noti)"
          >
            <strong>{{ noti.title }}</strong>
            <small>{{ noti.description }}</small>
          </button>

          <div v-if="!isNotificationLoading && !notifications.length" class="notification-empty">
            새로운 알림이 없습니다.
          </div>
        </div>
      </div>

      <!-- 직관적인 외부 액션 버튼 -->
      <button type="button" class="header-action-button" @click="router.push('/profile')">내 정보</button>
      <button type="button" class="header-action-button logout" @click="logout">로그아웃</button>

    </div>
  </header>
</template>

<style scoped>
/* ============================================================
   메인 헤더 컨테이너 (Readability Pass 적용)
   ============================================================ */
.main-header {
  --bg-header: #ffffff;
  --border-color: #e2e8f0;
  --primary: #2784B8;
  --primary-light: #EAF8FD;
  --text-main: #164E68;
  --text-sub: #475569;
  --hover-bg: #f8fafc;

  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  /* 나이대가 있는 점주를 위한 헤더 높이 및 여백 확대 */
  min-height: 78px;
  padding: 0 28px;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

/* ============================================================
   레이아웃 분할
   ============================================================ */
.header-left, .header-right {
  flex: 1;
  display: flex;
  align-items: center;
}
.header-left { justify-content: flex-start; }
.header-right { justify-content: flex-end; gap: 8px; position: relative; }

.header-center {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

/* ============================================================
   우측 액션 버튼 및 알림 아이콘 (가독성/터치 영역 강화)
   ============================================================ */
.header-action-button,
.header-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe3ee;
  background: #ffffff;
  color: #334155;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
}

.header-action-button {
  min-height: 42px;
  padding: 0 16px;
  font-size: 16px;
  border-radius: 12px;
}

.header-icon-button {
  width: 44px;
  height: 44px;
  font-size: 20px;
  border-radius: 13px;
  position: relative;
  padding: 0;
}

.header-action-button:hover,
.header-icon-button:hover {
  background-color: #f8fafc;
  color: var(--text-main);
}

.header-action-button.logout {
  color: #b91c1c;
  border-color: #fecaca;
}

/* 알림 배지 (빨간색 동그라미) */
.header-icon-button b {
  position: absolute;
  right: -4px;
  top: -5px;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #fff;
  background: #dc2626;
  font-size: 12px;
}

.header-icon-wrap { position: relative; }

/* ============================================================
   알림 드롭다운 메뉴
   ============================================================ */
.notification-dropdown {
  position: absolute;
  top: 56px;
  right: 0;
  width: 380px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16);
  z-index: 100;
}

.notification-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.notification-head strong { color: #111827; font-size: 18px; }
.notification-head span { color: #94a3b8; font-size: 14px; font-weight: 800; }

.notification-item {
  display: block;
  width: 100%;
  padding: 11px;
  border: 0;
  border-radius: 10px;
  background: #f8fafc;
  text-align: left;
  margin-top: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover { background: var(--primary-light); }

.notification-item strong { 
  display: block; 
  color: var(--text-main); 
  font-size: 16px; 
  font-weight: 900; 
}

.notification-item small { 
  display: block; 
  margin-top: 4px; 
  color: #64748b; 
  font-size: 14px; 
  line-height: 1.5; 
  font-weight: 600; 
}

.notification-empty {
  padding: 24px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}
</style>
