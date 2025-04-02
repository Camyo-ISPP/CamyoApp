import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import axios from "axios";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import ListadoOfertas from "../_components/ListadoOfertas";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import ListadoOfertasCamionero from "../_components/ListadoOfertasCamionero";

const MisOfertasCamionero = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    const { user } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState("PENDIENTE");
    const [aceptedOffers, setAceptedOffers] = useState<any[]>([]);
    const [pendingOffers, setPendingOffers] = useState<any[]>([]);
    const [rejectedOffers, setRejectedOffers] = useState<any[]>([]);

    const noOffersInAllCategories =
        aceptedOffers.length === 0 &&
        pendingOffers.length === 0 &&
        rejectedOffers.length === 0;

    useFocusEffect(
        useCallback(() => {
            const fetchOffers = async () => {
                try {
                    const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${user.id}`);
                    setAceptedOffers(response.data[2]);
                    setPendingOffers(response.data[0]);
                    setRejectedOffers(response.data[1]);
                } catch (error) {
                    console.error("Error al cargar las ofertas:", error);
                }
            };

            fetchOffers();
        }, [])
    );

    const renderOfferList = () => {

        if (noOffersInAllCategories) {
            return (
                <>
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No tienes ofertas todavía</Text>
                        <Text style={styles.emptySubtitle}>
                            Aún no has solicitado ninguna oferta. Vuelve a la página principal y empieza a explorar oportunidades.
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/explorar")}>
                            <Text style={styles.emptyButtonText}>Explorar Ofertas</Text>
                        </TouchableOpacity>
                    </View>

                </>
            );
        }

        if (tab === "ACEPTADA") {
            if (aceptedOffers.length === 0) {
                return <Text style={styles.emptyTitle}>No tienes ofertas asignadas todavía. ¡Sigue atento a nuevas oportunidades!</Text>;
            }
            return <ListadoOfertasCamionero offers={aceptedOffers} showPromoted={false} />;
        }

        if (tab === "PENDIENTE") {
            if (pendingOffers.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No hay ofertas pendientes por el momento.
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Vuelve a la página principal para buscar ofertas.
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/explorar")}>
                            <Text style={styles.emptyButtonText}>Explorar Ofertas</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return <ListadoOfertasCamionero offers={pendingOffers} showPromoted={false} />;
        }

        if (tab === "RECHAZADA") {
            if (rejectedOffers.length === 0) {
                return <Text style={styles.emptyTitle}>No hay ofertas descartadas.</Text>;
            }
            return <ListadoOfertasCamionero offers={rejectedOffers} showPromoted={false} />;
        }

        return null;
    };

    const getActiveTabStyle = (type: string) => {
        switch (type) {
            case "PENDIENTE":
                return {
                    backgroundColor: "#F2873AFF"
                };
            case "ACEPTADA":
                return {
                    backgroundColor: "#28AD60FF"
                };
            case "RECHAZADA":
                return {
                    backgroundColor: "#e74c3c"
                };
            default:
                return {};
        }
    };


    return (
        <View style={styles.container}>
            {!noOffersInAllCategories &&
                <View style={styles.contentWrapper}>
                    <View style={styles.tabContainer}>
                        {["PENDIENTE", "ACEPTADA", "RECHAZADA"].map((t) => {
                            const isActive = tab === t;
                            const dynamicStyle = isActive ? getActiveTabStyle(t) : {};
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTab(t)}
                                    style={[styles.tabButton, isActive && styles.activeTab, dynamicStyle]}
                                >
                                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                        {t === "ACEPTADA" ? "Asignadas" : t === "PENDIENTE" ? "Pendientes" : "Descartadas"}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            }
            <ScrollView style={styles.offersWrapper}>
                <View style={styles.contenedorOfertas}>
                    {renderOfferList()}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedorOfertas: {
        width: '70%',
        alignSelf: 'center',
      },
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: 50,
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
        marginTop: 30,
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
    offerCard: {
        backgroundColor: colors.lightGray,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.secondary
    },
    offerDetail: {
        fontSize: 14,
        color: colors.darkGray
    },
    emptyText: {
        textAlign: "center",
        fontStyle: "italic",
        marginTop: 30,
        fontSize: 20
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
        shadowRadius: 4
    },
    emptyButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600"
    },

});


const misOfertasStyle = StyleSheet.create({
    contenedorOfertas: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    card: {
        backgroundColor: colors.white,
        padding: 20,
        marginVertical: 10,
        width: "70%",
        borderRadius: 10,
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        borderLeftWidth: 4,
        borderColor: "red",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    companyLogo: {
        height: 90,
        width: 90,
        marginRight: 10,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flexWrap: "wrap",
        marginBottom: 2,
        color: colors.secondary,
    },
    offerDetailsTagType: {
        fontSize: 9,
        backgroundColor: colors.primary,
        color: colors.white,
        borderRadius: 10,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "700",
        flexWrap: "wrap",
    },
    offerDetailsTagLicense: {
        fontSize: 9,
        backgroundColor: colors.secondary,
        borderRadius: 10,
        color: colors.white,
        paddingTop: 2,
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
        flexWrap: "wrap",
    },
    offerDetailsTagExperience: {
        fontSize: 9,
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: 10,
        color: colors.primary,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
        flexWrap: "wrap",
    },
    offerInfo: {
        fontSize: 12,
        color: "gray",
        marginTop: 5,
        flexWrap: "wrap",
    },
    offerSueldo: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "right",
        paddingLeft: 3,
        color: colors.secondary,
        textAlignVertical: "center",
        width: "35%",
        alignSelf: "center",
    },
    button: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: "2%",
        marginTop: 4,
        flexDirection: "row",
        height: 40,
        width: 150,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: colors.white,
        fontWeight: "bold",
    },
    detailsIcon: {
        color: colors.white,
        alignSelf: "center",
        marginLeft: 3,
        marginTop: 3,
        marginRight: 5,
    },
    localizacion: {
        fontSize: 15,
        color: "#696969",
    },
});

export default MisOfertasCamionero;