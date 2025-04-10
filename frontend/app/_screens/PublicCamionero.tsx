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
import { startChat } from "../(protected)/chat/services";
import SuccessModal from "../_components/SuccessModal";
import ResenaModal from "../_components/ResenaModal";

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
    const [fueAsignado, setFueAsignado] = useState(false);
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

    const fetchMisOfertasEmpresa = async () => {
        const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
        setFueAsignado(response.data.filter((offer: any) => offer.estado === "CERRADA").some((offer: any) => offer.camionero.id === parseInt(userId)));
    }

    useEffect(() => {
        if (user2?.userId) {
            fetchResenas();
        }
        if (user && user.rol === 'EMPRESA') {
            fetchMisOfertasEmpresa();
        }
    }, [user2]);

    const descargarPDF = async () => {
        const base64Data = user2.curriculum;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CV_${user2.username}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
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
                            {user2?.curriculum &&
                                <TouchableOpacity style={styles.pdfButton} onPress={descargarPDF}>
                                    <Text style={styles.pdfButtonText}>{"Descargar Curriculum"}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                        <View style={styles.separator} />

                        <View style={styles.reviewsContainer}>
                            <Text style={styles.sectionTitle}>Reseñas Recibidas</Text>

                            {/* Valoración media con estrellas */}
                            <View style={styles.ratingSummary}>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FontAwesome
                                            key={star}
                                            name={valoracionMedia && star <= Math.round(valoracionMedia) ? "star" : "star-o"}
                                            size={24}
                                            color={colors.primary}
                                            style={styles.starIcon}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.averageRatingText}>
                                    {valoracionMedia ? valoracionMedia.toFixed(1) : '0.0'} / 5.0
                                    {resenas.length > 0 && (
                                        <Text style={styles.reviewCount}> • {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}</Text>
                                    )}
                                </Text>
                            </View>

                            {/* Lista de reseñas */}
                            {resenas.length === 0 ? (
                                <View style={styles.emptyReviews}>
                                    <FontAwesome5 name="comment-slash" size={40} color={colors.lightGray} />
                                    <Text style={styles.emptyText}>Aún no tienes reseñas</Text>
                                </View>
                            ) : (
                                <>
                                    {resenas.map((resena) => (
                                        <View key={resena.id} style={styles.reviewCard}>
                                            {/* Encabezado con avatar y nombre */}
                                            <View style={styles.reviewHeader}>
                                                {resena.comentador?.foto ? (
                                                    <Image
                                                        source={{ uri: `data:image/png;base64,${resena.comentador.foto}` }}
                                                        style={styles.reviewAvatar}
                                                    />
                                                ) : (
                                                    <View style={styles.avatarPlaceholder}>
                                                        <FontAwesome5 name="user" size={20} color="white" />
                                                    </View>
                                                )}
                                                <View>
                                                    <Text style={styles.reviewAuthor}>{resena.comentador?.nombre}</Text>
                                                    <Text style={styles.reviewDate}>
                                                        {new Date(resena.fechaCreacion || Date.now()).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Valoración con estrellas */}
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FontAwesome
                                                        key={star}
                                                        name={star <= resena.valoracion ? "star" : "star-o"}
                                                        size={16}
                                                        color={colors.primary}
                                                    />
                                                ))}
                                            </View>

                                            {/* Comentario */}
                                            {user?.userId === resena.comentador?.id && (
                                                <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 8 }}>

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setEditResenaId(resena.id);
                                                            setShowResenaModal(true);
                                                        }}
                                                        style={[styles.button, { marginTop: 8, alignSelf: 'flex-end' }]}
                                                    >
                                                        <Text style={styles.buttonText}>Editar reseña</Text>
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
                                            <ResenaModal
                                                visible={showResenaModal}
                                                onClose={() => {
                                                    setShowResenaModal(false);
                                                    setEditResenaId(null);
                                                }}
                                                onSubmit={async (data) => {
                                                    try {
                                                        const headers = {
                                                            Authorization: `Bearer ${userToken}`,
                                                            "Content-Type": "application/json",
                                                        };

                                                        if (editResenaId) {
                                                            const res = await axios.put(`${BACKEND_URL}/resenas/${editResenaId}`, data, { headers });
                                                            if (res.status === 200) {
                                                                setSuccessModalVisible(true);
                                                                setTimeout(() => setSuccessModalVisible(false), 1000);
                                                                setEditResenaId(null);
                                                                setShowResenaModal(false);
                                                                fetchResenas();
                                                            }
                                                        } else {
                                                            const res = await axios.post(`${BACKEND_URL}/resenas`, data, { headers });
                                                            if (res.status === 201) {
                                                                setSuccessModalVisible(true);
                                                                setTimeout(() => setSuccessModalVisible(false), 1000);
                                                                setShowResenaModal(false);
                                                                fetchResenas();
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error("Error al enviar reseña:", error);
                                                        alert("No se pudo enviar la reseña.");
                                                    }
                                                }}
                                                comentadorId={user?.userId}
                                                comentadoId={user2?.userId}
                                                initialRating={editResenaId ? resena.valoracion : 5}
                                                initialComment={editResenaId ? resena.comentarios : ""}
                                            />

                                            {/* Divider */}
                                            <View style={styles.reviewDivider} />
                                        </View>
                                    ))}
                                </>
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
                                width: "30%",
                                height:"20%",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 6,
                                elevation: 10,
                            }}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    marginBottom: 20,
                                    color: colors.secondary,
                                    textAlign: "center"
                                }}>
                                    ¿Estás seguro de que quieres eliminar esta reseña?
                                </Text>

                                <View style={{ flexDirection: "row",alignItems:"flex-end" }}>
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
                                            backgroundColor:colors.red,
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
        paddingVertical: 60,
        backgroundColor: colors.white,
        minHeight: "100%",
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
        borderRadius: 75,
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
        width: "50%",
        alignSelf: "flex-end",
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
    pdfButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    pdfButtonText: {
        color: colors.white,
        fontWeight: "bold",
    },
    reviewsContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
        marginBottom: 30,
    },
    ratingSummary: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 25,
    },
    averageRatingText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.secondary,
    },
    reviewCount: {
        fontSize: 16,
        color: colors.mediumGray,
        fontWeight: '400',
    },
    emptyReviews: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: colors.extraLightGray,
        borderRadius: 12,
        marginTop: 10,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: colors.mediumGray,
        textAlign: 'center',
    },
    reviewCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    reviewAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reviewAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 13,
        color: colors.mediumGray,
    },
    reviewStars: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    reviewComment: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.darkGray,
        marginBottom: 15,
    },
    reviewDivider: {
        height: 1,
        backgroundColor: colors.extraLightGray,
        marginHorizontal: -20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

export default PublicCamionero;
