import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Animated, Dimensions, Platform } from 'react-native';
import { useAuth } from "../../../contexts/AuthContext";
import { Entypo } from '@expo/vector-icons';
import colors from "frontend/assets/styles/colors";
import { useRouter } from 'expo-router';
import SuccessModal from '../SuccessModal';
import defaultImageEmpresa from "../../../assets/images/empresa.jpg";
import defaultImageCamionero from "../../../assets/images/camionero.png";

const ProfileDropdown = ({ user }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { logout } = useAuth();

  const defaultImage = user.rol === 'EMPRESA' ? defaultImageEmpresa : defaultImageCamionero;

  // Cerrar dropdown al hacer clic fuera (solo para web)
  useEffect(() => {
    if (dropdownVisible) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownVisible(false);
        }
      };

      if (Platform.OS === 'web') {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        if (Platform.OS === 'web') {
          document.removeEventListener('mousedown', handleClickOutside);
        }
      };
    }
  }, [dropdownVisible]);

  // Animación de entrada/salida
  useEffect(() => {
    if (dropdownVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [dropdownVisible, fadeAnim]);

  const handleLogout = () => {
    setModalVisible(false);
    setSuccessModalVisible(true);
    setTimeout(() => {
      logout();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={0.8}
      >
        <Image
          source={user.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Dropdown con animación */}
      {dropdownVisible && (
        <Animated.View 
          ref={dropdownRef}
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setDropdownVisible(false)}
            activeOpacity={0.7}
          >
            <Entypo name="cross" size={20} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Image
              source={user.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
              style={styles.avatarDropdown}
            />
            <View style={styles.badge}>
              <Text style={styles.dropdownRole}>{user.rol}</Text>
            </View>
          </View>

          <Text style={styles.dropdownHeader}>¡Hola, {user.nombre}!</Text>
          <Text style={styles.dropdownEmail}>{user.email}</Text>

          <View style={styles.buttonsContainer}>
            {user.rol !== 'ADMIN' && (
              <TouchableOpacity 
                style={[styles.dropdownButton, styles.profileButton]}
                onPress={() => {
                  setDropdownVisible(false);
                  router.push("/miperfil");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownButtonText}>Ver Perfil</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.dropdownButton, styles.logoutButton]}
              onPress={() => {
                setModalVisible(true);
                setDropdownVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Modal de confirmación */}
    {/* Modal de confirmación */}
    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>¿Estás seguro/a de que quieres cerrar sesión?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogout} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de éxito de cierre de sesión*/}
      <SuccessModal
        isVisible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        message={<Text>¡Hasta pronto!{'\n'}Cerrando sesión...</Text>}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 1000,

  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  avatarDropdown: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
    marginLeft: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 250,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    marginTop: 8,
  },
  dropdownHeader: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  dropdownEmail: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  dropdownRole: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
    color: colors.gray,
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 10,
  },
  dropdownButton: {
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: colors.secondary,
  },
  logoutButton: {
    backgroundColor: colors.primary,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  // Estilos del Modal
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileDropdown;