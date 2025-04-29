export interface StationData {
	// Define properties returned by fetchStationsData
	domain: string;
	// ...other properties
}

export interface StationCoordinates {
	type: string;
	features: any[];
}

export interface StationAssets {
	runs: any; // Can be further typed into a structure grouping difficulties
	lifts: any;
}

export interface UseStationDataResult {
	stationData: StationData | null;
	stationCoordinates: StationCoordinates | null;
	assets: StationAssets | null;
	isLoading: boolean;
}

export interface Station {
	osmId: string;
	name: string;
	longitude: number;
	latitude: number;
	// add other station properties as needed
}

export interface UseStationsResult {
	stations: Station[];
	dropdownItems: { label: string; value: string }[];
	selectedStation: Station | null;
	isLoading: boolean;
	setSelectedStation: (station: Station) => void;
}
