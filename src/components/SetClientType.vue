
<script setup lang="ts">
import { ClientType, getConfig, setConfig } from '@/services';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const Router = useRouter();

const clientTypeVisible = ref(false)
const initClientType = () => {
  const ct = getConfig('clientType')
  if (ct === ClientType.Storage) {
    Router.push('/storage/connections')
  } else if (ct === ClientType.Usage) {
    Router.push('/usage/folder')
  } else {
    clientTypeVisible.value = true
    return
  }
}
initClientType()

// 无值的时候
const form = reactive({
  ctype: ClientType.Usage,
});
const handleBeforeOk = (done: any) => {
  setConfig('clientType', form.ctype)
  done();
  if (form.ctype === ClientType.Storage) {
    Router.push('/storage/settings')
  } else {
    Router.push('/usage/settings')
  }
};
</script>
<template>
 	<div>
		<a-modal v-model:visible="clientTypeVisible" title="客户端类型" @before-ok="handleBeforeOk" :esc-to-close="false"
			:hideCancel="true" :mask-closable="false" :closable="false">
			<a-form :model="form">
				<a-form-item field="post" label="类型选择">
					<a-select v-model="form.ctype">
						<a-option :value="ClientType.Storage">资源储存(NAS)</a-option>
						<a-option :value="ClientType.Usage">资源使用侧</a-option>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>

		<!-- <a-modal v-model:visible="connDeviceVisible" title="设置连接设备" @before-ok="connDeviceHandleBeforeOk" :esc-to-close="false"
      :hideCancel="true" :mask-closable="false" :closable="false">
      <a-form :model="connDeviceForm">
        <a-form-item field="connDeviceId" label="连接设备ID" :rules="[{ required: true, message: 'deviceId is required' }]"
          :validate-trigger="['change', 'input']">
          <a-input v-model="connDeviceForm.connDeviceId" placeholder="please enter your connDeviceId..." />
        </a-form-item>
      </a-form>
    </a-modal> -->
	</div>
</template>