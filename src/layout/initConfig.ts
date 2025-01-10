import { v4 as uuidv4 } from 'uuid';
import { getConfig, setConfig } from '@/services/index'

export const initConfig = () => {
	// init deviceId
	const deviceId = getConfig('deviceId') || uuidv4();
	setConfig('deviceId', deviceId)
	console.log('deviceId: ', deviceId)
}