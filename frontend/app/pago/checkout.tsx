import {Button, TextInput, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView} from "react-native";
import {useContext, useEffect, useState} from "react";
import CartItem, {ItemData} from "../_components/CartItem";
import TotalFooter from "../_components/TotalFooter";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import { router, useLocalSearchParams } from "expo-router";
import { usePayment } from "@/contexts/PaymentContext";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import { Products } from "../../utils/productDetails";
import colors from "@/assets/styles/colors";
import globalStyles from "@/assets/styles/globalStyles";

function IntegratedCheckout() {
    const { id, setId } = usePayment();
    const { user, userToken } = useAuth();
    const [transactionClientSecret, setTransactionClientSecret] = useState("")
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

    useEffect(() => {
        // Make sure to call `loadStripe` outside of a component’s render to avoid
        // recreating the `Stripe` object on every render.
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
        router.back();
    }

    return <>
        {id === 'BASICO' || id === 'PREMIUM' ?
          <ScrollView contentContainerStyle={globalStyles.container}> 
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Finalizar compra</Text>
                <View style={styles.card}>
                    <Text style={styles.username}>Vas a realizar la siguiente compra:</Text>
                    <Text style={styles.info}>{Products.get(id).name}</Text>
                    <Text style={styles.info}>{Products.get(id).description}</Text>
                    <Text style={styles.info}>Precio: {Products.get(id).price}€</Text>
                    <View style={styles.contentWrapper}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                onPress={createTransactionSecret}
                                style={[styles.startButton]}
                            >
                                <Text style={styles.buttonText}>
                                    Iniciar pago
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={[styles.button]}
                            >
                                <Text style={styles.buttonText}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {(transactionClientSecret === "" ?
                        <></>
                        : <Elements stripe={stripePromise} options={{clientSecret: transactionClientSecret}}>
                            <CheckoutForm transactionClientSecret={transactionClientSecret} plan={id}/>
                        </Elements>)}
                    
                </View>
            </View>
          </ScrollView>

            :

            <View>
                <Text>Compra no válida</Text>
                <Text>Se ha producido un error intentando realizar la compra.</Text>
            </View>
        }
        
    </>
}

const CheckoutForm = (transactionClientSecret: any) => {
    const stripe = useStripe();
    const { user, userToken } = useAuth();
    const { setId } = usePayment();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [error, setError] = useState(null)

    const handleSubmit = async () => {
        setLoading(true);
        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:8081/miperfil",
            },
            redirect: "if_required",
        })
        if (result.error) {
            console.log(result.error.message);
            setLoading(false);
        }
        stripe.retrievePaymentIntent(transactionClientSecret.transactionClientSecret)
        .then(function(result: any) {
            fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/pago/apply_subscription", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    intent: result.paymentIntent?.id,
                    compra: transactionClientSecret.plan,
                })
            })
                .then(res => {
                    if (res.status == 200) {
                        setSuccessModalVisible(true);
                        setTimeout(() => {
                                setSuccessModalVisible(false);
                                router.replace("/");
                            }, 1000);
                    } else {
                        const data = res.json();
                        console.log(res);
                        setError(data.message);
                    }
                })
                .then(() => setLoading(false))
                .then(() => setId(""))
        });
        
    };

    return <>
        <View>
          <View style={styles.separator} />
          <PaymentElement/>
          <View style={styles.separator} />
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              disabled={!stripe || loading}
              onPress={handleSubmit}
              style={styles.payButton}
            >
              <Text style={styles.buttonText}>
                  Pagar
              </Text>
            </TouchableOpacity>
        </View>
        <Text>{error}</Text>
        <SuccessModal
          isVisible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          message="¡Pago exitoso! Redirigiendo..."
        />
      </View>
    </>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginTop: 20,
    paddingTop: 70,
    minHeight: "100%",
  },
  card: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    elevation: 6,
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonWrapper: {
    width: "45%",
    alignSelf: "center",
  },
  username: {
    fontSize: 18,
    color: colors.darkGray,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 6,
  },
  info: {
    fontSize: 16,
    color: colors.darkGray,
    marginVertical: 4,
  },
  description: {
    fontSize: 15,
    color: colors.darkGray,
    marginTop: 6,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingLeft: 5,
    paddingRight: 5,
    flexDirection: "row",
    flexWrap: "nowrap",
    height: 40,
    width: "50%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  startButton: {
    backgroundColor: colors.secondary,
    color: colors.white,
    paddingLeft: 5,
    paddingRight: 5,
    flexDirection: "row",
    flexWrap: "nowrap",
    height: 40,
    width: "50%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  payButton: {
    backgroundColor: colors.secondary,
    color: colors.white,
    marginTop: 20,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold"
  },
  contentWrapper: {
      width: "90%",
      alignSelf: "center",
  },
  tabContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
      marginTop: 30,
      marginBottom: 20,
      gap: 10
  },
});

export default IntegratedCheckout