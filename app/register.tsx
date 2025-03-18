import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
} from 'react-native';
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import {Link, useRouter} from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TextStyles} from "@/constants/TextStyles";
import {useThemeColor} from "@/hooks/useThemeColor";

const SignupScreen: React.FC = () => {
    let API_URL = 'http://localhost:3000/';
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
        console.warn("Les variables d'environnement ne sont pas accessibles.");
    } else {
        API_URL = Constants.expoConfig.extra.apiUrl;
    }

    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [telephone, setTelephone] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    // const [skiLevel, setSkiLevel] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [error, setError] = useState<string>('');

    const errorTextColor = useThemeColor({}, 'errorText');

    const handleRegister = async (): Promise<void> => {
        if (!email || !password || !telephone || !name || !lastname || !confirmPassword) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        if (telephone) {
            const regex = /^(\+33|0)[1-9](\d{2}){4}$/;
            if (!regex.test(telephone)) {
                setError('Numéro de téléphone invalide');
                return;
            }
        }


        const payload = {
            email: email,
            firstName: name,
            lastName: lastname,
            password: password,
            confirmPassword: confirmPassword,
            phoneNumber: telephone,
        };

        try {
            const response = await axios.post(`${API_URL}/api/register`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Vous êtes inscrit(e) avec succès.');
                const token= response.data.token;
                const refreshToken = response.data.refresh_token;

                if (Platform.OS === 'web'){
                    await AsyncStorage.setItem('refresh_token', refreshToken);
                    await AsyncStorage.setItem('token', refreshToken);
                }else {
                    // Sauvegarder les tokens dans SecureStore
                    await SecureStore.setItemAsync('token', token);
                    await SecureStore.setItemAsync('refresh_token', refreshToken);
                }
                console.log('Response received:', response);
                router.push('/dashboard');
            } else {
                setError("Erreur inattendue. Veuillez réessayer.");
            }
        } catch (err: any) {
            // Gestion des erreurs axios
            if (err.response) {
                const errors = err.response.data.errors && err.response.data.errors.email;
                console.log(err.response.data.errors)
                if (errors) {
                    setError(errors || 'Erreur inattendue');
                }
            }
            else if (err.request) {
                console.error(err.request);
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
            } else {
                console.error('Erreur', err.message);
                setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.viewContainer}>
                    <Text style={[{ color: errorTextColor }, TextStyles.errorText]}>{error}</Text>
                    <Text style={styles.logo}>SkiMate</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Nom"
                            onChangeText={setLastname}
                            placeholderTextColor="#000"
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Prénom"
                            onChangeText={setName}
                            placeholderTextColor="#000"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={setEmail}
                            placeholderTextColor="#000"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Téléphone"
                            onChangeText={setTelephone}
                            placeholderTextColor="#000"
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            onChangeText={setPassword}
                            placeholderTextColor="#000"
                            secureTextEntry
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            onChangeText={setConfirmPassword}
                            placeholderTextColor="#000"
                            secureTextEntry
                        />
                    </View>
                    {/*
                      <View style={styles.inputContainer}>
                          <TextInput
                              style={styles.input}
                              placeholder="Niveau de ski"
                              onChangeText={setSkiLevel}
                              placeholderTextColor="#000"
                          />
                      </View>
                    */}
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    </TouchableOpacity>
                    <Link href="/login" asChild>
                        <TouchableOpacity style={{ marginTop: 20 }}>
                            <Text style={{ color: 'black', textAlign: 'center' }}>Se connecter</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5
    },
    viewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#003566',
        textAlign: 'center',
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfInput: {
        width: '48%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000000',
        backgroundColor: 'transparent',
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#003566',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
