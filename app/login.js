import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    ScrollView, Alert,
} from 'react-native';

import axios from "axios";

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Error, setError] = useState('');

    const handleLogin = async () => {

        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
        }

        const isEmailValid = (email)=>{
            const regex = /^[a-z0-9]+@[a-z0-9]+\.[a-z0-9]+$/;
            return regex.test(email)
        }

        if(!isEmailValid(email)){
            setError('Veuillez entrer une adresse email valide.');
        }

        try{
            const response = await axios.post('http://localhost:8000/api/login',{
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200) {
                Alert.alert('Vous êtes connecté(e) avec succès.');
                const token = response.data.token;
                await AsyncStorage.setItem('token', token);
                console.log(response.data.token);
                navigation.navigate('dashboard')

            }else {
                setError("Identifiants invalide. Veuillez réessayer");
            }
        }catch(error){
            console.log(error);
            setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
        }
    }

    return (
        <View style={styles.LoginContainer}>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View contentContainerStyle={styles.container}>
                    <Text style={styles.logo}>SkiMate</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#000000"
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
                        <Text style={styles.buttonText}>se connecter</Text>
                    </TouchableOpacity>

                    <View style={styles.linksContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('register')}>
                            <Text style={styles.linkText}>S'inscrire</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Mot de passe oublié</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

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
