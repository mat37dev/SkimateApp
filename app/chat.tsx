import React from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Image } from "react-native";
import {useThemeColor} from "@/hooks/useThemeColor";
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const ChatScreen = () => {

    const text = useThemeColor({}, 'text');
    const whiteText = useThemeColor({}, 'whiteText');
    const container = useThemeColor({}, 'containerHeader');
    return (
        <ImageBackground
            source={require("../assets/background/pexels-ryank-20042214.jpg")}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={[styles.username, {color:whiteText}]}>Admin</Text>
                    <Text style={styles.status}>Active 20m ago</Text>
                </View>
                <Ionicons name="call-outline" size={24} color="white" style={styles.icon} />
                <Ionicons name="videocam-outline" size={24} color="white" />
            </View>

            <View style={styles.chatContainer}>
                <View style={[styles.messageContainer, styles.adminMessage]}>
                    <Text style={[styles.messageText,{color:text}]}>Lorem ipsum dolor sit amet.</Text>
                </View>
                <View style={[styles.messageContainer, styles.adminMessage]}>
                    <Text style={[styles.messageText,{color:text}]}>Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</Text>
                </View>
                <Text style={styles.timestamp}>Nov 30, 2023, 9:41 AM</Text>
                <View style={[styles.messageContainer, styles.userMessage]}>
                    <Text style={[styles.messageText,{color:whiteText}]}>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Message..." placeholderTextColor="#888" />
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={[styles.sendText, {color:whiteText}]}><FontAwesome name="send" size={18} /></Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    backgroundImage: {
        opacity: 0.5,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerText: {
        flex: 1,
        marginLeft: 10,
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
    },
    status: {
        fontSize: 12,
        color: "#ddd",
    },
    icon: {
        marginRight: 10,
    },
    chatContainer: {
        padding: 15,
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    messageContainer: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    adminMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#EAEAEA",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#11181C",
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: "#ddd",
        marginTop: 5,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
    },
    sendButton: {
        backgroundColor: "black",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    sendText: {
        fontWeight: "bold",
        borderRadius: 15
    },
});

export default ChatScreen;
