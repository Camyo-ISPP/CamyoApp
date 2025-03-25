import {Button, TextInput, View, Text} from "react-native";
import {useContext, useEffect, useState} from "react";
import CartItem, {ItemData} from "../_components/CartItem";
import TotalFooter from "../_components/TotalFooter";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import { router, useLocalSearchParams } from "expo-router";
import { usePayment } from "@/contexts/PaymentContext";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import { Products } from "./productDetails";

function IntegratedCheckout() {
    const { id, setId } = usePayment();
    const { user, userToken } = useAuth();
    const [transactionClientSecret, setTransactionClientSecret] = useState("")
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

    useEffect(() => {
        // Make sure to call `loadStripe` outside of a component’s render to avoid
        // recreating the `Stripe` object on every render.
        setStripePromise(loadStripe(process.env.STRIPE_API_KEY || "pk_test_51R1s9PC8z1doGFyHZ51UNEI7OrBTwMv1qCYeJp8WTdeTsroq1ARp16l16jc3eYBKCo9F0e0RECGQrV7dLDlvedST00xEdKOpRl",
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
            <View>
                <View style={{ marginTop: '100px' }}>
                    <Text>Compra</Text>
                    <Text>Vas a realizar la siguiente compra:</Text>
                    <Text>{Products.get(id).name}</Text>
                    <Text>{Products.get(id).description}</Text>
                    <TotalFooter total={Products.get(id).price} mode={"subscription"}/>
                    <Button onPress={createTransactionSecret} title="Iniciar pago"/>

                    {(transactionClientSecret === "" ?
                        <></>
                        : <Elements stripe={stripePromise} options={{clientSecret: transactionClientSecret}}>
                            <CheckoutForm transactionClientSecret={transactionClientSecret} plan={id}/>
                        </Elements>)}
                    
                    <Button onPress={handleCancel} title="Cancelar"/>
                </View>
            </View>

            :

            <View>
                <Text>Plan no válido</Text>
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
        .then(function(result) {
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
                        alert(res.body)
                    }
                })
                .then(() => setLoading(false))
                .then(() => setId(""))
        });
        
    };

    return <>
        <View>
            <PaymentElement/>
            <Button disabled={!stripe || loading} onPress={handleSubmit} title="Pagar"/>
            <SuccessModal
                isVisible={successModalVisible}
                onClose={() => setSuccessModalVisible(false)}
                message="¡Pago exitoso! Redirigiendo..."
            />
        </View>
    </>
}

export default IntegratedCheckout