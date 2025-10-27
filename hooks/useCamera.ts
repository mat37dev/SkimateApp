import type { RefObject } from "react";

// 🔧 Type utilitaire pour référencer la caméra Mapbox
export interface CameraRef extends RefObject<any> {}

// 🎯 Centre la caméra sur la station actuelle
// - Définit le centre de la vue
// - Ajuste le zoom et la durée d’animation
// - Appelé notamment au changement de station
export function centerOnStation(
	mapCameraRef: CameraRef,
	longitude: number,
	latitude: number,
	zoom = 11,
	duration = 1000
) {
	console.log("Centering on station at:", longitude, latitude);
	mapCameraRef.current?.setCamera({
		centerCoordinate: [longitude, latitude],
		zoomLevel: zoom,
		animationDuration: duration,
	});
}

// 📍 Centre la caméra sur la position GPS de l’utilisateur
// - Utilisé lors du clic sur le bouton "centrer sur moi"
export function centerOnUser(
	mapCameraRef: CameraRef,
	userLocation: [number, number] | null,
	zoom = 15,
	duration = 1000
) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: userLocation,
		zoomLevel: zoom,
		animationDuration: duration,
	});
}

// 🔄 Réinitialise la caméra en vue 2D sur la station
// - Met le pitch à 0 pour repasser en vue plane
export function resetToStation2D(
	mapCameraRef: CameraRef,
	longitude: number,
	latitude: number,
	duration = 1000
) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: [longitude, latitude],
		pitch: 0,
		animationDuration: duration,
	});
}

// 🧭 Déplace la caméra vers des coordonnées précises (ex: piste ou remontée sélectionnée)
export function setCameraToCoordinates(
	mapCameraRef: CameraRef,
	destinationCoord: [number, number],
	zoom = 14,
	duration = 1000
) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: destinationCoord,
		zoomLevel: zoom,
		animationDuration: duration,
	});
}
