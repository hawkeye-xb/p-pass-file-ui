const BASE_URL = 'http://localhost:2501';

export const request = (url: RequestInfo | URL, options?: RequestInit) => fetch(`${BASE_URL}${url}`, options);
export const jsonHeaders = {
	'Content-Type': 'application/json',
};