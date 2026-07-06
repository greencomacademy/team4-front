import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';

export const useOrderStore = defineStore('order', () => {
  /*
   * 통합 주문 관리 화면의 오늘 주문 목록
   */
  const orderList = ref([]);

  /*
   * 주문 상세 응답
   */
  const orderDetail = ref(null);

  /*
   * 지연 위험 주문 목록
   */
  const delayRiskList = ref([]);

  /*
   * 목록 조회 중 여부
   */
  const isLoading = ref(false);

  /*
   * 상태 변경 중인 주문 ID
   */
  const changingOrderId = ref(null);

  /*
   * 오늘 영업일 주문 목록 조회
   *
   * 호출 API:
   * GET /api/orders/today
   */
  const findToday = async (params = {}) => {
    try {
      isLoading.value = true;

      const result = await myAxios.get('/api/orders/today', {
        params,
      });

      orderList.value = result.data.data || [];

      return orderList.value;
    } catch (error) {
      console.error(error);
      alert('오늘 주문 목록 조회에 실패했습니다.');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /*
   * 주문 상세 조회
   *
   * 호출 API:
   * GET /api/orders/{orderId}
   */
  const findOne = async (orderId) => {
    try {
      const result =
        await myAxios.get(`/api/orders/${orderId}`);

      orderDetail.value = result.data.data;

      return orderDetail.value;
    } catch (error) {
      console.error(error);
      alert('주문 상세 조회에 실패했습니다.');
      throw error;
    }
  };

  /*
   * 지연 위험 주문 조회
   *
   * 호출 API:
   * GET /api/orders/delay-risks
   */
  const findDelayRisks = async () => {
    try {
      const result =
        await myAxios.get('/api/orders/delay-risks');

      delayRiskList.value = result.data.data || [];

      return delayRiskList.value;
    } catch (error) {
      console.error(error);
      alert('지연 위험 주문 조회에 실패했습니다.');
      throw error;
    }
  };

  /*
   * 주문 상태 변경
   *
   * 호출 API:
   * PATCH /api/orders/{orderId}/status
   */
  const updateStatus = async (
    orderId,
    payload
  ) => {
    try {
      changingOrderId.value = orderId;

      const result =
        await myAxios.patch(
          `/api/orders/${orderId}/status`,
          payload
        );

      return result.data.data;
    } catch (error) {
      console.error(error);
      alert('주문 상태 변경에 실패했습니다.');
      throw error;
    } finally {
      changingOrderId.value = null;
    }
  };

  const clearOrders = () => {
    orderList.value = [];
    orderDetail.value = null;
    delayRiskList.value = [];
    isLoading.value = false;
    changingOrderId.value = null;
  };

  return {
    orderList,
    orderDetail,
    delayRiskList,
    isLoading,
    changingOrderId,

    findToday,
    findOne,
    findDelayRisks,
    updateStatus,
    clearOrders,
  };
});