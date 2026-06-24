import { ref } from 'vue';
import { defineStore } from "pinia";
import myAxios from "../../api/myAxios";

// 매장관리 스토어
export const useStoreStore = defineStore('store',() => {

  // state
  const currentData = ref();

  // 현재 매장정보 표시용 콜백
  const currentStore = async () => {
    try {
      const url = '/api/stores/me'; // ✅ 수정됨 (store -> stores)
      const result = await myAxios.get(url);

      currentData.value = result.data.data;
       return currentData.value;
    } catch (error) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      if( responseData?.code === 'E31' &&
      status === 404) 
      {
      currentData.value = null;
      return null;
      }
      console.error(error);
      throw error;
      
    }
  }
 
  // 매장등록 콜백
  const storeForm = async (myStoreRegistration) => {
    try {
      const url = '/api/stores/newstore'; // ✅ 수정됨 (store -> stores, newStore -> newstore)
      const res = await myAxios.post(url, myStoreRegistration);
    } catch (error) {
      console.error(error);
      throw alert("매장 등록에 실패했습니다.");
    }
  }

  // 현재 매장 삭제 콜백
  const deleteStore = async () => {
    try {
      const url = `/api/stores/me`; // ✅ 수정됨 (store -> stores)
      const res = await myAxios.delete(url);

      currentData.value = null;
    } catch (error) {
      console.error(error);
      throw alert("매장 삭제에 실패했습니다.");
    }
  }

  // 현재 매장 수정 콜백
  const updateStore = async (myStoreUpdate) => {
    try {
      const url = `/api/stores/me`; // ✅ 수정됨 (store -> stores)
      const res = await myAxios.patch(url, myStoreUpdate);

      // 업데이트 후 최신 매장정보를 다시 불러옵니다.
      await currentStore();
    } catch (error) {
      console.error(error);
      throw alert("매장 정보 수정에 실패했습니다.");
    }
  }

  return {
    // state
    currentData,

    // actions
    currentStore,
    storeForm,
    deleteStore,
    updateStore
  }
});

