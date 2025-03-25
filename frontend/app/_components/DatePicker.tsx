import React, { useState } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Móvil
import DatePickerWeb from "react-datepicker"; // Navegador
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";

const DatePicker = ({ label, value, onChange, iconName = "calendar-alt" }) => {
  const [showPicker, setShowPicker] = useState(false);

  const openDatePicker = () => {
    if (Platform.OS !== "web") {
      setShowPicker(true);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    const finalDate = Platform.OS === 'android' ? new Date(event.nativeEvent.timestamp) : selectedDate;
    if (finalDate) {
      onChange(finalDate.toISOString().split("T")[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name={iconName} size={20} style={styles.icon} />
        {Platform.OS === "web" ? (
          <DatePickerWeb
            selected={value ? new Date(value) : new Date()}
            onChange={(date) => onChange(date ? date.toISOString().split("T")[0] : null)}
            dateFormat="dd-MM-yyyy"
            locale={es}
            className="react-datepicker"
            popperPlacement="top-start"
            portalId="root-portal"
            customInput={<Text style={styles.dateText}>{value || "Selecciona una fecha"}</Text>}
          />
        ) : (
          <TouchableOpacity onPress={openDatePicker} style={styles.datePickerButton}>
            <Text style={styles.dateText}>{value || "Selecciona una fecha"}</Text>
          </TouchableOpacity>
        )}
        {showPicker && (
          <DateTimePicker
            value={value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.secondary,
    marginLeft: 8,
    marginBottom: -6,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: 5,
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    height: 40,
  },
  icon: {
    color: colors.primary,
  },
  dateText: {
    flex: 1,
    paddingLeft: 8,
    color: colors.secondary,
    textAlignVertical: "center",
  },
  datePickerButton: {
    flex: 1,
    justifyContent: "center",
  },
});

export default DatePicker;
