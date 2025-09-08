import { FeatureCollection, Point } from "geojson";

export interface SkiMapProps {
	cameraCenter: [number, number];
	is3D: boolean;
	userLocation: [number, number] | null;
	mapCameraRef: React.RefObject<any>;
	selectedFeature: any;
	routeFeature: any;
	onMapLoad?: () => void;
	stationGeoJson: any;
	assets: any;
	onMapFeaturePress: (e: any) => void;
	runLayers: (
		shapeId: string,
		lineId: string,
		color: string,
		labelId: string,
		arrowId: string,
		shapeData: any
	) => JSX.Element;
	showRuns: boolean;
	showLifts: boolean;
	showNovice: boolean;
	showEasy: boolean;
	showIntermediate: boolean;
	showExpert: boolean;
	destinationCoord: [number, number] | null;
	stationCities?: FeatureCollection<Point, { name: string }>;
	showDestinationPoint: boolean;
}
