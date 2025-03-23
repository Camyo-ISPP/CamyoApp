import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import { useState, useEffect } from "react";
import axios from "axios";
const { unifyUserData } = require("../../utils/unifyData");
import BackButton from "../_components/BackButton";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const PublicCamionero = ({ userId }) => {
    const { user } = useAuth();
    const router = useRouter();

    // user2 es el usuario que se está visualizando
    const [user2, setUser2] = useState(null);

    useEffect(() => {
        // Si el usuario autenticado es el mismo usuario, redirigir a su perfil
        if (user?.id == userId) {
          router.push("/miperfil");
          return;
        }
    
        const fetchUser = async () => {
          try {
            const response = await axios.get(`${BACKEND_URL}/camioneros/${userId}`);
            const unifiedData = unifyUserData(response.data)
            setUser2(unifiedData);
          } catch (error) {
            console.error("Error al cargar los datos de la empresa:", error);
          }
        };
    
        fetchUser();
      }, [userId]);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.rowContainer}>
                <BackButton />
                    {/* Imagen de perfil */}
                    <View style={styles.profileContainer}>
                        <Image
                            source={user2?.foto ? { uri: user2?.foto } : defaultImage}
                            style={styles.profileImage}
                        />
                    </View>
                    {/* Información del usuario */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{user2?.nombre}</Text>
                        <Text style={styles.username}>@{user2?.username}</Text>
                        <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user2?.localizacion}</Text>
                        <Text style={styles.description}>{user2?.descripcion}</Text>
                    </View>
                </View>
                {/* Separador */}
                <View style={styles.separator} />

                <View style={styles.downContainer}>
                    {/* Información profesional */}
                    <Text style={styles.sectionTitle}>Información Profesional</Text>
                    <Text style={styles.info}>
                        <FontAwesome5 name="truck" size={18} color={colors.primary} /> Licencias:{" "}
                        {user2?.licencias.map(licencia => licencia.replace("_", "+")).join(", ")}
                    </Text>
                    <Text style={styles.info}><FontAwesome5 name="clock" size={18} color={colors.primary} />  Disponibilidad: {user2?.disponibilidad}</Text>
                    <Text style={styles.info}><FontAwesome5 name="briefcase" size={18} color={colors.primary} />  Experiencia: {user2?.experiencia} años</Text>
                    {user2?.tieneCAP && <Text style={styles.info}><FontAwesome5 name="certificate" size={18} color={colors.primary} />  CAP hasta: {user2.expiracionCAP}</Text>}
                    {user2?.isAutonomo && <Text style={styles.info}><FontAwesome5 name="id-badge" size={18} color={colors.primary} />   Tarjetas: {user2.tarjetas.join(", ")}</Text>}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        backgroundColor: colors.white,
        marginTop: 20,
    },
    card: {
        backgroundColor: colors.white,
        padding: 30,
        borderRadius: 15,
        elevation: 6,
        width: "70%",
        maxWidth: 600,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    profileContainer: {
        position: "relative",
        marginRight: 40,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: colors.primary,
        marginLeft: 30,
    },
    editIcon: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    infoContainer: {
        flex: 1,
        justifyContent: "center",
        marginLeft: 10,
    },
    name: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.secondary,
    },
    username: {
        fontSize: 18,
        color: colors.darkGray,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 6,
    },
    info: {
        fontSize: 16,
        color: colors.darkGray,
        marginVertical: 4,
    },
    description: {
        fontSize: 15,
        color: colors.darkGray,
        marginTop: 6,
    },
    separator: {
        width: "100%",
        height: 1,
        backgroundColor: colors.mediumGray,
        marginVertical: 20,
    },
    infoCard: {
        backgroundColor: colors.white,
        paddingVertical: 25,
        paddingHorizontal: 30,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignSelf: "stretch",
        maxWidth: 750,
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 15,
        textAlign: "center",
    },
    downContainer: {
        paddingHorizontal: 30,
    },
});


export default PublicCamionero;