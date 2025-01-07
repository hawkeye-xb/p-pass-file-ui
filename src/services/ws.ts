const WS_URL = "ws://localhost:3000/ws";

console.log("Connecting to server...");
export const ws = new WebSocket(WS_URL);

ws.onopen = () => {
	console.log("Connected to server");
};
ws.onmessage = (event) => {
	console.log(`Received message from server: ${event.data}`);
};
ws.onclose = () => {
	console.log("Disconnected from server");
};
ws.onerror = (error) => {
	console.error(`WebSocket error: ${error}`);
};
