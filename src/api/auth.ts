import { AxiosError } from "axios";
import api from "./axios";

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResponse {
	message?: string;
	user?: User;
	token?: string;
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
		const response = await api.post<LoginResponse>("/api/login", payload);
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

export async function logout(): Promise<void> {
	try {
		await api.post("/api/logout");
	} catch (error) {
		console.error("Logout error:", error);
		throw error;
	}
}
