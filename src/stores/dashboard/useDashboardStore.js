import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';

export const useDashboardStore = defineStore('dashboard', () => {
  /*
   * 실시간 운영 요약
   * GET /api/orders/operation-summary
   */
  const operationSummary = ref(null);

  /*
   * 조리 지연 위험 주문 목록
   * GET /api/orders/delay-risks
   */
  const delayRiskOrders = ref([]);

  /*
   * 오늘 영업일 주문 목록
   * GET /api/orders/today
   *
   * 대시보드 우선 확인 주문에서
   * 요청사항 위험 / 손실 위험 주문을 보조로 뽑기 위해 사용한다.
   */
  const todayOrders = ref([]);

  const isLoading = ref(false);
  const lastUpdatedAt = ref(null);

  const findOperationSummary = async () => {
    const result =
      await myAxios.get('/api/orders/operation-summary');

    operationSummary.value = result.data.data;

    return operationSummary.value;
  };

  const findDelayRisks = async () => {
    const result =
      await myAxios.get('/api/orders/delay-risks');

    delayRiskOrders.value = result.data.data || [];

    return delayRiskOrders.value;
  };

  const findTodayOrders = async () => {
    const result =
      await myAxios.get('/api/orders/today');

    todayOrders.value = result.data.data || [];

    return todayOrders.value;
  };

  /*
   * 대시보드에서 필요한 API를 한 번에 호출한다.
   */
  const loadDashboard = async (options = {}) => {
    const shouldAlert = options.showAlert !== false;

    try {
      isLoading.value = true;

      await Promise.all([
        findOperationSummary(),
        findDelayRisks(),
        findTodayOrders(),
      ]);

      lastUpdatedAt.value = new Date();

      return {
        operationSummary: operationSummary.value,
        delayRiskOrders: delayRiskOrders.value,
        todayOrders: todayOrders.value,
      };
    } catch (error) {
      console.error(error);

      if (shouldAlert) {
        alert('실시간 운영 대시보드 조회에 실패했습니다.');
      }

      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const clearDashboard = () => {
    operationSummary.value = null;
    delayRiskOrders.value = [];
    todayOrders.value = [];
    isLoading.value = false;
    lastUpdatedAt.value = null;
  };

  return {
    operationSummary,
    delayRiskOrders,
    todayOrders,
    isLoading,
    lastUpdatedAt,

    findOperationSummary,
    findDelayRisks,
    findTodayOrders,
    loadDashboard,
    clearDashboard,
  };
});
