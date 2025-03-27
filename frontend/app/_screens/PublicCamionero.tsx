import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import { useState, useEffect } from "react";
import axios from "axios";
const { unifyUserData } = require("../../utils/unifyData");
import BackButton from "../_components/BackButton";
import { startChat } from "../chat/services";
import SuccessModal from "../_components/SuccessModal";

const PublicCamionero = ({ userId }) => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { user, userToken } = useAuth();
    const router = useRouter();

    const [showResenaModal, setShowResenaModal] = useState(false);
    const [resenaForm, setResenaForm] = useState({ valoracion: 5, comentarios: "" });
    const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
    const [resenaAEliminar, setResenaAEliminar] = useState(null);
    const [editResenaId, setEditResenaId] = useState(null);
    const [yaEscribioResena, setYaEscribioResena] = useState(false);

    const [resenas, setResenas] = useState([]);

    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);


    // user2 es el usuario que se está visualizando
    const [user2, setUser2] = useState(null);

    useEffect(() => {
        if (user?.id == userId) {
            if (user.rol == "CAMIONERO") {
                router.push("/miperfil");
                return;
            }
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

            const yaExiste = response.data.some(res => res.comentador?.id === user?.userId);
            setYaEscribioResena(yaExiste);

            const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user2?.userId}/valoracion`);
            setValoracionMedia(mediaResponse.data);
        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
        }
    };

    useEffect(() => {
        if (user2?.userId) {
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
                                            Authorization: `Bearer ${userToken}`,
                                            "Content-Type": "application/json",
                                        };

                                        if (editResenaId) {
                                            console.log("Editando reseña con ID:", editResenaId);
                                            const res = await axios.put(`${BACKEND_URL}/resenas/${editResenaId}`, payload, { headers });

                                            if (res.status === 200) {
                                                setSuccessModalVisible(true);
                                                setTimeout(() => setSuccessModalVisible(false), 1000);
                                                setEditResenaId(null);
                                                setResenaForm({ valoracion: 5, comentarios: "" });
                                                setShowResenaModal(false);
                                                fetchResenas();
                                            }
                                        } else {
                                            const res = await axios.post(`${BACKEND_URL}/resenas`, payload, { headers });

                                            if (res.status === 201) {
                                                setSuccessModalVisible(true);
                                                setTimeout(() => setSuccessModalVisible(false), 1000);
                                                setResenaForm({ valoracion: 5, comentarios: "" });
                                                setShowResenaModal(false);
                                                fetchResenas();
                                            }
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

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.rowContainer}>
                            <BackButton />
                            {/* Imagen de perfil */}
                            <View style={styles.profileContainer}>
                                <Image
                                    source={user2?.foto ? { uri: `data:image/png;base64,${user2.foto}` } : defaultImage}
                                    style={styles.profileImage}
                                />
                            </View>
                            {/* Información del usuario */}
                            <View style={styles.infoContainer}>
                                <Text style={styles.name}>{user2?.nombre}</Text>
                                <Text style={styles.username}>@{user2?.username}</Text>
                                <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user2?.localizacion}</Text>
                                <Text style={styles.description}>{user2?.descripcion}</Text>
                                {user && user.rol === "EMPRESA" && !yaEscribioResena && (
                                    <TouchableOpacity
                                        style={[styles.publishButton, { marginTop: 10 }]}
                                        onPress={() => {
                                            setResenaForm({ valoracion: 5, comentarios: "" });
                                            setEditResenaId(null);
                                            setShowResenaModal(true);
                                        }}
                                    >
                                        <FontAwesome name="star" size={16} color="white" style={styles.plusIcon} />
                                        <Text style={styles.publishButtonText}>Escribir Reseña</Text>
                                    </TouchableOpacity>

                                )}
                                {/* Botón "Iniciar chat" solo si el usuario tiene rol "empresa" */}
                    {user && user.rol == "EMPRESA" && (
                    <TouchableOpacity
                        style={styles.chatButton}
                        onPress={async () => {
                        const chatId = await startChat(user.userId, user2.userId);
                            if (chatId) {
                                router.push(`/chat`);
                            }
                         }}
                     >
                     <FontAwesome name="comments" size={16} color="white" style={styles.chatIcon} />
                     <Text style={styles.chatButtonText}>Contactar</Text>
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
                            <Text style={styles.info}><FontAwesome5 name="briefcase" size={18} color={colors.primary} />  Experiencia: {user2?.experiencia} años</Text>
                            {user2?.tieneCAP && <Text style={styles.info}><FontAwesome5 name="certificate" size={18} color={colors.primary} />  CAP hasta: {user2.expiracionCAP}</Text>}
                            {user2?.isAutonomo && <Text style={styles.info}><FontAwesome5 name="id-badge" size={18} color={colors.primary} />   Tarjetas: {user2.tarjetas.join(", ")}</Text>}
                        </View>
                        <View style={styles.separator} />

                        <View style={styles.reseñasContainer}>
                            <Text style={styles.sectionTitle}>Reseñas</Text>
                            {resenas.length > 0 ? (
                                valoracionMedia !== null && (
                                    <Text style={{ fontSize: 16, color: colors.primary, textAlign: 'center', marginBottom: 10 }}>
                                        ⭐ Valoración media: {valoracionMedia.toFixed(1)} / 5
                                    </Text>
                                )
                            ) : (
                                <Text style={{ fontSize: 16, color: colors.mediumGray, textAlign: 'center', marginBottom: 10 }}>
                                    Valoración media: No hay datos suficientes
                                </Text>
                            )}
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
                                        {user?.userId === resena.comentador?.id && (
                                            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setResenaForm({
                                                            valoracion: resena.valoracion,
                                                            comentarios: resena.comentarios,
                                                        });
                                                        setEditResenaId(resena.id);
                                                        setShowResenaModal(true);
                                                    }}
                                                    style={[styles.button, { marginTop: 8, alignSelf: 'flex-end' }]}>

                                                    <Text style={styles.buttonText}>
                                                        Editar reseña
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setResenaAEliminar(resena.id);
                                                        setConfirmDeleteModalVisible(true);
                                                    }}
                                                    style={[
                                                        styles.button,
                                                        {
                                                            marginTop: 8,
                                                            alignSelf: 'flex-end',
                                                            backgroundColor: '#D14F45',
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.buttonText}>Eliminar reseña</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
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
                    <Modal visible={confirmDeleteModalVisible} transparent animationType="fade">
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                        }}>
                            <View style={{
                                backgroundColor: colors.white,
                                paddingVertical: 16,
                                paddingHorizontal: 10,
                                borderRadius: 12,
                                width: "60%",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 6,
                                elevation: 10,
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    marginBottom: 12,
                                    color: colors.secondary,
                                    textAlign: "center"
                                }}>
                                    ¿Estás seguro de que quieres eliminar esta reseña?
                                </Text>

                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <TouchableOpacity
                                        onPress={() => setConfirmDeleteModalVisible(false)}
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.mediumGray,
                                            padding: 12,
                                            borderRadius: 10,
                                            marginRight: 10,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text style={{ color: "black", fontWeight: "bold" }}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            try {
                                                const res = await axios.delete(`${BACKEND_URL}/resenas/${resenaAEliminar}`, {
                                                    headers: { Authorization: `Bearer ${userToken}` },
                                                });
                                                if (res.status === 200 || res.status === 204) {
                                                    fetchResenas();
                                                    setConfirmDeleteModalVisible(false);
                                                    setResenaAEliminar(null);
                                                }
                                            } catch (error) {
                                                console.error("Error al eliminar reseña:", error);
                                                alert("No se pudo eliminar la reseña.");
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "#D14F45",
                                            padding: 12,
                                            borderRadius: 10,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text style={{ color: "white", fontWeight: "bold" }}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                </View>
            </ScrollView >

        </>

    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: colors.white,
        minHeight: "100%",
        marginTop: 80,
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
    chatButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "flex-end",
        width:"50%",
        alignSelf:"flex-end",
        flexDirection: "row",
    },
    chatButtonText: {
        fontSize: 18,
        color: colors.white,
        fontWeight: "bold",
    },
    chatIcon: {
        marginRight: 8,
        marginBottom: 4,
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
    button: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: "2%",
        marginTop: 4,
        flexDirection: "row",
        flexWrap: "nowrap",
        height: 40,
        width: 150,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: colors.white,
        fontWeight: "bold"
    },
});

export default PublicCamionero;
