import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, Linking, Alert, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import colors from "frontend/assets/styles/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from "../_components/SuccessModal";

const formatDate = (fecha: string) => {
    const opciones = { day: "numeric", month: "long", year: "numeric" } as const;
    return new Date(fecha).toLocaleDateString("es-ES", opciones);
};

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function OfertaDetalleScreen() {
    const [offerData, setOfferData] = useState<any>(null);
    const [empresaData, setEmpresaData] = useState<any>(null);
    const [usuarioEmpresaData, setUsuarioEmpresaData] = useState<any>(null);
    const [offerTrabajoData, setOfferTrabajoData] = useState<any>(null);
    const [offerCargaData, setOfferCargaData] = useState<any>(null);
    const [userHasApplied, setUserHasApplied] = useState(false); 
    const [loading, setLoading] = useState(true);
    const { ofertaid } = useLocalSearchParams();
    const router = useRouter(); // Para navegar entre pantallas
    const { user, userToken, login, logout } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);

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
                    
                    const empresaResponse = await fetch(`${BACKEND_URL}/empresas/${data.empresa.id}`); //http://localhost:8080/empresas/${data.empresaId}
                    const empresaData = await empresaResponse.json();
                    setEmpresaData(empresaData);

                    const usuarioEmpresaResponse = await fetch(`${BACKEND_URL}/usuarios/${empresaData.usuario.id}`); //http://localhost:8080/usuarios/${empresaData.usuarioId}
                    const usuarioEmpresaData = await usuarioEmpresaResponse.json();
                    setUsuarioEmpresaData(usuarioEmpresaData);

                   
                    const camionerosResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/camioneros`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userToken}`
                        }
                        });
                    const camionerosData = await camionerosResponse.json();

                    const yaAplicado = camionerosData.some((camionero: { id: string }) => camionero.id === user.id);
                    setUserHasApplied(yaAplicado);

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
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setIsModalVisible(true);
                setUserHasApplied(true);
                setTimeout(() => {
                    setIsModalVisible(false); 
                }, 2000);
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
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                Alert.alert("Éxito", "Has retirado tu solicitud correctamente.");
                setUserHasApplied(false);
            } else {
                Alert.alert("Error", "No se pudo retirar la solicitud.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema con la solicitud.");
        }
    };

    const handleLoginRedirect = () => {
        router.replace("/login")
    };    

    const handleEditarOferta = () => {
        router.replace(`/oferta/editar/${ofertaid}`);
    }

    const renderOfferCard = () => {
        return (
            <View style={styles.card}>
                {offerTrabajoData == null ? (
                    <>
                        <View style={styles.header}>
                            {/* Icono de retroceso */}
                            <TouchableOpacity style={styles.backIcon} onPress={() => router.replace('/')}>
                                <Ionicons name="arrow-back" size={30} color="#0b4f6c" />
                            </TouchableOpacity>
                            <Image
                                source={require('../../assets/images/no-company-logo.png')} 
                                style={styles.logo}
                            />
                            <View style={styles.headerText}>
                                <Text style={styles.title}>{offerData.titulo}</Text>
                                {usuarioEmpresaData.nombre && (
                                    <Text style={styles.empresa}>
                                    {usuarioEmpresaData.nombre.toUpperCase()} |
                                    <MaterialIcons name="location-on" size={18} color="#0b4f6c" />
                                    <Text style={styles.empresa}> {offerCargaData.origen}</Text>
                                </Text>
                                )}
                            </View>
                        </View>
                        
                        
                        {user ? (
                            user.rol === 'CAMIONERO' ? (
                                userHasApplied ? (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleDesaplicarOferta}>
                                        <Text style={styles.solicitarButtonText}>Cancelar Solicitud</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleSolicitarOferta}>
                                        <Text style={styles.solicitarButtonText}>Solicitar Oferta</Text>
                                    </TouchableOpacity>
                                )
                            ) : user.rol === 'EMPRESA' && user.id === offerData.empresa.id ? (
                                <TouchableOpacity style={styles.solicitarButton} onPress={handleEditarOferta}>
                                    <Text style={styles.solicitarButtonText}>Editar Oferta</Text>
                                </TouchableOpacity>
                            ) : null
                        ) : (
                            <TouchableOpacity style={styles.solicitarButton} onPress={handleLoginRedirect}>
                                <Text style={styles.solicitarButtonText}>Inicia sesión para solicitar</Text>
                            </TouchableOpacity>
                        )}

                        {/* Modal de éxito */}
                        <SuccessModal
                            isVisible={isModalVisible}
                            onClose={() => setIsModalVisible(false)}
                            message="¡Has solicitado correctamente a la carga!"
                        />

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
                            <FontAwesome5 name="briefcase" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Experiencia Mínima:</Text> {offerData.experiencia}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="truck" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Camión Requerido:</Text> Furgoneta/Camión furgón y Refrigerado {/*offerData.camionRequerido*/}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="location-on" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Recogida (Localización):</Text> {offerCargaData.origen}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="location-on" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Entrega (Localización):</Text> {offerCargaData.destino}
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
                                <Text style={styles.detallesLabel}>Tamaño de Paquete:</Text> Euro Palet 120cm x 80cm x 120cm {/* {offerCargaData.dim} */}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="cogs" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Número de Paquetes:</Text> 2{/*offerCargaData.numeroPaquetes*/}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="weight" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Peso:</Text> {offerCargaData.peso} kg
                            </Text>
                        </View>

                        <View style={styles.separator} />

                        <Text style={styles.subTitulo}>Descripción Completa</Text>

                        <Text style={styles.description}>{offerData.notas} </Text>

                    </>
                ) : (
                    <>
                        <View style={styles.header}>
                            {/* Icono de retroceso */}
                            <TouchableOpacity style={styles.backIcon} onPress={() => router.replace('/')}>
                                <Ionicons name="arrow-back" size={30} color="#0b4f6c" />
                            </TouchableOpacity>
                            <Image
                                source={require('../../assets/images/no-company-logo.png')} 
                                style={styles.logo}
                            />
                            <View style={styles.headerText}>
                                <Text style={styles.title}>{offerData.titulo}</Text>
                                {usuarioEmpresaData.nombre && (
                                    <Text style={styles.empresa}>
                                    {usuarioEmpresaData.nombre.toUpperCase()} |
                                    <MaterialIcons name="location-on" size={18} color="#0b4f6c" />
                                    <Text style={styles.empresa}> {usuarioEmpresaData.localizacion}</Text>
                                </Text>
                                )}
                            </View>
                        </View>
                        
                        {user ? (
                            user.rol === 'CAMIONERO' ? (
                                userHasApplied ? (
                                    <TouchableOpacity style={styles.solicitarButton2} onPress={handleDesaplicarOferta}>
                                        <Text style={styles.solicitarButtonText}>Cancelar Solicitud</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.solicitarButton} onPress={handleSolicitarOferta}>
                                        <Text style={styles.solicitarButtonText}>Solicitar Oferta</Text>
                                    </TouchableOpacity>
                                )
                            ) : user.rol === 'EMPRESA' && user.id === offerData.empresa.id ? (
                                <TouchableOpacity style={styles.solicitarButton} onPress={handleEditarOferta}>
                                    <Text style={styles.solicitarButtonText}>Editar Oferta</Text>
                                </TouchableOpacity>
                            ) : null
                        ) : (
                            <TouchableOpacity style={styles.solicitarButton} onPress={handleLoginRedirect}>
                                <Text style={styles.solicitarButtonText}>Inicia sesión para solicitar</Text>
                            </TouchableOpacity>
                        )}

                        {/* Modal de éxito */}
                        <SuccessModal
                            isVisible={isModalVisible}
                            onClose={() => setIsModalVisible(false)}
                            message="¡Has solicitado correctamente a la oferta!"
                        />
                        

                        <View style={styles.separator} />

                        <Text style={styles.subTitulo}>
                            Detalles de la Oferta
                        </Text>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="attach-money" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Salario:</Text> {offerData.sueldo}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="briefcase" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Experiencia Mínima:</Text> {offerData.experiencia}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Entypo name="clock" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Jornada:</Text> Completa {/* {offerData.jornada} */}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="id-card" size={18} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Licencia Requerida:</Text> C+E {/* {offerData.licencia} */}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="event" size={20} color="#0b4f6c" />
                            <Text style={styles.detalles}>
                                <Text style={styles.detallesLabel}>Fecha Incorporación:</Text> {formatDate(offerTrabajoData.fechaIncorporacion)}
                            </Text>
                        </View>
                        <View style={styles.separator} />

                        <Text style={styles.subTitulo}>Descripción Completa</Text>

                        <Text style={styles.description}>{offerData.notas} </Text>

                    </>
                )}

            </View>
        );
    };

    return (
        <ScrollView style={[styles.scrollContainer, { paddingTop: 0 }]}>
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
        backgroundColor: '#e6e8e6',
        paddingVertical: 20,
        paddingTop: Platform.OS === "web" ? '5.8%' : '0%',
        
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    card: {
        width: Platform.OS === "web" ? '60%' : '100%',
        marginHorizontal: '15%',
        padding: Platform.OS === "web" ? 20 : 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
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
});