import React, { useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform, Animated, Easing, ActivityIndicator } from "react-native";
import colors from "frontend/assets/styles/colors";
import CamyoWebNavBar from "../_components/CamyoNavBar";
import BottomBar from "../_components/BottomBar";
import Titulo from "../_components/Titulo";
import Ionicons from "@expo/vector-icons/Ionicons";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import EmpresaRoute from "@/security/EmpresaRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";


const SubscriptionPlans = () => {

    const { user, userToken } = useAuth();
    const router = useRouter();
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    useEffect(() => {
        if (user === undefined) {
          return;
        }
    
        setIsAuthLoaded(true);
    
    }, [user]);
    
    useEffect(() => {
        if (!isAuthLoaded) {
          return;
        }
    
        if (user === undefined) {
          return; 
        }
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
      
    if (!isAuthLoaded) {
        return (
          <View>
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
                alert(`¡Tu plan ha sido cambiado a ${formatPlanLevel(planLevel)}!`);
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
          case "GRATIS":
            return "GRATIS";
          case "BASIC":
            return "BÁSICO";
          case "PREMIUM":
            return "PREMIUM";
          default:
            return plan;
        }
      };

    const getPlanIcon = (planLevel: string) => {
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
    };

    const PlanCard: React.FC<{
        title: string;
        price: string;
        description: string;
        borderColor: string;
        planLevel: string;
        currentPlan: string;
        onChangePlan: (planLevel: string) => void;
        }> = ({ title, price, description, borderColor, planLevel, currentPlan, onChangePlan }) => {
    
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
                    onPress={() => onChangePlan(planLevel)}
                >
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <EmpresaRoute>
            {Platform.OS === 'web' ? (
                <View style={styles.webContainer}>
                    <CamyoWebNavBar />
                    <ScrollView contentContainerStyle={styles.scrollview}>
                        <Text style={styles.sectionTitle}>Planes de suscripción</Text>
                        <View style={styles.cardsContainer}>
                            <PlanCard
                                title="GRATIS"
                                price="0€"
                                description="Ofertas limitadas con datos incompletos."
                                borderColor={colors.primary}
                                planLevel="GRATIS"
                                currentPlan={currentPlan}
                                onChangePlan={handleChangePlan}
                            />
                            <PlanCard
                                title="BÁSICO"
                                price="24.99€"
                                description="Permite publicar hasta 10 ofertas de empleo con datos completos."
                                borderColor={colors.primary}
                                planLevel="BASIC"
                                currentPlan={currentPlan}
                                onChangePlan={handleChangePlan}
                            />
                            <PlanCard
                                title="PREMIUM"
                                price="49.99€"
                                description="Permite publicar un número ilimitado de ofertas con datos completos."
                                borderColor={colors.primary}
                                planLevel="PREMIUM"
                                currentPlan={currentPlan}
                                onChangePlan={handleChangePlan}
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
                                onChangePlan={handleChangePlan}
                            />
                            <PlanCard
                                title="BÁSICO"
                                price="24.99€"
                                description="Permite publicar hasta 10 ofertas de empleo con datos completos."
                                borderColor={colors.primary}
                                planLevel="BASIC"
                                currentPlan={currentPlan}
                                onChangePlan={handleChangePlan}
                            />
                            <PlanCard
                                title="PREMIUM"
                                price="49.99€"
                                description="Permite publicar un número ilimitado de ofertas con datos completos."
                                borderColor={colors.primary}
                                planLevel="PREMIUM"
                                currentPlan={currentPlan}
                                onChangePlan={handleChangePlan}
                            />
                        </View>
                    </ScrollView>
                    <BottomBar />
                </View>
            )}
        </EmpresaRoute>
    );
};

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
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.secondary,
        marginBottom: 15,
        marginTop: 15,
        textAlign: "center",
    },
});

export default withNavigationGuard(SubscriptionPlans);