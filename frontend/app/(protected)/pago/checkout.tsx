import {Button, TextInput, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking} from "react-native";
import {useContext, useEffect, useState} from "react";
import CartItem, {ItemData} from "../../_components/CartItem";
import TotalFooter from "../../_components/TotalFooter";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import { router, useLocalSearchParams } from "expo-router";
import { usePayment } from "@/contexts/PaymentContext";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../_components/SuccessModal";
import { Products } from "../../../utils/productDetails";
import colors from "@/assets/styles/colors";
import globalStyles from "@/assets/styles/globalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import MapLoader from "@/app/_components/MapLoader";

function IntegratedCheckout() {
    const { id, setId, ofertaId, setOfertaId } = usePayment();
    const { user, userToken } = useAuth();
    const [transactionClientSecret, setTransactionClientSecret] = useState("")
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

    useEffect(() => {
        setStripePromise(loadStripe(process.env.STRIPE_API_KEY || "pk_test_51R7E5pIRKHnhkuSfOzrm7E0goTdINnhhfLIARgpTqlr7eRzMFQD4RBvnI3qutHpKyVJCjXORTbLYYnkZq7pcub3y00GuI1VjNP",
            { locale: 'es' }
        ));
    }, [])

    const createTransactionSecret = () => {
        fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/pago/integrated", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                compra: id,
            })
        })
            .then(r => r.text())
            .then(r => {
                setTransactionClientSecret(r)
            })
    }

    const handleCancel = () => {
        setId("");
        setOfertaId(0);
        router.back();
    }

    const openTermsLink = () => {
        Linking.openURL(process.env.EXPO_PUBLIC_FRONTEND_URL + '/terminos');
    }

    const openPrivacyLink = () => {
        Linking.openURL(process.env.EXPO_PUBLIC_FRONTEND_URL + '/privacidad');
    }

    return <>
        {id === 'BASICO' || id === 'PREMIUM' || id === 'PATROCINAR' || id === 'ELIMINAR_ANUNCIOS' ?
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Finalizar compra</Text>
                </View>

                <View style={styles.twoColumnContainer}>
                    {/* Columna izquierda - Resumen del producto */}
                    <View style={styles.leftColumn}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Resumen de tu compra</Text>
                            
                            <View style={styles.planInfo}>
                                <Text style={styles.planName}>{Products.get(id).name}</Text>
                                <Text style={styles.planPrice}>{Products.get(id).price}€{id !== "PATROCINAR" && id !== "ELIMINAR_ANUNCIOS" ? "/mes" : ""}</Text>
                            </View>

                            <View style={styles.featuresList}>
                                {Products.get(id).description.split('. ').map((feature, index) => (
                                    feature && (
                                        <View key={index} style={styles.featureItem}>
                                            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                                            <Text style={styles.featureText}>{feature.trim()}</Text>
                                        </View>
                                    )
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={createTransactionSecret}
                                style={styles.initPaymentButton}
                            >
                                <Text style={styles.initPaymentButtonText}>Continuar al pago</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Columna derecha - Pasarela de pago */}
                    <View style={styles.rightColumn}>
                        {(transactionClientSecret === "" ?
                            <View style={styles.paymentPlaceholder}>
                                <Ionicons name="card" size={40} color={colors.lightGray} />
                            </View>
                            : 
                            <View style={styles.paymentSection}>
                                <Elements stripe={stripePromise} options={{ clientSecret: transactionClientSecret }}>
                                    <CheckoutForm transactionClientSecret={transactionClientSecret} plan={id} />
                                </Elements>
                            </View>
                        )}
                    </View>
                </View>

                {/* Disclaimer legal */}
                <View style={styles.legalDisclaimer}>
                    <Text style={styles.legalText}>
                        Al realizar el pago, aceptas nuestros{' '}
                        <Text style={styles.legalLink} onPress={openTermsLink}>Términos y Condiciones</Text>{' '}
                        y nuestra{' '}
                        <Text style={styles.legalLink} onPress={openPrivacyLink}>Política de Privacidad</Text>.
                        {id !== "PATROCINAR" && id !== "ELIMINAR_ANUNCIOS" ? "El pago se renovará automáticamente cada mes hasta que canceles tu suscripción." : ""}
                    </Text>
                </View>
            </ScrollView>
            :
            <View style={styles.errorContainer}>
                <Ionicons name="warning" size={40} color={colors.secondary} />
                <Text style={styles.errorTitle}>Compra no válida</Text>
                <Text style={styles.errorText}>Se ha producido un error al procesar tu compra.</Text>
                <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.errorButton}
                >
                    <Text style={styles.errorButtonText}>Volver atrás</Text>
                </TouchableOpacity>
            </View>
        }
    </>
}

const CheckoutForm = (transactionClientSecret: any) => {
    const stripe = useStripe();
    const { user, userToken, updateUser } = useAuth();
    const { setId, ofertaId } = usePayment();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: process.env.EXPO_PUBLIC_FRONTEND_URL +"/suscripcion",
            },
            redirect: "if_required",
        })
        if (result.error) {
            setError(result.error.message);
            setLoading(false);
        }
        stripe.retrievePaymentIntent(transactionClientSecret.transactionClientSecret)
        .then(function(result: any) {
            fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/pago/apply_compra", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    intent: result.paymentIntent?.id,
                    compra: transactionClientSecret.plan,
                    ofertaId: ofertaId,
                })
            })
                .then(res => {
                    if (res.status == 200) {
                        res.json().then(data => {
                            user.ads = data.ads
                            updateUser(user)
                        })
                        setSuccessModalVisible(true);
                        setTimeout(() => {
                                setSuccessModalVisible(false);
                                router.push("/");
                            }, 1000);
                    } else {
                        setError("Pago fallado. Revisa los detalles de pago e inténtalo de nuevo.")
                    }
                })
                .then(() => setLoading(false))
        });
    };

    return (
      <View style={styles.paymentFormContainer}>
          <Text style={styles.paymentTitle}>Método de pago</Text>
          
          <View style={styles.paymentElementContainer}>
              <PaymentElement />
          </View>

          <View style={styles.paymentActions}>
              <TouchableOpacity
                  disabled={!stripe || loading}
                  onPress={handleSubmit}
                  style={[styles.payButton, loading && styles.payButtonDisabled]}
              >
                  {loading ? (
                      <MapLoader />
                  ) : (
                      <>
                          <Text style={styles.payButtonText}>Confirmar pago</Text>
                          <Ionicons name="lock-closed" size={16} color={colors.white} />
                      </>
                  )}
              </TouchableOpacity>
          </View>

          {error && (
              <View style={styles.errorMessage}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
              </View>
          )}

          <SuccessModal
              isVisible={successModalVisible}
              onClose={() => setSuccessModalVisible(false)}
              message="¡Pago completado con éxito!"
          />
      </View>
  );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: colors.white,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    twoColumnContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
    },
    summaryCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 20,
    },
    planInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGray,
    },
    planPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    featuresList: {
        marginVertical: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        fontSize: 14,
        color: colors.darkGray,
        marginLeft: 10,
    },
    initPaymentButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initPaymentButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        marginRight: 10,
    },
    paymentPlaceholder: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    paymentPlaceholderText: {
        marginTop: 15,
        color: colors.lightGray,
        fontSize: 16,
        textAlign: 'center',
    },
    paymentSection: {
        flex: 1,
    },
    paymentFormContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.lightGray,
        minHeight: 400,
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 15,
    },
    paymentElementContainer: {
        marginVertical: 15,
    },
    paymentActions: {
        marginTop: 20,
    },
    payButton: {
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        marginRight: 10,
    },
    whiteTransition: {
        height: '9%',
        backgroundColor: colors.white,
        width: '100%',
    },
    errorMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 10,
        backgroundColor: colors.lightError,
        borderRadius: 6,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginLeft: 5,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.white,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 20,
        marginBottom: 10,
    },
    errorButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 15,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    errorButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    legalDisclaimer: {
        paddingHorizontal: 30,
        paddingVertical: 20,
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    legalText: {
        fontSize: 12,
        color: colors.darkGray,
        textAlign: 'center',
        lineHeight: 18,
    },
    legalLink: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
});

export default IntegratedCheckout;