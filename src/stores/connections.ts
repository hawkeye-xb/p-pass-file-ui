import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DataConnection } from 'peerjs'

export const useConnectionsStore = defineStore('connections', () => {
	const connections = ref<DataConnection[]>([])

	function addConnection(connection: DataConnection) {
		connections.value.push(connection)
	}

	function setConnections(conns: DataConnection[]) {
		connections.value = conns
	}

	function removeConnection(connection: DataConnection) {
		connections.value = connections.value.filter(c => c !== connection)
	}

	return { setConnections, connections, addConnection, removeConnection }
})