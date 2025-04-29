import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Entypo, FontAwesome, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from "frontend/assets/styles/colors";
import { router } from 'expo-router';
import { useAuth } from "../../../contexts/AuthContext";

const OptionsDropdown = () => {
  const { user } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !event.target.closest('[data-menu-button]')) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: dropdownVisible ? 1 : 0,
      duration: dropdownVisible ? 200 : 150,
      useNativeDriver: true,
    }).start();
  }, [dropdownVisible, fadeAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={0.8}
        style={styles.menuButton}
        data-menu-button="true"
      >
        <FontAwesome name="bars" size={18} color={colors.secondary} />
        <Text style={styles.menuText}>Menú</Text>
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
            onPress={() => setDropdownVisible(false)} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Entypo name="cross" size={20} color={colors.primary} />
          </TouchableOpacity>

          {user && user.rol === "ADMIN" && (
            <DropdownButton 
              icon={<FontAwesome5 name="wrench" size={18} color={colors.secondary} />}
              text="Admin"
              onPress={() => {
                setDropdownVisible(false);
                router.push('/admin');
              }}
            />
          )}

          <DropdownButton 
            icon={<MaterialIcons name="domain" size={20} color={colors.secondary} />}
            text="Empresas"
            onPress={() => {
              setDropdownVisible(false);
              router.push('/empresas');
            }}
          />

          <DropdownButton 
            icon={<MaterialIcons name="search" size={20} color={colors.secondary} />}
            text="Ofertas"
            onPress={() => {
              setDropdownVisible(false);
              router.push('/explorar');
            }}
          />

          {user && user.rol !== "ADMIN" && (
            <DropdownButton 
              icon={<MaterialIcons name="work" size={20} color={colors.secondary} />}
              text="Mis ofertas"
              onPress={() => {
                setDropdownVisible(false);
                router.push('/misofertas');
              }}
            />
          )}

          {user && user.rol !== "ADMIN" && (
            <DropdownButton 
              icon={<MaterialIcons name="sms" size={20} color={colors.secondary} />}
              text="Mis mensajes"
              onPress={() => {
                setDropdownVisible(false);
                router.push('/chat');
              }}
            />
          )}

          {user?.rol === "EMPRESA" && (
            <DropdownButton 
              icon={<MaterialIcons name="sell" size={20} color={colors.secondary} />}
              text="Suscripción"
              onPress={() => {
                setDropdownVisible(false);
                router.push('/suscripcion');
              }}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
};

const DropdownButton = ({ icon, text, onPress }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={styles.dropdownButton}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <Text style={styles.dropdownButtonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 220,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
});

export default OptionsDropdown;