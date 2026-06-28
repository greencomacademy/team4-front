import { ref } from 'vue';
import { defineStore } from 'pinia';
import myAxios from '../../api/myAxios.js';

export const usePlatformSettingStore = defineStore('platformSetting', () => {
  /*
   * 현재 로그인 사용자의 매장에 연결된 플랫폼 설정 목록
   *
   * 백엔드 응답:
   * [
   *   {
   *     id,
   *     platformType,
   *     commissionRate,
   *     deliveryFee,
   *     couponCost,
   *     platformSupportAmount,
   *     createdAt,
   *     updatedAt
   *   }
   * ]
   */
  const platformSettings = ref([]);

  /*
   * 조회 중 여부
   */
  const isLoading = ref(false);

  /*
   * 저장 중인 플랫폼 타입
   * 예: BAEMIN, COUPANG_EATS
   */
  const savingPlatformType = ref('');

  /*
   * 플랫폼 설정 전체 조회
   *
   * 호출 API:
   * GET /api/platform-settings
   */
  const findAll = async () => {
    try {
      isLoading.value = true;

      const url = '/api/platform-settings';
      const result = await myAxios.get(url);

      platformSettings.value = result.data.data || [];

      return platformSettings.value;
    } catch (error) {
      console.error(error);
      alert('플랫폼 수수료 설정 조회에 실패했습니다.');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /*
   * 플랫폼 설정 수정
   *
   * 호출 API:
   * PATCH /api/platform-settings/{platformType}
   *
   * platformType 예:
   * BAEMIN
   * COUPANG_EATS
   * YOGIYO
   * DDANGYO
   */
  const update = async (
    platformType,
    updatePayload
  ) => {
    try {
      savingPlatformType.value = platformType;

      const url = `/api/platform-settings/${platformType}`;
      const result = await myAxios.patch(
        url,
        updatePayload
      );

      const updatedSetting = result.data.data;

      platformSettings.value =
        platformSettings.value.map((setting) => {
          if (setting.platformType === platformType) {
            return updatedSetting;
          }

          return setting;
        });

      return updatedSetting;
    } catch (error) {
      console.error(error);
      alert('플랫폼 수수료 설정 수정에 실패했습니다.');
      throw error;
    } finally {
      savingPlatformType.value = '';
    }
  };

  const clearPlatformSettings = () => {
    platformSettings.value = [];
    isLoading.value = false;
    savingPlatformType.value = '';
  };

  return {
    platformSettings,
    isLoading,
    savingPlatformType,

    findAll,
    update,
    clearPlatformSettings,
  };
});