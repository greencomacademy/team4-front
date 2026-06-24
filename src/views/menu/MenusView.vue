<!--
MenusView.vue: '메뉴 수익성 설정' 탭입니다. 
새 메뉴를 등록하거나 기존 메뉴를 수정하는 폼 영역과, 메뉴별 마진율을 분석해 보여주는 테이블 영역을 담당합니다.
-->
<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
// 스토어를 불러올 때 반드시 { } 중괄호를 사용해야 합니다.
import { useMenuStore } from '../../stores/menu/useMenuStore';

const store = useMenuStore();

const isModalOpen = ref(false);
const isEditMode = ref(false); 
const selectedMenuId = ref(null);

const formData = reactive({
  menuName: '',
  menuPrice: '',
  menuCost: '',
  packagingFee: '',
  expectedCookingTime: '',
  batchCapacity: ''
});

onBeforeMount(async () => {
  await store.fetchMenus();
});

const openAddModal = () => {
  isEditMode.value = false;
  selectedMenuId.value = null;
  Object.keys(formData).forEach(key => formData[key] = '');
  isModalOpen.value = true;
};

const openEditModal = (menu) => {
  isEditMode.value = true;
  selectedMenuId.value = menu.menuId; 
  
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

const formatPrice = (price) => {
  return Number(price).toLocaleString();
};
</script>

<template>
  <section data-tab-panel="menu-profit" class="page-section">
    <div class="section-title-row">
      <h1 class="main-title">메뉴 수익 관리</h1>
      <p class="sub-desc">메뉴 기준값과 마진 분석을 함께 표시</p>
    </div>

    <article class="card">
      <div class="card-header">
        <div class="title-area">
          <h3>등록된 메뉴 목록</h3>
        </div>
        <button type="button" class="btn-submit" @click="openAddModal">메뉴 등록</button>
      </div>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>메뉴명</th>
              <th>판매가</th>
              <th>원가/포장비</th>
              <th>마진율</th>
              <th>조리부담</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.menuList.length === 0">
              <td colspan="5" class="empty-state">등록된 메뉴가 없습니다. 우측 상단에서 메뉴를 등록해주세요.</td>
            </tr>
            <tr 
              v-else 
              v-for="menu in store.menuList" 
              :key="menu.menuId" 
              @click="openEditModal(menu)" 
              class="clickable-row"
            >
              <td class="font-bold">{{ menu.menuName }}</td>
              <td>{{ formatPrice(menu.menuPrice) }}원</td>
              <td>{{ formatPrice(menu.menuCost) }} / {{ formatPrice(menu.packagingFee) }}</td>
              <td :class="{'text-green': menu.expectedMarginRate >= 50, 'font-bold': true}">
                {{ menu.expectedMarginRate }}%
              </td>
              <td class="font-bold">{{ menu.cookingBurdenLevel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <article class="card modal-content">
        <div class="card-header">
          <div class="title-area">
            <h3>{{ isEditMode ? '메뉴 수정' : '메뉴 등록' }}</h3>
            <p class="required-note"><span>*</span> 필수 입력</p>
          </div>
        </div>
        
        <form id="menuForm" class="grid-form" @submit.prevent="handleSubmit">
          <div class="input-group full-width">
            <label>메뉴명 <span>*</span></label>
            <input name="menuName" type="text" v-model="formData.menuName" placeholder="예) 묵은지 김치찜" required>
          </div>
          
          <div class="input-group">
            <label>판매가 (원) <span>*</span></label>
            <input name="menuPrice" type="number" v-model.number="formData.menuPrice" placeholder="예) 12000" required>
          </div>
          <div class="input-group">
            <label>원가 (원) <span>*</span></label>
            <input name="menuCost" type="number" v-model.number="formData.menuCost" placeholder="예) 4300" required>
          </div>
          
          <div class="input-group">
            <label>포장비 (원) <span>*</span></label>
            <input name="packagingFee" type="number" v-model.number="formData.packagingFee" placeholder="예) 500" required>
          </div>
          <div class="input-group">
            <label>예상 조리시간 (분) <span>*</span></label>
            <input name="expectedCookingTime" type="number" v-model.number="formData.expectedCookingTime" placeholder="예) 15" required>
          </div>
          
          <div class="input-group full-width">
            <label>1회 최대 조리 가능량 (인분) <span>*</span></label>
            <input name="batchCapacity" type="number" v-model.number="formData.batchCapacity" placeholder="예) 5" required>
          </div>

          <div class="form-actions full-width" :class="{'justify-between': isEditMode}">
            <button v-if="isEditMode" type="button" class="btn-danger" @click="handleDelete">메뉴 삭제</button>
            
            <div class="right-buttons">
              <button type="button" class="btn-cancel" @click="closeModal">취소</button>
              <button type="submit" class="btn-submit">
                {{ isEditMode ? '수정 완료' : '등록 완료' }}
              </button>
            </div>
          </div>
        </form>
      </article>
    </div>
  </section>
</template>

<style scoped>
.page-section { max-width: 1000px; margin: 0 auto; padding: 40px 20px; color: #374151; font-family: 'Pretendard', sans-serif; }
.main-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 8px; }
.sub-desc { font-size: 14px; color: #6b7280; margin-bottom: 30px; }
.font-bold { font-weight: 700; color: #111827; }
.text-green { color: #059669 !important; }

.card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px 40px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.title-area h3 { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 4px; }

.table-responsive { width: 100%; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { background: #f9fafb; padding: 16px 12px; font-size: 13px; color: #6b7280; font-weight: 600; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
.data-table td { padding: 16px 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
.clickable-row { cursor: pointer; transition: background-color 0.2s ease; }
.clickable-row:hover { background: #f3f4f6; }
.empty-state { text-align: center; padding: 40px !important; color: #9ca3af !important; font-size: 14px; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 32px 30px; }
.required-note { font-size: 12px; color: #9ca3af; }
.required-note span { color: #ef4444; }

.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 13px; font-weight: 700; color: #374151; }
.input-group label span { color: #ef4444; }
.grid-form input { padding: 10px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; font-size: 14px; color: #111827; outline: none; transition: all 0.2s ease; }
.grid-form input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.form-actions { display: flex; align-items: center; justify-content: flex-end; margin-top: 10px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
.justify-between { justify-content: space-between; }
.right-buttons { display: flex; gap: 12px; }

.btn-cancel { padding: 10px 24px; border: 1px solid #d1d5db; background: #ffffff; border-radius: 6px; font-size: 14px; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-submit { padding: 10px 24px; border: none; background: #3b82f6; border-radius: 6px; font-size: 14px; font-weight: 700; color: #ffffff; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover { background: #2563eb; }
.btn-danger { padding: 10px 24px; border: none; background: #fee2e2; border-radius: 6px; font-size: 14px; font-weight: 700; color: #ef4444; cursor: pointer; transition: background 0.2s; }
.btn-danger:hover { background: #fca5a5; color: #b91c1c; }
</style>