import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";

// Extract the correct types from the default export
type GeoOptions = Geolocation.GeolocationOptions;
type GeoPosition = Geolocation.GeolocationResponse;

export function useUserLocation(options: GeoOptions = {}) {
	const fallback: [number, number] = [4.6483232, 45.4903648];
	const [location, setLocation] = useState<[number, number] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let watchId: number | null = null;

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

			// 2) grab a one-off fix immediately
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

			// 3) then subscribe for real-time updates
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
					distanceFilter: 5,
					interval: 5000,
					fastestInterval: 2000,
					...options,
				}
			);
		})();

		return () => {
			if (watchId !== null) {
				Geolocation.clearWatch(watchId);
			}
		};
	}, [options]);

	return { location, error };
}

export async function getLocation(): Promise<[number, number] | null> {
	console.log("trying to log location");
	// Android runtime permission
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
	// Wrap the callback API in a Promise:
	return new Promise((resolve, reject) => {
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
				resolve(null); // or reject(error)
			},
			{
				enableHighAccuracy: true,
				timeout: 15_000,
				maximumAge: 1_000,
			}
		);
	});
}
