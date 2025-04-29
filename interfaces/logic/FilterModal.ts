export interface FilterModalProps {
	visible: boolean;
	onClose: () => void;
	showLifts: boolean;
	setShowLifts: (value: boolean) => void;
	showRuns: boolean;
	setShowRuns: (value: boolean) => void;
	showNovice: boolean;
	setShowNovice: (value: boolean) => void;
	showEasy: boolean;
	setShowEasy: (value: boolean) => void;
	showIntermediate: boolean;
	setShowIntermediate: (value: boolean) => void;
	showExpert: boolean;
	setShowExpert: (value: boolean) => void;
}
