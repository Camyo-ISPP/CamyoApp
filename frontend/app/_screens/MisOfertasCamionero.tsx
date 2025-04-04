import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import axios from "axios";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import ListadoOfertasPublico from "../_components/ListadoOfertasPublico";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WebFooter from "../_components/_layout/WebFooter";

const MisOfertasCamionero = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { user } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState("PENDIENTE");
    const [aceptedOffers, setAceptedOffers] = useState<any[]>([]);
    const [pendingOffers, setPendingOffers] = useState<any[]>([]);
    const [rejectedOffers, setRejectedOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const noOffersInAllCategories =
        aceptedOffers.length === 0 &&
        pendingOffers.length === 0 &&
        rejectedOffers.length === 0;

    useFocusEffect(
        useCallback(() => {
            const fetchOffers = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${user.id}`);
                    setAceptedOffers(response.data[2]);
                    setPendingOffers(response.data[0]);
                    setRejectedOffers(response.data[1]);
                    setError(null);
                } catch (error) {
                    console.error("Error al cargar las ofertas:", error);
                    setError("Error al cargar tus ofertas. Inténtalo de nuevo más tarde.");
                } finally {
                    setLoading(false);
                }
            };

            fetchOffers();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchOffers()}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderOfferList = () => {
        if (noOffersInAllCategories) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="briefcase-off-outline" size={48} color={colors.mediumGray} />
                    <Text style={styles.emptyTitle}>No tienes ofertas todavía</Text>
                    <Text style={styles.emptySubtitle}>
                        Aún no has solicitado ninguna oferta. Vuelve a la página principal y empieza a explorar oportunidades.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => router.push("/explorar")}
                    >
                        <MaterialCommunityIcons name="compass-outline" size={20} color="white" />
                        <Text style={styles.emptyButtonText}>Explorar Ofertas</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (tab === "ACEPTADA") {
            if (aceptedOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="briefcase-check-outline" size={48} color={colors.mediumGray} />
                        <Text style={styles.emptyTitle}>No tienes ofertas asignadas</Text>
                        <Text style={styles.emptySubtitle}>
                            Todavía no tienes ofertas aceptadas. Sigue atento a nuevas oportunidades.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push("/explorar")}
                        >
                            <MaterialCommunityIcons name="compass-outline" size={20} color="white" />
                            <Text style={styles.emptyButtonText}>Explorar Ofertas</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return <ListadoOfertasPublico offers={aceptedOffers} showPromoted={false} />;
        }

        if (tab === "PENDIENTE") {
            if (pendingOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={48} color={colors.mediumGray} />
                        <Text style={styles.emptyTitle}>No hay ofertas pendientes</Text>
                        <Text style={styles.emptySubtitle}>
                            Vuelve a la página principal para buscar ofertas.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push("/explorar")}
                        >
                            <MaterialCommunityIcons name="compass-outline" size={20} color="white" />
                            <Text style={styles.emptyButtonText}>Explorar Ofertas</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return <ListadoOfertasPublico offers={pendingOffers} showPromoted={false} />;
        }

        if (tab === "RECHAZADA") {
            if (rejectedOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={48} color={colors.mediumGray} />
                        <Text style={styles.emptyTitle}>No hay ofertas descartadas</Text>
                        <Text style={styles.emptySubtitle}>
                            No has rechazado ninguna oferta hasta el momento.
                        </Text>
                    </View>
                );
            }
            return <ListadoOfertasPublico offers={rejectedOffers} showPromoted={false} />;
        }

        return null;
    };

    const getActiveTabStyle = (type: string) => {
        switch (type) {
            case "PENDIENTE":
                return {
                    backgroundColor: "#FFA500" // Naranja para pendientes
                };
            case "ACEPTADA":
                return {
                    backgroundColor: "#28a745" // Verde para aceptadas
                };
            case "RECHAZADA":
                return {
                    backgroundColor: "#dc3545" // Rojo para rechazadas
                };
            default:
                return {};
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Hero Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Ofertas</Text>
                <Text style={styles.headerSubtitle}>Gestiona todas tus ofertas solicitadas</Text>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {!noOffersInAllCategories && (
                    <View style={styles.tabContainer}>
                        {["PENDIENTE", "ACEPTADA", "RECHAZADA"].map((t) => {
                            const isActive = tab === t;
                            const count = t === "PENDIENTE" 
                                ? pendingOffers.length 
                                : t === "ACEPTADA" 
                                    ? aceptedOffers.length 
                                    : rejectedOffers.length;
                            const dynamicStyle = isActive ? getActiveTabStyle(t) : {};
                            
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTab(t)}
                                    style={[
                                        styles.tabButton,
                                        isActive && styles.activeTab,
                                        dynamicStyle
                                    ]}
                                >
                                    <View style={styles.tabContent}>
                                        <MaterialCommunityIcons
                                            name={
                                                t === "PENDIENTE" ? "clock-outline" : 
                                                t === "ACEPTADA" ? "check-circle-outline" : 
                                                "close-circle-outline"
                                            }
                                            size={20}
                                            color={isActive ? 'white' : colors.darkGray}
                                        />
                                        <Text style={[
                                            styles.tabText,
                                            isActive && styles.activeTabText
                                        ]}>
                                            {t === "PENDIENTE" ? "Pendientes" : 
                                             t === "ACEPTADA" ? "Asignadas" : 
                                             "Descartadas"}
                                        </Text>
                                        <View style={[
                                            styles.tabBadge,
                                            isActive && styles.tabBadgeActive
                                        ]}>
                                            <Text style={[
                                                styles.tabBadgeText,
                                                isActive && styles.tabBadgeTextActive
                                            ]}>
                                                {count}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {renderOfferList()}
            </View>

            <WebFooter />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: colors.error,
        marginTop: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        width: '100%',
        paddingVertical: 30,
        paddingHorizontal: '10%',
        backgroundColor: colors.secondary,
        marginBottom: 25,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.white,
        opacity: 0.9,
    },
    mainContent: {
        width: '80%',
        alignSelf: 'center',
        paddingBottom: 30,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        backgroundColor: 'transparent',
        borderRadius: 25,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    activeTab: {
        // Estilo dinámico aplicado en el componente
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGray,
    },
    activeTabText: {
        color: 'white',
    },
    tabBadge: {
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    tabBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.darkGray,
    },
    tabBadgeTextActive: {
        color: 'white',
    },
    emptyContainer: {
        marginTop: 30,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.mediumGray,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MisOfertasCamionero;