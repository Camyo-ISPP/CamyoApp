import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Móvil
import DatePickerWeb from "react-datepicker"; // Navegador
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";

const DatePicker = ({ value, onChange, iconName = "calendar-alt" }) => {
  const [showPicker, setShowPicker] = useState(false);

  const openDatePicker = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event, finalDate) => {
    setShowPicker(false);
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
      <View style={styles.inputContainer}>
        <FontAwesome5 name={iconName} size={20} style={styles.icon} />

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
    width: "100%",
    marginBottom: 15,
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
