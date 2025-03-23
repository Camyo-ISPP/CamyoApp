import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, Animated, Dimensions, ScrollView, TouchableWithoutFeedback } from "react-native";
import colors from "frontend/assets/styles/colors";
import React, { useEffect, useState, useRef } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const ProyectoLogo = require('frontend/assets/images/camyo.png');
import routes from "./routes";
import PerfilDropdown from "./ProfileDropdown";
import { useAuth } from "../../contexts/AuthContext";


export default function CamyoWebNavBar({ onSearch }) {
  const { user, userToken, logout } = useAuth();
  const router = useRouter();
  const [isSidebar, setIsSidebar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    const handleResize = () => {
      const zoomLevel = window.devicePixelRatio * 100;
      setIsSidebar(zoomLevel >= 230);
      if (zoomLevel < 230) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebarOpen ? 0 : -Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSearch = () => {
    onSearch(searchQuery); 
  };

  return (
    <>
      {isSidebar ? (
        <>
          {isSidebarOpen && (
            <TouchableWithoutFeedback onPress={() => setIsSidebarOpen(false)}>
              <View style={[styles.overlay, styles.overlayVisible]} />
            </TouchableWithoutFeedback>
          )}
          <View style={styles.headerWebZoomed}>
            <View style={[styles.leftSection, isZoomed && styles.centerSection]}>
              <TouchableOpacity onPress={toggleSidebar}>
                <Ionicons name="menu" size={30} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Image source={ProyectoLogo} style={styles.logoZoomed} resizeMode="cover" />
            </TouchableOpacity>
          </View>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
            <ScrollView>
              
              <View style={styles.searchWebZoom}>
                <TextInput
                  style={styles.searchInputWebZoom}
                  placeholder="Buscar"
                  placeholderTextColor={colors.secondary}
                />
                <TouchableOpacity><FontAwesome name="search" size={12} color="black" style={styles.searchIconZoom} /></TouchableOpacity>
              </View>
              

              {user ? (
                <TouchableOpacity style={styles.shareButtonZoomed2} onPress={() => logout()}><Text style={styles.shareTextZoom1}>Cerrar Sesión</Text></TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.shareButtonZoomed1} onPress={() => router.push(routes.login)}><Text style={styles.shareTextZoom1}>Iniciar Sesión</Text></TouchableOpacity>
    
                </>
              )}


            </ScrollView>
          </Animated.View>
        </>
      ) : (
        <>
          <View style={styles.headerWeb}>
            <View style={[styles.leftSection, isZoomed && styles.centerSection]}>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Image source={ProyectoLogo} style={styles.logoZoomed} resizeMode="cover" />
              </TouchableOpacity>
            </View>
            <View style={styles.rightSection}>
               
               <TouchableOpacity onPress={() => router.replace('/chat/list')}>
                  <Text style={styles.linkText}>Mis Mensajes</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.buttonText} onPress={() => router.push(routes.listcompanies)} ><Text style={styles.linkText}>Empresas</Text></TouchableOpacity>
              
              
              <View style={styles.searchWeb}>
              <TextInput
                style={styles.searchInputWeb}
                placeholder="Buscar Ofertas"
                value={searchQuery}
                onChangeText={setSearchQuery} // Solo actualiza el estado, sin activar la búsqueda
                onSubmitEditing={handleSearch} // Activa la búsqueda cuando se presiona Enter
              />
              <TouchableOpacity onPress={handleSearch}>
                <FontAwesome name="search" size={24} color="black" style={styles.searchIcon} />
              </TouchableOpacity>
            </View>
              

              {user ? (
                <>
                   <PerfilDropdown user={user}/>
                
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.shareButton} onPress={() => router.push(routes.login)}><Text style={styles.shareText}>Acceder</Text></TouchableOpacity>
                
                </>
              )}

            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  logo: {
    width: 60,
    height: 40,
    marginRight: 10,
  },
  headerWeb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.secondary,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexWrap: "wrap",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerWebZoomed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: colors.secondary,
    position: "fixed",
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 20,
    left: 0,
    right: 0,
    zIndex: 10,
    flexWrap: "wrap",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 60, // Altura fija
  },
  logoZoomed: {
    width: 60,
    height: 40,
    marginRight: "25%",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 9998,
  },
  overlayVisible: {
    backgroundColor: "rgba(0,0,0,0.5)", // filtro gris
  },
  sidebar: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingLeft: 13,
    position: "absolute",
    left: 0,
    height: "100%",
    zIndex: 9999, // siempre encima de todo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  centerSection: {
    justifyContent: "center",
    width: "100%",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    marginLeft: "-1%",
    minWidth: 0,
  },
  searchViewWeb: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 0,
    marginHorizontal: 20,
    minWidth: 300,
    alignSelf: 'flex-start',
  },
  searchIcon: {
    color: colors.primary,
    marginRight: 10,
  },
  searchWeb: {
    backgroundColor: colors.lightGray,
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    padding: 5,
    borderRadius: 50,
    margin: 3,
  },
  searchInputWeb: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 50,
    borderColor: "transparent",
    marginRight: 3,
    outlineStyle: "none",
  },
  searchWebZoom: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 20,
    paddingVertical: 5,
    marginVertical: 10,
    width: "93%",
  },
  searchInputWebZoom: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 50,
    borderColor: "transparent",
    height: 10,
    fontSize: 12,
    outlineStyle: "none",
    width: "100%",
  },
  searchIconZoom: {
    color: colors.primary,
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    margin: 2,
  },
  buttonText: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  buttonTextZoomed: {
    backgroundColor: "transparent",
    borderRadius: 20,
    height: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  shareButtonZoomed1: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: "auto",
    height: "20%",
    paddingVertical: 10,
    marginRight: 13,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  shareButtonZoomed2: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    width: "auto",
    height: "auto",
    paddingVertical: 10,
    marginRight: 13,
    paddingRight: "5%",
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  linkTextZoom: {
    color: colors.secondary,
    fontWeight: 600,
    textAlign: "center",
    marginRight: 20,
  },
  shareText: {
    color: colors.white,
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  shareTextZoom1: {
    color: colors.white,
    marginHorizontal: 10,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  shareTextZoom2: {
    color: colors.secondary,
    marginHorizontal: 10,
    fontSize: 12,
    marginRight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  linkText: {
    color: 'white',
  },
  middleSection: {
    display: "flex",
    flexDirection: "row",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 60,

  },
  desktopAvatar: {
    width: 47,
    height: 47,
    borderRadius: 60,
    marginLeft: 5

  }
});
