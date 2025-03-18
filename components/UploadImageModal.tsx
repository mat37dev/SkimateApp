import React from 'react';
import {Modal, View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const UploadImage = ({ isVisible, onClose, onOptionSelected }) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Choisir une option</Text>
                    <View style={styles.modalIcons}>
                        <TouchableOpacity
                            onPress={() => {
                                onOptionSelected('camera');
                                onClose();
                            }}>
                            <Entypo style={styles.icon} name="camera" size={50} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onOptionSelected('gallery');
                                onClose();
                            }}>
                            <FontAwesome style={styles.icon} name="photo" size={50} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onOptionSelected('remove');
                                onClose();
                            }}>
                            <FontAwesome style={styles.icon} name="trash" size={50} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    modalIcons:{
        display: 'flex',
        flexDirection:'row'
    },
    icon:{
        paddingHorizontal: 20,
    }
});

export default UploadImage;
