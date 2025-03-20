import { useState } from "react";

export function useModal(initialVisible = false) {
	const [visible, setVisible] = useState(initialVisible);
	const openModal = () => setVisible(true);
	const closeModal = () => setVisible(false);
	const toggleModal = () => setVisible((prev) => !prev);

	return { visible, openModal, closeModal, toggleModal };
}
