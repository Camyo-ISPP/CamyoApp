import {View, Text} from "react-native";

function TotalFooter(props: TotalFooterProps) {
    return <>
        <View>
            <Text>Total</Text>
            <Text>
                {"€" + props.total}
            </Text>
        </View>
        {props.mode === "subscription" &&
            <Text style={{ color: "blue" }}>(Mensual, desde hoy)</Text>
        }
        {props.mode === "trial" &&
            <Text style={{ color: "blue" }}>(Mensual, desde el mes siguiente)</Text>
        }
    </>
}

interface TotalFooterProps {
    total: number
    mode: "checkout" | "subscription" | "trial"
}

export default TotalFooter