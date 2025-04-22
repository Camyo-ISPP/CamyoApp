import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import BackButton from "../_components/BackButton";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import AddResenaModal from "../components/AddResenaModal";
import ResenaModal from "../_components/ResenaModal";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import ErrorModal from "../_components/ErrorModal";
import SuccessModal from "../_components/SuccessModal";

const MiPerfilCamionero = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { user, userToken, logout } = useAuth();
    const router = useRouter();

    const [resenas, setResenas] = useState([]);
    const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);
    const [ofertasCamionero, setOfertasCamionero] = useState([]);
    const [camionero, setCamionero] = useState<{ id: string } | null>(null);
    const [showResenaModal, setShowResenaModal] = useState(false);
    const [empresasRecientes, setEmpresasRecientes] = useState([]);
    const [empresaAResenar, setEmpresaAResenar] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [resenados, setResenados] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchCamionero();
            fetchOfertasCamionero();
            fetchEmpresasResenados();
        }, [])
    );
    const fetchCamionero = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${user.userId}`);

            if (response.data) {
                setCamionero(response.data);
            }
        } catch (error) {
            console.error("Error al cargar el camionero:", error);
        }
    };

    const fetchOfertasCamionero = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${camionero.id}`);
            setOfertasCamionero(response.data[2]);

            // Extraer empresas de las ofertas
            const empresasUnicas = response.data[2].reduce((acc, oferta) => {
                if (oferta.empresa && !acc.some(e => e.id === oferta.empresa.id)) {
                    acc.push({
                        ...oferta.empresa,
                        userId: oferta.empresa.usuario.id
                    }

                    );
                }
                return acc;
            }, []);
            setEmpresasRecientes(empresasUnicas);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setOfertasCamionero([]);
                } else {
                    console.error("Error al cargar ofertas:", error.message);
                }
            } else {
                console.error("Error desconocido:", error);
            }
        }
    };

    const fetchEmpresasResenados = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/resenas/resenados/${user.userId}`);
            const ids = response.data.map(empresa => empresa.id);
            setResenados(ids)
        } catch (error) {
            console.error("Error al obtener los camioneros reseñados:", error);
            return [];
        }
    }

    const fetchResenas = async () => {
        try {
            if (!user?.userId) return;

            const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user.userId}`);
            setResenas(response.data);

            const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user.userId}/valoracion`);
            setValoracionMedia(mediaResponse.data);
        } catch (error) {
            console.error("Error al cargar reseñas:", error);
        }
    };

    const handleAddResena = async (resenaData) => {
        try {
            if (!user?.userId || !empresaAResenar) {
                Alert.alert("Error", "Datos incompletos para publicar la reseña");
                return;
            }

            const response = await axios.post(`${BACKEND_URL}/resenas`, {
                ...resenaData,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.status === 201) {
                Alert.alert("Éxito", "Reseña publicada correctamente");
                await fetchResenas();
                setShowResenaModal(false);
                setEmpresaAResenar(null);
            }
        } catch (error) {
            console.error("Error al publicar reseña:", error);
            let errorMessage = "Error al publicar la reseña";

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    errorMessage = "No tienes ofertas comunes con esta empresa para reseñarla";
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            Alert.alert("Error", errorMessage);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        if (user?.userId) {
            fetchCamionero();
            fetchResenas();
            fetchEmpresasResenados();
        }
    }, [user]);

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete(`${BACKEND_URL}/usuarios/${user.userId}`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (response.status === 200) {
                setSuccessModalVisible(true);
                setTimeout(() => {
                    setSuccessModalVisible(false);
                    logout();
                }, 2500);
            }

        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            setErrorModalVisible(true);
            setTimeout(() => {
                setErrorModalVisible(false);
            }, 2500);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const descargarPDF = async () => {
        const base64Data = user.curriculum;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CV_${user.username}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (camionero?.id) {
            fetchOfertasCamionero();
        }
    }, [camionero]);

    const handleSubmitResenaWrapper = async (resenaData: any) => {
        try {
            await handleAddResena(resenaData);
            await fetchOfertasCamionero();
            await fetchEmpresasResenados();
            setShowResenaModal(false);
            setEmpresaAResenar(null);
        } catch (error) {
            console.error("Error en el proceso completo:", error);
        }
    };
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.rowContainer}>
                        <BackButton />

                        <View>
                            <View style={styles.profileContainer}>
                                <Image
                                    source={user?.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
                                    style={styles.profileImage}
                                />
                                <TouchableOpacity style={styles.editIcon} onPress={() => router.push("/miperfil/editar")}>
                                    <Feather name="edit-3" size={22} color={colors.white} />
                                </TouchableOpacity>
                            </View>

                            {/* Botón de eliminar cuenta */}
                            <TouchableOpacity
                                style={styles.deleteAccountButton}
                                onPress={() => setShowDeleteModal(true)}
                            >
                                <MaterialIcons name="delete" size={20} color={colors.white} />
                                <Text style={styles.deleteAccountButtonText}>Eliminar Cuenta</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.name}>{user.nombre}</Text>
                            <Text style={styles.username}>@{user.username}</Text>
                            <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user.localizacion}</Text>
                            <Text style={styles.description}>{user.descripcion}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />

                    <View style={styles.downContainer}>
                        <Text style={styles.sectionTitle}>Información Profesional</Text>
                        <Text style={styles.info}>
                            <FontAwesome5 name="truck" size={18} color={colors.primary} /> Licencias:{" "}
                            {user.licencias.map(licencia => licencia.replace("_", "+")).join(", ")}
                        </Text>
                        <Text style={styles.info}><FontAwesome5 name="briefcase" size={18} color={colors.primary} />  Experiencia: {user.experiencia} años</Text>
                        {user.tieneCAP && <Text style={styles.info}><FontAwesome5 name="certificate" size={18} color={colors.primary} />  CAP hasta: {user.expiracionCAP}</Text>}
                        {user.isAutonomo && <Text style={styles.info}><FontAwesome5 name="id-badge" size={18} color={colors.primary} />   Tarjetas: {user.tarjetas.join(", ")}</Text>}
                        {user.curriculum &&
                            <TouchableOpacity style={styles.pdfButton} onPress={descargarPDF}>
                                <Text style={styles.pdfButtonText}>{"Descargar Curriculum"}</Text>
                            </TouchableOpacity>
                        }
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.empresasSection}>
                        <Text style={styles.sectionTitle}>Empresas Recientes</Text>

                        {empresasRecientes.filter(empresa => !(resenados.includes(empresa.userId))).length === 0 ? (
                            <Text style={styles.emptyMessage}>No has trabajado con empresas recientemente</Text>
                        ) : (
                            empresasRecientes
                                .filter(empresa => !(resenados.includes(empresa.userId)))
                                .map(empresa => (
                                    < View key={`empresa-${empresa.id}`} style={styles.empresaCard}>
                                        {/* Header con imagen y nombre */}
                                        <View style={styles.empresaHeader}>
                                            {empresa.usuario?.foto ? (
                                                <Image
                                                    source={{ uri: `data:image/png;base64,${empresa.usuario.foto}` }}
                                                    style={styles.empresaAvatar}
                                                />
                                            ) : (
                                                <View style={styles.empresaAvatarPlaceholder}>
                                                    <FontAwesome5 name="building" size={20} color={colors.white} />
                                                </View>
                                            )}
                                            <View style={styles.empresaInfo}>
                                                <Text style={styles.empresaNombre}>{empresa.usuario?.nombre}</Text>
                                                <Text style={styles.empresaUbicacion}>
                                                    <MaterialIcons name="location-on" size={14} color={colors.secondary} />
                                                    {empresa.usuario?.localizacion || 'Ubicación no disponible'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Sección de valoración */}
                                        <View style={styles.valoracionSection}>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <TouchableOpacity
                                                        key={`star-${star}`}
                                                        onPress={() => {
                                                            setEmpresaAResenar(empresa);
                                                            setShowResenaModal(true);
                                                        }}
                                                        onPressIn={() => setHoverRating(star)}
                                                        onPressOut={() => setHoverRating(0)}
                                                        activeOpacity={1}
                                                    >
                                                        <FontAwesome
                                                            name={star <= hoverRating ? "star" : "star-o"}
                                                            size={27}
                                                            color={star <= hoverRating ? colors.primary : colors.primaryLight}
                                                            style={styles.starIcon}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Botones de acción */}
                                        <View style={styles.actionsContainer}>
                                            <TouchableOpacity
                                                style={styles.fullWidthButton}
                                                onPress={() => router.push(`/empresa/${empresa.id}`)}
                                            >
                                                <FontAwesome5 name="building" size={14} color={colors.white} />
                                                <Text style={styles.actionButtonText}>Ver empresa</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                        )}
                    </View>
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
                                        <Text style={styles.reviewComment}>{resena.comentarios}</Text>

                                        {/* Divider */}
                                        <View style={styles.reviewDivider} />
                                    </View>
                                ))}
                            </>
                        )}
                    </View>

                </View>
            </View>

            {/* Modal para añadir reseñas */}
            <ResenaModal
                visible={showResenaModal}
                onClose={() => {
                    setShowResenaModal(false);
                    setEmpresaAResenar(null);
                }}
                onSubmit={handleSubmitResenaWrapper}
                comentadorId={user?.userId}
                comentadoId={empresaAResenar?.usuario?.id}
                isEditing={false}
            />

            <ConfirmDeleteModal
                isVisible={showDeleteModal}
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteModal(false)}
                message="Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. ¿Deseas continuar?"
            />

            <ErrorModal
                isVisible={errorModalVisible}
                message="No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo más tarde."
            />

            <SuccessModal
                isVisible={successModalVisible}
                onClose={() => setSuccessModalVisible(false)}
                message="¡Tu cuenta se ha eliminado correctamente, te echaremos de menos!"
            />

        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        backgroundColor: colors.white,
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
    resenasHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    valoracionContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    valoracionText: {
        fontSize: 18,
        color: colors.primary,
        marginLeft: 5,
    },
    reseñaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    resenaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    reseñaAutor: {
        fontWeight: "bold",
        color: colors.secondary,
    },
    starsSmall: {
        flexDirection: "row",
    },
    reseñaComentario: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 8,
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
    resenaFecha: {
        fontSize: 12,
        color: colors.mediumGray,
        textAlign: "right",
    },
    empresaImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    empresaImagePlaceholder: {
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    addResenaButton: {
        backgroundColor: colors.primary,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    addResenaButtonText: {
        color: colors.white,
        fontSize: 12,
    },

    empresaCardContainer: {
        marginBottom: 12,
        borderRadius: 10,
        backgroundColor: colors.white,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },

    empresaContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empresaImageContainer: {
        marginRight: 12,
    },
    starButton: {
        marginHorizontal: 2,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    verEmpresaButton: {
        backgroundColor: colors.secondary,
        marginRight: 5,
    },
    verOfertaButton: {
        backgroundColor: colors.primary,
        marginLeft: 5,
    },
    buttonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    buttonIcon: {
        marginRight: 5,
    }, empresasSection: {
        marginTop: 25,
        paddingHorizontal: 15,
    },
    emptyMessage: {
        textAlign: 'center',
        color: colors.mediumGray,
        fontSize: 16,
        marginVertical: 20,
        fontStyle: 'italic',
    },
    empresaCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.lightGray,
        position: 'relative',
        paddingBottom: 60,
    },
    empresaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    empresaAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    empresaAvatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empresaInfo: {
        marginLeft: 12,
        flex: 1,
    },
    empresaNombre: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.secondary,
    },
    empresaUbicacion: {
        fontSize: 14,
        color: colors.secondary,
        marginTop: 4,
    },
    valoracionSection: {
        marginBottom: 16,
    },
    valoracionTitle: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    starIcon: {
        marginHorizontal: 4,
        transitionDuration: '400ms',
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },

    fullWidthButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
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
    deleteAccountButton: {
        backgroundColor: colors.red,
        padding: 8,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#d32f2f",
        width: '70%',
        maxWidth: 250,
        alignSelf: "center",
    },
    deleteAccountButtonText: {
        color: colors.white,
        fontWeight: "600",
        marginLeft: 5,
        fontSize: 14,
    },
});

export default MiPerfilCamionero;