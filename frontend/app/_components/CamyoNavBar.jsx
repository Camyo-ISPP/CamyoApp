import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from "react-native";
import colors from "frontend/assets/styles/colors";
import React, { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
const ProyectoLogo = require('../../assets/images/camyoV1.png');
import routes from "./routes";
import PerfilDropdown from "./ProfileDropdown";
import OptionsDropdown from "./OptionsDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';


export default function CamyoWebNavBar({ onSearch }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 1140);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateSize = () => {
      setIsCompact(Dimensions.get("window").width < 1140);
    };
    Dimensions.addEventListener("change", updateSize);
    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  const handleSearch = () => {
    onSearch(searchQuery); 
    setSearchQuery("");
  };

  return (
    <LinearGradient colors={["rgba(220, 220, 220, 1)", "rgba(0, 0, 0, 0)"]}  style={styles.headerWeb}>
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={ProyectoLogo} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput} placeholder="Buscar ofertas..." placeholderTextColor={colors.lightGray} value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch}/>
            <TouchableOpacity onPress={handleSearch}><FontAwesome name="search" size={20} color="black" style={styles.searchIcon} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
        {isCompact ? (
            <OptionsDropdown />
          ) : (
            <>
              {user?.rol === "EMPRESA" && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => router.push("/suscripcion")}
                    >
                      <Text style={styles.buttonText}>Suscripción</Text>
                    </TouchableOpacity>
                    <View style={styles.dot} />
                  </>
              )}
              {!(!user || !user.rol) && (
                  <>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/chat/list')}>
                          <Text style={styles.buttonText}>Mis Mensajes</Text>
                    </TouchableOpacity>
                    <View style={styles.dot} />
                  </>
              )}
              <TouchableOpacity style={styles.button} onPress={() => router.push(routes.listcompanies)}>
                <Text style={styles.buttonText}>Empresas</Text>
              </TouchableOpacity>
            </>
          )}
          <View style={styles.dot} />
          {user ? (
            <PerfilDropdown user={user} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => router.push(routes.login)}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerWeb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 20,
    paddingBottom: 30,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
    paddingBottom:10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    width: 3,
    height: 50,
    backgroundColor: colors.primary,
    marginHorizontal: 20,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 25,
    backgroundColor: colors.primary,
    marginHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 5,
    margin: 3
  },
  searchInput: {
    flex: 1,
    padding: 7,
    borderRadius: 50,
    outlineStyle: "none",
  },
  searchIcon: {
    color: colors.primary,
    marginRight: 7,
  },
  button: {
    paddingVertical: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 15,
  },
  logo: {
    width: 80,
    height: 60,
    aspectRatio: 1,
  }
});
