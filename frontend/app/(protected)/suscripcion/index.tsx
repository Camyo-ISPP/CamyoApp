import React, { useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Animated, Easing, ActivityIndicator, Image } from "react-native";
import colors from "frontend/assets/styles/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import EmpresaRoute from "@/security/EmpresaRoute";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import SuccessModal from "../../_components/SuccessModal";
import WebFooter from "@/app/_components/_layout/WebFooter";

const SubscriptionPlans = () => {
    const { user, userToken } = useAuth();
    const { id, setId } = usePayment();
    const router = useRouter();
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        if (user === undefined) return;
        setIsAuthLoaded(true);
    }, [user]);

    useEffect(() => {
        if (!isAuthLoaded) return;
        if (user === undefined) return;
        setIsUserLoading(false);
    }, [isAuthLoaded]);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!user?.id || !userToken) return;

            try {
                const response = await axios.get(`${BACKEND_URL}/suscripciones/nivel/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                });
                setCurrentPlan(response.data);
            } catch (error) {
                console.error("Error al obtener el plan de suscripción:", error);
                setCurrentPlan("GRATIS");
            } finally {
                setLoadingPlan(false);
            }
        };

        fetchPlan();
    }, [user?.id, userToken]);


    useEffect(() => {
        if (id === "BASICO" || id === "PREMIUM") {
            router.push("/pago/checkout");
        }

    }, [id])



    if (!isAuthLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const handleChangePlan = async (planLevel: string) => {
        if (!user || !user.id || !userToken) return;

        try {
            setLoadingPlan(true);
            const response = await axios.post(
                `${BACKEND_URL}/suscripciones/${user.id}?nivel=${planLevel}&duracion=30`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            if (response.status === 201) {
                setCurrentPlan(planLevel);
                setSuccessModalVisible(true);
                setTimeout(() => {
                    setSuccessModalVisible(false);
                }, 2000);
            } else {
                alert("No se pudo cambiar el plan.");
            }
        } catch (error) {
            alert("Ocurrió un error al cambiar el plan.");
        } finally {
            setLoadingPlan(false);
        }
    };

    const formatPlanLevel = (plan: string): string => {
        switch (plan.toUpperCase()) {
            case "GRATIS": return "GRATIS";
            case "BASICO": return "BÁSICO";
            case "PREMIUM": return "PREMIUM";
            default: return plan;
        }
    };

    const handleGoToCheckout = (planId: string) => {
        setId(planId)
    }

    const getPlanIcon = (planLevel: string) => {
        switch (planLevel) {
            case "GRATIS": return <Ionicons name="pricetag-outline" size={28} color={colors.primary} />;
            case "BASICO": return <Ionicons name="layers-outline" size={28} color={colors.primary} />;
            case "PREMIUM": return <Ionicons name="diamond-outline" size={28} color={colors.primary} />;
            default: return null;
        }
    };

    const PlanCard: React.FC<{
        title: string;
        price: string;
        features: string[];
        popular?: boolean;
        borderColor: string;
        backgroundColor: string;
        planLevel: string;
        currentPlan: string;
        onChangePlan: (planLevel: string) => void;
    }> = ({ title, price, features, popular, borderColor, backgroundColor, planLevel, currentPlan, onChangePlan }) => {

        const isCurrentPlan = planLevel === currentPlan;
        const buttonText = isCurrentPlan ? "Plan actual" : "Cambiar a este plan";
        const scaleValue = useRef(new Animated.Value(1)).current;

        const handleMouseEnter = () => {
            Animated.timing(scaleValue, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
        };

        const handleMouseLeave = () => {
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
        };

        return (
            <Animated.View
                style={[
                    styles.card,
                    {
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                        transform: [{ scale: scaleValue }],
                        marginTop: popular ? 0 : 20,
                    },
                ]}
                {...({ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } as any)}
            >
                {popular && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>RECOMENDADO</Text>
                    </View>
                )}

                <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                        {getPlanIcon(planLevel)}
                        <Text style={styles.planTitle}>{title}</Text>
                    </View>
                    <Text style={styles.planPrice}>{price}</Text>
                    <Text style={styles.billingText}>al mes</Text>
                </View>

                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isCurrentPlan ? styles.currentPlanButton : styles.changePlanButton,
                        popular ? styles.popularButton : {}
                    ]}
                    disabled={isCurrentPlan || loadingPlan}
                    onPress={() => onChangePlan(planLevel)}
                >
                    {loadingPlan && isCurrentPlan ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const plans = [
        {
            level: "GRATIS",
            title: "Plan Gratis",
            price: "0€",
            features: [
                "1 oferta activa simultánea",
                "1 oferta patrocinada simultánea",
                "Soporte estándar"
            ],
            borderColor: "#ccc",
            backgroundColor: colors.white
        },
        {
            level: "PREMIUM",
            title: "Plan Premium",
            price: "49,99€",
            popular: true,
            features: [
                "Ofertas ilimitadas activas",
                "Ofertas patrocinadas ilimitadas",
                "Soporte prioritario 24/7",
            ],
            borderColor: colors.secondary,
            backgroundColor: colors.white
        },
        {
            level: "BASICO",
            title: "Plan Básico",
            price: "24,99€",
            features: [
                "3 ofertas activas simultáneas",
                "2 ofertas patrocinadas simultáneas",
                "Soporte prioritario por email"
            ],
            borderColor: colors.primary,
            backgroundColor: colors.white
        }
    ];

    return (
        <EmpresaRoute>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>Encuentra al mejor talento para tu empresa</Text>
                        <Text style={styles.heroSubtitle}>Elige el plan que mejor se adapte a tus necesidades de contratación</Text>
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.sectionTitle}>Planes de Suscripción</Text>
                        <Text style={styles.sectionDescription}>
                            Actualmente tienes el plan: <Text style={styles.currentPlanHighlight}>{formatPlanLevel(currentPlan || "GRATIS")}</Text>
                        </Text>

                        <View style={styles.plansContainer}>
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.level}
                                    title={plan.title}
                                    price={plan.price}
                                    features={plan.features}
                                    popular={plan.popular}
                                    borderColor={plan.borderColor}
                                    backgroundColor={plan.backgroundColor}
                                    planLevel={plan.level}
                                    currentPlan={currentPlan || "GRATIS"}
                                    onChangePlan={plan.level === "GRATIS" ? handleChangePlan : handleGoToCheckout}
                                />
                            ))}
                        </View>

                        <View style={styles.faqSection}>
                            <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
                            <View style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>¿Puedo cambiar de plan en cualquier momento?</Text>
                                <Text style={styles.faqAnswer}>Sí, puedes cambiar de plan cuando quieras. El cambio será efectivo inmediatamente.</Text>
                            </View>
                            <View style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>¿Hay un período de prueba?</Text>
                                <Text style={styles.faqAnswer}>Actualmente no ofrecemos periodos de pruebas gratuitos. Contacta con el equipo de soporte para más información.</Text>
                            </View>
                            <View style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>¿Cómo se procesan los pagos?</Text>
                                <Text style={styles.faqAnswer}>
                                    Usamos <Text style={{ fontWeight: 'bold' }}>Stripe</Text>, la plataforma de pagos líder mundial.
                                    Aceptamos todas las tarjetas principales (Visa, Mastercard, etc.) de forma segura.
                                    Tus datos de pago están encriptados y nunca se almacenan en nuestros servidores.
                                    Los pagos son recurrentes cada mes con facturación automática.
                                </Text>
                            </View>
                        </View>
                    </View>
                    <WebFooter />
                </ScrollView>

                <SuccessModal
                    isVisible={successModalVisible}
                    onClose={() => setSuccessModalVisible(false)}
                    message="¡Plan actualizado con éxito!"
                />
            </View>
        </EmpresaRoute>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    heroSection: {
        backgroundColor: colors.primary,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.9,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'space-between', 
        paddingBottom: 0,
    },
    contentContainer: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionDescription: {
        fontSize: 16,
        color: colors.darkGray,
        textAlign: 'center',
        marginBottom: 30,
    },
    currentPlanHighlight: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    plansContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: 40,
    },
    card: {
        width: '30%',
        minWidth: 280,
        borderRadius: 12,
        borderWidth: 2,
        padding: 25,
        marginHorizontal: 10,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
        justifyContent: 'space-between',
        minHeight: 550,
    },
    popularBadge: {
        position: 'absolute',
        top: -15,
        right: 20,
        backgroundColor: colors.secondary,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    popularBadgeText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    planHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    planTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    planTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 10,
    },
    planPrice: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.darkGray,
        marginBottom: 5,
    },
    billingText: {
        fontSize: 14,
        color: colors.darkGray,
    },
    featuresContainer: {
        marginVertical: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    whiteTransition: {
        height: '9%',
        backgroundColor: colors.white,
        width: '100%',
    },
    featureText: {
        fontSize: 15,
        color: colors.darkGray,
        marginLeft: 10,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '100%',
    },
    changePlanButton: {
        backgroundColor: colors.primary,
    },
    currentPlanButton: {
        backgroundColor: colors.mediumGray,
    },
    popularButton: {
        backgroundColor: colors.secondary,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    faqSection: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    faqTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    faqItem: {
        marginBottom: 20,
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    faqQuestion: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 10,
    },
    faqAnswer: {
        fontSize: 15,
        color: colors.darkGray,
        lineHeight: 22,
    },
});

export default withNavigationGuard(SubscriptionPlans);