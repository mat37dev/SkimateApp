export const mapVariables = {
	// Zone de délimitation pour restreindre les mouvements de la caméra
	BOUNDS: {
		ne: [6.95, 45.65], // coin nord-est
		sw: [6.6, 45.4], // coin sud-ouest
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
	},

	// Niveau de zoom par défaut (vue initiale et mode 2D)
	DEFAULT_ZOOM_LEVEL: 11,

	// Inclinaison (pitch) par défaut en mode 3D
	DEFAULT_PITCH_3D: 70,

	// Inclinaison et zoom lorsqu'on suit la position GPS
	FOLLOW_PITCH: 45,
	FOLLOW_ZOOM_LEVEL: 18,
};
