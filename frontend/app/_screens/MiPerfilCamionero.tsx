import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import defaultImage from "../../assets/images/camionero.png";
import BackButton from "../_components/BackButton";
import axios from "axios";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const MiPerfilCamionero = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [camionero, setCamionero] = useState(null);
    const [camionero, setCamionero] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);
    const [ofertas, setOfertas] = useState([]);
    const [ofertas, setOfertas] = useState([]);

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

        const fetchCamionero = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${user.userId}`);
                setCamionero(response.data);
            } catch (error) {
                console.error("Error al cargar el camionero:", error);
            }
        };

        const fetchCamionero = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${user.userId}`);
                setCamionero(response.data);
            } catch (error) {
                console.error("Error al cargar el camionero:", error);
            }
        };

        const fetchCamionero = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${user.userId}`);
                setCamionero(response.data);
            } catch (error) {
                console.error("Error al cargar el camionero:", error);
            }
        };

        if (user?.userId) {
            fetchResenas();
            fetchCamionero();
            fetchCamionero();
        }
    }, [user]);

    useEffect(() => {
        const fetchOfertasCerradas = async () => {
            if (!camionero) return;
            try {
                const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${camionero.id}`);
                const todasLasOfertas = response.data;

                setOfertas(todasLasOfertas[2]);
                console.log('Ofertas cerradas:', todasLasOfertas);
            } catch (error) {
                console.error("Error al cargar las ofertas cerradas:", error);
            }
        };

        if (camionero) {
            fetchOfertasCerradas();
        }
    }, [camionero]);

    useEffect(() => {
        const fetchOfertasCerradas = async () => {
            if (!camionero) return;
            try {
                const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${camionero.id}`);
                const todasLasOfertas = response.data;

                setOfertas(todasLasOfertas[2]);
                console.log('Ofertas cerradas:', todasLasOfertas);
            } catch (error) {
                console.error("Error al cargar las ofertas cerradas:", error);
            }
        };

        if (camionero) {
            fetchOfertasCerradas();
        }
    }, [camionero]);

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.rowContainer}>
                        <BackButton />
                        {/* Imagen de perfil */}
                        <View style={styles.profileContainer}>
                            <Image
                                source={user?.foto ? { uri: user.foto } : defaultImage}
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
                            {user?.licencias?.map(licencia => licencia.replace("_", "+")).join(", ")}
                        </Text>
                        <Text style={styles.info}><FontAwesome5 name="clock" size={18} color={colors.primary} />  Disponibilidad: {user?.disponibilidad}</Text>
                        <Text style={styles.info}><FontAwesome5 name="briefcase" size={18} color={colors.primary} />  Experiencia: {user?.experiencia} años</Text>
                        {user?.tieneCAP && <Text style={styles.info}><FontAwesome5 name="certificate" size={18} color={colors.primary} />  CAP hasta: {user?.expiracionCAP}</Text>}
                        {user?.isAutonomo && <Text style={styles.info}><FontAwesome5 name="id-badge" size={18} color={colors.primary} />   Tarjetas: {user?.tarjetas?.join(", ")}</Text>}
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
                <View style={styles.separator} />
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: 'center' }}>
                    <View>
                        <Text style={styles.sectionTitle}>Empresas con las que has Trabajado</Text>
                        <View style={{ justifyContent: "center", marginRight: 30, marginLeft: -30 }}>
                            {ofertas && ofertas.length > 0 ? (
                                Array.from(new Set(ofertas.map((oferta: any) => oferta.empresa.usuario.nombre)))
                                    .map((nombreEmpresa: string, index: number) => (
                                        <View key={index} style={styles.ofertaCard}>
                                            <View style={{ display: "flex", flexDirection: 'row', alignItems: 'baseline', justifyContent: "space-around" }} >
                                                <Text style={styles.ofertaTitulo}>  <FontAwesome5 name="user" size={14} color={colors.primary} />{nombreEmpresa}</Text>
                                            </View>
                                            <View>
                                                <TouchableOpacity style={styles.button} onPress={() => ""}>
                                                    <MaterialCommunityIcons name="eye" size={15} color="white" style={styles.detailsIcon} />
                                                    <Text style={styles.buttonText}>Ver Oferta</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.button} onPress={() => ""}>
                                                    <Text style={styles.buttonText}>  <AntDesign name="form" size={15} color="white" style={styles.detailsIcon} />Añadir Reseña</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                            ) : (
                                <Text>No hay ofertas cerradas.</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.separatorVertical} />

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
                </View>
            </View>
        </ScrollView>
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
        minHeight: "90%",
    },
    card: {
        backgroundColor: colors.white,
        padding: 30,
        borderRadius: 15,
        elevation: 6,
        width: 0.8 * screenWidth,
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
    separatorVertical: {
        width: 1,
        height: "100%",
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
        width: "35%"
    },
    reseñaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        width: "100%",
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
    ofertaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        width: "120%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 10,
        marginBottom: 10,
    },
    ofertaTitulo: {
        fontWeight: "bold",
        marginBottom: 5,
        color: colors.secondary,
    },
    ofertaEstado: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 4,
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
        fontWeight: "bold",
        textAlign: "center"
    },
    detailsIcon: {
        marginRight: 4
    }
    reseñasContainer: {
        paddingHorizontal: 30,
        marginTop: 20,
        width: "35%"
    },
    reseñaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        width: "100%",
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
    ofertaCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        width: "120%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 10,
        marginBottom: 10,
    },
    ofertaTitulo: {
        fontWeight: "bold",
        marginBottom: 5,
        color: colors.secondary,
    },
    ofertaEstado: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 4,
    }, button: {
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
        fontWeight: "bold",
        textAlign: "center"
    },
    detailsIcon: {
        marginRight: 4
    }
});

export default MiPerfilCamionero;