import { DataConnection, Peer, type PeerOptions } from "peerjs";
import { getConfig } from "../config";
import type { WebRTCContextType } from "./type";
import { emit } from "./router";

const deviceId = getConfig('deviceId') || '';
const peerOptions: PeerOptions = {
	debug: 3,
	config: {
		iceServers: [
			{ urls: 'stun:stun.l.google.com:19302' }
		]
	}
}

export const peerInstance = new Peer(deviceId, peerOptions);
let connectionOpenCallback = (conn: DataConnection) => { };
export const onConnectionOpen = (cb: (conn: DataConnection) => void) => {
	connectionOpenCallback = cb;
}

async function handleReceived(conn: DataConnection, d: unknown) {
	try {
		const data = d as WebRTCContextType;
		await emit(data, conn);

		conn.send(data);
	} catch (error) {
		console.warn(error);
	}
}
peerInstance.on('open', (id) => {
	console.log('peerjs open', id);
});
peerInstance.on('error', (err) => {
	console.log('peerjs error', err);
});
peerInstance.on('connection', (conn) => {
	console.log('peerjs connection', conn);

	conn.on('open', () => {
		connectionOpenCallback(conn);
	})
	conn.on('data', (d: unknown) => {
		handleReceived(conn, d);
	})
});
peerInstance.on('disconnected', () => {
	console.log('peerjs disconnected');
});
peerInstance.on('close', () => {
	console.log('peerjs close');
});