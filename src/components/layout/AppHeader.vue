<script setup>
import { useRouter } from 'vue-router'

// Vue Router 인스턴스 가져오기
const router = useRouter()
</script>

<template>
  <header class="main-header">
    <div class="header-left">
      <button @click="goBack" class="back-btn" aria-label="뒤로가기">
        &lt; 뒤로가기
      </button>
    </div>

    <div class="header-center">
      <h1 class="header-title">대충 헤더</h1>
    </div>

    <div class="header-right">
      <router-link to="/profile" class="profile-link">내 정보</router-link>
    </div>
  </header>
</template>

<style scoped>
/* 헤더 전체 컨테이너 설정 */
.main-header {
  display: flex;
  justify-content: space-between; /* 좌, 우, 가운데 요소를 균등 분할 배정 */
  align-items: center; /* 세로축 기준 가운데 정렬 */
  
  height: 50px; /* 이미지 속 회색 바 높이 지정 */
  padding: 0 20px;
  background-color: #999999; /* 이미지와 유사한 회색 배경 */
  color: #333333;
  box-sizing: border-box;
}

/* 세 영역이 동일한 공간적 베이스를 갖도록 설정 (가운데 정렬을 유지하기 위함) */
.header-left, .header-right {
  flex: 1;
}

.header-center {
  flex: 2;
  text-align: center;
}

.header-right {
  text-align: right;
}

/* 타이틀 스타일 */
.header-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

/* 버튼 및 링크 기본 스타일 초기화 및 스타일링 */
.back-btn {
  background: none;
  border: none;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.7;
}

.profile-link {
  color: #333333;
  text-decoration: none;
  font-size: 14px;
  padding: 5px 10px;
}

.profile-link:hover {
  text-decoration: underline;
}
</style>