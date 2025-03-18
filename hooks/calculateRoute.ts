// calculateRoute.js

// Module-level variable for caching the graph.
let cachedGraph = null;

// Maximum bridging distance (in degrees). Adjust as needed.
const MAX_BRIDGE_DISTANCE = 0.003; // ~50m

/**
 * Preprocess features so that each feature yields exactly one "edge"
 * from a valid start to a valid end.
 * For runs, the first coordinate is the top (start) and the last is the bottom (end).
 * For lifts, the first coordinate is the bottom (start) and the last is the top (end).
 * Also, preserve the full coordinate array (for outlining the actual feature).
 */
export function preprocessFeatures(features) {
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
 * nodes: { nodeId: [lng, lat], ... }
 * adjacencyList: { nodeId: [{ node, weight, data }, ...], ... }
 */
class Graph {
	constructor() {
		this.nodes = {};
		this.adjacencyList = {};
	}
	addNode(nodeId, coord) {
		if (!this.nodes[nodeId]) {
			this.nodes[nodeId] = coord;
			this.adjacencyList[nodeId] = [];
		}
	}
	addEdge(nodeId1, nodeId2, weight, data) {
		if (!this.adjacencyList[nodeId1]) {
			this.adjacencyList[nodeId1] = [];
		}
		this.adjacencyList[nodeId1].push({ node: nodeId2, weight, data });
	}
}

// Helper to compute Euclidean distance.
function distance(coordA, coordB) {
	const dx = coordA[0] - coordB[0];
	const dy = coordA[1] - coordB[1];
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Build a graph from simplifiedEdges.
 * Each edge represents a full run/lift with its start and end nodes.
 * Then, bridging edges (walking) are added for nodes that are close enough.
 */
export function buildGraph(simplifiedEdges) {
	console.log("Building graph from simplified edges...");
	const graph = new Graph();

	// 1. Add nodes and run/lift edges.
	simplifiedEdges.forEach((edge) => {
		const startId = edge.startCoord.join(",");
		const endId = edge.endCoord.join(",");

		graph.addNode(startId, edge.startCoord);
		graph.addNode(endId, edge.endCoord);

		const w = distance(edge.startCoord, edge.endCoord);
		// Mark this as a non-bridging edge and store full geometry.
		const edgeData = {
			bridging: false,
			category: edge.category,
			properties: edge.properties,
			fullCoordinates: edge.fullCoordinates,
		};

		// Add bidirectional edge.
		graph.addEdge(startId, endId, w, edgeData);
		graph.addEdge(endId, startId, w, edgeData);
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
 * getGraph: returns the cached graph if available, otherwise builds it.
 */
export function getGraphFromEdges(simplifiedEdges) {
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
export function findClosestNode(graph, targetCoord) {
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
export function computeShortestPath(graph, startNodeId, endNodeId) {
	console.log(`Computing shortest path from ${startNodeId} to ${endNodeId}`);
	const distances = {};
	const previous = {};
	const unvisited = new Set();

	for (const nodeId in graph.nodes) {
		distances[nodeId] = Infinity;
		previous[nodeId] = null;
		unvisited.add(nodeId);
	}
	distances[startNodeId] = 0;

	while (unvisited.size > 0) {
		let current = null;
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
	const path = [];
	let cur = endNodeId;
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
function getRunColor(properties) {
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
 * For each consecutive pair of nodes in the computed path, we look up the edge data.
 * If edge.data.bridging is true, we treat it as a walking segment (a straight line).
 * For non-bridging edges (i.e. a run or lift), we use the fullCoordinates from the original feature.
 */
export function generateSegmentedRoutes(graph, path) {
	console.log("Generating segmented routes from path:", path);
	const segments = [];
	let currentSegment = null; // For grouping consecutive non-bridging edges

	// Iterate over consecutive node pairs.
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
			// Finish any current non-bridging segment.
			if (currentSegment) {
				segments.push(currentSegment);
				currentSegment = null;
			}
			// Create a bridging segment as a straight line between node1 and node2.
			segments.push({
				segmentType: "bridging",
				color: "blue",
				coordinates: [graph.nodes[node1], graph.nodes[node2]],
			});
		} else {
			// Non-bridging: use the fullCoordinates from the edge.
			const runId = edge.data.properties?.name || "unknown";
			const segColor = edge.data.category === "run" ? getRunColor(edge.data.properties) : "black";
			// If currentSegment is defined and has the same runId, continue.
			if (currentSegment && currentSegment.runId === runId) {
				// Do nothing: assume the full geometry already represents the entire run.
				// Alternatively, you could merge segments if needed.
			} else {
				// If there's an existing segment, push it.
				if (currentSegment) segments.push(currentSegment);
				// Start a new segment using the fullCoordinates.
				currentSegment = {
					segmentType: "runOrLift",
					runId: runId,
					color: segColor,
					coordinates: edge.data.fullCoordinates, // Detailed geometry from the original feature.
				};
			}
		}
	}
	// Push any remaining non-bridging segment.
	if (currentSegment) segments.push(currentSegment);

	// Convert segments into GeoJSON features.
	const features = segments.map((seg) => ({
		type: "Feature",
		properties: {
			segmentType: seg.segmentType, // "bridging" or "runOrLift"
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
 * getGraph: returns the cached graph if it exists, otherwise builds it.
 */
export function getGraph(simplifiedEdges) {
	if (cachedGraph) {
		console.log("Graph is already stored!");
		return cachedGraph;
	}
	console.log("Graph is not stored yet :/ Building graph...");
	cachedGraph = buildGraph(simplifiedEdges);
	return cachedGraph;
}
