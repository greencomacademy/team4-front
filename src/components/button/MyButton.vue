<script setup>
const props = defineProps({
  'btnType': {
    type: String,
    default: 'button'
  }, // 'button', 'submit', 'reset'
  'size': String, // 'big', 'middle', 'small'
  'color': String, // 'black', 'white', 'gray'
  'content': String,
});

</script>

<template>
  <button 
  :type="props.btnType" 
  :class="[props.color, props.size]"
  >{{ props.content }}</button>
</template>

<style scoped>
button {
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
}

.big {
  width: 100%;
  max-width: 350px;
  height: 45px;
  font-size: 20px;
}

.middle {
  width: 100%;
  max-width: 300px;
  height: 70px;
  font-size: 40px;
}

.small {
  width: 100%;
  max-width: 90px;  
  height: 45px;
  font-size: 20px;
}

.black {
  background-color:var(--personal-color-black);
  color: var(--personal-color-white);
}

.gray {
  background-color:var(--personal-color-gray);
  color: var(--personal-color-white);
}

.white {
  background-color:var(--personal-color-white);
  color: var(--personal-color-black);
}

.blue {
  background-color:var(--personal-color-blue);
  color: var(--personal-color-white);
}

.red {
  background-color:var(--personal-color-red);
  color: var(--personal-color-white);
}
</style>