const dictionaries = {
	featureTranslation: {
		run: "Piste",
		lift: "Remontée mécanique",
		station: "Station",
		city: "Ville",
		unknown: "Inconnu",
	},
	difficulty: {
		novice: "Débutant",
		easy: "Facile",
		intermediate: "Intermédiaire",
		expert: "Expert",
		nullDiff: "Non défini",
		unknown: "Inconnu",
	},
	aerialway: {
		chair_lift: "Télésiège",
		drag_lift: "Téléski",
		rope_tow: "Fil neige/télécorde",
		magic_carpet: "Tapis roulant",
		gondola: "Télécabine",
		cable_car: "Téléphérique",
		zip_line: "Tyrolienne",
		platter: "Téléski à perche/tire-fesses",
		unknown: "Inconnu",
	},
	lit: {
		yes: "Éclairée",
		no: "Non éclairée",
		unknown: "Inconnu",
	},
};

export function tr(
	value: string | undefined,
	category: keyof typeof dictionaries
): string {
	if (!value) return "Inconnu";
	const dict = dictionaries[category];
	return dict[value as keyof typeof dict] || value;
}
