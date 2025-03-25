import React, { useState } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Móvil
import DatePickerWeb from "react-datepicker"; // Navegador
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
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
      onChange(format(finalDate, "dd-MM-yyyy", { locale: es }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Selecciona una fecha";
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy", { locale: es });
  };

  const parseDate = (dateString) => {
    if (!dateString) return new Date();
  
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  
    return new Date(dateString);
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name={iconName} size={20} style={styles.icon} />
        {Platform.OS === "web" ? (
          <DatePickerWeb
            selected={value ? parseDate(value) : new Date()}
            onChange={(date) => onChange(format(date, "dd-MM-yyyy", { locale: es }))} 
            dateFormat="dd-MM-yyyy"
            locale={es}
            className="react-datepicker"
            popperPlacement="top-start"
            portalId="root-portal"
            customInput={<Text style={styles.dateText}>{value || "Selecciona una fecha"}</Text>}
          />
        ) : (
          <TouchableOpacity onPress={openDatePicker} style={styles.datePickerButton}>
            <Text style={styles.dateText}>{formatDate(value) || "Selecciona una fecha"}</Text>
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
