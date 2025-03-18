import "dotenv/config";

export default {
	expo: {
		name: "SkimateApp",
		slug: "SkimateApp",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "myapp",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			package: "com.mathieu.skimate",
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		plugins: [
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
				},
			],
			["expo-secure-store"],
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			apiUrl: process.env.API_URL,
			eas: {
				projectId: "5642594b-cf85-4c67-ada9-332ab7736d16",
			},
		},
	},
};
