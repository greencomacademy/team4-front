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
  display: flex;
  align-items: center;
  margin: 10px;
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

.default {
  background-color: transparent;
}
</style>