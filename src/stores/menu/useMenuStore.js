import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios.js';

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref([]);
  const lossDismissals = ref([]);
// 2. 액션 (Actions)
  // [조회] 메뉴 목록 및 마진 분석 데이터 불러오기 (GET)
  const fetchMenus = async () => {
    try {
      // 백엔드의 MenuController에 작성된 마진 분석 전용 API 주소
      const url = '/api/menus/margin-analysis'; 
      const result = await myAxios.get(url);
      
      // 서버에서 준 데이터를 상태(State)에 저장
      menuList.value = result.data.data || [];
    } catch (error) {
      console.warn("메뉴 목록을 불러오지 못했습니다.", error);
      menuList.value = []; // 에러 시 빈 배열로 초기화하여 화면 깨짐 방지
    }
  };

  // 숨은 손실 메뉴 확인 완료 목록 조회
  const fetchLossDismissals = async () => {
    try {
      const result = await myAxios.get('/api/menus/loss-dismissals');
      lossDismissals.value = result.data.data || [];
      return lossDismissals.value;
    } catch (error) {
      console.warn('숨은 손실 메뉴 확인 완료 목록을 불러오지 못했습니다.', error);
      lossDismissals.value = [];
      return [];
    }
  };

  // 숨은 손실 메뉴 7일간 확인 완료 처리
  const dismissLossMenu = async (menuId, hideDays = 7) => {
    try {
      await myAxios.post(`/api/menus/${menuId}/loss-dismissal`, {
        hideDays,
      });

      await fetchLossDismissals();
    } catch (error) {
      console.error('숨은 손실 메뉴 확인 완료 처리 실패:', error);
      throw error;
    }
  };

  // 확인 완료한 숨은 손실 메뉴 다시 표시
  const restoreLossMenu = async (menuId) => {
    try {
      await myAxios.delete(`/api/menus/${menuId}/loss-dismissal`);

      await fetchLossDismissals();
    } catch (error) {
      console.error('숨은 손실 메뉴 다시 표시 실패:', error);
      throw error;
    }
  };

  // 내 활성 메뉴 조회
  const getAllMenus = async () => {
    try {
      const url = '/api/menus'; 
      const result = await myAxios.get(url);
      
      // 서버에서 준 데이터를 상태(State)에 저장
      menuList.value = result.data.data || [];
    } catch (error) {
      console.warn("메뉴 목록을 불러오지 못했습니다.", error);
      menuList.value = []; // 에러 시 빈 배열로 초기화하여 화면 깨짐 방지
    }
  };


  // [등록] 새로운 메뉴 등록하기 (POST)
  const createMenu = async (menuData) => {
    try {
      const url = '/api/menus';
      await myAxios.post(url, menuData);
      
      // 등록이 성공하면 서버에서 최신 목록을 다시 불러와 화면을 갱신합니다.
      await fetchMenus();
      await fetchLossDismissals();
    } catch (error) {
      console.error("메뉴 등록 실패:", error);
      throw error; // 에러를 컴포넌트로 던져서 컴포넌트가 처리하도록 함
    }
  };

  // [수정] 기존 메뉴 수정하기 (PATCH)
  const updateMenu = async (menuId, updateData) => {
    try {
      const url = `/api/menus/${menuId}`;
      await myAxios.patch(url, updateData);
      
      // 수정이 성공하면 서버에서 최신 목록을 다시 불러옵니다.
      await fetchMenus();
      await fetchLossDismissals();
    } catch (error) {
      console.error("메뉴 수정 실패:", error);
      throw error;
    }
  };

  // [삭제] 메뉴 삭제하기 (DELETE)
  const deleteMenu = async (menuId) => {
    try {
      const url = `/api/menus/${menuId}`;
      await myAxios.delete(url);
      
      // 삭제가 성공하면 서버에서 최신 목록을 다시 불러옵니다.
      await fetchMenus();
      await fetchLossDismissals();
    } catch (error) {
      console.error("메뉴 삭제 실패:", error);
      throw error;
    }
  };

  return {
    // state
    menuList,
    lossDismissals,
    
    // actions
    fetchMenus,
    getAllMenus,
    fetchLossDismissals,
    dismissLossMenu,
    restoreLossMenu,
    createMenu,
    updateMenu,
    deleteMenu
  };
});
