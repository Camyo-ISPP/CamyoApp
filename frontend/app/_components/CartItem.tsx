import {Button, Image, Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking, Alert, Modal} from "react-native";
import colors from "frontend/assets/styles/colors";

function CartItem(props: CartItemProps) {
    return (
    <View style={styles.card}>
        <Image
            src={props.data.image}
        />
        <View>
            <View>
                <View style={{ alignItems: 'flex-start' }}>
                    <Text>{props.data.name}</Text>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text>
                            {props.data.description}
                        </Text>
                        {(props.mode === "checkout" ? <Text>
                            {"Quantity: " + props.data.quantity}
                        </Text> : <></>)}
                    </View>
                </View>
            </View>

            <View>
                <View style={{ alignItems: 'flex-start' }}>
                    <Text>
                        {"$" + props.data.price}
                    </Text>
                </View>
            </View>
        </View>
    </View>
    )
}

export interface ItemData {
    name: string
    price: number
    quantity: number
    image: string
    description: string
    id: string
}

interface CartItemProps {
    data: ItemData
    mode: "subscription" | "checkout"
    onCancelled?: () => void
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e6e8e6',
        paddingVertical: 20,
        paddingTop: Platform.OS === "web" ? '5.8%' : '0%',
        
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    card: {
        width: Platform.OS === "web" ? '60%' : '100%',
        marginHorizontal: '15%',
        padding: Platform.OS === "web" ? 20 : 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    headerText: {
        flex: 1,
    },
    title: {
        paddingTop: Platform.OS === "web" ? 0 : 10,
        fontSize: 34,
        fontWeight: 'bold',
    }
})

export default CartItem