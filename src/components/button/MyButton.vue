<script setup>
const props = defineProps({
  'btnType': {
    type: String,
    default: 'button'
  }, // 'button', 'submit', 'reset'
  'size': {
    type: String,
    default: 'middle'
  }, // 'large', 'middle', 'small', 'big'
  'color': {
    type: String,
    default: 'primary'
  }, // 'primary', 'blue', 'black', 'white', 'gray', 'red'
  'content': String,
  'disabled': {
    type: Boolean,
    default: false
  } // 로딩 중 클릭 방지를 위한 속성
});
</script>

<template>
  <button 
    :type="props.btnType" 
    :class="['my-btn', props.color, props.size]"
    :disabled="props.disabled"
  >
    {{ props.content }}
  </button>
</template>

<style scoped>
/* =======================================
   버튼 기본 스타일 (Premium Soft UI)
======================================== */
.my-btn {
  width: 100%; /* 부모 컨테이너 크기에 유연하게 맞춰짐 */
  border-radius: 8px; /* 입력창과 동일한 둥글기 */
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-weight: 700;
  transition: all 0.2s ease; /* 부드러운 색상/크기 전환 */
  box-sizing: border-box;
}

/* 비활성화(로딩 중) 상태일 때 */
.my-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =======================================
   사이즈(Size) 옵션
======================================== */
.large, .big {
  height: 56px; /* 시원하고 큼직한 높이 */
  font-size: 16px;
}

.middle {
  height: 48px;
  font-size: 15px;
}

.small {
  height: 40px;
  font-size: 14px;
}

/* =======================================
   컬러(Color) 옵션
======================================== */
/* 메인 브랜드 컬러 (Primary / Blue) */
.primary, .blue {
  background-color: #3b82f6;
  color: #ffffff;
}
.primary:hover:not(:disabled), .blue:hover:not(:disabled) {
  background-color: #2563eb; /* 마우스 오버 시 살짝 진해짐 */
  transform: translateY(-1px); /* 살짝 떠오르는 느낌 */
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

/* 검정색 */
.black {
  background-color: var(--personal-color-black, #111827);
  color: #ffffff;
}
.black:hover:not(:disabled) {
  background-color: #000000;
}

/* 회색 */
.gray {
  background-color: var(--personal-color-gray, #9ca3af);
  color: #ffffff;
}
.gray:hover:not(:disabled) {
  background-color: #6b7280;
}

/* 흰색 (테두리 추가) */
.white {
  background-color: var(--personal-color-white, #ffffff);
  color: var(--personal-color-black, #111827);
  border: 1px solid #d1d5db;
}
.white:hover:not(:disabled) {
  background-color: #f9fafb;
}

/* 빨간색 (위험/삭제 등) */
.red {
  background-color: var(--personal-color-red, #ef4444);
  color: #ffffff;
}
.red:hover:not(:disabled) {
  background-color: #dc2626;
}
</style>