<script setup lang="ts">
import {
	IconFolder,
	IconSettings,
	IconApps,
	IconSwap,
} from '@arco-design/web-vue/es/icon';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const Router = useRouter();

const selectedKeys = ref([route.path]);

// 监听路由变化，更新选中的菜单项
watch(
	() => route.path,
	(newPath) => {
		selectedKeys.value = [newPath];
	}
);
</script>

<template>
  <a-menu :style="{
    width: '200px',
    height: '100%',
  }" show-collapse-button breakpoint="xl" :selectedKeys="selectedKeys">
    <a-menu-item key="/storage/connections" v-on:click="() => { Router.push('/storage/connections') }">
      <template #icon>
        <IconApps></IconApps>
      </template>
      {{ t('menu.connections') }}
    </a-menu-item>
    <a-menu-item key="/storage/settings" v-on:click="() => { Router.push('/storage/settings') }">
      <template #icon>
        <IconSettings></IconSettings>
      </template>
      {{ t('menu.settings') }}
    </a-menu-item>
  </a-menu>
</template>
