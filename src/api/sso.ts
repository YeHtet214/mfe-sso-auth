import api from "./axios";

export interface CreateTokenResponse {
	token_type: string;
	access_token: string;
	expires_at: string | null;
	redirect_uri: string;
}

export async function createSsoToken(
	clientId: string,
	redirectUri: string
): Promise<CreateTokenResponse> {
	const response = await api.post<CreateTokenResponse>("/api/sso/create-token", {
		client_id: clientId,
		redirect_uri: redirectUri,
	});
	return response.data;
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

export function redirectWithToken(redirectUri: string, token: string): void {
	window.location.href = `${redirectUri}#token=${token}`;
}

export function redirectToOrigin(redirectUri: string, clientId: string): void {
	api.post<CreateTokenResponse>("/api/sso/create-token", {
		client_id: clientId,
		redirect_uri: redirectUri,
	}).then((response) => {
		window.location.href = `${redirectUri}#token=${response.data.access_token}`;
	}).catch(() => {
		window.location.href = redirectUri;
	});
}