import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from 'expo-router';
import apiClient from "@/api/apiClient";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from "expo-image-picker";
import UploadImageModal from "@/components/UploadImageModal";
import { TextStyles } from "@/constants/TextStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfileScreen = () => {
    const [userData, setUserData] = useState({ user: {} });
    const [skiPreference, setSkiPreference] = useState({ user: {} });
    const [skiLevel, setSkiLevel] = useState({ user: {} });
    const [error, setError] = useState<String | null>(null);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const text = useThemeColor({}, 'text');
    const whiteText = useThemeColor({}, 'whiteText');
    const iconsColor = useThemeColor({}, 'icon');

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert("Désolé, nous avons besoin des autorisations de caméra pour que cela fonctionne!");
        }
    };

    useEffect(() => {
        requestPermissions();
        loadImage();
    }, []);

    const loadImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem('userImage');
            if (savedImage) {
                setImage(savedImage);
            }
        } catch (error) {
            console.error("Error loading image:", error);
        }
    };

    const uploadImage = async (option) => {
        try {
            let result;
            if (option === "camera") {
                await requestPermissions();
                result = await ImagePicker.launchCameraAsync({
                    cameraType: ImagePicker.CameraType.front,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            } else if (option === "gallery") {
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            }
            if (!result.canceled) {
                await saveImage(result.assets[0].uri);
            }
        } catch (error) {
            alert("Error while saving image: " + error.message);
            setModalVisible(false);
        }
    };

    const saveImage = async (uri) => {
        try {
            await AsyncStorage.setItem('userImage', uri);
            setImage(uri);
        } catch (error) {
            console.error("Error saving image:", error);
        }
    };

    const removeImage = () => {
        setImage(null);
        setModalVisible(false);
        AsyncStorage.removeItem('userImage');
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await apiClient.get('/profile');
                setUserData(response.data.user);
                setSkiPreference(response.data.user.skiPreference);
                setSkiLevel(response.data.user.skiLevel);
            } catch (error) {
                setError('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <ImageBackground
            source={require('../assets/background/pexels-ryank-20042214.jpg')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.profileHeader}>
                    <Avatar.Image
                        source={image ? { uri: image } : require('../assets/images/profil.png')}
                        size={120}
                        style={styles.avatar}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.cameraIcon}>
                        <MaterialCommunityIcons name="camera" size={20} color='#fff' />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
                        <Ionicons name="settings-sharp" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="small" color="#003566" />
                ) : userData ? (
                    <Text style={[TextStyles.whiteTitle, { color: whiteText }]}>
                        {userData.firstname} {userData.lastname}
                    </Text>
                ) : (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                <ScrollView style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Text style={[TextStyles.title, { color: text }]}>Informations personnelles</Text>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="email" size={24} style={[{ color: iconsColor }]} />
                            <Text style={[{ color: text }]}>{userData.email}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="phone" size={24} style={[{ color: iconsColor }]} />
                            <Text style={[{ color: text }]}>{userData.phoneNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={[TextStyles.title, { color: text }]}>Préférences et Niveau de ski</Text>
                        {skiPreference ? (
                            <View style={styles.infoItem}>
                                <Text style={[{ color: text }]}>Préférence de ski</Text>
                                <Text style={[{ color: text }]}>{skiPreference.name}</Text>
                            </View>
                        ) : null}
                        {skiLevel ? (
                            <View style={styles.infoItem}>
                                <Text style={[{ color: text }]}>Niveau de ski</Text>
                                <Text style={[{ color: text }]}>{skiLevel.name}</Text>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </View>

            <UploadImageModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onOptionSelected={uploadImage}
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 20,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.3,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
        position: "relative",
    },
    avatar: {
        marginBottom: 15,
        borderColor: '#fff',
        backgroundColor: '#fff',
    },
    cameraIcon: {
        position: "absolute",
        top: 80,
        right:0,
        backgroundColor: '#003566',
        padding: 8,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },

    settingsBtn: {
        position: "absolute",
        top: -50,
        left: 180,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#003566",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 50,
    },
    cardContainer: {
        width: '100%',
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default UserProfileScreen;
