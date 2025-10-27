import { useState } from "react";

// 🪟 Hook générique de gestion de modale
// Fournit un état "visible" et trois fonctions :
// - openModal() : ouvre la modale
// - closeModal() : la ferme
// - toggleModal() : alterne entre ouvert/fermé
export function useModal(initialVisible = false) {
	const [visible, setVisible] = useState(initialVisible);

	const openModal = () => setVisible(true);
	const closeModal = () => setVisible(false);
	const toggleModal = () => setVisible((prev) => !prev);

	return { visible, openModal, closeModal, toggleModal };
}
