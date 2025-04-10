import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import colors from "../../assets/styles/colors";
import { useRouter, SearchParams } from "expo-router";
import ListadoOfertasBorrador from "../_components/ListadoOfertasBorrador";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import ListadoOfertasEmpresa from "../_components/ListadoOfertasEmpresa";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WebFooter from "../_components/_layout/WebFooter";
import { useSearchParams } from "expo-router/build/hooks";
import MapLoader from "../_components/MapLoader";

const MisOfertasEmpresa = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const { user } = useAuth();
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState<"ABIERTA" | "CERRADA" | "BORRADOR">();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab"); 
    console.log("Tab:", tab); 


    useEffect(() => {
        if (tab) {
            setCurrentTab(tab);
        } else {
            setCurrentTab("ABIERTA"); 
        }
    }, [tab]);

    const [allOffers, setAllOffers] = useState<any[]>([]);
    const [openOffers, setOpenOffers] = useState<any[]>([]);
    const [closedOffers, setClosedOffers] = useState<any[]>([]);
    const [draftOffers, setDraftOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { rules } = useSubscriptionRules();
    const { canCreateNewOffer } = useSubscriptionRules();

    const noOffersInAllCategories =
        openOffers.length === 0 &&
        closedOffers.length === 0 &&
        draftOffers.length === 0;

    useFocusEffect(
        useCallback(() => {
            fetchOffers();
        }, [])
    );
    console.log(tab)



    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
            setAllOffers(response.data);
            setOpenOffers(response.data.filter((o: any) => o.estado === "ABIERTA"));
            setClosedOffers(response.data.filter((o: any) => o.estado === "CERRADA"));
            setDraftOffers(response.data.filter((o: any) => o.estado === "BORRADOR"));
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
                <MapLoader />
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

        switch (currentTab) {
            case "ABIERTA":
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

            case "CERRADA":
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

            case "BORRADOR":
                if (draftOffers.length === 0) {
                    return <Text style={styles.emptyTitle}>No tienes ofertas en modo borrador.</Text>;
                }
                return <ListadoOfertasBorrador data={draftOffers} />;

            default:
                return null;
        }
    };

    const getActiveTabStyle = (type: string) => {
        switch (type) {
            case "ABIERTA":
                return { backgroundColor: "#28AD60FF" };
            case "CERRADA":
                return { backgroundColor: "#e74c3c" };
            case "BORRADOR":
                return { backgroundColor: "#f39c12" };
            default:
                return {};
        }
    };

    const getTabLabel = (type: string) => {
        switch (type) {
            case "ABIERTA":
                return ` Abiertas(Sin Asignar)`;
            case "CERRADA":
                return `Cerradas(Asignadas) `;
            case "BORRADOR":
                return `Borradores `;
            default:
                return "";
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.webContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Ofertas</Text>
                <Text style={styles.headerSubtitle}>Gestiona todas tus ofertas publicadas</Text>
            </View>

            <View style={styles.mainContent}>
                {!noOffersInAllCategories && (
                    <View style={styles.tabContainer}>
                        {["ABIERTA", "BORRADOR", "CERRADA"].map((t) => {
                            const isActive = currentTab === t;
                            const count = t === "ABIERTA" ? openOffers.length : t === "CERRADA" ? closedOffers.length : draftOffers.length;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setCurrentTab(t)}
                                    style={[styles.tabButton, isActive && getActiveTabStyle(t)]}
                                >
                                    <MaterialCommunityIcons
                                        name={t === "ABIERTA" ? "lock-open-outline" : t === "CERRADA" ? "archive-outline" : "briefcase-outline"}
                                        size={20}
                                        color={isActive ? 'white' : colors.mediumGray}
                                    />
                                    <Text style={[styles.tabText, isActive && { color: 'white' }]}>
                                        {getTabLabel(t)}
                                    </Text>
                                    {count > 0 && (
                                        <View style={[
                                            styles.tagContainer,
                                            isActive
                                                ? { backgroundColor: 'rgba(0,0,0,0.2)' }
                                                : { backgroundColor: colors.mediumGray }
                                        ]}>
                                            <Text style={[
                                                styles.tagText,
                                                isActive
                                                    ? { color: 'white' }
                                                    : { color: colors.darkGray }
                                            ]}>
                                                {count}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {renderOfferList()}
            </View>
            </View>        <WebFooter />
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
        backgroundColor: colors.white
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
        marginBottom: 50,
        backgroundColor: 'transparent',
        borderRadius: 25,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        flexDirection: "row",
        paddingHorizontal: 16,
        justifyContent: "center",
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
        color: colors.mediumGray2,
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
        fontSize: 14,
    },tagContainer: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginLeft: 8,
        justifyContent: 'center', 
        alignItems: 'center', 
        minWidth: 24, 
        height: 24, 
    },
    
    tagText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: 'white', 
    }

});

export default MisOfertasEmpresa;