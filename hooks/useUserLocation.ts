import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";

type GeoOptions = Geolocation.GeolocationOptions;
type GeoPosition = Geolocation.GeolocationResponse;
// 🎯 Hook de gestion de la position GPS utilisateur (version native Android/iOS)
// - Gère les permissions
// - Récupère la position actuelle
// - Met à jour en continu la localisation de l’utilisateur
export function useUserLocation(options: GeoOptions = {}) {
	const fallback: [number, number] = [4.6483232, 45.4903648]; // 🧭 Coordonnées par défaut (fallback)
	const [location, setLocation] = useState<[number, number] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let watchId: number | null = null;

		// 🪪 Fonction interne pour demander la permission Android
		async function requestPermission() {
			if (Platform.OS === "android") {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
					{
						title: "Location Permission",
						message:
							"This app needs access to your location to show your position in real time.",
						buttonPositive: "OK",
					}
				);
				return granted === PermissionsAndroid.RESULTS.GRANTED;
			}
			return true;
		}

		(async () => {
			if (!(await requestPermission())) {
				setError("Location permission denied");
				return;
			}

			// 🧭 Récupération ponctuelle initiale
			Geolocation.getCurrentPosition(
				(pos) => {
					setLocation([pos.coords.longitude, pos.coords.latitude]);
				},
				(err) => {
					console.warn("getCurrentPosition failed:", err.message);
					setError(err.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 1000,
				}
			);

			// 🔁 Suivi en temps réel avec Geolocation.watchPosition
			watchId = Geolocation.watchPosition(
				(pos) => {
					setLocation([pos.coords.longitude, pos.coords.latitude]);
				},
				(err) => {
					console.warn("watchPosition failed:", err.message);
					setError(err.message);
				},
				{
					enableHighAccuracy: true,
					distanceFilter: 5, // déclenche tous les 5 mètres
					interval: 5000, // ou toutes les 5 secondes
					fastestInterval: 2000,
					...options,
				}
			);
		})();

		// 🧹 Nettoyage à la désactivation du composant
		return () => {
			if (watchId !== null) {
				Geolocation.clearWatch(watchId);
			}
		};
	}, [options]);

	return { location, error };
}

// 📦 Fonction utilitaire pour récupérer la position actuelle une seule fois (Promise)
export async function getLocation(): Promise<[number, number] | null> {
	console.log("trying to log location");

	// 🔐 Vérification permission Android
	if (Platform.OS === "android") {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			{
				title: "Location Permission",
				message:
					"Skimate needs access to your location to center the map.",
				buttonPositive: "OK",
			}
		);
		if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
			console.warn("Location permission denied");
			return null;
		}
	}

	// 🔄 Retourne la position actuelle via Promise
	return new Promise((resolve) => {
		Geolocation.getCurrentPosition(
			({ coords }) => {
				const loc: [number, number] = [
					coords.longitude,
					coords.latitude,
				];
				console.log("User location:", {
					latitude: coords.latitude,
					longitude: coords.longitude,
				});
				resolve(loc);
			},
			(error) => {
				console.error("Failed to get location:", error.message);
				resolve(null);
			},
			{
				enableHighAccuracy: true,
				timeout: 15_000,
				maximumAge: 1_000,
			}
		);
	});
}
