import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, ActivityIndicator, Dimensions, Image } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import axios from "axios";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import ListadoOfertasEmpresa from "../_components/ListadoOfertasEmpresa";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import WebFooter from "../_components/_layout/WebFooter";

const MisOfertasEmpresa = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const { user, userToken } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState("ABIERTA");
    const [allOffers, setAllOffers] = useState<any[]>([]);
    const [openOffers, setOpenOffers] = useState<any[]>([]);
    const [closedOffers, setClosedOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { rules, canCreateNewOffer } = useSubscriptionRules();

    const noOffersInAllCategories = openOffers.length === 0 && closedOffers.length === 0;

    useFocusEffect(
        useCallback(() => {
            fetchOffers();
        }, [])
    );

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
            setAllOffers(response.data);
            setOpenOffers(response.data.filter((o: any) => o.estado === "ABIERTA"));
            setClosedOffers(response.data.filter((o: any) => o.estado === "CERRADA"));
            setError(null);
        } catch (error) {
            console.error("Error al cargar las ofertas:", error);
            setError("Error al cargar tus ofertas. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const canPromoteNewOffer = () => {
        const activeOffersCount = openOffers.filter((offer) => offer.estado === 'ABIERTA' && offer.promoted === true).length;
        return activeOffersCount < rules.maxSponsoredOffers;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderOfferList = () => {
        if (noOffersInAllCategories) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="briefcase-off-outline" size={48} color={colors.mediumGray} />
                    <Text style={styles.emptyTitle}>No tienes ofertas publicadas</Text>
                    <Text style={styles.emptySubtitle}>
                        Aún no has creado ninguna oferta. Empieza ahora para encontrar el profesional perfecto.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => router.push("/oferta/crear")}
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={20} color="white" />
                        <Text style={styles.emptyButtonText}>Crear nueva oferta</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (tab === "ABIERTA") {
            if (openOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="briefcase-check-outline" size={48} color={colors.mediumGray} />
                        <Text style={styles.emptyTitle}>No tienes ofertas abiertas</Text>
                        <Text style={styles.emptySubtitle}>
                            Todas tus ofertas están cerradas o aún no has creado ninguna.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push("/oferta/crear")}
                        >
                            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="white" />
                            <Text style={styles.emptyButtonText}>Crear nueva oferta</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.offersContainer}>
                    <ListadoOfertasEmpresa
                        offers={openOffers}
                        canPromoteNewOffer={canPromoteNewOffer}
                        canCancelPromotedOffer={true}
                        fetchOffers={fetchOffers}
                    />
                </View>
            );
        }

        if (tab === "CERRADA") {
            if (closedOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="archive-outline" size={48} color={colors.mediumGray} />
                        <Text style={styles.emptyTitle}>No tienes ofertas cerradas</Text>
                        <Text style={styles.emptySubtitle}>
                            Todas tus ofertas están abiertas o aún no has creado ninguna.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push("/oferta/crear")}
                        >
                            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="white" />
                            <Text style={styles.emptyButtonText}>Crear nueva oferta</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.offersContainer}>
                    <ListadoOfertasEmpresa
                        offers={closedOffers}
                        canPromoteNewOffer={() => false}
                        canCancelPromotedOffer={false}
                        fetchOffers={fetchOffers}
                    />
                </View>
            );
        }

        return null;
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.webContainer}>
            {/* Hero Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Ofertas</Text>
                <Text style={styles.headerSubtitle}>Gestiona todas tus ofertas publicadas</Text>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {!noOffersInAllCategories && (
                    <View style={styles.tabContainer}>
                        {["ABIERTA", "CERRADA"].map((t) => {
                            const isActive = tab === t;
                            const count = t === "ABIERTA" ? openOffers.length : closedOffers.length;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTab(t)}
                                    style={[
                                        styles.tabButton,
                                        isActive && t === "ABIERTA" && styles.activeTabOpen,
                                        isActive && t === "CERRADA" && styles.activeTabClosed
                                    ]}
                                >
                                    <View style={styles.tabContent}>
                                        <MaterialCommunityIcons
                                            name={t === "ABIERTA" ? "lock-open-outline" : "lock-outline"}
                                            size={20}
                                            color={isActive ? 'white' : colors.darkGray}
                                        />
                                        <Text style={[
                                            styles.tabText,
                                            isActive && styles.activeTabText
                                        ]}>
                                            {t === "ABIERTA" ? `Abiertas` : `Cerradas`}
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

                {canCreateNewOffer(allOffers) && (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("/oferta/crear")}
                    >
                        <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
                        <Text style={styles.createButtonText}>Nueva oferta</Text>
                    </TouchableOpacity>
                )}

                {renderOfferList()}
            </View>
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
    webContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
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
        fontSize: 18,
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
    activeTabOpen: {
        backgroundColor: '#28a745',
    },
    activeTabClosed: {
        backgroundColor: '#dc3545',
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
    offersContainer: {
        width: '100%',
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
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 25,
        gap: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MisOfertasEmpresa;