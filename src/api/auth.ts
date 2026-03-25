import { AxiosError } from "axios";
import api, { csrfCookie } from "./axios";

export interface LoginPayload {
	email: string;
	password: string;
	remember: boolean;
}

export interface LoginResponse {
	message?: string;
	user?: User;
}

export interface User {
	id: number;
	name: string;
	email: string;
}

interface LaravelValidationErrors {
	message?: string;
	errors?: Record<string, string[]>;
}

function getValidationMessage(errorBody?: LaravelValidationErrors) {
	if (!errorBody?.errors) return errorBody?.message;
	const firstField = Object.keys(errorBody.errors)[0];
	return errorBody.errors[firstField]?.[0] ?? errorBody.message;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
	try {
		const response = await csrfCookie().then(() => {
			return api.post<LoginResponse>("/login", payload, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				withCredentials: true,
			});
		});
		return response.data;
	} catch (error) {
		const axiosError = error as AxiosError<LaravelValidationErrors>;
		const message =
			getValidationMessage(axiosError.response?.data) ??
			axiosError.response?.statusText ??
			"Login failed. Please check your credentials.";
		throw new Error(message);
	}
}

export async function getUser(): Promise<User> {
	try {
		const response = await api.get<User>("/api/me");
		return response.data;
	} catch (error) {
		throw error;
	}
}
