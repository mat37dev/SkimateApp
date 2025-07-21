/**
 * Fichier de style pour la carte, potentiellement accessible par l'admin pour modifier les styles de la carte.
 */

const MapStyleConfig = {
	/* STATIONS */

	// Style des contours de station
	StationLineColor: "#1E90FF", // Couleur de la ligne
	StationLineWidth: 2, // Largeur de la ligne
	StationLineOpacity: 1, // Opacité
	StationLineJoin: "round", // *NE PAS TOUCHER* - Jointure des segments
	StationLineCap: "round", // *NE PAS TOUCHER* - Cap des lignes

	// Style des labels
	StationLabelFontSize: 15, // Taille du texte
	StationLabelTextOpacity: 1, // Opacité du texte
	StationLabelColor: "#1E90FF", // Couleur du texte
	StationLabelHaloWidth: 2, // Largeur de l'auréole
	StationLabelHaloColor: "#ffffff", // Couleur de l'auréole
	StationLabelAllowOverlap: false, // Ne pas chevaucher
	StationLabelTextFont: "Open Sans Bold", // Police
	StationLabelTextIgnorePlacement: false, // Ne pas ignorer placement
	StationLabelSymbolPlacement: "line", // *NE PAS TOUCHER* Placement le long de la ligne

	/* CITIES */

	// Style des labels de ville
	CityLabelFontSize: 14, // Taille du texte
	CityLabelTextOpacity: 1, // Opacité du texte
	CityLabelMinimumDistanceApparition: 11.5, // Distance d'apparition des labels
	CityLabelMaximumDistanceApparition: 13.5, // Distance d'apparition des labels
	CityLabelColor: "#000", // Couleur du texte
	CityLabelHaloWidth: 1, // Largeur de l'auréole
	CityLabelHaloColor: "#fff", // Couleur de l'auréole
	CityLabelAllowOverlap: false, // Ne pas chevaucher
	CityLabelTextFont: "Open Sans Bold", // Police
	CityLabelTextIgnorePlacement: false, // Ne pas ignorer placement
	CityLabelSymbolPlacement: "point", // *NE PAS TOUCHER* - Placement par point

	/* PISTES */

	// Style des tracés
	RunLineOpacity: 0.7, // Opacité de la ligne de course
	RunLineWidth: ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 1.4], // Largeur de la ligne de course en fonction du zoom

	//Style des labels
	RunLabelFontSize: 14, // Taille de la police des labels de course
	RunLabelTextOpacity: 0.7, // Opacité du texte des labels de cours
	RunLabelTextDistanceApparition: 13.5, // Distance d'apparition des labels de course
	RunLabelHaloWidth: 4, // Largeur de l'auréole des labels
	RunLabelHaloColor: "#fff", // Couleur de l'auréole des labels de course
	RunLabelAllowOverlap: true, // Permettre le chevauchement des labels
	RunLabelTextFont: "Open Sans Bold", // Police des labels de course
	RunLabelTextIgnorePlacement: true, // Ignorer le placement des labels
	RunLabelSymbolPlacement: "line", // *NE PAS TOUCHER* Placement des symboles des labels de course

	//Styles des flèches
	RunArrowsSymbolPlacement: "line", // *NE PAS TOUCHER* Placement des symboles de flèches
	RunArrowDistanceApparition: 15, // Distance d'apparition des flèches
	RunArrowSymbolSpacing: 200, // Espacement des symboles de flèches
	RunArrowTextField: "▶", // On utilise du texte pour les flèches ici, mais peut être remplacé par une icône si nécessaire
	RunArrowTextSize: 30, // Taille du texte des flèches de direction
	RunArrowHaloWidth: 0, // Largeur de l'auréole des flèches
	RunArrowHaloColor: "#ffffff", // Couleur de l'auréole des flèches
	RunArrowTextOpacity: 1, // Opacité des flèches
	RunArrowTextRotationAlignment: "map", // *NE PAS TOUCHER* - Alignement de la rotation du texte des flèches
	RunArrowTextPitchAlignment: "map", // *NE PAS TOUCHER* - Alignement de l'inclinaison du texte des flèches
	RunArrowTextKeepUpright: false, // *NE PAS TOUCHER* - Garde le texte des flèches droit

	/* LIFTS */

	// Style des tracés
	LiftLineOpacity: 0.7, // Opacité de la ligne de lift
	LiftLineWidth: ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 1.4], // Largeur variable selon le zoom
	LiftLineDashArray: [2, 2], // Pointillés
	LiftLineColor: "black", // Couleur de la ligne de lift

	// Style des labels
	LiftLabelFontSize: 14, // Taille du texte des labels
	LiftLabelTextOpacity: 0.7, // Opacité du texte
	LiftLabelTextDistanceApparition: 13.5, // Distance d'apparition des labels
	LiftLabelColor: "#000", // Couleur du texte
	LiftLabelHaloWidth: 3, // Largeur de l'auréole
	LiftLabelHaloColor: "#fff", // Couleur de l'auréole
	LiftLabelAllowOverlap: true, // Permettre chevauchement des labels
	LiftLabelTextFont: "Open Sans Bold", // Police du label
	LiftLabelTextIgnorePlacement: true, // Ignorer le placement
	LiftLabelSymbolPlacement: "line", // *NE PAS TOUCHER* Placement le long de la ligne

	// Style des flèches
	LiftArrowSymbolPlacement: "line", // *NE PAS TOUCHER* Placement le long de la ligne
	LiftArrowDistanceApparition: 15, // Zoom minimal d'apparition des flèches
	LiftArrowSymbolSpacing: 200, // Espacement entre flèches
	LiftArrowTextField: "▶", // Texte ou icône pour flèche
	LiftArrowTextSize: 30, // Taille de la flèche
	LiftArrowHaloWidth: 0, // Largeur de l'auréole
	LiftArrowHaloColor: "#ffffff", // Couleur de l'auréole
	LiftArrowTextOpacity: 1, // Opacité
	LiftArrowTextRotationAlignment: "map", // *NE PAS TOUCHER* Alignement rotation
	LiftArrowTextPitchAlignment: "map", // *NE PAS TOUCHER* Alignement inclinaison
	LiftArrowTextKeepUpright: false, // *NE PAS TOUCHER* Ne force pas la flèche droite

	// Styles des icônes de transport (tire-fesses, télésièges, etc.)

	LiftIconDistanceApparition: 15, // Distance d'apparition des icônes de lift
	LiftIconSize: 0.07, // Taille relative de l'icône
	LiftIconSymbolPlacement: "point", // *NE PAS TOUCHER* - Placement sur un point
	LiftIconAllowOverlap: true, // Permettre chevauchement
	LiftIconIgnorePlacement: true, // Ignorer le placement des autres éléments
	LiftIconPitchAlignment: "viewport", // *NE PAS TOUCHER* - Alignement inclinaison
	LiftIconRotationAlignment: "viewport", // *NE PAS TOUCHER* - Alignement rotation
	LiftIconAnchor: "bottom", // *NE PAS TOUCHER* - Ancrage en bas

	/* ROUTES GPS */

	RouteSegmentLineWidth: 4, // Largeur des segments de route
	RouteSegmentLineOpacity: 1, // Opacité des segments
};

export default MapStyleConfig;
