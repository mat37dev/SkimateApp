import { router } from "expo-router";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let API_URL = "http://10.0.2.2:8000";
/* if (Constants.expoConfig?.extra?.apiUrl) {
  API_URL = Constants.expoConfig.extra.apiUrl;
} */
console.log("📡 API URL being used:", API_URL);

const apiClient = async (endpoint: string, options: RequestInit = {}) => {
	const url = `${API_URL}${endpoint}`;

	// Add headers
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	// Retrieve the token and add it to the headers
	let token;
	if (Platform.OS === "web") {
		token = await AsyncStorage.getItem("token");
	} else {
		token = await SecureStore.getItemAsync("token");
	}

	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	// Log the request
	console.log("📤 Full API Request URL:", url);
	console.log("📤 API Method:", options.method || "GET");
	console.log("📤 Headers:", headers);
	if (options.body) {
		console.log("📤 Data:", options.body);
	}

	try {
		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			console.error("❌ API Error:", response.status);
			const errorText = await response.text();
			console.error("❌ Server Response:", errorText);
			throw new Error(`HTTP Error ${response.status}`);
		}

		const data = await response.json();
		console.log("✅ API Response:", response.status, data);
		return data;
	} catch (error) {
		console.error("❌ Network Error:", error);
		throw error;
	}
};

// Function to refresh the token
const refreshToken = async () => {
	let refresh_token: string | null = null;

	if (Platform.OS === "web") {
		refresh_token = await AsyncStorage.getItem("refresh_token");
	} else {
		refresh_token = await SecureStore.getItemAsync("refresh_token");
	}

	if (!refresh_token) {
		throw new Error("Refresh token non trouvé.");
	}

	const response = await fetch(`${API_URL}/api/token/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh_token }),
	});

	if (!response.ok) {
		throw new Error("Erreur lors du rafraîchissement du token");
	}

	const data = await response.json();
	return data.token;
};

// Handle authentication failures
const handleAuthError = async () => {
	console.warn("Session expirée, redirection vers Login...");
	if (Platform.OS === "web") {
		await AsyncStorage.removeItem("token");
		await AsyncStorage.removeItem("refresh_token");
	} else {
		await SecureStore.deleteItemAsync("token");
		await SecureStore.deleteItemAsync("refresh_token");
	}
	router.replace("/login");
};

export default apiClient;
