import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
    Platform
} from 'react-native';
import axios from 'axios';
import {useRouter, Link} from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {isUserConnected} from "@/api/apiClient";

const LoginScreen: React.FC = () => {
    useEffect(() => {
        const checkConnection = async () => {
            const connected = await isUserConnected();
            if(connected){
                router.replace("/dashboard");
            }
        };
        checkConnection();
    }, []);

    let API_URL = 'http://localhost:8000/';
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
        console.warn("Les variables d'environnement ne sont pas accessibles.");
    } else {
        API_URL = Constants.expoConfig.extra.apiUrl;
    }

    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = async (): Promise<void> => {
        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        const isEmailValid = (input: string): boolean => {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(input);
        };

        if (!isEmailValid(email)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                Alert.alert('Vous êtes connecté(e) avec succès.');
                const token= response.data.token;
                const refreshToken = response.data.refresh_token;

                if (Platform.OS === 'web'){
                    await AsyncStorage.setItem('token', token);
                    await AsyncStorage.setItem('refresh_token', refreshToken);
                }else {
                    // Sauvegarder les tokens dans SecureStore
                    await SecureStore.setItemAsync('token', token);
                    await SecureStore.setItemAsync('refresh_token', refreshToken);
                }
                router.push('/dashboard');
            } else {
                setError("Identifiants invalides. Veuillez réessayer.");
            }
        } catch (err) {
            console.log(err);
            setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    };
    return (
        <View style={styles.LoginContainer}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.container}>
                    <Text style={styles.logo}>SkiMate</Text>

                    {error ? (
                        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#000000"
                            value={email}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#000000"
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Se connecter</Text>
                    </TouchableOpacity>

                    <View style={styles.linksContainer}>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>S'inscrire</Text>
                            </TouchableOpacity>
                        </Link>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Mot de passe oublié</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    LoginContainer: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    container: {
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
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
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
    linksContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linkText: {
        color: '#000000',
        fontSize: 14,
    },
});

export default LoginScreen;
