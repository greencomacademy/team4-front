<!--
StoreView.vue: '매장 관리' 탭입니다. 
내 가게의 기본 정보(이름, 주소, 주방 처리량 등)를 등록하고 확인하는 화면입니다.
-->
<script setup>
import { onBeforeMount, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreStore } from '../../store/useStoreStore';



// 여러 컴포넌트가 공유해서 사용해야 하는 상태값은, store 에 관리를 한다.
// 한 컴포넌트 내에서만 사용할 상태값은, 해당 컴포넌트에서 관리한다.

//  store 
// | 매장 | 매장 등록/조회/수정 가능 
const router = useRouter();

// 배달+ 프로핏 을 줄여서 베프

const store = useStoreStore();

// 1. 등록 폼 전용: 사업자번호 3칸 변수
const businessNumber = reactive({
  part1: '',
  part2: '',
  part3: ''
});

const myStoreRegistration = reactive({
  name: '',
  address: '',
  phone: '',
  kitchenCapacity: '',
});


// 1. 컴포넌트 지역 상태
const isUpdateModalOpen = ref(false); // 모달창 열림/닫힘 상태


// 2. 수정 폼 전용: 사업자번호 3칸 변수
const updatebusinessNumber = reactive({
  part1: '',
  part2: '',
  part3: ''
});

// 수정 폼 전용 임시 데이터
const updateFormData = reactive({     
  name: '',
  businessNumber: '',
  address: '',
  phone: '', 
  kitchenCapacity: '',
});

// 2. 모달창 열기 (기존 데이터 채워넣기)
const openUpdateModal = () => {
  if (store.currentData) {
    updateFormData.name = store.currentData.name;
    updateFormData.address = store.currentData.address;
    updateFormData.phone = store.currentData.phone;
    updateFormData.kitchenCapacity = store.currentData.kitchenCapacity;

    // 서버에서 가져온 사업자번호("123-45-67890")를 쪼개서 각각의 칸에 넣습니다.
    if (store.currentData.businessNumber) {
      const parts = store.currentData.businessNumber.split('-');
      updatebusinessNumber.part1 = parts[0] || '';
      updatebusinessNumber.part2 = parts[1] || '';
      updatebusinessNumber.part3 = parts[2] || '';
    }

  }
  isUpdateModalOpen.value = true;
};

// 3. 모달창 닫기
const closeUpdateModal = () => {
  isUpdateModalOpen.value = false;
};

// 4. 수정 완료 전송
const submitUpdate = async () => {
  try {

    // 3칸의 데이터를 하이픈(-)으로 합쳐서 서버 전송용 객체에 넣습니다.
    updateFormData.businessNumber = `${updatebusinessNumber.part1}-${updatebusinessNumber.part2}-${updatebusinessNumber.part3}`;

    await store.updateStore(updateFormData);
    alert('매장 정보가 수정되었습니다.');
    closeUpdateModal(); // 성공 시 모달창 닫기
  } catch (error) {
    console.error(error);
  }
};




onBeforeMount(async () => {
  try {
    await store.currentStore(); // 매장 정보 불러오기
  }catch (error) {
    throw alert('매장 정보를 불러오는 데 실패했습니다.'+error);
  }

})


const storeId = store.currentData?.id;



</script>

<template>
  <section data-tab-panel="store" class="page-section">
    <div class="section-title-row">
      <div>
        <h1 class="main-title">배달 운영 정산 대시보드</h1>
        <h2 class="sub-title">매장 관리</h2>
      </div>
    </div>

    <div class="two-column">
      <article class="card">
        <div class="card-title">
          <h3>내 매장 등록</h3>
          <p>회원 1명당 매장 1개만 저장됩니다. 다른 매장으로 바꾸려면 현재 매장을 삭제한 후, 다시 등록하세요</p>
        </div>
        
        <form id="storeForm" class="grid-form">
          <div class="input-group">
            <label>매장명</label>
            <input 
            name="name"
            type="text"
            v-model="myStoreRegistration.name"
            required>
          </div>
          <div class="input-group">
            <label>사업자 번호</label>
            <div class="biz-num-group">
              <input type="text" maxlength="3" v-model="businessNumber.part1" required>
              <span class="dash">-</span>
              <input type="text" maxlength="2" v-model="businessNumber.part2" required>
              <span class="dash">-</span>
              <input type="text" maxlength="5" v-model="businessNumber.part3" required>
            </div>
             
          </div>
          <div class="input-group">
            <label>주소</label>
            <input 
            name="address"
            type="text"
            v-model="myStoreRegistration.address"
            required>
          </div>
          <div class="input-group">
            <label>전화번호</label>
            <input 
            name="phone"
            type="text"
            v-model="myStoreRegistration.phone"
            required>
          </div>
          <div class="input-group">
            <label>주방 처리량</label>
            <input 
            name="kitchenCapacity"
            type="number"
            min="1"
            v-model="myStoreRegistration.kitchenCapacity"
            required>
          </div>
          
          <button type="button" class="pill-btn mt-20" data-loading-key="storeSave">매장 등록</button>
        </form>
      </article>

      <article class="card">
        <div class="card-title">
          <h3>현재 매장 정보</h3>
          <p>GET /api/stores/me 응답 기준입니다</p>
        </div>
        
        <div id="storePreview" class="preview-container">
          <div class="preview-group">
            <label>매장명</label>
            <p class="currentInfo">{{ store.currentData?.name }}</p>
            <div class="underline"></div>
          </div>
          <div class="preview-group">
            <label>사업자 번호</label>
            <p class="currentInfo">{{ store.currentData?.businessNumber }}</p>
            <div class="underline"></div>
          </div>
          <div class="preview-group">
            <label>주소</label>
            <p class="currentInfo">{{ store.currentData?.address }}</p>
            <div class="underline"></div>
          </div>
          <div class="preview-group">
            <label>전화번호</label>
            <p class="currentInfo">{{ store.currentData?.phone }}</p>
            <div class="underline"></div>
          </div>
          <div class="preview-group">
            <label>주방 처리량</label>
            <p class="currentInfo">{{ store.currentData?.kitchenCapacity }}</p>
            <div class="underline"></div>
          </div>

          <button
           type="button"
           class="pill-btn mt-20"
           @click="openUpdateModal"
          >매장정보 수정</button>

          <button
           type="button"
           class="pill-btn mt-20"
           @click="store.deleteStore(storeId)"
            >매장 삭제 후 다시 만들기</button>
          <p class="footer-note">매장 정보는 1개만 저장됩니다. 다른 매장으로 바꾸려면 삭제 후, 새로 등록하세요</p>
        </div>
      </article>


      <div class="modal-overlay" v-if="isUpdateModalOpen" @click.self="closeUpdateModal">
        <article class="card modal-content">
          <div class="card-title">
            <h3>내 매장정보 수정</h3>
            <p>매장 정보를 수정할 수 있습니다.</p>
          </div>
          
          <form id="updateStoreForm" class="grid-form">
            <div class="input-group">
              <label>매장명</label>
              <input name="name" type="text" v-model="updateFormData.name" required>
            </div>
            <div class="input-group">
              <label>사업자 번호</label>
              <div class="biz-num-group">
                <input type="text" maxlength="3" v-model="updatebusinessNumber.part1" required>
                <span class="dash">-</span>
                <input type="text" maxlength="2" v-model="updatebusinessNumber.part2" required>
                <span class="dash">-</span>
                <input type="text" maxlength="5" v-model="updatebusinessNumber.part3" required>
              </div>
            </div>
            <div class="input-group">
              <label>주소</label>
              <input name="address" type="text" v-model="updateFormData.address" required>
            </div>
            <div class="input-group">
              <label>전화번호</label>
              <input name="phone" type="text" v-model="updateFormData.phone" required>
            </div>
            <div class="input-group">
              <label>주방 처리량</label>
              <input name="kitchenCapacity" type="number" min="1" v-model="updateFormData.kitchenCapacity" required>
            </div>
            
            <div class="button-group">
              <button type="button" class="pill-btn mt-20 cancel-btn" @click="closeUpdateModal">취소</button>
              <button type="button" class="pill-btn mt-20" @click="submitUpdate">수정 완료</button>
            </div>
          </form>
        </article>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* 전체 레이아웃 간격 */
.page-section {
  display: grid;
  gap: 24px;
  color: #111; /* 전체 글씨 색상을 진한 검정으로 설정 */


  /* 추가된 핵심 스타일 */
  max-width: 1200px; /* 창을 최대화해도 폼이 1000px 이상 커지지 않도록 제한합니다 */
  margin: 0 auto; /* 제한된 1000px 박스를 화면 정중앙에 배치합니다 */
  padding: 30px; /* 사이드바와 폼 사이의 간격을 30px로 넓혀줍니다 */
  box-sizing: border-box; /* 패딩이 전체 너비에 포함되도록 하여 레이아웃 깨짐 방지 */
}

/* 상단 타이틀 디자인 */
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

/* 두 개 컬럼(카드) 분할 */
.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 70px;
}

/* 카드 공통 디자인: 사진과 같은 연한 회색 배경과 둥근 모서리 */
.card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
  padding: 30px;
}

.card-title h3 {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 8px;
}

.card-title p {
  font-size: 12px;
  margin-bottom: 24px;
  color: #555;
  line-height: 1.5;
}

/* 폼 요소 세로 정렬 및 간격 */
.grid-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group, .preview-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 라벨과 입력칸 사이의 간격 */
}

.input-group label, .preview-group label {
  font-size: 13px;
  font-weight: 600;
}

/* 인풋창 디자인: 알약 모양으로 길고 둥글게 */
.input-group input {
  padding: 10px 14px;
  border-radius: 20px; /* 입력칸 끝을 완전히 둥글게 */
  border: 1px solid #111; /* 검은색 테두리 */
  background: transparent; /* 배경을 투명하게 해서 카드의 회색이 비치게 함 */
  outline: none;
  font-size: 14px;
}

/* 오른쪽 카드 밑줄 디자인 */
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.underline {
  border-bottom: 1px solid #111;
  height: 20px; /* 라벨 밑으로 일정 공간 확보 후 밑줄 */
}

/* 둥근 테두리 버튼 디자인 (알약 버튼) */
.pill-btn {
  width: 100%;
  padding: 12px;
  border-radius: 24px;
  border: 1px solid #111;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn:hover {
  background: rgba(0, 0, 0, 0.05); /* 마우스 올렸을 때 살짝 어두워지는 효과 */
}

.mt-20 {
  margin-top: 20px;
}

/* 오른쪽 카드 하단 작은 설명 글씨 */
.footer-note {
  margin-top: 16px;
  font-size: 11px;
  color: #555;
  text-align: center;
}



/* 모달 오버레이 (화면 전체를 덮는 반투명 검은 배경) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 창 내부 카드 사이즈 조절 */
.modal-content {
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto; /* 내용이 길면 창 안에서 스크롤 생성 */
}

/* 버튼 나란히 배치 */
.button-group {
  display: flex;
  gap: 12px;
}

/* 취소 버튼 스타일 추가 */
.cancel-btn {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #d1d5db;
}



/* 1. 가로로 나란히 배치하고 간격 설정 */
.biz-num-group {
  display: flex;
  align-items: center;
  gap: 8px; 
}

/* 2. 네모 반듯한 직사각형 폼 형태 만들기 */
.biz-num-group input {
  border: 1px solid #d1d5db; /* 사진과 비슷한 연한 회색 테두리 */
  border-radius: 20px;        /* 모서리가 날카롭지 않게 아주 살짝만 둥글게 처리 */
  padding: 10px 8px;         /* 텍스트 입력 여백 */
  background: #ffffff;       /* 입력칸 배경을 흰색으로 */
  outline: none; /* 포커스 시 테두리 색상 */
  font-size: 14px;
}

/* (선택사항) 사용자가 칸을 클릭했을 때 테두리가 진해지도록 하는 효과 */
.biz-num-group input:focus {
  border-color: #111;
}

/* 3. 각 칸의 가로 길이 비율 (3자리:2자리:5자리)에 맞게 조정 */
.biz-num-group input:nth-child(1) { width: 70px; text-align: center; flex: none; }
/* 첫 번째 칸: 3자리 */
.biz-num-group input:nth-child(3) { width: 70px; text-align: center; flex: none; }
/* 두 번째 칸: 2자리 */
.biz-num-group input:nth-child(5) { width: 70px; text-align: center; flex: none; }

/* 4. 가운데 하이픈 디자인 */
.biz-num-group .dash {
  font-weight: 500;
  color: #666;
}


</style>
