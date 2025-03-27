import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

// Selector de opciones Sí / No para formularios que requieran una respuesta booleana
const BooleanSelector = ({ value, onChange, colors, globalStyles }) => {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
      {[true, false].map((opcion) => (
        <TouchableOpacity
          key={opcion.toString()}
          style={[
            globalStyles.userTypeButton,
            value === opcion
              ? { backgroundColor: opcion ? colors.green : colors.red, borderRadius: 8, padding: 10 }
              : { backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.mediumGray, borderRadius: 8, padding: 10 }
          ]}
          onPress={() => onChange(opcion)}
        >
          <Text style={{ fontSize: 16, color: value === opcion ? colors.white : colors.secondary }}>
            {opcion ? "Sí" : "No"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BooleanSelector;
