<script setup>
const props = defineProps({
  'type': String,
  'placeholder': String,
  'readonly': Boolean,
  'required': Boolean,
  'size': {
    type: String,
    default: 'middle' // 기본 사이즈 지정
  },
  'color': {
    type: String,
  }
});

const model = defineModel();
</script>

<template>
  <input
    :type="props.type"
    :readonly="props.readonly"
    :required="props.required"
    :placeholder="props.placeholder"
    :class="['my-input', props.size, props.color]"
    v-model="model"
  >
</template>

<style scoped>
/* 기본 인풋 스타일 (Premium Soft UI 적용) */
.my-input {
  width: 100%; /* 부모의 크기에 맞게 100% 꽉 차도록 변경 */
  box-sizing: border-box;
  padding: 0 16px;
  margin: 0; /* 강제 마진 제거! (레이아웃은 부모에서 제어) */
  
  background-color: #ffffff;
  border: 1px solid #d1d5db; /* 까만색 2px 테두리 대신 부드러운 회색 1px */
  border-radius: 8px; /* 모서리 둥글게 */
  
  color: #111827;
  font-family: 'Pretendard', -apple-system, sans-serif;
  transition: all 0.2s ease; /* 포커스 시 부드러운 전환 효과 */
  outline: none;
}

/* 포커스(클릭) 되었을 때 파란색 테두리와 부드러운 그림자 효과 */
.my-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* 읽기 전용 상태일 때 */
.my-input:read-only {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

/* Placeholder 글자색 연하게 */
.my-input::placeholder {
  color: #9ca3af;
}

/* =======================================
   사이즈 클래스 (높이와 폰트 크기만 제어)
======================================== */
.big {
  height: 52px;
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

/* 비밀번호 입력 시 점 모양 자간 조절 */
input[type="password"] {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
  letter-spacing: 3px;
}
</style>