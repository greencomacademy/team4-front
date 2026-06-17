import { defineStore } from "pinia";
import { ref } from "vue";

// 매장관리 스토어
export const useStoreStore = defineStore('store',() => {


  // state
  const currentData = ref();



  // 현재 매장정보 표시용 콜백.
  const currentStore = async () => {
    try {
      const url = '/api/stores/me';
      const result = await myAxios.get(url);

      currentData.value = result.data.data;
    }catch (error) {
      throw alert(error);
    }
  }

 
  // 매장등록 콜백
  const storeForm = async (myStoreRegistration) => {

    try {
      const url = '/api/stores';
      const res = await myAxios.post(url, myStoreRegistration);

    } catch (error) {

      throw alert(error);
    }

  }


  // 현재 매장 삭제 콜백
  const deleteStore = async () => {

    try {
      const url = `/api/stores/me`;
      const res = await myAxios.delete(url);

      currentData.value = null;
    }
    catch (error) {

      throw alert(error);
    }

  }


  const updateStore = async (myStoreUpdate) => {
    try {
      const url = `/api/stores/me`;
      const res = await myAxios.patch(url, myStoreUpdate);
    } catch (error) {
      throw alert("매장 정보 수정에 실패했습니다.");
    }
  }


  return {

    // state
    currentData,

    // actions
    currentStore,
    storeForm,
    deleteStore
  }

})