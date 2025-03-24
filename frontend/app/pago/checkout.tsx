import {Button, TextInput, View, Text} from "react-native";
import {useContext, useEffect, useState} from "react";
import CartItem, {ItemData} from "../_components/CartItem";
import TotalFooter from "../_components/TotalFooter";
import {Products} from './datosdeprueba'
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import { useLocalSearchParams } from "expo-router";
import { usePayment } from "@/contexts/PaymentContext";

function IntegratedCheckout() {
    const {id} = usePayment();
    const [transactionClientSecret, setTransactionClientSecret] = useState("")
    const params = useLocalSearchParams();
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

    useEffect(() => {
        // Make sure to call `loadStripe` outside of a component’s render to avoid
        // recreating the `Stripe` object on every render.
        setStripePromise(loadStripe(process.env.STRIPE_API_KEY || "pk_test_51R1s9PC8z1doGFyHZ51UNEI7OrBTwMv1qCYeJp8WTdeTsroq1ARp16l16jc3eYBKCo9F0e0RECGQrV7dLDlvedST00xEdKOpRl"));

    }, [])

    const createTransactionSecret = () => {
        fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/pago/integrated", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                compra: params.plan,
            })
        })
            .then(r => r.text())
            .then(r => {
                setTransactionClientSecret(r)
            })
    }

    return <>
        {params.plan === 'BASICO' || params.plan === 'PREMIUM' ?
            <View>
                <View style={{ marginTop: '100px' }}>
                    <Text>Integrated Checkout Example</Text>
                    <Text>{id}</Text>
                    <TotalFooter total={params.plan === 'BASICO' ? 24.99 : 49.99} mode={"subscription"}/>
                    <Button onPress={createTransactionSecret} title="Iniciar pago"/>

                    {(transactionClientSecret === "" ?
                        <></>
                        : <Elements stripe={stripePromise} options={{clientSecret: transactionClientSecret}}>
                            <CheckoutForm transactionClientSecret={transactionClientSecret} plan={params.plan}/>
                        </Elements>)}
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

const CheckoutForm = (transactionClientSecret: any, plan: any) => {
    const stripe = useStripe();
    const elements = useElements();
    const handleSubmit = async () => {
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
        }
        stripe.retrievePaymentIntent(transactionClientSecret.transactionClientSecret)
        .then(function(result) {
            fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/pago/apply_subscription", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    intent: result.paymentIntent?.id,
                    compra: transactionClientSecret.plan,
                })
            })
                .then(res => console.log(res))
        });
        
    };

    return <>
        <View>
            <PaymentElement/>
            <Button disabled={!stripe} onPress={handleSubmit} title="Pagar"/>
        </View>
    </>
}

export default IntegratedCheckout