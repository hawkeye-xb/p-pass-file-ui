import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DataConnection } from 'peerjs'

export const useConnectionsStore = defineStore('connections', () => {
	const connectionMap = ref<Map<string, DataConnection>>(new Map())
	function addConnectionMap(connection: DataConnection) {
		connectionMap.value.set(connection.peer, connection)
	}
	function removeConnectionMap(connection: DataConnection) {
		connectionMap.value.delete(connection.peer)
	}
	function getConnectionsMap() {
		return connectionMap.value
	}

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

	return { setConnections, connections, addConnection, removeConnection, getConnectionsMap, addConnectionMap, removeConnectionMap }
})