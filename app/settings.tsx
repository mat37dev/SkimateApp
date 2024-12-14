import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import React, {useState} from "react";
import SelectDropdown from 'react-native-select-dropdown'
import { AntDesign } from '@expo/vector-icons';
import axios from "axios";

const  SettingScreen: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [prenom, setPrenom] = useState<string>('');
    const [nom, setNom] = useState<string>('');
    const [telephone, setTelephone] = useState<string>('');
    const [isPressed, setIsPressed] = useState<string | null>(null);
    // const [success, setSuccess] = useState<string | null>(null);
    // const [error, setError] = useState<string | null>(null);

    const handlePress=(button: string)=>{
        setIsPressed(button);
    }

    // const handleUpdate = ()=>{
    //     axios.put(`http://localhost:8000/api/admin/utilisateur/edit/${userId}`, {
    //
    //             email,
    //             firstName: prenom,
    //             lastName: nom,
    //             phoneNumber: telephone,
    //         },
    //         {
    //             headers:{
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         })
    //         .then(response => {
    //             console.log(response.data);
    //             setSuccess(true);
    //             setError(false);
    //         })
    //         .catch(err => {
    //             console.error(err.response);
    //             setSuccess(false);
    //             setError(true);
    //         })
    // }
    return(
        <View>
            <ImageBackground
                source={require('../assets/background/pexels-ryank-20042214.jpg')}
                style={styles.background}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.container}>
                    <Text style={styles.skiLevelText}>
                        Niveau de ski: Intermédiaire
                    </Text>

                    <View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholderTextColor="#000000"
                                value={email}
                            />
                            <TouchableOpacity><AntDesign style={styles.editBtn} name="edit"/></TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Prenom"
                                onChangeText={setPrenom}
                                placeholderTextColor="#000000"
                                value={prenom}
                            />
                            <TouchableOpacity><AntDesign style={styles.editBtn} name="edit"/></TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom"
                                onChangeText={setNom}
                                placeholderTextColor="#000000"
                                value={nom}
                            />
                            <TouchableOpacity><AntDesign style={styles.editBtn} name="edit"/></TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Telephone"
                                onChangeText={setTelephone}
                                placeholderTextColor="#000000"
                                value={telephone}
                                keyboardType="phone-pad"
                            />
                            <TouchableOpacity><AntDesign style={styles.editBtn} name="edit"/></TouchableOpacity>
                        </View>

                        <View>
                            <Text>Type de ski</Text>
                            <View style={styles.containerPreference}>
                                <TouchableOpacity
                                    style={[styles.button, isPressed === 'Piste' ? styles.buttonPressed : null ]} onPress={()=>handlePress("Piste")}>
                                    <Text style={[styles.buttonText, isPressed === "Piste" ? styles.buttonPressedText : null]} onPress={()=>handlePress("Piste")}>Piste</Text>

                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'hors-piste' ? styles.buttonPressed : null ]} onPress={()=>handlePress("hors-piste")}>
                                    <Text style={[styles.buttonText, isPressed === "hors-piste" ? styles.buttonPressedText : null]} onPress={()=>handlePress("hors-piste")}>hors-piste</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button3, isPressed === 'freestyle' ? styles.buttonPressed : null ]} onPress={()=>handlePress("freestyle")}>
                                    <Text style={[styles.buttonText, isPressed === "freestyle" ? styles.buttonPressedText : null]} onPress={()=>handlePress("freestyle")}>Piste</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View>
                            <Text>Niveau de difficulté</Text>
                            <View style={styles.containerPreference}>
                                <TouchableOpacity
                                    style={[styles.button, isPressed === 'Vert' ? styles.buttonPressed : null ]} onPress={()=>handlePress("Vert")}>
                                    <Text style={[styles.buttonText, isPressed === "Vert" ? styles.buttonPressedText : null]} onPress={()=>handlePress("Vert")}>Vert</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'Bleu' ? styles.buttonPressed : null ]} onPress={()=>handlePress("Bleu")}>
                                    <Text style={[styles.buttonText, isPressed === "Bleu" ? styles.buttonPressedText : null]} onPress={()=>handlePress("Bleu")}>Bleu</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button2, isPressed === 'Rouge' ? styles.buttonPressed : null ]} onPress={()=>handlePress("Rouge")}>
                                    <Text style={[styles.buttonText, isPressed === "Rouge" ? styles.buttonPressedText : null]} onPress={()=>handlePress("Rouge")}>Rouge</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button3, isPressed === 'Noir' ? styles.buttonPressed : null ]} onPress={()=>handlePress("Noir")}>
                                    <Text style={[styles.buttonText, isPressed === "Noir" ? styles.buttonPressedText : null]} onPress={()=>handlePress("Noir")}>Noir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                       <View style={styles.btnsContainer}>
                           {/*<SelectDropdown>*/}
                           {/*    */}
                           {/*</SelectDropdown>*/}

                           <TouchableOpacity style={styles.adminBtn}>
                               <Text>Contacter un admin</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.logoutBtn}>
                               <Text style={styles.logoutBtnText}> Déconnexion<AntDesign name="logout" style={styles.iconLogout}/> </Text>
                           </TouchableOpacity>
                       </View>
                    </View>
                </View>
            </ImageBackground>
        </View>


    );

};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120
    },
    skiLevelText: {
        color: '#000',
    },
    inputContainer: {
        marginBottom: 20,
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',

    },
    input: {
       width:280
    },
    editBtn:{
        marginTop:10,
        fontSize:16
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        // paddingLeft:10,
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width:80,
    },
    button2: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingLeft:10,
        alignItems: 'center',
        marginTop: 20,
        width:90,
    },
    button3: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        // paddingLeft:10,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width:80,
        paddingRight:10,
    },
    buttonText: {
        color: '#003566',
        fontSize: 16,
    },
    buttonPressed:{
        backgroundColor:'#003566',
        color:'#fff'
    },
    buttonPressedText:{
        color:'#fff'
    },
    containerPreference:{
        flexDirection:'row',
        justifyContent:'center',

    },
    adminBtn:{
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        marginTop: 20,
        width:200,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 25,
    },
    logoutBtn:{
        backgroundColor: 'red',
        paddingVertical: 10,
        marginTop: 20,
        width:200,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 10,
        color:'#fff',

    },
    btnsContainer:{
        alignItems:'center',
    },
    logoutBtnText:{
        color:'#fff',
    },
    iconLogout:{
        paddingLeft:5,
        fontSize:12
    }

})
export default SettingScreen