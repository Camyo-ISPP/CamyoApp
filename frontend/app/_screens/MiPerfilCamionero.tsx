import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TextInput, Modal } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import BackButton from "../_components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const MiPerfilCamionero = () => {
    const { user } = useAuth();
    const router = useRouter();

    // Estados para la gestión de datos
    const [resenas, setResenas] = useState<Array<{
        id: string;
        comentador?: { nombre: string };
        valoracion: number;
        comentarios: string;
    }>>([]);
    const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);
    const [ofertasCamionero, setOfertasCamionero] = useState<Array<{
        id: string;
        nombreEmpresa: string;
        tipoOferta: string;
        fechaPublicacion: string;
        localizacion: string;
        sueldo: number;
        estado: string;
        valoracion?: number;
    }>>([]);
    const [camionero, setCamionero] = useState<{ id: string } | null>(null);

    // Estados para el modal de valoración
    const [mostrarModalValoracion, setMostrarModalValoracion] = useState(false);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState<{
        id: string;
        nombreEmpresa: string;
    } | null>(null);
    const [valoracionActual, setValoracionActual] = useState(0);
    const [comentario, setComentario] = useState("");

    // Función para enviar la valoración
    const handleValoracionCompleta = async (empresaId: string, valoracion: number) => {
       
    };

    // Función para obtener datos del camionero
    const fetchCamionero = async () => {
        try {
            if (!user?.userId) return;

            const response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${user.userId}`);
            if (response.data) {
                setCamionero(response.data);
            }
        } catch (error) {
            console.error("Error al cargar el camionero:", error);
        }
    };

    // Función para obtener ofertas del camionero
    const fetchOfertasCamionero = async () => {
        try {
            if (!camionero?.id) {
                console.log("No hay ID de camionero disponible");
                return;
            }

            const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${camionero.id}`);
            setOfertasCamionero(response.data[2] || []);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    console.log("No hay ofertas para este camionero");
                    setOfertasCamionero([]);
                } else {
                    console.error("Error al cargar ofertas:", error.message);
                }
            } else {
                console.error("Error desconocido:", error);
            }
        }
    };

    // Función para obtener reseñas
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

    useEffect(() => {
        if (user?.userId) {
            fetchCamionero();
            fetchResenas();
        }
    }, [user]);

    useEffect(() => {
        if (camionero?.id) {
            fetchOfertasCamionero();
        }
    }, [camionero]);

    return (
        <ScrollView 
            contentContainerStyle={{ 
                flexGrow: 1,
                paddingTop: 30,
            }}
            style={styles.scrollView}
        >
            <View style={styles.container}>
                <View style={styles.card}>
                    {/* Sección de perfil */}
                    <View style={styles.rowContainer}>
                        <BackButton />
                        <View style={styles.profileContainer}>
                            <Image
                                source={user?.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity 
                                style={styles.editIcon} 
                                onPress={() => router.push("/miperfil/editar")}
                            >
                                <Feather name="edit-3" size={22} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.name}>{user?.nombre}</Text>
                            <Text style={styles.username}>@{user?.username}</Text>
                            <Text style={styles.info}>
                                <MaterialIcons name="location-pin" size={18} color={colors.primary} /> 
                                {user?.localizacion}
                            </Text>
                            <Text style={styles.description}>{user?.descripcion}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.separator} />

                    {/* Información profesional */}
                    <View style={styles.downContainer}>
                        <Text style={styles.sectionTitle}>Información Profesional</Text>
                        <Text style={styles.info}>
                            <FontAwesome5 name="truck" size={18} color={colors.primary} /> Licencias:{" "}
                            {user?.licencias?.map(licencia => licencia.replace("_", "+")).join(", ")}
                        </Text>
                        <Text style={styles.info}>
                            <FontAwesome5 name="briefcase" size={18} color={colors.primary} /> Experiencia: {user?.experiencia} años
                        </Text>
                        {user?.tieneCAP && (
                            <Text style={styles.info}>
                                <FontAwesome5 name="certificate" size={18} color={colors.primary} /> CAP hasta: {user?.expiracionCAP}
                            </Text>
                        )}
                        {user?.isAutonomo && (
                            <Text style={styles.info}>
                                <FontAwesome5 name="id-badge" size={18} color={colors.primary} /> Tarjetas: {user?.tarjetas?.join(", ")}
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.separator} />

                    {/* Empresas recientes */}
                    <View style={styles.reseñasContainer}>
                        <Text style={styles.sectionTitle}>Empresas recientes</Text>

                        {ofertasCamionero.length === 0 ? (
                            <Text style={styles.info}>No has trabajado con empresas recientemente</Text>
                        ) : (
                            ofertasCamionero
                                .filter(oferta => {
                                    const fechaOferta = new Date(oferta.fechaPublicacion);
                                    const unMesAtras = new Date();
                                    unMesAtras.setDate(unMesAtras.getDate() - 30);
                                    return fechaOferta >= unMesAtras && oferta.estado === "CERRADA";
                                })
                                .map(oferta => (
                                    <View key={oferta.id} style={styles.empresaCard}>
                                        <View style={styles.empresaHeader}>
                                            <View style={styles.empresaLogoPlaceholder}>
                                                <Text style={styles.empresaLogoText}>
                                                    {oferta.nombreEmpresa.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={styles.empresaInfo}>
                                                <Text style={styles.empresaNombre}>{oferta.nombreEmpresa}</Text>
                                                <View style={styles.empresaDetails}>
                                                    <Text style={styles.empresaDetalle}>
                                                        <MaterialIcons name="work" size={14} color={colors.primary} />
                                                        {oferta.tipoOferta}
                                                    </Text>
                                                    <Text style={styles.empresaDetalle}>
                                                        <MaterialIcons name="date-range" size={14} color={colors.primary} />
                                                        {new Date(oferta.fechaPublicacion).toLocaleDateString()}
                                                    </Text>
                                                    <Text style={styles.empresaDetalle}>
                                                        <MaterialIcons name="location-on" size={14} color={colors.primary} />
                                                        {oferta.localizacion}
                                                    </Text>
                                                    <Text style={styles.empresaDetalle}>
                                                        <FontAwesome5 name="money-bill-wave" size={14} color={colors.primary} />
                                                        {oferta.sueldo}€
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.buttonsContainer}>
                                            <TouchableOpacity
                                                style={styles.secondaryButton}
                                                onPress={() => router.push(`/ofertas/${oferta.id}`)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Ver Oferta</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity
                                                style={styles.secondaryButton}
                                                onPress={() => router.push(`/empresas/${oferta.nombreEmpresa}`)}
                                            >
                                                <Text style={styles.secondaryButtonText}>Ver Empresa</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.valoracionContainer}>
                                            <Text style={styles.valoracionTexto}>Valorar esta empresa:</Text>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => {
                                                            setEmpresaSeleccionada({
                                                                id: oferta.id,
                                                                nombreEmpresa: oferta.nombreEmpresa
                                                            });
                                                            setValoracionActual(star);
                                                            setMostrarModalValoracion(true);
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            name="star"
                                                            size={20}
                                                            color={oferta.valoracion && oferta.valoracion >= star ? colors.primary : colors.lightGray}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                ))
                        )}
                    </View>

                    {/* Reseñas recibidas */}
                    <View style={styles.reseñasContainer}>
                        <Text style={styles.sectionTitle}>Reseñas</Text>
                        {resenas.length > 0 ? (
                            valoracionMedia !== null && (
                                <Text style={styles.valoracionMedia}>
                                    ⭐ Valoración media: {valoracionMedia.toFixed(1)} / 5
                                </Text>
                            )
                        ) : (
                            <Text style={styles.sinValoracion}>
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
                </View>
            </View>

            {/* Modal de valoración */}
            <Modal
                visible={mostrarModalValoracion}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarModalValoracion(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Valorar a {empresaSeleccionada?.nombreEmpresa}</Text>
                        
                        <View style={styles.modalStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setValoracionActual(star)}
                                >
                                    <FontAwesome5
                                        name="star"
                                        size={30}
                                        color={valoracionActual >= star ? colors.primary : colors.lightGray}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <Text style={styles.modalLabel}>Comentario (opcional):</Text>
                        <TextInput
                            style={styles.comentarioInput}
                            multiline
                            numberOfLines={4}
                            placeholder="¿Cómo fue tu experiencia?"
                            value={comentario}
                            onChangeText={setComentario}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => {
                                    setMostrarModalValoracion(false);
                                    setComentario("");
                                    setValoracionActual(0);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.primaryButton}
                                onPress={() => {
                                    if (empresaSeleccionada) {
                                        handleValoracionCompleta(empresaSeleccionada.id, valoracionActual);
                                    }
                                }}
                            >
                                <Text style={styles.primaryButtonText}>Enviar Valoración</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: colors.lightBackground,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        backgroundColor: colors.lightBackground,
        minHeight: screenHeight - 100, // Asegura espacio para la barra superior
        paddingTop: 50, // Margen superior adicional
    },
    card: {
        backgroundColor: colors.white,
        padding: 25,
        borderRadius: 15,
        elevation: 4,
        width: "90%",
        maxWidth: 600,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: colors.lightGray,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 20,
        marginTop: 20,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    profileContainer: {
        position: "relative",
        marginRight: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.primary,
        marginLeft: 15,
    },
    editIcon: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: colors.primary,
        padding: 6,
        borderRadius: 12,
        shadowColor: colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    infoContainer: {
        flex: 1,
        justifyContent: "center",
        marginLeft: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.secondary,
        marginBottom: 2,
    },
    username: {
        fontSize: 16,
        color: colors.mediumGray,
        fontWeight: "600",
        marginBottom: 8,
    },
    info: {
        fontSize: 14,
        color: colors.darkGray,
        marginVertical: 3,
        lineHeight: 20,
    },
    description: {
        fontSize: 14,
        color: colors.darkGray,
        marginTop: 8,
        lineHeight: 20,
        fontStyle: "italic",
    },
    separator: {
        width: "100%",
        height: 1,
        backgroundColor: colors.lightGray,
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.secondary,
        marginBottom: 15,
        textAlign: "center",
    },
    downContainer: {
        paddingHorizontal: 15,
    },
    reseñasContainer: {
        paddingHorizontal: 15,
        marginTop: 15,
        marginBottom: 10,
    },
    valoracionMedia: {
        fontSize: 16, 
        color: colors.primary, 
        textAlign: 'center', 
        marginBottom: 10,
        fontWeight: '600'
    },
    sinValoracion: {
        fontSize: 16, 
        color: colors.mediumGray, 
        textAlign: 'center', 
        marginBottom: 10
    },
    reseñaCard: {
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.lightGray,
        shadowColor: colors.lightGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    reseñaAutor: {
        fontWeight: "600",
        marginBottom: 5,
        color: colors.secondary,
        fontSize: 15,
    },
    reseñaValoracion: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 5,
        fontWeight: "500",
    },
    reseñaComentario: {
        fontSize: 14,
        color: colors.darkGray,
        lineHeight: 20,
    },
    empresaCard: {
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.lightGray,
        shadowColor: colors.lightGray,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    empresaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    empresaLogoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    empresaLogoText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    empresaInfo: {
        flex: 1,
    },
    empresaNombre: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
        marginBottom: 6,
    },
    empresaDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 6,
    },
    empresaDetalle: {
        fontSize: 13,
        color: colors.darkGray,
        marginRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 15,
        gap: 10,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    secondaryButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    valoracionContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    valoracionTexto: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '500',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: colors.white,
        width: '90%',
        maxWidth: 500,
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.secondary,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 14,
        color: colors.darkGray,
        marginTop: 15,
        marginBottom: 5,
    },
    comentarioInput: {
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalStars: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    cancelButton: {
        backgroundColor: colors.lightGray,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    cancelButtonText: {
        color: colors.darkGray,
        fontWeight: '600',
    },
});

export default MiPerfilCamionero;