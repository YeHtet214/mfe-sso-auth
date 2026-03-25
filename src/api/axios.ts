import axios from "axios";

const api = axios.create({
	baseURL:
		import.meta.env.VITE_API_BASE_URL ??
		"http://laravel-api-for-microfrontend.test",
	timeout: 10000,
	withCredentials: true,
	withXSRFToken: true,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

export const csrfCookie = async () =>
	await api.get("/sanctum/csrf-cookie", { withCredentials: true });

export default api;
