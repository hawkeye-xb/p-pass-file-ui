import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DataConnection } from 'peerjs'

export const useConnectionsStore = defineStore('connections', () => {
	const connections = ref<DataConnection[]>([])

	function addConnection(connection: DataConnection) {
		connections.value.push(connection)
	}

	function removeConnection(connection: DataConnection) {
		connections.value = connections.value.filter(c => c !== connection)
	}

	return { connections, addConnection, removeConnection }
})