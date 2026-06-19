<script setup>
import { onBeforeMount, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreStore } from '../../store/store/useStoreStore';

const router = useRouter();
const store = useStoreStore();

// 1. 화면에 바인딩 될 입력 폼 상태
const formData = reactive({
  name: '',
  address: '',
  phone: '',
  kitchenCapacity: '',
});

// 사업자 번호 3칸 전용 상태
const bizNumParts = reactive({
  part1: '',
  part2: '',
  part3: ''
});

// 2. 변경된 항목만 추출하기 위해 원본 데이터를 저장해둘 빈 객체
let originalData = {};

// 3. 내 매장 정보가 이미 존재하는지 판별 하는 변수 (버튼 텍스트 변경용)
const isExistingStore = computed(() => !!store.currentData);

// 4. 화면이 열리기 전(초기화) 로직: 데이터 자동 채우기
onBeforeMount(async () => {
  try {
    await store.currentStore(); // 매장 정보 불러오기
    
    // 서버에 내 매  장 정보가 있다면 폼에 미리 채워줍니다.
    if (store.currentData) {
      formData.name = store.currentData.name || '';
      formData.address = store.currentData.address || '';
      formData.phone = store.currentData.phone || '';
      formData.kitchenCapacity = store.currentData.kitchenCapacity || '';

      // 사업자 번호 '-' 기준으로 쪼개서 넣기
      if (store.currentData.businessNumber) {
        const parts = store.currentData.businessNumber.split('-');
        bizNumParts.part1 = parts[0] || '';
        bizNumParts.part2 = parts[1] || '';
        bizNumParts.part3 = parts[2] || '';
      }

      // 나중에 변경된 항목만 찾기 위해 원본 스냅샷을 찍어둡니다.
      originalData = {
        name: formData.name,
        businessNumber: store.currentData.businessNumber || '',
        address: formData.address,
        phone: formData.phone,
        kitchenCapacity: String(formData.kitchenCapacity) // 숫자일 수 있으므로 문자로 통일
      };
    }
  } catch (error) {
    console.error('매장 정보를 불러오는 데 실패했습니다.', error);
  }
});

// 5. 등록 및 수정 버튼 클릭 시 실행될 함수
const handleSubmit = async () => {
  // 화면의 3칸 사업자 번호를 하나로 합침
  const currentBizNum = `${bizNumParts.part1}-${bizNumParts.part2}-${bizNumParts.part3}`;

  if (isExistingStore.value) {
    /* =======================================
       [기존 유저] 부분 수정 로직 (PATCH)
       ======================================= */
    const changedFields = {}; // 변경된 데이터만 담을 빈 바구니

    // 원본과 현재 입력값을 비교해서 다를 때만 바구니에 담습니다.
    if (formData.name !== originalData.name) changedFields.name = formData.name;
    if (formData.address !== originalData.address) changedFields.address = formData.address;
    if (formData.phone !== originalData.phone) changedFields.phone = formData.phone;
    if (String(formData.kitchenCapacity) !== originalData.kitchenCapacity) changedFields.kitchenCapacity = formData.kitchenCapacity;
    if (currentBizNum !== originalData.businessNumber) changedFields.businessNumber = currentBizNum;

    // 만약 바뀐 항목이 단 하나도 없다면 서버에 보낼 필요 없이 막습니다.
    if (Object.keys(changedFields).length === 0) {
      alert('수정된 항목이 없습니다.');
      return;
    }

    try {
      // 변경된 항목(changedFields)만 서버로 전송
      await store.updateStore(changedFields);
      alert('매장 정보가 성공적으로 수정되었습니다.');
      
      // 수정 성공 시, 원본 데이터(스냅샷)도 현재 데이터로 최신화 해줍니다.
      Object.assign(originalData, { ...changedFields, kitchenCapacity: String(formData.kitchenCapacity) });
      if (changedFields.businessNumber) originalData.businessNumber = currentBizNum;
      
    } catch (error) {
      console.error(error);
    }

  } else {
    /* =======================================
       [신규 유저] 신규 등록 로직 (POST)
       ======================================= */
    const payload = { ...formData, businessNumber: currentBizNum };
    
    try {
      await store.storeForm(payload); // 전체 데이터 전송 (storeForm 함수 사용)
      alert('매장이 성공적으로 등록되었습니다.');
      await store.currentStore(); // 등록 후 다시 내 정보 불러오기 (자동으로 isExistingStore가 true로 바뀜)
    } catch (error) {
      console.error(error);
    }
  }
};
</script>

<template>
  <section data-tab-panel="store" class="page-section">
    <div class="section-title-row">
      <div>
        <h1 class="main-title">배달 운영 정산 대시보드</h1>
        <h2 class="sub-title">매장 관리</h2>
      </div>
    </div>

    <div class="single-column">
      <article class="card">
        <div class="card-title">
          <h3>매장 기본정보</h3>
          <p>회원 1명당 매장 1개만 저장됩니다. 수정 후 저장 버튼을 누르시면 변경된 정보만 업데이트됩니다.</p>
        </div>
        
        <form id="storeForm" class="grid-form" @submit.prevent="handleSubmit">
          <div class="input-group">
            <label>매장명</label>
            <input name="name" type="text" v-model="formData.name" required>
          </div>

          <div class="input-group">
            <label>대표 전화번호</label>
            <input name="phone" type="text" v-model="formData.phone" required>
          </div>

          
          <div class="input-group">
            <label>주소</label>
            <input name="address" type="text" v-model="formData.address" required>
          </div>

          <div class="input-group">
            <label>사업자 번호</label>
            <div class="biz-num-group">
              <input type="text" maxlength="3" v-model="bizNumParts.part1" required>
              <span class="dash">-</span>
              <input type="text" maxlength="2" v-model="bizNumParts.part2" required>
              <span class="dash">-</span>
              <input type="text" maxlength="5" v-model="bizNumParts.part3" required>
            </div>
          </div>
          
          
          
          <div class="input-group">
            <label>주방 처리량</label>
            <input name="kitchenCapacity" type="number" min="1" v-model="formData.kitchenCapacity" required>
          </div>
          
          <button type="submit" class="pill-btn mt-20">
            {{ isExistingStore ? '매장 수정' : '매장 등록' }}
          </button>
        </form>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* 전체 레이아웃 간격 */
.page-section {
  display: grid;
  gap: 24px;
  color: #111;
  max-width: 600px; /* 폼이 너무 양옆으로 퍼지지 않도록 사진처럼 좁게 고정 */
  margin: 0 auto;
  padding: 30px;
  box-sizing: border-box;
}

.main-title {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 20px;
}
.sub-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

/* 하나의 컬럼으로 중앙 정렬 */
.single-column {
  display: block;
}

/* 카드 디자인 */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}
.card-title p {
  font-size: 12px;
  margin-bottom: 30px;
  color: #555;
  line-height: 1.5;
}

/* 폼 요소 간격 */
.grid-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group label {
  font-size: 14px;
  font-weight: 800;
}

/* 입력칸 공통 알약 모양 디자인 */
.input-group input, .biz-num-group input {
  padding: 12px 16px;
  border-radius: 24px; /* 완전한 알약 모양 테두리 */
  border: 1px solid #111;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #111;
}

/* 포커스 효과 */
.input-group input:focus, .biz-num-group input:focus {
  border-width: 2px;
  padding: 11px 15px; /* 테두리가 두꺼워지면서 흔들리는 현상 방지 */
}

/* 사업자번호 특화 간격 */
.biz-num-group {
  display: flex;
  align-items: center;
  gap: 12px; 
}
.biz-num-group input {
  text-align: center;
}
/* 사업자번호 각 칸 비율 */
.biz-num-group input:nth-child(1) { flex: 3; }
.biz-num-group input:nth-child(3) { flex: 2; }
.biz-num-group input:nth-child(5) { flex: 4; }

.biz-num-group .dash {
  font-weight: 600;
  color: #111;
}

/* 버튼 알약 디자인 */
.pill-btn {
  width: 100%;
  padding: 14px;
  border-radius: 30px;
  border: 1px solid #111;
  background: #fff;
  color: #111;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 20px;
}
.pill-btn:hover {
  background: #f9fafb;
}
</style>