import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from "../../../contexts/AuthContext";
import { Entypo } from '@expo/vector-icons';
import colors from "frontend/assets/styles/colors";
import { useRouter } from 'expo-router';
import SuccessModal from '../SuccessModal';
import defaultImageEmpresa from "../../../assets/images/empresa.jpg";
import defaultImageCamionero from "../../../assets/images/camionero.png";

const ProfileDropdown = ({ user }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de pregunta de confirmación
  const [successModalVisible, setSuccessModalVisible] = useState(false); // Estado para el modal de éxito de cierre de sesión

  const router = useRouter();
  const { logout } = useAuth();

  const defaultImage = user.rol === 'EMPRESA' ? defaultImageEmpresa : defaultImageCamionero;

  const handleLogout = () => {
    setModalVisible(false);

    logout();
  };

  return (
    <View style={styles.container}>
      {/* Foto de perfil */}
      <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
        <Image
          source={user.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Dropdown */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <Entypo
            name="cross"
            size={20}
            color={colors.primary}
            style={styles.crossIcon}
            onPress={() => setDropdownVisible(false)}
          />
          <Image
            source={user.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
            style={styles.avatarDropdown}
          />

          <Text style={styles.dropdownRole}>{user.rol}</Text>
          <Text style={styles.dropdownHeader}>¡Hola, {user.nombre}!</Text>
          <Text style={styles.dropdownEmail}>{user.email}</Text>

          {user.rol !== 'ADMIN' && (
            <TouchableOpacity style={styles.dropdownButton} onPress={() => router.push("/miperfil")} >
              <Text style={styles.dropdownButtonText}>Ver Perfil</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.dropdownButtonText2}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  avatarDropdown: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    display: 'flex',
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  dropdownHeader: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  dropdownEmail: {
    fontSize: 12,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 5,
  },
  dropdownRole: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    borderRadius: 15,
  },
  dropdownButton: {
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    backgroundColor: colors.secondary,
    color: colors.white,
    minWidth: 150,
    padding: 4,
    fontWeight: '500',
    textAlign: 'center',
    borderRadius: 40,
  },
  dropdownButtonText2: {
    fontSize: 14,
    backgroundColor: colors.primary,
    color: colors.white,
    minWidth: 150,
    padding: 4,
    fontWeight: '500',
    textAlign: 'center',
    borderRadius: 40,
  },
  crossIcon: {
    alignSelf: 'flex-end',
    marginRight: 4,
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
