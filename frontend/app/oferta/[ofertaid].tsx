import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, Alert, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import colors from "frontend/assets/styles/colors";
import { useAuth } from "@/contexts/AuthContext";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import defaultCompanyLogo from "frontend/assets/images/defaultCompImg.png"
import defaultCamImage from "../../assets/images/defaultAvatar.png";
import BackButton from "../_components/BackButton";

const formatDate = (fecha: string) => {
    const opciones = { day: "numeric", month: "long", year: "numeric" } as const;
    return new Date(fecha).toLocaleDateString("es-ES", opciones);
};

export default function OfertaDetalleScreen() {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const [offerData, setOfferData] = useState<any>(null);
    const [offerTrabajoData, setOfferTrabajoData] = useState<any>(null);
    const [offerCargaData, setOfferCargaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { ofertaid } = useLocalSearchParams();
    const router = useRouter(); // Para navegar entre pantallas
    const { user, userToken, login, logout } = useAuth();
    const [successModalVisibleCam, setSuccessModalVisibleCam] = useState(false);
    const [successModalVisibleEmp, setSuccessModalVisibleEmp] = useState(false);

    useEffect(() => {
        if (ofertaid) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`);
                    const data = await response.json();
                    setOfferData(data);

                    const trabajoResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`);
                    const trabajoText = await trabajoResponse.text();
                    const trabajoData = trabajoText ? JSON.parse(trabajoText) : null;
                    setOfferTrabajoData(trabajoData);

                    const cargaResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`);
                    const cargaText = await cargaResponse.text();
                    const cargaData = cargaText ? JSON.parse(cargaText) : null;
                    setOfferCargaData(cargaData);

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [ofertaid]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    };

    if (!offerData) {
        return (
            <View style={styles.container}>
                <Text>No data available for this offer</Text>
            </View>
        );
    };

    const handleSolicitarOferta = async () => {

        try {
            const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/aplicar/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setSuccessModalVisibleCam(true);
                const text = await response.text();
                setOfferData(text ? JSON.parse(text) : {})
                setTimeout(() => {
                    setSuccessModalVisibleCam(false);
                }, 1500);
            } else {
                Alert.alert("Error", "No se pudo solicitar la oferta.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema con la solicitud.");
        }
    };

    const handleDesaplicarOferta = async () => {

        try {
            const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/desaplicar/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setSuccessModalVisibleCam(true);
                const text = await response.text();
                setOfferData(text ? JSON.parse(text) : {})
                setTimeout(() => {
                    setSuccessModalVisibleCam(false);
                }, 1500);
            } else {
                Alert.alert("Error", "No se pudo retirar la solicitud.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema con la solicitud.");
        }
    };

    const handleAsignarCamionero = async (item) => {
        try {
            const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/asignar/${item.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setSuccessModalVisibleEmp(true);
                const text = await response.text();
                setOfferData(text ? JSON.parse(text) : {})
                setTimeout(() => {
                    setSuccessModalVisibleEmp(false);
                }, 1500);
            } else {
                Alert.alert("Error", "No se pudo asignar al camionero.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema con la asignación.");
        }
    };

    const handleRechazarCamionero = async (item) => {
        try {
            const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/rechazar/${item.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setSuccessModalVisibleEmp(true);
                const text = await response.text();
                setOfferData(text ? JSON.parse(text) : {})
                setTimeout(() => {
                    setSuccessModalVisibleEmp(false);
                }, 1500);
            } else {
                Alert.alert("Error", "No se pudo rechazar al camionero.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema con el rechazo.");
        }
    };

    const handleLoginRedirect = () => {
        router.push("/login")
    };

    const handleDeleteOffer = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
        });

        if (response.ok) {
        router.replace("/miperfil");    
        } else {
            Alert.alert("Error", "No se pudo eliminar la oferta.");
        }
    } catch (error) {
        console.error("Error al eliminar la oferta:", error);
    }
    };

    const renderOfferCard = () => {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <BackButton />
                    <Image
                        source={defaultCompanyLogo}
                        style={styles.logo}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{offerData.titulo}</Text>
                        <Text style={styles.empresa}>
                            {offerData.empresa.usuario.nombre.toUpperCase()} |
                            <MaterialIcons name="location-on" size={18} color="#0b4f6c" />
                            <Text style={styles.empresa}> {offerData.localizacion}</Text>
                        </Text>
                        <Text style={styles.empresa}>Estado: {offerData.estado} </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        {user && user.rol == "EMPRESA" && offerData.empresa.id === user.id ? (
                            <View style={styles.ownOfferBadgeAlt}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="white" />
                                <Text style={styles.ownOfferTextAlt}>Tu Oferta</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => router.push(`/empresa/${offerData.empresa.id}`)}
                            >
                                <MaterialIcons name="business" size={15} color="white" />
                                <Text style={styles.buttonText}> Ver Empresa</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                {offerData.estado === 'ABIERTA' ? (
                    user ? (
                        user.rol === 'CAMIONERO' ? (
                            !offerData.rechazados.some((camionero: { id: string }) => camionero.id === user.id) ? (
                                offerData.aplicados.some((camionero: { id: string }) => camionero.id === user.id) ? (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleDesaplicarOferta}>
                                        <Text style={styles.solicitarButtonText}>Cancelar Solicitud</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleSolicitarOferta}>
                                        <Text style={styles.solicitarButtonText}>Solicitar Oferta</Text>
                                    </TouchableOpacity>
                                )
                            ) : <></>
                        ) : <></>
                    ) : (
                        <TouchableOpacity style={styles.solicitarButton} onPress={handleLoginRedirect}>
                            <Text style={styles.solicitarButtonText}>Inicia sesión para solicitar</Text>
                        </TouchableOpacity>
                    )
                ) : <></>}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisibleCam}
                    onRequestClose={() => setSuccessModalVisibleCam(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <FontAwesome5 name="check-circle" size={50} color="white" style={styles.modalIcon} />
                            {(user ? offerData.aplicados.some((camionero: { id: string }) => camionero.id === user.id) : false) ?
                                <Text style={styles.modalText}>¡Has solicitado la oferta correctamente!</Text>
                                :
                                <Text style={styles.modalText}>¡Has retirado tu solicitud correctamente!</Text>
                            }
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisibleEmp}
                    onRequestClose={() => setSuccessModalVisibleEmp(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <FontAwesome5 name="check-circle" size={50} color="white" style={styles.modalIcon} />
                            {offerData.estado === "ABIERTA" ?
                                <Text style={styles.modalText}>¡Has rechazado a un camionero!</Text>
                                :
                                <Text style={styles.modalText}>¡Has asignado a un camionero!</Text>
                            }
                        </View>
                    </View>
                </Modal>

                <View style={styles.separator} />

                <Text style={styles.subTitulo}>
                    Detalles de la Oferta
                </Text>

                <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={20} color="#0b4f6c" />
                    <Text style={styles.detalles}>
                        <Text style={styles.detallesLabel}>Presupuesto:</Text> {offerData.sueldo}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <FontAwesome5 name="id-card" size={18} color="#0b4f6c" />
                    <Text style={styles.detalles}>
                        <Text style={styles.detallesLabel}>Licencia Requerida:</Text> {offerData.licencia}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <FontAwesome5 name="briefcase" size={18} color="#0b4f6c" />
                    <Text style={styles.detalles}>
                        <Text style={styles.detallesLabel}>Experiencia Mínima:</Text> {offerData.experiencia}
                    </Text>
                </View>

                {offerCargaData !== null ? (
                    <>
                        <View style={styles.detailRow}>
                            <MaterialIcons name="location-on" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Origen (Localización):</Text> {offerCargaData.origen}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="location-on" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Destino (Localización):</Text> {offerCargaData.destino}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="road" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Distancia:</Text> {offerCargaData.distancia} km
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="box" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Mercancía:</Text> {offerCargaData.mercancia} kg
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="weight" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Peso:</Text> {offerCargaData.peso} kg
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="clock" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Inicio:</Text> {formatDate(offerCargaData.inicio)}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="calendar-minus" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Fin mínimo:</Text> {formatDate(offerCargaData.finMinimo)}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="calendar-plus" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Fin máximo:</Text> {formatDate(offerCargaData.finMaximo)}
                            </Text>
                        </View>
                    </>
                ) : (
                    offerTrabajoData !== null ? (
                        <>
                            <View style={styles.detailRow}>
                                <Entypo name="clock" size={20} color="#0b4f6c" />
                                <Text style={styles.detalles}>
                                    <Text style={styles.detallesLabel}>Jornada:</Text> {offerTrabajoData.jornada}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <MaterialIcons name="event" size={20} color="#0b4f6c" />
                                <Text style={styles.detalles}>
                                    <Text style={styles.detallesLabel}>Fecha Incorporación:</Text> {formatDate(offerTrabajoData.fechaIncorporacion)}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <></>
                    )
                )}

                <View style={styles.separator} />
                <Text style={styles.subTitulo}>Descripción Completa</Text>
                <Text style={styles.description}>{offerData.notas} </Text>

                {(user ? (user.rol === 'EMPRESA' && user.id === offerData.empresa.id) : false) ? (
                    offerData.estado === 'ABIERTA' ? (
                        <>
                            <View style={styles.separator} />
                            <Text style={styles.subTitulo}>Camioneros solicitantes</Text>
                            <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                {offerData && offerData.aplicados.map((item) => (
                                    <View key={item.id} style={styles.camCard}>
                                        <Image source={defaultCamImage} style={styles.logo} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.camTitle}>{item.usuario.nombre}</Text>
                                        </View>
                                        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
                                            <TouchableOpacity style={styles.button} onPress={() => router.push(`/camionero/${item.id}`)}>
                                                <MaterialCommunityIcons name="eye" size={15} color="white" />
                                                <Text style={styles.buttonText}> Ver Detalles</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.button, { backgroundColor: "green" }]} onPress={() => handleAsignarCamionero(item)}>
                                                <MaterialCommunityIcons name="thumb-up" size={15} color="white" />
                                                <Text style={styles.buttonText}> Asignar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={() => handleRechazarCamionero(item)}>
                                                <MaterialCommunityIcons name="thumb-down" size={15} color="white" />
                                                <Text style={styles.buttonText}> Rechazar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.separator}/>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={handleDeleteOffer}
                                    >
                                        <Text style={styles.deleteButtonText}>Eliminar Oferta</Text>
                                    </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.separator} />
                            <Text style={styles.subTitulo}>Camionero asignado</Text>
                            <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <View key={offerData.camionero.id} style={styles.camCard}>
                                    <Image source={defaultCamImage} style={styles.logo} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.camTitle}>{offerData.camionero.usuario.nombre}</Text>
                                    </View>
                                    <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
                                        <TouchableOpacity style={styles.button} onPress={() => router.push(`/camionero/${offerData.camionero.id}`)}>
                                            <MaterialCommunityIcons name="eye" size={15} color="white" />
                                            <Text style={styles.buttonText}> Ver Detalles</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    )
                ) : (<></>)
                }

            </View>
        );
    };

    return (
        <ScrollView style={[styles.scrollContainer, { paddingTop: 30 }]}>
            <View style={styles.container}>
                {renderOfferCard()}
            </View>
        </ScrollView>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 20,
        paddingTop: Platform.OS === "web" ? '5.8%' : '0%',
        marginTop: 20,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    card: {
        width: Platform.OS === "web" ? '60%' : '100%',
        marginHorizontal: '15%',
        padding: Platform.OS === "web" ? 20 : 10,
        backgroundColor: colors.white,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    headerText: {
        flex: 1,
    },
    title: {
        paddingTop: Platform.OS === "web" ? 0 : 10,
        fontSize: 34,
        fontWeight: 'bold',
    },
    empresa: {
        fontSize: 20,
        color: '#0b4f6c',
        marginTop: 0,
    },
    solicitarButton: {
        width: '40%',
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'center',
        backgroundColor: colors.primary,
        marginVertical: 15,
    },
    solicitarButton2: {
        width: '40%',
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'center',
        backgroundColor: '#FBC02D',
        marginVertical: 15,
    },
    solicitarButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        opacity: 0.6,
        marginVertical: 12,
        width: '100%',
        alignSelf: 'center',
    },

    subTitulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0b4f6c',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: '0%',
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        marginLeft: '2%',
    },

    detalles: {
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
    },

    detallesLabel: {
        fontWeight: 'bold',
    },
    camCard: {
        backgroundColor: colors.white,
        padding: 20,
        marginVertical: 10,
        width: "100%",
        borderRadius: 10,
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        borderLeftWidth: 4,
        borderColor: "red",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    camTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flexWrap: "wrap",
        marginBottom: 2,
        color: colors.secondary
    },
    button: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: "2%",
        marginTop: 5,
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
    description: {
        fontSize: 16,
        marginTop: 5,
        marginRight: 10,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    editButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    editButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: colors.green,
        padding: 20,
        borderRadius: 10,
        width: 250,
        alignItems: "center",
    },
    modalIcon: {
        marginBottom: 10,
    },
    modalText: {
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    backIcon: {
        marginLeft: 10,
        marginTop: Platform.OS === 'ios' ? 30 : 10,
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        marginRight: 10,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "#D14F45",
    },
    deleteButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    ownOfferBadgeAlt: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4A6572",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 30,
    },
    ownOfferTextAlt: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        marginLeft: 5
    }
});