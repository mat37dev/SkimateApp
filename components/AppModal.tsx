// AppModal.tsx
import React from "react";
import { Modal, Pressable, View } from "react-native";
import styles from "@/styles/mapStyles";

interface AppModalProps {
	visible: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export const AppModal = ({ visible, onClose, children }: AppModalProps) => {
	return (
		<Modal
			visible={visible}
			transparent
			animationType='slide'
			onRequestClose={onClose}
		>
			<Pressable style={styles.modalOverlay} onPress={onClose}>
				<View style={styles.modalContainer}>
					<Pressable onPress={(e) => e.stopPropagation()}>
						{children}
					</Pressable>
				</View>
			</Pressable>
		</Modal>
	);
};
