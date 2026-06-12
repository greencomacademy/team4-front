<script setup>
import { ref } from 'vue';

// App.vue에서 내려주는 속성(Props) 수신
defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

// App.vue로 이벤트를 쏘기 위한 준비
const emit = defineEmits(['toggle']);

const navItems = ref([
    '오늘 운영 대시보드',
    '주문 운영 현황',
    'Mock 데이터',
    '메뉴 수익성 설정',
    '플랫폼 정산 조건',
    '매장 관리'
]);
</script>

<template>
    <div class="side-bar" :class="{ 'fold' : !isOpen}">
        <button class="back-btn" @click="emit('toggle')">
            {{ isOpen ? '<=' : '=>' }}
        </button>
        <div v-if="isOpen" class="side-list">
            <div
            class="menu-item"
            v-for="(item, index) in navItems" 
            :key="index"
            >{{ item }}</div>
        </div>
    </div>
</template>

<style scoped>
.side-bar {
    height: 100vh;
    width: 200px;
    box-sizing: border-box;
    transition: all 0.3s ease;
    background-color: rgb(128, 128, 128);
    padding: 20px;
    /* 핵심: App.vue의 flex 속성 때문에 찌그러지는 것을 방지 */
    flex-shrink: 0; 
}

.side-bar.fold {
    width: 60px;
    /* 접혔을 때 투명해지면 글자가 안 보일 수 있으니 주의하세요 */
    background-color: rgb(200, 200, 200); 
}    

.menu-item {
    margin-top: 30px;
    padding: 10px;
    color: white; /* 회색 배경에서 잘 보이도록 텍스트 색상 추가 */
    cursor: pointer;
}

.menu-item:hover {
    transition: all 0.5s ease;
    background-color: rgb(63, 165, 255);
}

.back-btn {
    cursor: pointer;
}
</style>