<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/Index.vue'
</script>

<template>
  <div class="index-layout">
    <Menu />
    <RouterView style="flex: 1;" />
  </div>
</template>

<style scoped>
.index-layout {
  display: flex;
  height: 100%;

  padding-top: 80px;
}
</style>
