import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";

const SuccessModal = ({ isVisible, onClose, message = "¡Operación exitosa!" }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <FontAwesome5 name="check-circle" size={50} color="white" style={styles.modalIcon} />
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: colors.green,
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});

export default SuccessModal;
