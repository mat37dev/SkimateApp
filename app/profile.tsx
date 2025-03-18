import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator} from 'react-native';
import { Avatar } from 'react-native-paper';
import { Card } from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import {useThemeColor} from "@/hooks/useThemeColor";
import {router} from 'expo-router';
import apiClient from "@/api/apiClient";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from "expo-image-picker"
import UploadImageModal from "@/components/UploadImageModal";
import {TextStyles} from "@/constants/TextStyles";

const UserProfileScreen = () => {
    const [userData, setUserData] = useState({user:{}});
    const [skiPreference, setSkiPreference] = useState({user:{}});
    const [skiLevel, setSkiLevel] = useState({user:{}});
    const [error, setError] = useState<String | null>(null);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const text = useThemeColor({}, 'text');
    const whiteText = useThemeColor({}, 'whiteText');
    const iconsColor = useThemeColor({}, 'icon')

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert("Désolé, nous avons besoin des autorisations de caméra pour que cela fonctionne!");
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);
    const uploadImage = async (option) => {
        try {
            let result;
            if (option === "camera"){
                await requestPermissions();

                result = await ImagePicker.launchCameraAsync({
                    cameraType: ImagePicker.CameraType.front,
                    allowsEditing: true,
                    aspect:[1,1],
                    quality: 1,
                });
            }else if(option ==="gallery"){
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect:[1,1],
                    quality: 1,
                });
            }
            if (!result.cancelled) {
                await saveImage(result.assets[0].uri)
            }
        } catch (error) {
            alert("Error while saving image: " + error.message);
            setModalVisible(false);
        }
    };

    const saveImage = async(uri) => {
        setImage(uri)
    }
    const removeImage = () => {
        setImage(null);
        setModalVisible(false);
    };

    useEffect(() => {
        const fetchUserInfo = async ()=>{
            try {
                const response = await apiClient.get('/profile');
                setUserData(response.data.user);
                setSkiPreference(response.data.user.skiPreference);
                setSkiLevel(response.data.user.skiLevel);
                console.log(response.data.user);
            }catch(error){
                console.log(error);
                setError('Impossible de charger les données');
            }finally {
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
                <View>
                    <Avatar.Image
                        source={image ? { uri: image } : require('../assets/images/profil.png')}
                        size={100}
                        style={styles.avatar}

                    />
                    <TouchableOpacity onPress={()=> setModalVisible(true)}>
                        <MaterialCommunityIcons
                            name="camera"
                            size={30}
                            color='grey'
                            style={styles.photo}>
                        </MaterialCommunityIcons>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.settingsBtn} onPress={()=>router.push('/settings')}>
                    <Ionicons name="settings-sharp" size={30} color="#fff" />
                </TouchableOpacity>
                {loading ? (
                    <ActivityIndicator size="small" color="#003566" />
                ) : userData? (
                    <>
                        <Text style={[TextStyles.whiteTitle, {color: whiteText}]}>
                            {userData.firstname} {userData.lastname}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                <ScrollView style={styles.cardContainer}>
                    <View>
                        {loading ? (
                            <ActivityIndicator size="small" color="#003566" />
                        ) : userData? (
                            <View style={styles.infosContainer}>
                                <Text style={[TextStyles.title, {color: text}]}>Informations personnelles</Text>
                                <View style={[styles.fieldText, styles.topField]}>
                                    <MaterialCommunityIcons name="email" size={24} style={[{color: iconsColor}]}  />
                                    <Text style={[{color: text}]}>{userData.email}</Text>
                                </View>
                                <View style={[styles.fieldText, styles.bottomField]}>
                                    <MaterialCommunityIcons name="phone" size={24} style={[{color: iconsColor}]}/>
                                    <Text style={[{color: text}]}>{userData.phoneNumber}</Text>
                                </View>

                            </View>
                        ) : (
                            <Text style={styles.errorText}>{error}</Text>
                        )}
                    </View>
                    <View>
                        {loading ? (
                            <ActivityIndicator size="small" color="#003566" />
                        ) : userData? (
                            <View style={styles.infosContainer}>
                                <View style={styles.topField}>
                                    {skiPreference ? (
                                        <View style={[styles.fieldText, styles.topField]}>
                                            <Text style={[{color: text}]}> Préference de ski</Text>
                                            <Text style={[{color: text}]}>{skiPreference.name}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.errorText}>{error}</Text>
                                    )}
                                </View>
                                <View>
                                    {skiLevel ? (
                                            <View style={[styles.fieldText, styles.bottomField]}>
                                                <Text style={[{color: text}]}>Niveau de ski</Text>
                                                <Text style={[{color: text}]}>{skiLevel.name}</Text>
                                            </View>
                                    ) : (
                                        <Text style={styles.errorText}>{error}</Text>
                                    )}
                                </View>

                            </View>
                        ) : (
                            <Text style={styles.errorText}>{error}</Text>
                        )}
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
        opacity: 0.5,
    },
    avatar: {
        marginBottom: 15,
        borderColor: '#fff',
        backgroundColor:'#fff'
    },

    phone: {
        fontSize: 16,
        marginTop: 5,
    },
    skiLevelText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'right',
        marginBottom: 30,
    },
    cardContainer: {
        width: '100%',
    },

    infosContainer:{
      marginTop: 30,
    },
    fieldText: {
        fontSize: 16,
        marginBottom: 2,
        backgroundColor:'#f2f4f7',
        height:45,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingRight:30,
        paddingLeft:30,
    },
    topField:{
      borderTopRightRadius:10,
      borderTopLeftRadius:10,
    },
    bottomField:{
      borderBottomRightRadius:10,
      borderBottomLeftRadius:10,
    },
    settingsBtn: {
        position: 'absolute',
        top: -40,
        right: 25,
        backgroundColor: '#0A3A5D',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    photo:{
        position: "absolute",
        top: -45,
        right: 10,
    }
});

export default UserProfileScreen;
