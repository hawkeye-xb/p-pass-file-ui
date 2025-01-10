<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router';

const Router = useRouter();

</script>
<template>
	<div class="transport-layout">
		<div class="transport-layout-header">
			<div class="transport-layout-header-upload">
				<span @click="Router.push('/transport/upload')">Upload</span>
			</div>
			<!-- <a-divider direction="vertical" /> -->
			<div class="transport-layout-header-download">
				<span @click="Router.push('/transport/download')">Download</span>
			</div>
		</div>
		<RouterView style="flex: 1; padding: 8px 16px;" />
	</div>
</template>
<style scoped>
.transport-layout {
	width: 100%;
	height: 100%;
	display: flex;
		flex-direction: column;
}

.transport-layout-header {
	display: flex;
	height: 40px;
		border-bottom: 1px solid var(--color-neutral-3);
}

.transport-layout-header-upload,
.transport-layout-header-download {
	width: 100%;
	height: 100%;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	font-weight: 500;
	cursor: pointer;
}
.transport-layout-header-upload:hover,
.transport-layout-header-download:hover {
	color: rgb(var(--primary-6));
}
</style>