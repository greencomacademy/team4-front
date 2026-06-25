import { ref, computed } from 'vue';
import { defineStore } from "pinia";
import myAxios from "../../api/myAxios";

// 매장관리 스토어
export const useStoreStore = defineStore('store',() => {

  // state
  const currentData = ref();
  /*
 * 매장 조회 여부
 *
 * false: 아직 /api/stores/me를 조회하지 않음
 * true: 매장 조회를 한 번 완료함
 */
const isStoreChecked = ref(false);

/*
 * 매장이 실제로 있는지 여부
 */
const hasStore = computed(() => {
  return !!currentData.value;
});

  // 현재 매장정보 표시용 콜백
  const currentStore = async () => {
    try {
      const url = '/api/stores/me'; // ✅ 수정됨 (store -> stores)
      const result = await myAxios.get(url);

      currentData.value = result.data.data;
       isStoreChecked.value = true;
      return currentData.value;

    } catch (error) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      if( responseData?.code === 'E31' &&
      status === 404) 
      {
      currentData.value = null;
      isStoreChecked.value = true;
      return null;
      }
      isStoreChecked.value = true;
      console.error(error);
      throw error;
      
    }
  }
  /*
 * 매장 존재 여부 확인용 함수
 *
 * 라우터 가드와 로그인 성공 후 이동 분기에서 사용한다.
 * 이미 조회한 적이 있으면 다시 API를 호출하지 않는다.
 * force=true면 강제로 다시 조회한다.
 */
const checkMyStore = async (force = false) => {
  if (
    isStoreChecked.value &&
    !force
  ) {
    return currentData.value;
  }

  return await currentStore();
};
 
  // 매장등록 콜백
  const storeForm = async (myStoreRegistration) => {
    try {
      const url = '/api/stores/newstore'; // ✅ 수정됨 (store -> stores, newStore -> newstore)
      const res = await myAxios.post(url, myStoreRegistration);
      currentData.value = res.data.data;
      isStoreChecked.value = true;
      return currentData.value;
    } catch (error) {
      console.error(error);
      alert("매장 등록에 실패했습니다.");
    }
  }

  // 현재 매장 삭제 콜백
  const deleteStore = async () => {
    try {
      const url = `/api/stores/me`; // ✅ 수정됨 (store -> stores)
      const res = await myAxios.delete(url);

      currentData.value = null;
      isStoreChecked.value = true;
    } catch (error) {
      console.error(error);
      alert("매장 삭제에 실패했습니다.");
    }
  }
  /*
 * 로그아웃 시 매장 상태 초기화
 */
const clearStoreState = () => {
  currentData.value = undefined;
  isStoreChecked.value = false;
};

  // 현재 매장 수정 콜백
  const updateStore = async (myStoreUpdate) => {
    try {
      const url = `/api/stores/me`; // ✅ 수정됨 (store -> stores)
      const res = await myAxios.patch(url, myStoreUpdate);

      // 업데이트 후 최신 매장정보를 다시 불러옵니다.
    return await currentStore();
    } catch (error) {
      console.error(error);
      alert("매장 정보 수정에 실패했습니다.");
    }
  }

  return {
    // state
    currentData,
    isStoreChecked,
    hasStore,

    // actions
    currentStore,
    checkMyStore,
    storeForm,
    deleteStore,
    updateStore,
    clearStoreState
  }
});

