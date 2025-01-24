import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DataConnection } from 'peerjs'

export const useConnectionsStore = defineStore('connections', () => {
	const connections = ref<DataConnection[]>([])

	function addConnection(conn: DataConnection) {
		connections.value.push(conn)
	}

	function removeConnection(conn: DataConnection) {
		const index = connections.value.indexOf(conn)
		if (index !== -1) {
			const conn = connections.value[index]
			conn.close()
			connections.value.splice(index, 1)
		}
	}

	return { connections, addConnection, removeConnection }
})