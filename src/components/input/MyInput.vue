<script setup>
const props = defineProps({
  'type': String,
  'placeholder': String,
  'readonly': Boolean,
  'required': Boolean,
  'size': {
    type: String,
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
  :class="[props.size, props.color]"
  v-model="model"
>
</template>

<style scoped>
input {
  padding: 10px;
  border: 2px solid var(--personal-color-black);
  margin: 10px;
  box-sizing: border-box;
  line-height: 1; 
  font-family: inherit;
}

.big {
  width: 350px;
  height: 45px;
  font-size: 20px;
}

.middle {
  width: 300px;
  height: 45px;
  font-size: 16px;
}

.small {
  width: 90px;
  height: 40px;
  font-size: 14px;
}

input[type="password"] {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
  letter-spacing: 3px; /* 까만 점들이 너무 다닥다닥 붙지 않게 조절 */
}
</style>