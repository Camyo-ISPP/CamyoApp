import React, { createContext, useContext, useEffect, useState } from "react";
import { Modal, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native"; // Import navigation state hook

const PopupAdContext = createContext({});

export const PopupAdProvider = ({ children, user }: { children: React.ReactNode; user: any }) => {
    const [isVisible, setIsVisible] = useState(false);
    const navigationState = useNavigationState((state) => state); // Get navigation state

    useEffect(() => {
        if (!user || user?.ads) {
            // Show popup every 5 minutes
            const interval = setInterval(() => {
                setIsVisible(true);
            }, 240000);

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [user?.ads]);



    const closePopup = () => {
        setIsVisible(false);
    };

    return (
        <PopupAdContext.Provider value={{}}>
            {children}
            {isVisible && (
                <Modal transparent={true} animationType="fade" visible={isVisible}>
                    <View style={styles.overlay}>
                        <View style={styles.popup}>
                            {/* Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Ad Image */}
                            <Image
                                source={require("../../assets/images/anuncios/AnuncioPopUp.png")} // Replace with your ad image path
                                style={styles.adImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </PopupAdContext.Provider>
    );
};

export const usePopupAd = () => useContext(PopupAdContext);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    popup: {
        width: 500,
        height: 500,
        backgroundColor: "white",
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
    },
    adImage: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 15,
        padding: 5,
        zIndex: 10,
    },
});