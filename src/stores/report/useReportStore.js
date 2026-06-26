import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';

export const useReportStore = defineStore('report', () => {
  const reportOrders = ref([]);
  const isLoading = ref(false);
  const isExporting = ref(false);
  const lastSearchParams = ref({});

  /*
   * 화면 필터 이름을 백엔드 query parameter 이름으로 변환한다.
   *
   * 화면:
   * platform, status
   *
   * 백엔드:
   * platformType, orderStatus
   */
  const buildSearchParams = (filters = {}) => {
    const params = {};

    if (filters.startDate) {
      params.startDate = filters.startDate;
    }

    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    if (filters.platform) {
      params.platformType = filters.platform;
    }

    if (filters.platformType) {
      params.platformType = filters.platformType;
    }

    if (filters.status) {
      params.orderStatus = filters.status;
    }

    if (filters.orderStatus) {
      params.orderStatus = filters.orderStatus;
    }

    /*
     * 주의:
     * 백엔드 riskType은 order_requests.risk_type 값을 기대한다.
     * 예: ALLERGY, DISPUTE, EXCESSIVE 등
     *
     * 현재 AllReportView의 risk 값은 REQUEST, LOSS, CANCEL 같은
     * 화면 전용 필터라서 그대로 riskType으로 보내면 검색 결과가 틀어질 수 있다.
     */
    if (filters.riskType) {
      params.riskType = filters.riskType;
    }

    if (filters.keyword && filters.keyword.trim()) {
      params.keyword = filters.keyword.trim();
    }

    return params;
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return '';
    }

    return String(dateTime).slice(0, 10);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return '';
    }

    return String(dateTime).replace('T', ' ').slice(0, 16);
  };

  const createRiskBadges = (order) => {
    const badges = [];

    if (order.requestRiskType === 'ALLERGY') {
      badges.push('알러지 주의');
    }

    if (order.requestRiskType === 'DISPUTE') {
      badges.push('분쟁 가능');
    }

    if (order.requestRiskType === 'EXCESSIVE') {
      badges.push('과도 요청');
    }

    if (
      order.requestRiskLevel === 'CAUTION' ||
      order.requestRiskLevel === 'WARNING' ||
      order.requestRiskLevel === 'DANGER'
    ) {
      badges.push('요구사항 확인');
    }

    const netProfit = Number(order.netProfit || 0);
    const isClosedOrder =
      order.orderStatus === 'CANCELED' ||
      order.orderStatus === 'REFUNDED';

    if (netProfit <= 0 && !isClosedOrder) {
      badges.push('손실 위험');
    }

    return [...new Set(badges)];
  };

  /*
   * 백엔드 응답을 기존 AllReportView.vue가 쓰던 필드명에 맞춘다.
   * 이렇게 하면 화면 수정량이 줄어든다.
   */
  const normalizeReportOrder = (order = {}) => {
    const riskBadges = createRiskBadges(order);

    return {
      ...order,

      // 화면 기존 필드명 보정
      orderDate: formatDate(order.orderedAt),
      platformOrderNo: order.platformOrderNumber || '',
      deliveryFeeAmount: order.deliveryFee || 0,
      couponAmount: order.couponCost || 0,
      menuCostAmount: order.totalMenuCost || 0,
      packagingAmount: order.totalPackagingFee || 0,

      // 일시 표시용
      orderedAtText: formatDateTime(order.orderedAt),
      cookingStartedAtText: formatDateTime(order.cookingStartedAt),
      completedAtText: formatDateTime(order.completedAt),
      canceledAtText: formatDateTime(order.canceledAt),
      refundedAtText: formatDateTime(order.refundedAt),

      /*
       * 기존 화면이 completedAt, canceledAt을 바로 출력하고 있어서
       * 우선 표시용 문자열로 맞춘다.
       */
      completedAt: formatDateTime(order.completedAt),
      canceledAt: formatDateTime(order.canceledAt),
      refundedAt: formatDateTime(order.refundedAt),

      // 화면 전용 판정값
      riskBadges,
      lossRisk: riskBadges.includes('손실 위험'),

      // null 방어
      cancelType: order.cancelType || '',
      cancelReason: order.cancelReason || '',
      refundType: order.refundType || '',
      refundReason: order.refundReason || '',
      requestText: order.requestText || '',
      requestRiskType: order.requestRiskType || '',
      requestRiskLevel: order.requestRiskLevel || '',
      requestAnalysisMessage: order.requestAnalysisMessage || '',
    };
  };

  /*
   * 화면 전용 risk 필터.
   *
   * REQUEST, LOSS, CANCEL, REFUND는 백엔드 riskType과 의미가 다르다.
   * 그래서 서버 조회 후 프론트에서 한 번 더 거른다.
   */
  const applyClientReportFilter = (orders, filters = {}) => {
    if (!filters.risk) {
      return orders;
    }

    return orders.filter((order) => {
      if (filters.risk === 'REQUEST') {
        return order.riskBadges.length > 0;
      }

      if (filters.risk === 'LOSS') {
        return order.lossRisk;
      }

      if (filters.risk === 'CANCEL') {
        return order.orderStatus === 'CANCELED';
      }

      if (filters.risk === 'REFUND') {
        return order.orderStatus === 'REFUNDED';
      }

      return true;
    });
  };

  const findOrders = async (filters = {}) => {
    try {
      isLoading.value = true;

      const params = buildSearchParams(filters);
      lastSearchParams.value = { ...params };

      const result = await myAxios.get('/api/reports/orders', {
        params,
      });

      const data = result.data.data || [];

      const normalizedOrders = data.map(normalizeReportOrder);

      reportOrders.value = applyClientReportFilter(
        normalizedOrders,
        filters
      );

      return reportOrders.value;
    } catch (error) {
      console.error(error);
      alert('운영 리포트 조회에 실패했습니다.');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const downloadOrdersCsv = async (filters = {}) => {
    try {
      isExporting.value = true;

      const params = buildSearchParams(filters);

      const result = await myAxios.get('/api/reports/orders/export', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([result.data], {
        type: 'text/csv;charset=utf-8;',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `deliveryinsider-orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert('CSV 다운로드에 실패했습니다.');
      throw error;
    } finally {
      isExporting.value = false;
    }
  };

  const clearReports = () => {
    reportOrders.value = [];
    isLoading.value = false;
    isExporting.value = false;
    lastSearchParams.value = {};
  };

  return {
    reportOrders,
    isLoading,
    isExporting,
    lastSearchParams,

    findOrders,
    downloadOrdersCsv,
    clearReports,
  };
});