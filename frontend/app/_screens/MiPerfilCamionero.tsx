import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import BackButton from "../_components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePayment } from "@/contexts/PaymentContext";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import ErrorModal from "../_components/ErrorModal";
import SuccessModal from "../_components/SuccessModal";

const MiPerfilCamionero = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { setId } = usePayment();
    const { user, userToken, logout } = useAuth();
    const router = useRouter();

    const [resenas, setResenas] = useState([]);
    const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    console.log(user.ads)
    useEffect(() => {
        const fetchResenas = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user.userId}`);
                setResenas(response.data);

                // Obtener valoración media del backend
                const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user.userId}/valoracion`);
                setValoracionMedia(mediaResponse.data);
            } catch (error) {
                console.error("Error al cargar las reseñas o valoración:", error);
            }
        };

        if (user?.userId) {
            fetchResenas();
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

    const handleRemoveAds = () => {
        setId("ELIMINAR_ANUNCIOS");
        router.push("/pago/checkout");
      }

      return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.pageContainer}>
                {/* Left Ad Placeholder */}
                {user.ads && (
                <View style={styles.adContainer}>
                    <Image
                        source={require("../../assets/images/truck_mockup_ad.jpg")}
                        style={styles.adImage}
                        resizeMode="cover"
                    />
                </View>
            )}
    
                {/* Main Content */}
                <View style={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.rowContainer}>
                            <BackButton />
                            {/* Imagen de perfil */}
                            <View style={styles.profileContainer}>
                                <Image
                                    source={user?.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
                                    style={styles.profileImage}
                                />
                                {/* Botón de edición */}
                                <TouchableOpacity style={styles.editIcon} onPress={() => router.push("/miperfil/editar")}>
                                    <Feather name="edit-3" size={22} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                            {/* Información del usuario */}
                            <View style={styles.infoContainer}>
                                <Text style={styles.name}>{user.nombre}</Text>
                                <Text style={styles.username}>@{user.username}</Text>
                                <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user.localizacion}</Text>
                                <Text style={styles.description}>{user.descripcion}</Text>
                            </View>
                        </View>
                        {/* Separador */}
                        <View style={styles.separator} />
    
                        <View style={styles.downContainer}>
                            {/* Información profesional */}
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
    
                        <TouchableOpacity
                            style={styles.deleteAccountButton}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <MaterialIcons name="delete" size={20} color={colors.white} />
                            <Text style={styles.deleteAccountButtonText}>Eliminar Cuenta</Text>
                        </TouchableOpacity>
    
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
                                <Text style={styles.info}>Todavía no tienes reseñas.</Text>
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
    
                        {/* Botón de eliminar anuncios */}
                        {user.ads ?
                            <View>
                                <View style={styles.separator} />
                                <View>
                                    <TouchableOpacity
                                        style={styles.mejorarPlanButton}
                                        onPress={handleRemoveAds}
                                    >
                                        <FontAwesome5 name="ban" size={16} color="white" style={styles.plusIcon} />
                                        <Text style={styles.publishButtonText}>Eliminar anuncios</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            : <></>}
                    </View>
                </View>
    
                {/* Right Ad Placeholder */}
                <View style={styles.adContainer}>
                    <Image
                        source={require("../../assets/images/truck_mockup_ad.jpg")}
                        style={styles.adImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
    
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
        backgroundColor: colors.white,
        minHeight: "90%",
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
    plusIcon: {
        marginRight: 6,
    },
        publishButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    mejorarPlanButton: {
        backgroundColor: '#0993A8FF',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteAccountButton: {
        backgroundColor: colors.red,
        padding: 12,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    deleteAccountButtonText: {
        color: colors.white,
        fontWeight: "bold",
        marginLeft: 10,
    },
    pageContainer: {
        flexDirection: "row", // Arrange items in a row
        justifyContent: "space-between", // Space between ads and main content
        flexGrow: 1,
        backgroundColor: colors.white,
    },
    adContainer: {
        width: "15%",
        minWidth: 100,
        backgroundColor: colors.lightGray,
        alignItems: "center",
        justifyContent: "center",
    },
    adImage: {
        flex: 1, 
        width: "100%",
        height: "200%",
        resizeMode: "cover",
    },
});

export default MiPerfilCamionero;