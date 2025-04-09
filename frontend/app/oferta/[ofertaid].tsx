import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import colors from "frontend/assets/styles/colors";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import defaultCompanyLogo from "frontend/assets/images/defaultCompImg.png"
import defaultCamImage from "../../assets/images/camionero.png";
import BackButton from "../_components/BackButton";
import { RouteMap } from "../_components/Maps";

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

    const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const openCageKey = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY;


    useEffect(() => {
        if (ofertaid) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`);
                    const data = await response.json();
                    setOfferData(data);

                    if (data.tipoOferta === "TRABAJO") {
                        const trabajoResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`);
                        const trabajoData = await trabajoResponse.json();
                        setOfferTrabajoData(trabajoData);
                    } else if (data.tipoOferta === "CARGA") {
                        const cargaResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`);
                        const cargaText = await cargaResponse.text();
                        const cargaData = cargaText ? JSON.parse(cargaText) : null;
                        setOfferCargaData(cargaData);
                    }

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
            <View style={[
                styles.card,
                offerData.estado === 'CERRADA' && user && user.rol === 'CAMIONERO' && offerData.camionero?.id === user.id && styles.assignedCard,
                user && user.rol === 'CAMIONERO' && offerData.rechazados.some((c: { id: string }) => c.id === user.id) && styles.rejectedCard
            ]}>
                <View style={styles.header}>
                    <BackButton />
                    <Image
                        source={offerData?.empresa?.usuario?.foto ? { uri: `data:image/png;base64,${offerData.empresa.usuario.foto}` } : defaultCompanyLogo}
                        style={styles.logo}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{offerData.titulo}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4, marginBottom: 4, marginLeft: 10 }}>
                            <TouchableOpacity style={styles.companyTouchable}
                                onPress={() => router.push(`/empresa/${offerData.empresa.id}`)}
                            >
                                <FontAwesome5 name="building" size={14} color={colors.primary} />
                                <Text style={styles.companyNameText}>
                                    {offerData.empresa.usuario.nombre}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.separatorText}>|</Text>
                            <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                            <Text style={styles.locationText}>
                                {offerData.localizacion}
                            </Text>
                        </View>

                        <View style={[styles.estadoBadgeBase, offerData.estado === 'ABIERTA' ? styles.estadoAbierta : styles.estadoCerrada]}>
                            <Text style={[styles.estadoText, offerData.estado === 'ABIERTA' ? styles.estadoAbiertaText : styles.estadoCerradaText]}>
                                {offerData.estado}
                            </Text>
                        </View>

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

                {/*Banner de estado*/}
                {offerData.estado === 'CERRADA' && user && user.rol === 'CAMIONERO' && offerData.camionero?.id === user.id && (
                    <View style={[styles.statusBanner, styles.assignedBanner]}>
                        <MaterialCommunityIcons name="check-circle-outline" size={24} color="#28a745" style={styles.statusIcon} />
                        <Text style={[styles.statusText, styles.assignedText]}>
                            ¡Felicidades! Has sido asignado a esta oferta
                        </Text>
                    </View>
                )}

                {user && user.rol === 'CAMIONERO' && offerData.rechazados.some((c: { id: string }) => c.id === user.id) && (
                    <View style={[styles.statusBanner, styles.rejectedBanner]}>
                        <MaterialCommunityIcons name="close-circle-outline" size={24} color="#dc3545" style={styles.statusIcon} />
                        <Text style={[styles.statusText, styles.rejectedText]}>
                            Lo sentimos, no has sido seleccionado para esta oferta
                        </Text>
                    </View>
                )}

                {offerData.estado === 'ABIERTA' ? (
                    user ? (
                        user.rol === 'CAMIONERO' ? (
                            !offerData.rechazados.some((camionero: { id: string }) => camionero.id === user.id) ? (
                                offerData.aplicados.some((camionero: { id: string }) => camionero.id === user.id) ? (
                                    <TouchableOpacity style={[styles.solicitarButton, styles.pendingButton]} onPress={handleDesaplicarOferta}>
                                        <View style={styles.buttonContent}>
                                            <MaterialCommunityIcons name="clock-outline" size={20} color="white" />
                                            <Text style={styles.solicitarButtonText}>Cancelar Solicitud</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleSolicitarOferta}>
                                        <View style={styles.buttonContent}>
                                            <MaterialCommunityIcons name="briefcase-plus-outline" size={20} color="white" />
                                            <Text style={styles.solicitarButtonText}>Solicitar Oferta</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            ) : <></>
                        ) : <></>
                    ) : (
                        <TouchableOpacity style={[styles.solicitarButton, styles.secondaryButton]} onPress={handleLoginRedirect}>
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
                        <Text style={styles.detallesLabel}>Licencia(s) Requerida(s):</Text> {offerData.licencia?.replace(/_/g, '+')}
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

                        <View style={styles.separator} />
                        <RouteMap
                            origin={offerCargaData.origen}
                            destination={offerCargaData.destino}
                            openCageKey={openCageKey}
                            googleMapsApiKey={googleApiKey}
                        />
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
                                        <Image
                                            source={item?.usuario.foto ? { uri: `data:image/png;base64,${item.usuario.foto}` } : defaultCamImage}
                                            style={styles.logo}
                                        />

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
                            <View style={styles.separator} />
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
                                    <Image
                                        source={offerData.camionero?.usuario.foto ? { uri: `data:image/png;base64,${offerData.camionero.usuario.foto}` } : defaultCamImage}
                                        style={styles.logo}
                                    />
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
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 20,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    card: {
        width: '60%',
        marginHorizontal: '15%',
        padding: 20,
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
        paddingTop: 0,
        fontSize: 34,
        fontWeight: 'bold',
    },
    empresa: {
        fontSize: 20,
        color: '#0b4f6c',
        marginTop: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    solicitarButton: {
        width: '35%',
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'center',
        backgroundColor: colors.primary,
        marginVertical: 15,
    },
    solicitarButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: colors.secondary,
    },
    pendingButton: {
        backgroundColor: '#FFA500',
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
        fontWeight: '600',
        color: colors.secondary,
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
        marginTop: 10,
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
    },
    companyInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
        marginBottom: 4,
    },
    companyTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyNameText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        marginLeft: 6,
    },
    separatorText: {
        color: colors.secondary,
        marginHorizontal: 6,
    },
    locationText: {
        fontSize: 17,
        fontWeight: '500',
        color: colors.secondary,
        marginLeft: 4,
    },
    estadoBadgeBase: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    estadoAbierta: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1.5,
        borderColor: '#4CAF50',
    },
    estadoCerrada: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1.5,
        borderColor: '#F44336',
    },
    estadoText: {
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    estadoAbiertaText: {
        color: '#2E7D32',
    },
    estadoCerradaText: {
        color: '#C62828',
    },

    assignedCard: {
        borderWidth: 2,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.02)',
        shadowColor: '#28a745',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    rejectedCard: {
        borderWidth: 2,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.02)',
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIcon: {
        marginRight: 10,
    },
    statusBanner: {
        width: '100%',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 8,
        flexDirection: 'row',
    },
    assignedBanner: {
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
    },
    rejectedBanner: {
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    assignedText: {
        color: '#28a745'
    },
    rejectedText: {
        color: '#dc3545'
    }
});