import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import colors from "frontend/assets/styles/colors";
import { router } from 'expo-router';
import { useAuth } from "../../contexts/AuthContext";

const OptionsDropdown = () => {
  const { user } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
      <View style={styles.container}>
        {/* 3 lines */}
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <FontAwesome name="bars" size={20} color={colors.secondary}/>
        </TouchableOpacity>

        {/* Dropdown */}
        {dropdownVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity onPress={() => setDropdownVisible(false)} style={styles.closeButton}>
                <Entypo name="cross" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/empresas')} style={styles.dropdownButton}>
                <MaterialIcons name="domain" size={20} style={styles.dropdownButtonIcon} />
                <Text style={styles.dropdownButtonText}>Empresas</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/buscar-ofertas')} style={styles.dropdownButton}>
                <MaterialIcons name="search" size={20} style={styles.dropdownButtonIcon} />
                <Text style={styles.dropdownButtonText}>Ofertas</Text>
              </TouchableOpacity>

              {user && user.rol !== "ADMIN" && (
                <TouchableOpacity onPress={() => router.push('/misofertas')} style={styles.dropdownButton}>
                  <MaterialIcons name="work" size={20} style={styles.dropdownButtonIcon} />
                  <Text style={styles.dropdownButtonText}>Mis ofertas</Text>
                </TouchableOpacity>
              )}

              {user && user.rol !== "ADMIN" && (
                <TouchableOpacity onPress={() => router.push('/chat/list')} style={styles.dropdownButton}>
                  <MaterialIcons name="sms" size={20} style={styles.dropdownButtonIcon} />
                  <Text style={styles.dropdownButtonText}>Mis mensajes</Text>
                </TouchableOpacity>
              )}

              {user?.rol === "EMPRESA" && (
                <TouchableOpacity onPress={() => router.replace('/suscripcion')} style={styles.dropdownButton}>
                  <MaterialIcons name="sell" size={20} style={styles.dropdownButtonIcon} />
                  <Text style={styles.dropdownButtonText}>Suscripción</Text>
                </TouchableOpacity>
              )}

            </View>
        )}
      </View >
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 160,
    marginTop: 15,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginTop: 15,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.secondary,
    paddingHorizontal: 4,    
  },
  dropdownButtonIcon: {
    width: 24,
    color: colors.secondary,
  },
  closeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
  }
});

export default OptionsDropdown;