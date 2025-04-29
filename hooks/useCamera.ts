import type { RefObject } from "react";

export interface CameraRef extends RefObject<any> {}

export function centerOnStation(mapCameraRef: CameraRef, longitude: number, latitude: number, zoom = 11, duration = 1000) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: [longitude, latitude],
		zoomLevel: zoom,
		animationDuration: duration,
	});
}

export function centerOnUser(mapCameraRef: CameraRef, userLocation: [number, number] | null, zoom = 15, duration = 1000) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: userLocation,
		zoomLevel: zoom,
		animationDuration: duration,
	});
}

export function resetToStation2D(mapCameraRef: CameraRef, longitude: number, latitude: number, zoom = 11, duration = 1000) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: [longitude, latitude],
		zoomLevel: zoom,
		pitch: 0,
		animationDuration: duration,
	});
}

export function setCameraToCoordinates(mapCameraRef: CameraRef, destinationCoord: [number, number], zoom = 15, duration = 1000) {
	mapCameraRef.current?.setCamera({
		centerCoordinate: destinationCoord,
		zoomLevel: zoom,
		animationDuration: duration,
	});
}
