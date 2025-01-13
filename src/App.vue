<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { getConfig, setConfig } from '@/services/index'
import SetClientType from './components/SetClientType.vue';

const initConfig = () => {
  const deviceId = getConfig('deviceId') || uuidv4();
  setConfig('deviceId', deviceId)

  console.log('deviceId: ', deviceId)
}
initConfig()
</script>

<template>
  <SetClientType />
  <RouterView />
</template>
