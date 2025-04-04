import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from "react-native";
import colors from "frontend/assets/styles/colors";
import React, { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
const ProyectoLogo = require('../../../assets/images/camyoV1.png');
import PerfilDropdown from "./ProfileDropdown";
import OptionsDropdown from "./OptionsDropdown";
import { useAuth } from "../../../contexts/AuthContext";

export default function CamyoWebNavBar({ onSearch }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 1600);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateSize = () => {
      setIsCompact(Dimensions.get("window").width < 1600);
    };
    Dimensions.addEventListener("change", updateSize);
    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  const handleSearch = () => {
    onSearch(searchQuery); 
    setSearchQuery("");
  };

  return (
    <View style={styles.headerWeb}>
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={ProyectoLogo} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.searchContainer}>
          <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar ofertas..." 
              placeholderTextColor={colors.lightGray} 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              onSubmitEditing={handleSearch}
              selectionColor={colors.primary}
              cursorColor={colors.primary} 
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <FontAwesome name="search" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
          {isCompact ? (
            <OptionsDropdown />
          ) : (
            <>
              {user?.rol === "EMPRESA" && (
                <>
                  <NavButton 
                    text="Suscripción" 
                    onPress={() => router.push("/suscripcion")} 
                  />
                  <NavSeparator />
                </>
              )}
              {user && user.rol !== "ADMIN" && (
                <>
                  <NavButton 
                    text="Mis Mensajes" 
                    onPress={() => router.push('/chat')} 
                  />
                  <NavSeparator />
                  <NavButton 
                    text="Mis Ofertas" 
                    onPress={() => router.push('/misofertas')} 
                  />
                  <NavSeparator />
                </>
              )}
              <NavButton 
                text="Explorar Ofertas" 
                onPress={() => router.push("/explorar")} 
              />
              <NavSeparator />
              <NavButton 
                text="Explorar Empresas" 
                onPress={() => router.push("/empresas")} 
              />
            </>
          )}
          <NavSeparator />
          {user ? (
            <PerfilDropdown user={user} />
          ) : (
            <NavButton 
              text="Iniciar Sesión" 
              onPress={() => router.push("/login")} 
              isPrimary
            />
          )}
        </View>
      </View>
    </View>
  );
};

// Helper components for cleaner code
const NavButton = ({ text, onPress, isPrimary = false }) => (
  <TouchableOpacity 
    style={[styles.button, isPrimary && styles.primaryButton]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, isPrimary && styles.primaryButtonText]}>
      {text}
    </Text>
  </TouchableOpacity>
);

const NavSeparator = () => <View style={styles.dot} />;

const styles = StyleSheet.create({
  headerWeb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
    maxWidth: 1400,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  separator: {
    width: 2,
    height: 40,
    backgroundColor: colors.lightGray,
    marginHorizontal: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    outlineStyle: 'none',
  },
  searchButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 0,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: colors.secondary,
    fontWeight: "700",
    fontSize: 16,
  },
  primaryButtonText: {
    color: colors.white,
  },
  logo: {
    width: 90,
    height: 50,
    aspectRatio: 1,
  }
});