// CollapsibleRouteSheet.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";

const screenHeight = Dimensions.get("window").height;

type SegmentFeature = {
	properties: {
		segmentType: string; // "bridging" or "runOrLift"
		runId?: string;
		color?: string;
	};
};

type CollapsibleRouteSheetProps = {
	segments: SegmentFeature[];
	open: boolean; // whether the sheet is "open" or "collapsed"
	onToggle: () => void;
	onCancelTravel: () => void; // the function to cancel the travel
};

export function CollapsibleRouteSheet({ segments, open, onToggle, onCancelTravel }: CollapsibleRouteSheetProps) {
	// If open, we let content define the height up to maxHeight.
	// If collapsed, we can set a small fixed height (like 80).
	const containerStyle = open
		? {
				maxHeight: screenHeight * 0.8, // or 0.7, etc.
		  }
		: {
				height: 80,
		  };

	return (
		<View style={[stylesSheet.container, containerStyle]}>
			{/* Header: toggles open/close */}
			<TouchableOpacity style={stylesSheet.header} activeOpacity={0.8} onPress={onToggle}>
				<Text style={{ fontWeight: "bold" }}>{open ? "Route Instructions ▼" : "Route Instructions ▲"}</Text>
			</TouchableOpacity>

			{/* Body: timeline of segments + cancel button */}
			<ScrollView style={stylesSheet.body}>
				{segments.map((seg, idx) => {
					const { segmentType, runId, color } = seg.properties;
					let label = "";
					if (segmentType === "bridging") {
						label = "Walk (blue dotted line)";
					} else {
						label = runId ? `Take ${runId}` : "Take unknown route";
					}

					// We'll show a bullet + vertical line for each item
					// The line extends downward except for the last item
					const isLast = idx === segments.length - 1;

					return (
						<View key={idx} style={stylesSheet.timelineRow}>
							{/* The timeline column */}
							<View style={stylesSheet.timelineCol}>
								<View style={[stylesSheet.bullet, { borderColor: color || "blue" }]} />
								{!isLast && <View style={stylesSheet.verticalLine} />}
							</View>
							{/* The label text */}
							<View style={{ flex: 1 }}>
								<Text style={stylesSheet.labelText}>{label}</Text>
							</View>
						</View>
					);
				})}

				{/* A bit of spacing at the bottom */}
				<View style={{ height: 20 }} />
			</ScrollView>

			{/* Footer with the Cancel button */}
			<View style={stylesSheet.footer}>
				<TouchableOpacity style={stylesSheet.cancelBtn} onPress={onCancelTravel}>
					<Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel Travel</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const stylesSheet = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#fff",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,

		// Some shadow/elevation
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	header: {
		alignItems: "center",
		padding: 10,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		backgroundColor: "#eee",
	},
	body: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 7,
	},
	footer: {
		padding: 10,
		alignItems: "center",
	},
	cancelBtn: {
		backgroundColor: "red",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},

	// Timeline styles
	timelineRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
	},
	timelineCol: {
		width: 30,
		alignItems: "center",
	},
	bullet: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: "#fff",
		borderWidth: 3,
		// The border color is set dynamically in the code
	},
	verticalLine: {
		width: 2,
		flex: 1,
		backgroundColor: "blue",
		marginTop: 2,
	},
	labelText: {
		fontSize: 14,
		lineHeight: 20,
	},
});
