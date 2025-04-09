import React from "react";
import { Modal, View, Text, StyleSheet, Animated, Easing } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";

const ErrorModal = ({ isVisible, message = "¡Algo salió mal!" }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="times-circle" size={60} color={colors.red} />
          </View>
          <Text style={styles.modalTitle}>Error</Text>
          <Text style={styles.modalText}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 100, 100, 0.1)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.red,
    marginBottom: 5,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
});

export default ErrorModal;
