import React from "react";
import MapboxGL from "@rnmapbox/maps";
import MapStyleConfig from "@/constants/map/mapStyles";

interface Props {
	routeFeature: any;
	belowLayerID: string;
}

export const RouteLayers = ({ routeFeature, belowLayerID }: Props) => {
	if (!routeFeature) return null;

	if (!Array.isArray(routeFeature)) {
		return (
			<MapboxGL.ShapeSource id='routeSource' shape={routeFeature}>
				<MapboxGL.LineLayer
					id='bridgingLayer'
					belowLayerID={belowLayerID}
					filter={["==", ["get", "segmentType"], "bridging"]}
					style={{
						lineColor: "green",
						lineWidth: 4,
						lineOpacity: 1,
						lineDasharray: [1, 1],
					}}
				/>
				<MapboxGL.LineLayer
					id='normalLayer'
					belowLayerID={belowLayerID}
					filter={["!=", ["get", "segmentType"], "bridging"]}
					style={{
						lineColor: ["get", "color"],
						lineWidth: 4,
						lineOpacity: 1,
					}}
				/>
			</MapboxGL.ShapeSource>
		);
	}

	return (
		<>
			{routeFeature.map((feature: any, index: number) => (
				<MapboxGL.ShapeSource
					key={`routeSource-${index}`}
					id={`routeSource-${index}`}
					shape={feature}
				>
					<MapboxGL.LineLayer
						id={`normalLayer-${index}`}
						belowLayerID={belowLayerID}
						style={{
							lineColor: ["get", "color"],
							lineWidth: MapStyleConfig.RouteSegmentLineWidth,
							lineOpacity: MapStyleConfig.RouteSegmentLineOpacity,
						}}
					/>
				</MapboxGL.ShapeSource>
			))}
		</>
	);
};

export default RouteLayers;
