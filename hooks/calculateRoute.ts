let cachedGraph: Graph | null = null;

const MAX_BRIDGE_DISTANCE = 0.004; // Maximum distance (in degrees) to consider two nodes as "close enough" for bridging.
const BRIDGING_PENALTY = 50500; // Fait varier la tendance à créer des ponts entre les pistes (à augmenter pour diminuer les ponts).

/**
 * Preprocess features so that each feature yields exactly one "edge"
 * from a valid start to a valid end.
 */
// … en haut de ton fichier, juste après les imports et les constantes :

/**
 * Compare deux points [lng, lat] en tolérant un tout petit écart.
 */
function areSamePoint(a: [number, number], b: [number, number], eps = 1e-8) {
	return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;
}

export function preprocessFeatures(features: any[]) {
	const simplifiedEdges: any[] = [];
	const runLines: Array<{ coords: [number, number][]; properties: any }> = [];
	const liftEdges: any[] = [];

	// 1) Sépare runs et lifts
	features.forEach((feature) => {
		if (feature.geometry.type !== "LineString") return;
		const coords = feature.geometry.coordinates as [number, number][];
		if (coords.length < 2) return;
		const category = feature.category || feature.properties?.category;
		if (category === "run") {
			runLines.push({ coords, properties: feature.properties });
		} else if (category === "lift") {
			// logique d'origine pour les lifts
			liftEdges.push({
				startCoord: coords[0],
				endCoord: coords[coords.length - 1],
				category: "lift",
				properties: feature.properties,
				fullCoordinates: coords,
			});
		}
	});

	// 2) Trouve les intersections *exactes* entre toutes les runs
	const intersectionPoints: [number, number][] = [];
	for (let i = 0; i < runLines.length; i++) {
		for (let j = i + 1; j < runLines.length; j++) {
			const A = runLines[i].coords;
			const B = runLines[j].coords;
			A.forEach((ptA) => {
				B.forEach((ptB) => {
					if (areSamePoint(ptA, ptB)) {
						intersectionPoints.push(ptA);
					}
				});
			});
		}
	}
	console.log(`✅ Found ${intersectionPoints.length} exact intersections`);

	// 3) Pour chaque run, scinde-la au niveau des intersections
	runLines.forEach(({ coords, properties }) => {
		// on récupère tous les indices où il y a une intersection
		const cutIndices = new Set<number>();
		coords.forEach((pt, idx) => {
			if (
				intersectionPoints.find((ip) => areSamePoint(ip, pt)) &&
				idx > 0 &&
				idx < coords.length - 1
			) {
				cutIndices.add(idx);
			}
		});

		// si pas d'intersection, edge entier
		if (cutIndices.size === 0) {
			simplifiedEdges.push({
				startCoord: coords[0],
				endCoord: coords[coords.length - 1],
				category: "run",
				properties,
				fullCoordinates: coords,
			});
		} else {
			// sinon on découpe en segments successifs
			let lastCut = 0;
			const sortedCuts = Array.from(cutIndices).sort((a, b) => a - b);
			sortedCuts.forEach((cutIdx) => {
				// segment [lastCut .. cutIdx]
				const seg = coords.slice(lastCut, cutIdx + 1);
				simplifiedEdges.push({
					startCoord: seg[0],
					endCoord: seg[seg.length - 1],
					category: "run",
					properties,
					fullCoordinates: seg,
				});
				lastCut = cutIdx;
			});
			// et le dernier segment [dernier cut .. fin]
			const tail = coords.slice(lastCut);
			if (tail.length > 1) {
				simplifiedEdges.push({
					startCoord: tail[0],
					endCoord: tail[tail.length - 1],
					category: "run",
					properties,
					fullCoordinates: tail,
				});
			}
		}
	});

	// 4) Ajoute les lifts inchangés
	simplifiedEdges.push(...liftEdges);

	return simplifiedEdges;
}

/**
 * A simple Graph class.
 */
class Graph {
	nodes: { [key: string]: [number, number] } = {};
	adjacencyList: {
		[key: string]: Array<{ node: string; weight: number; data: any }>;
	} = {};

	addNode(nodeId: string, coord: [number, number]) {
		if (!this.nodes[nodeId]) {
			this.nodes[nodeId] = coord;
			this.adjacencyList[nodeId] = [];
		}
	}

	addEdge(nodeId1: string, nodeId2: string, weight: number, data: any) {
		if (!this.adjacencyList[nodeId1]) {
			this.adjacencyList[nodeId1] = [];
		}
		this.adjacencyList[nodeId1].push({ node: nodeId2, weight, data });
	}
}

// Helper to compute Euclidean distance.
function distance(coordA: [number, number], coordB: [number, number]) {
	const dx = coordA[0] - coordB[0];
	const dy = coordA[1] - coordB[1];
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Build a graph from simplifiedEdges.
 * Each edge represents a full run/lift with its start and end nodes.
 * Then, bridging edges (walking) are added for nodes that are within MAX_BRIDGE_DISTANCE.
 *
 * Note: For runs and lifts, only a one-way edge is added:
 * - Runs: from top (start) to bottom (end)
 * - Lifts: from bottom (start) to top (end)
 */
export function buildGraph(simplifiedEdges: any[]) {
	console.log("Building graph from simplified edges...");
	const graph = new Graph();

	// 1. Add nodes and directional edges for runs/lifts.
	simplifiedEdges.forEach((edge) => {
		const startId = edge.startCoord.join(",");
		const endId = edge.endCoord.join(",");
		graph.addNode(startId, edge.startCoord);
		graph.addNode(endId, edge.endCoord);

		const w = distance(edge.startCoord, edge.endCoord);
		const edgeData = {
			bridging: false,
			category: edge.category,
			properties: edge.properties,
			fullCoordinates: edge.fullCoordinates,
		};

		// For runs and lifts, add only one directional edge.
		if (edge.category === "run" || edge.category === "lift") {
			graph.addEdge(startId, endId, w, edgeData);
		} else {
			// Fallback: add bidirectional edges.
			graph.addEdge(startId, endId, w, edgeData);
			graph.addEdge(endId, startId, w, edgeData);
		}
	});

	// 2. Add bridging edges between nodes that are within MAX_BRIDGE_DISTANCE.
	const allNodeIds = Object.keys(graph.nodes);
	for (let i = 0; i < allNodeIds.length; i++) {
		for (let j = i + 1; j < allNodeIds.length; j++) {
			const nodeIdA = allNodeIds[i];
			const nodeIdB = allNodeIds[j];
			const coordA = graph.nodes[nodeIdA];
			const coordB = graph.nodes[nodeIdB];
			const d = distance(coordA, coordB);
			const bridgingWeight = d + BRIDGING_PENALTY;

			if (d < MAX_BRIDGE_DISTANCE) {
				const bridgingData = { bridging: true };
				// Bridging edges are bidirectional.
				graph.addEdge(nodeIdA, nodeIdB, bridgingWeight, bridgingData);
				graph.addEdge(nodeIdB, nodeIdA, bridgingWeight, bridgingData);
			}
		}
	}

	console.log(`Graph built: ${Object.keys(graph.nodes).length} nodes`);
	return graph;
}

// Helper to compute the bearing (in degrees) from coord1 to coord2.
function getBearing(
	coord1: [number, number],
	coord2: [number, number]
): number {
	const toRad = (deg: number) => deg * (Math.PI / 180);
	const toDeg = (rad: number) => rad * (180 / Math.PI);
	const lat1 = toRad(coord1[1]);
	const lat2 = toRad(coord2[1]);
	const dLon = toRad(coord2[0] - coord1[0]);
	const y = Math.sin(dLon) * Math.cos(lat2);
	const x =
		Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
	let brng = toDeg(Math.atan2(y, x));
	return (brng + 360) % 360;
}

/**
 * getGraph: Returns the cached graph if available, otherwise builds it.
 */
export function getGraph(simplifiedEdges: any[]) {
	if (cachedGraph) {
		console.log("Graph is already stored!");
		return cachedGraph;
	}
	console.log("Graph is not stored yet. Building graph...");
	cachedGraph = buildGraph(simplifiedEdges);
	return cachedGraph;
}

/**
 * Find the closest node in the graph to the target coordinate.
 */
export function findClosestNode(graph: Graph, targetCoord: [number, number]) {
	let closestId: string | null = null;
	let minDist = Infinity;
	for (const nodeId in graph.nodes) {
		const d = distance(graph.nodes[nodeId], targetCoord);
		if (d < minDist) {
			minDist = d;
			closestId = nodeId;
		}
	}
	return closestId;
}

/**
 * Compute shortest path using Dijkstra's algorithm.
 */
export function computeShortestPath(
	graph: Graph,
	startNodeId: string,
	endNodeId: string
) {
	console.log(`Computing shortest path from ${startNodeId} to ${endNodeId}`);
	const distances: { [key: string]: number } = {};
	const previous: { [key: string]: string | null } = {};
	const unvisited = new Set<string>();

	for (const nodeId in graph.nodes) {
		distances[nodeId] = Infinity;
		previous[nodeId] = null;
		unvisited.add(nodeId);
	}
	distances[startNodeId] = 0;

	while (unvisited.size > 0) {
		let current: string | null = null;
		for (let nodeId of unvisited) {
			if (current === null || distances[nodeId] < distances[current]) {
				current = nodeId;
			}
		}
		if (current === null || distances[current] === Infinity) {
			console.log(
				`No more reachable nodes. Current node ${current} has distance Infinity.`
			);
			break;
		}
		if (current === endNodeId) {
			console.log(
				`Reached destination ${endNodeId} with distance ${distances[current]}`
			);
			break;
		}
		unvisited.delete(current);
		const neighbors = graph.adjacencyList[current] || [];
		neighbors.forEach((edge) => {
			const alt = distances[current] + edge.weight;
			if (alt < distances[edge.node]) {
				distances[edge.node] = alt;
				previous[edge.node] = current;
			}
		});
	}

	const path: string[] = [];
	let cur: string | null = endNodeId;
	while (cur !== null) {
		path.unshift(cur);
		cur = previous[cur];
	}
	if (path[0] !== startNodeId) {
		console.error("No path found. Final path:", path);
		return [];
	}
	console.log(`Path found: ${path.join(" -> ")}`);
	return path;
}

/**
 * Helper: Get a color for a run based on its difficulty.
 */
function getRunColor(properties: any) {
	if (!properties) return "grey";
	const diff = properties["piste:difficulty"] || properties.difficulty;
	if (diff === "easy") return "blue";
	if (diff === "novice") return "green";
	if (diff === "intermediate") return "red";
	if (diff === "expert") return "black";
	return "grey";
}

/**
 * Generate segmented routes.
 * For each consecutive pair of nodes in the computed path, if the edge is bridging,
 * we create a simple straight line (blue, dotted). Otherwise, we use the fullCoordinates
 * from the original feature.
 */
// Updated generateSegmentedRoutes: for non-bridging segments, compute and add the bearing.
export function generateSegmentedRoutes(graph: Graph, path: string[]) {
	console.log("Generating segmented routes from path:", path);
	const segments: any[] = [];
	let currentSegment: {
		runId: string;
		color: string;
		coordinates: [number, number][];
		bearing: number;
	} | null = null;

	for (let i = 0; i < path.length - 1; i++) {
		const node1 = path[i];
		const node2 = path[i + 1];
		const edge = (graph.adjacencyList[node1] || []).find(
			(e) => e.node === node2
		);
		if (!edge) continue;

		if (edge.data.bridging) {
			// Si on était en train de former un run, on le termine
			if (currentSegment) {
				segments.push(currentSegment);
				currentSegment = null;
			}
			segments.push({
				segmentType: "bridging",
				color: "blue",
				coordinates: [graph.nodes[node1], graph.nodes[node2]],
			});
		} else {
			// run ou lift
			const runId = edge.data.properties?.name || "unknown";
			const color =
				edge.data.category === "run"
					? getRunColor(edge.data.properties)
					: "black";

			// calcule l'azimut si besoin
			const bearing =
				edge.data.fullCoordinates.length >= 2
					? getBearing(
							edge.data.fullCoordinates[0],
							edge.data.fullCoordinates[
								edge.data.fullCoordinates.length - 1
							]
					  )
					: 0;

			if (currentSegment && currentSegment.runId === runId) {
				// on prolonge le segment en concaténant la géométrie,
				// mais on évite de dupliquer le point de jonction
				const coords = edge.data.fullCoordinates;
				currentSegment.coordinates.push(...coords.slice(1));
			} else {
				// on démarre un nouveau runOrLift
				if (currentSegment) segments.push(currentSegment);
				currentSegment = {
					runId,
					color,
					// clonage pour ne pas muter l'original
					coordinates: [...edge.data.fullCoordinates],
					bearing,
				};
			}
		}
	}

	// pousser le dernier
	if (currentSegment) segments.push(currentSegment);

	// transformer en GeoJSON
	const features = segments.map((seg) => ({
		type: "Feature",
		properties: {
			segmentType: seg.segmentType,
			runId: seg.runId || "",
			color: seg.color,
			bearing: seg.bearing,
		},
		geometry: {
			type: "LineString",
			coordinates: seg.coordinates,
		},
	}));

	console.log("Segmented route features generated:", features);
	return {
		type: "FeatureCollection",
		features,
	};
}

/**
 * calculateRouteForFeature: Exports a single function that encapsulates
 * the entire route calculation process.
 *
 * @param selectedFeature The feature selected by the user.
 * @param direction "top" or "bottom" indicating which end of the feature to travel to.
 * @param userLocation The user's coordinate as [lng, lat].
 * @param combinedList The full list of features used for route calculation.
 *
 * @returns { segmentedGeoJSON, destinationCoord } or null if the route cannot be computed.
 */
export function calculateRouteForFeature(
	selectedFeature: any,
	direction: "top" | "bottom",
	userLocation: [number, number] | null,
	combinedList: any[],
	allowedFilters?: {
		runs: boolean;
		lifts: boolean;
		novice: boolean;
		easy: boolean;
		intermediate: boolean;
		expert: boolean;
	}
) {
	// If allowedFilters is provided, filter the combinedList accordingly
	const filteredCombinedList = allowedFilters
		? combinedList.filter((feature) => {
				const cat = feature.category || feature.properties?.category;
				if (cat === "run") {
					if (!allowedFilters.runs) return false;
					// Get difficulty from properties (adjust key names if necessary)
					const diff = (
						feature.properties?.["piste:difficulty"] ||
						feature.properties?.difficulty ||
						""
					).toLowerCase();
					if (diff === "novice" && !allowedFilters.novice)
						return false;
					if (diff === "easy" && !allowedFilters.easy) return false;
					if (diff === "intermediate" && !allowedFilters.intermediate)
						return false;
					if (diff === "expert" && !allowedFilters.expert)
						return false;
					return true;
				} else if (cat === "lift") {
					return allowedFilters.lifts;
				}
				return true;
		  })
		: combinedList;

	// Preprocess the (filtered) combined list.
	const simplifiedEdges = preprocessFeatures(filteredCombinedList);
	if (simplifiedEdges.length === 0) {
		console.error("No simplified edges available.");
		return null;
	}
	// Build the graph:
	// If allowedFilters is provided, always rebuild the graph
	const graph = !allowedFilters
		? buildGraph(simplifiedEdges)
		: getGraph(simplifiedEdges);
	if (!graph) {
		console.error("Graph could not be built.");
		return null;
	}
	// Determine destination coordinate.
	let destinationCoord: [number, number] | null = null;
	if (selectedFeature.geometry.type === "LineString") {
		const coords = selectedFeature.geometry.coordinates;
		destinationCoord =
			direction === "top" ? coords[0] : coords[coords.length - 1];
	} else if (selectedFeature.geometry.type === "Point") {
		destinationCoord = selectedFeature.geometry.coordinates;
	}
	if (!destinationCoord) return null;

	// Find the closest nodes.
	const startNodeId = findClosestNode(graph, userLocation);
	const endNodeId = findClosestNode(graph, destinationCoord);

	// Compute the shortest path.
	const path = computeShortestPath(graph, startNodeId, endNodeId);
	if (!path || path.length === 0) {
		console.error("No path found");
		return null;
	}

	// Generate the segmented route.
	const segmentedGeoJSON = generateSegmentedRoutes(graph, path);
	return { segmentedGeoJSON, destinationCoord };
}
