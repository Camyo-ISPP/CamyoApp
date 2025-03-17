import React, { useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform, Animated, Easing } from "react-native";
import colors from "frontend/assets/styles/colors";
import CamyoWebNavBar from "../_components/CamyoNavBar";
import BottomBar from "../_components/BottomBar";
import Titulo from "../_components/Titulo";
import Ionicons from "@expo/vector-icons/Ionicons";

const subscriptionTestData = {
    id: 2,
    empresa_id: 218,
    nivel: "BASIC",
    fecha_inicio: "2025-03-16",
    fecha_fin: "2025-04-16",
    activa: true
};

export default function SubscriptionPlans() {

    const currentPlan = subscriptionTestData.nivel;

    return (
        <>
            {Platform.OS === 'web' ? (
                <View style={styles.webContainer}>
                    <CamyoWebNavBar />
                    <ScrollView contentContainerStyle={styles.scrollview}>
                        <Titulo texto="Planes de Suscripción" marginTop={30} />
                        <View style={styles.cardsContainer}>
                            <PlanCard
                                title="GRATIS"
                                price="0€"
                                description="Ofertas limitadas con datos incompletos."
                                borderColor={colors.primary}
                                planLevel="GRATIS"
                                currentPlan={currentPlan}
                            />
                            <PlanCard
                                title="BÁSICO"
                                price="24.99€"
                                description="Permite publicar hasta 10 ofertas de empleo con datos completos."
                                borderColor={colors.primary}
                                planLevel="BASIC"
                                currentPlan={currentPlan}
                            />
                            <PlanCard
                                title="PREMIUM"
                                price="49.99€"
                                description="Permite publicar un número ilimitado de ofertas con datos completos."
                                borderColor={colors.primary}
                                planLevel="PREMIUM"
                                currentPlan={currentPlan}
                            />
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.phoneContainer}>
                    <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
                    <ScrollView contentContainerStyle={styles.scrollview}>
                        <Text style={styles.pageTitle}>Planes de Suscripción</Text>
                        <View style={styles.cardsContainer}>
                            <PlanCard
                                title="GRATIS"
                                price="0€"
                                description="Ofertas limitadas con datos incompletos."
                                borderColor={colors.primary}
                                planLevel="GRATIS"
                                currentPlan={currentPlan}
                            />
                            <PlanCard
                                title="BÁSICO"
                                price="24.99€"
                                description="Permite publicar hasta 10 ofertas de empleo con datos completos."
                                borderColor={colors.primary}
                                planLevel="BASIC"
                                currentPlan={currentPlan}
                            />
                            <PlanCard
                                title="PREMIUM"
                                price="49.99€"
                                description="Permite publicar un número ilimitado de ofertas con datos completos."
                                borderColor={colors.primary}
                                planLevel="PREMIUM"
                                currentPlan={currentPlan}
                            />
                        </View>
                    </ScrollView>
                    <BottomBar />
                </View>
            )}
        </>
    );
}

function getPlanIcon(planLevel: string) {
    switch (planLevel) {
        case "GRATIS":
            return <Ionicons name="pricetag-outline" size={24} color={colors.primary} />;
        case "BASIC":
            return <Ionicons name="layers-outline" size={24} color={colors.primary} />;
        case "PREMIUM":
            return <Ionicons name="diamond-outline" size={24} color={colors.primary} />;
        default:
            return null;
    }
}

function PlanCard({ title, price, description, borderColor, planLevel, currentPlan }) {
    const isCurrentPlan = planLevel === currentPlan;
    const buttonText = isCurrentPlan ? "Plan actual" : "Cambiar a este plan";
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handleMouseEnter = () => {
        if (Platform.OS === "web") {
            Animated.timing(scaleValue, {
                toValue: 1.05,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
        }
    };

    const handleMouseLeave = () => {
        if (Platform.OS === "web") {
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
        }
    };

    return (
        <Animated.View
            style={[
                styles.card,
                { borderLeftColor: borderColor, transform: [{ scale: scaleValue }] },
            ]}
            {...(Platform.OS === "web"
                ? ({ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } as any)
                : {})}
        >
            <View style={styles.planTitleContainer}>
                {getPlanIcon(planLevel)}
                <Text style={styles.planTitle}>{title}</Text>
            </View>            
            <Text style={styles.planPrice}>{price}</Text>
            <Text style={styles.planDescription}>{description}</Text>
            <TouchableOpacity
                style={[
                    styles.button,
                    isCurrentPlan ? styles.disabledButton : styles.button
                ]}
                disabled={isCurrentPlan}
            >
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
    },
    phoneContainer: {
        flex: 1,
        backgroundColor: colors.mediumGray,
    },
    scrollview: {
        flex: 1,
        padding: 10,
        marginVertical: 40,
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        bottom: -40,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.secondary,
        marginVertical: 20,
    },
    cardsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-start",
    },
    card: {
        backgroundColor: colors.white,
        padding: 20,
        marginVertical: 10,
        width: "28%",
        borderRadius: 10,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: 230,
        justifyContent: "space-between",
        alignItems: "center",
    },
    planTitleContainer: {
        flexDirection: "row",     
        alignItems: "center",     
        justifyContent: "center",          
        marginBottom: 5,
      },
    planTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.primary,
        marginLeft: 8, 
      },
    planPrice: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 5,
    },
    planDescription: {
        fontSize: 14,
        color: "gray",
        marginBottom: 10,
        textAlign: "center",
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: colors.white,
        fontWeight: "bold",
    },
    disabledButton: {
        backgroundColor: "gray",
    },
});
