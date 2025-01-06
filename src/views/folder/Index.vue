<script setup lang="ts">
import Dir from './Dir.vue'

const beforeUploadFile = () => {
  console.log('beforeUploadFile')
}
const handleCreateDir = () => {
  console.log('handleCreateDir')
}
</script>

<template>
  <div>
    <a-space>
      <a-button type="primary" @click="beforeUploadFile">Upload File</a-button>
      <a-button v-on:click="handleCreateDir">Create Dir</a-button>
    </a-space>

    <a-divider />

    <!-- dir -->
    <Dir />
  </div>
</template>
