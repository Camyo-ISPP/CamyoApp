import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import { useState, useEffect } from "react";
import axios from "axios";
const { unifyUserData } = require("../../utils");
import BackButton from "../_components/BackButton";
import SuccessModal from "../_components/SuccessModal";


const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const PublicCamionero = ({ userId }) => {
    const { user } = useAuth();
    const router = useRouter();

    const [showResenaModal, setShowResenaModal] = useState(false);
    const [resenaForm, setResenaForm] = useState({ valoracion: 5, comentarios: "" });

    const [resenas, setResenas] = useState([]);

    const [successModalVisible, setSuccessModalVisible] = useState(false);


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

    const fetchResenas = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user2?.userId}`);
            setResenas(response.data);
        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
        }
    };

    useEffect(() => {
        if (user2?.id) {
            fetchResenas();
        }
    }, [user2]);

    return (
        <>
            <Modal visible={showResenaModal} transparent animationType="fade">
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}>
                    <View style={{
                        width: "85%",
                        backgroundColor: colors.white,
                        padding: 25,
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 10,
                    }}>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: "bold",
                            color: colors.secondary,
                            marginBottom: 15,
                            textAlign: "center"
                        }}>
                            Escribir Reseña
                        </Text>

                        <Text style={{ fontSize: 16, color: colors.secondary, marginBottom: 10 }}>Valoración</Text>
                        <View style={{ flexDirection: "row", marginBottom: 20 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setResenaForm({ ...resenaForm, valoracion: star })}
                                >
                                    <FontAwesome
                                        name={star <= resenaForm.valoracion ? "star" : "star-o"}
                                        size={28}
                                        color={colors.primary}
                                        style={{ marginHorizontal: 5 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ fontSize: 16, color: colors.secondary }}>Comentarios</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            value={resenaForm.comentarios}
                            onChangeText={(text) =>
                                setResenaForm({ ...resenaForm, comentarios: text })
                            }
                            placeholder="Escribe tu experiencia con esta empresa..."
                            placeholderTextColor={colors.mediumGray}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.mediumGray,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                fontSize: 16,
                                marginBottom: 20,
                                color: colors.secondary,
                                textAlignVertical: "top"
                            }}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    marginRight: 8,
                                    backgroundColor: "#D14F45",
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                }}
                                onPress={() => setShowResenaModal(false)}
                            >
                                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    marginLeft: 8,
                                    backgroundColor: colors.primary,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                }}
                                onPress={async () => {
                                    try {
                                        const payload = {
                                            valoracion: resenaForm.valoracion,
                                            comentarios: resenaForm.comentarios,
                                            comentador: { id: user.userId },
                                            comentado: { id: user2?.userId },
                                        };

                                        const headers = {
                                            Authorization: `Bearer ${user.token}`, // Usa userToken si lo tienes separado
                                            "Content-Type": "application/json",
                                        };

                                        const res = await axios.post(`${BACKEND_URL}/resenas`, payload, { headers });

                                        if (res.status === 201) {
                                            setShowResenaModal(false);
                                            setResenaForm({ valoracion: 5, comentarios: "" });
                                            fetchResenas();
                                            setSuccessModalVisible(true);
                                            setTimeout(() => {
                                                setSuccessModalVisible(false);
                                            }, 1000);
                                        }
                                    } catch (error) {
                                        console.error("Error al enviar reseña:", error);
                                        alert("No se pudo enviar la reseña.");
                                    }
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Enviar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <ScrollView>

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
                                {user && user.rol === "EMPRESA" && (
                                    <TouchableOpacity
                                        style={styles.publishButton}
                                        onPress={() => setShowResenaModal(true)}
                                    >
                                        <FontAwesome name="star" size={16} color="white" style={styles.plusIcon} />
                                        <Text style={styles.publishButtonText}>Hacer Reseña</Text>
                                    </TouchableOpacity>
                                )}
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
                        <View style={styles.separator} />

                        <View style={styles.reseñasContainer}>
                            <Text style={styles.sectionTitle}>Reseñas</Text>

                            {resenas.length === 0 ? (
                                <Text style={styles.info}>Todavía no hay reseñas.</Text>
                            ) : (
                                resenas.map((resena) => (
                                    <View key={resena.id} style={styles.reseñaCard}>
                                        <Text style={styles.reseñaAutor}>
                                            <FontAwesome5 name="user" size={14} color={colors.primary} /> {resena.comentador?.nombre}
                                        </Text>
                                        <Text style={styles.reseñaValoracion}>⭐ {resena.valoracion}/5</Text>
                                        <Text style={styles.reseñaComentario}>{resena.comentarios}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                    {/* Modal de éxito */}
                    <SuccessModal
                        isVisible={successModalVisible}
                        onClose={() => setSuccessModalVisible(false)}
                        message="¡Reseña creada con exito!"
                    />
                </View>
            </ScrollView >

        </>

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
    reseñasContainer: {
        paddingHorizontal: 30,
        marginTop: 20,
    },
    reseñaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    reseñaAutor: {
        fontWeight: "bold",
        marginBottom: 5,
        color: colors.secondary,
    },
    reseñaValoracion: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 4,
    },
    reseñaComentario: {
        fontSize: 14,
        color: colors.darkGray,
    },
    publishButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        marginTop: 10,
    },
    plusIcon: {
        marginRight: 6,
    },
    publishButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});


export default PublicCamionero;