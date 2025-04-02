import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import axios from "axios";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import ListadoOfertasEmpresa from "../_components/ListadoOfertasEmpresa";

const MisOfertasEmpresa = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { user, userToken } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState("ABIERTA");
    const [openOffers, setOpenOffers] = useState<any[]>([]);
    const [closedOffers, setClosedOffers] = useState<any[]>([]);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [isModalVisibleCancelar, setIsModalVisibleCancelar] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

    const noOffersInAllCategories =
        openOffers.length === 0 &&
        closedOffers.length === 0;

    useFocusEffect(
        useCallback(() => {
            const fetchOffers = async () => {
                try {
                    const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
                    setOpenOffers(response.data.filter((o: any) => o.estado === "ABIERTA"));
                    setClosedOffers(response.data.filter((o: any) => o.estado === "CERRADA"));
                } catch (error) {
                    console.error("Error al cargar las ofertas:", error);
                }
            };

            fetchOffers();
        }, [])
    );

    // TODO: Arreglar la parte de patrocinio en misofertas y tb en detalle de oferta
    const canPromoteNewOffer = () => {
        // Implement your logic here based on subscription rules
        // For example, check if the company can promote more offers
        return true;
    };

    const promoteOffer = async (ofertaId: number) => {
        try {
            const url = `${BACKEND_URL}/ofertas/${ofertaId}/patrocinar`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                setSuccessModalVisible(true);
                // Refresh offers after promotion
                const updatedResponse = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
                setOpenOffers(updatedResponse.data.filter((o: any) => o.estado === "ABIERTA"));
                setClosedOffers(updatedResponse.data.filter((o: any) => o.estado === "CERRADA"));
            }
        } catch (err) {
            console.error("Error promoting offer:", err);
        }
    };

    const unpromoteOffer = async (ofertaId: number | null) => {
        try {
            const response = await axios.put(
                `${BACKEND_URL}/ofertas/${ofertaId}/desactivar-patrocinio`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    }
                }
            );

            if (response.status === 200) {
                // Refresh offers after unpromotion
                const updatedResponse = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
                setOpenOffers(updatedResponse.data.filter((o: any) => o.estado === "ABIERTA"));
                setClosedOffers(updatedResponse.data.filter((o: any) => o.estado === "CERRADA"));
            }
            setIsModalVisibleCancelar(false);
            setSelectedOfferId(null);
        } catch (err) {
            console.error("Error unpromoting offer:", err);
        }
    };

    const renderOfferList = () => {
        if (noOffersInAllCategories) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No tienes ofertas publicadas todavía</Text>
                    <Text style={styles.emptySubtitle}>
                        Aún no has creado ninguna oferta.
                    </Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/oferta/crear")}>
                        <Text style={styles.emptyButtonText}>Crear nueva oferta</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (tab === "ABIERTA") {
            if (openOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No tienes ofertas abiertas por el momento.
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/oferta/crear")}>
                            <Text style={styles.emptyButtonText}>Crear nueva oferta</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.offersContainer}>
                    <ListadoOfertasEmpresa
                        offers={openOffers}
                        canPromoteNewOffer={() => false}
                        canCancelPromotedOffer={() => false}
                        promoteOffer={promoteOffer}
                        successModalVisible={false}
                        setSuccessModalVisible={setSuccessModalVisible}
                        isModalVisibleCancelar={false}
                        setIsModalVisibleCancelar={false}
                        selectedOfferId={null}
                        setSelectedOfferId={setSelectedOfferId}
                        unpromoteOffer={unpromoteOffer}
                    />
                </View>
            );
        }

        if (tab === "CERRADA") {
            if (closedOffers.length === 0) {
                return <Text style={styles.emptyTitle}>No tienes ofertas cerradas.</Text>;
            }
            return (
                <View style={styles.offersContainer}>
                    <ListadoOfertasEmpresa
                        offers={closedOffers}
                        canPromoteNewOffer={() => false} // No se puede patrocinar ofertas cerradas
                        canCancelPromotedOffer={() => false}
                        promoteOffer={() => { }}
                        successModalVisible={false}
                        setSuccessModalVisible={() => { }}
                        isModalVisibleCancelar={false}
                        setIsModalVisibleCancelar={() => { }}
                        selectedOfferId={null}
                        setSelectedOfferId={() => { }}
                        unpromoteOffer={() => { }}
                    />
                </View>
            );
        }

        return null;
    };

    const getActiveTabStyle = (type: string) => {
        switch (type) {
            case "ABIERTA":
                return {
                    backgroundColor: "#28AD60FF"
                };
            case "CERRADA":
                return {
                    backgroundColor: "#e74c3c"
                };
            default:
                return {};
        }
    };

    return (
        <View style={styles.container}>
            {!noOffersInAllCategories && (
                <View style={styles.contentWrapper}>
                    <View style={styles.tabContainer}>
                        {["ABIERTA", "CERRADA"].map((t) => {
                            const isActive = tab === t;
                            const dynamicStyle = isActive ? getActiveTabStyle(t) : {};
                            const count = t === "ABIERTA" ? openOffers.length : closedOffers.length;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTab(t)}
                                    style={[styles.tabButton, isActive && styles.activeTab, dynamicStyle]}
                                >
                                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                        {t === "ABIERTA" ? `Abiertas (${count})` : `Cerradas (${count})`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
            <ScrollView style={styles.offersWrapper}>{renderOfferList()}</ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    offersContainer: {
        width: '70%',
        alignSelf: "center",
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.white,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 20,
        textAlign: "center"
    },
    contentWrapper: {
        width: "70%",
        alignSelf: "center"
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
        gap: 10
    },
    tabButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor: colors.lightGray,
        alignItems: "center",
        minWidth: 110,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    activeTab: {
        backgroundColor: colors.primary
    },
    tabText: {
        color: colors.darkGray,
        fontWeight: "600",
        fontSize: 16
    },
    activeTabText: {
        color: colors.white,
        fontWeight: "700"
    },
    offersWrapper: {
        marginTop: 10
    },
    emptyContainer: {
        marginTop: 10,
        alignItems: "center",
        paddingHorizontal: 20
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 10,
        textAlign: "center"
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 25
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        width: 200,
        alignItems: "center",
        marginTop: 10
    },
    emptyButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600"
    },
});

export default MisOfertasEmpresa;