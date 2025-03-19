import {ItemData} from "./CartItem";
import {Button, TextInput, View} from "react-native";
import {useState} from "react";

function CustomerDetails(props: CustomerDetailsProp) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const onCustomerNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value)
    }



    const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(ev.target.value)
    }

    const initiatePayment = () => {
        // TODO: Cambiar fetch para que sea como el resto
        fetch(process.env.EXPO_PUBLIC_BACKEND_URL + props.endpoint, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: props.data.map(elem => ({name: elem.name, id: elem.id})),
                customerName: name,
                customerEmail: email,
            })
        })
            .then(r => r.text())
            .then(r => {
                window.location.href = r
            })

    }

    return <>
        <View>
            <TextInput placeholder='Customer Name' onChangeText={setName} value={name}/>
            <TextInput placeholder='Customer Email' onChangeText={setEmail} value={email}/>
            <Button onPress={initiatePayment} title="Checkout"/>
        </View>
    </>
}

interface CustomerDetailsProp {
    data: ItemData[]
    endpoint: string
}

export default CustomerDetails
