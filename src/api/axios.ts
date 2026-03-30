import axios from "axios";

const api = axios.create({
	baseURL:
		import.meta.env.VITE_API_BASE_URL ??
		"https://laravel-api-for-microfrontend-main-czaohc.free.laravel.cloud/",
	timeout: 10000,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
	localStorage.removeItem(TOKEN_KEY);
}

export function extractTokenFromUrl(): string | null {
	const hash = window.location.hash;
	if (!hash) return null;
	const match = hash.match(/#token=([^&]+)/);
	if (match) {
		return match[1];
	}
	return null;
}

export function clearUrlHash(): void {
	if (window.location.hash) {
		const url = window.location.href.replace(/#.*$/, "");
		window.history.replaceState(null, "", url);
	}
}

function initToken(): void {
	const urlToken = extractTokenFromUrl();
	if (urlToken) {
		setToken(urlToken);
		clearUrlHash();
	}
}
initToken();

api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
