// calculateRoute.ts
// Module-level variable for caching the graph.
let cachedGraph = null;

const MAX_BRIDGE_DISTANCE = 0.003; // ~50m

/**
 * Preprocess features so that each feature yields exactly one "edge"
 * from a valid start to a valid end.
 */
export function preprocessFeatures(features: any[]) {
	const simplifiedEdges = [];
	features.forEach((feature) => {
		if (feature.geometry.type === "LineString") {
			const coords = feature.geometry.coordinates;
			if (!coords || coords.length < 2) return;
			const category = feature.category || feature.properties?.category;
			if (category === "run") {
				const startCoord = coords[0]; // top
				const endCoord = coords[coords.length - 1]; // bottom
				simplifiedEdges.push({
					startCoord,
					endCoord,
					category: "run",
					properties: feature.properties,
					fullCoordinates: coords, // full geometry for outlining
				});
			} else if (category === "lift") {
				const startCoord = coords[0]; // bottom
				const endCoord = coords[coords.length - 1]; // top
				simplifiedEdges.push({
					startCoord,
					endCoord,
					category: "lift",
					properties: feature.properties,
					fullCoordinates: coords,
				});
			}
		}
	});
	return simplifiedEdges;
}

/**
 * A simple Graph class.
 */
class Graph {
	nodes: { [key: string]: [number, number] } = {};
	adjacencyList: { [key: string]: Array<{ node: string; weight: number; data: any }> } = {};
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
 */
export function buildGraph(simplifiedEdges: any[]) {
	console.log("Building graph from simplified edges...");
	const graph = new Graph();

	// Add nodes and non-bridging edges.
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

		// Add bidirectional edges.
		graph.addEdge(startId, endId, w, edgeData);
		graph.addEdge(endId, startId, w, edgeData);
	});

	// Add bridging edges for nodes that are close.
	const allNodeIds = Object.keys(graph.nodes);
	for (let i = 0; i < allNodeIds.length; i++) {
		for (let j = i + 1; j < allNodeIds.length; j++) {
			const nodeIdA = allNodeIds[i];
			const nodeIdB = allNodeIds[j];
			const coordA = graph.nodes[nodeIdA];
			const coordB = graph.nodes[nodeIdB];
			const d = distance(coordA, coordB);
			if (d < MAX_BRIDGE_DISTANCE) {
				const bridgingData = { bridging: true };
				graph.addEdge(nodeIdA, nodeIdB, d, bridgingData);
				graph.addEdge(nodeIdB, nodeIdA, d, bridgingData);
			}
		}
	}
	console.log(`Graph built: ${Object.keys(graph.nodes).length} nodes`);
	return graph;
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
	let closestId = null;
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
export function computeShortestPath(graph: Graph, startNodeId: string, endNodeId: string) {
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
			console.log(`No more reachable nodes. Current node ${current} has distance Infinity.`);
			break;
		}
		if (current === endNodeId) {
			console.log(`Reached destination ${endNodeId} with distance ${distances[current]}`);
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

	// Reconstruct path.
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
 * Generate segmented routes based on the computed path.
 */
export function generateSegmentedRoutes(graph: Graph, path: string[]) {
	console.log("Generating segmented routes from path:", path);
	const segments: any[] = [];
	let currentSegment = null;

	for (let i = 0; i < path.length - 1; i++) {
		const node1 = path[i];
		const node2 = path[i + 1];
		const candidateEdges = (graph.adjacencyList[node1] || []).filter((e) => e.node === node2);
		if (candidateEdges.length === 0) {
			console.warn("No edge found for nodes:", node1, node2);
			continue;
		}
		const edge = candidateEdges[0];
		if (edge.data.bridging) {
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
			const runId = edge.data.properties?.name || "unknown";
			const segColor = edge.data.category === "run" ? getRunColor(edge.data.properties) : "black";
			if (currentSegment && currentSegment.runId === runId) {
				// Already grouped.
			} else {
				if (currentSegment) segments.push(currentSegment);
				currentSegment = {
					segmentType: "runOrLift",
					runId: runId,
					color: segColor,
					coordinates: edge.data.fullCoordinates,
				};
			}
		}
	}
	if (currentSegment) segments.push(currentSegment);

	const features = segments.map((seg) => ({
		type: "Feature",
		properties: {
			segmentType: seg.segmentType,
			runId: seg.runId || "",
			color: seg.color,
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
 * Helper to get a color for a run based on its difficulty.
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
	userLocation: [number, number],
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
					const diff = (feature.properties?.["piste:difficulty"] || feature.properties?.difficulty || "").toLowerCase();
					if (diff === "novice" && !allowedFilters.novice) return false;
					if (diff === "easy" && !allowedFilters.easy) return false;
					if (diff === "intermediate" && !allowedFilters.intermediate) return false;
					if (diff === "expert" && !allowedFilters.expert) return false;
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
	const graph = allowedFilters ? buildGraph(simplifiedEdges) : getGraph(simplifiedEdges);
	if (!graph) {
		console.error("Graph could not be built.");
		return null;
	}
	// Determine destination coordinate.
	let destinationCoord: [number, number] | null = null;
	if (selectedFeature.geometry.type === "LineString") {
		const coords = selectedFeature.geometry.coordinates;
		destinationCoord = direction === "top" ? coords[0] : coords[coords.length - 1];
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
