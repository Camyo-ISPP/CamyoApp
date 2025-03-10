import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Platform, Linking, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomBar from "../_components/BottomBar.jsx";
import CamyoWebNavBar from "../_components/CamyoNavBar.jsx";
import defaultBanner from "../../assets/images/empresa.jpg";
import defaultImage from "../../assets/images/image_perfil_empresa.jpg";

import colors from '@/assets/styles/colors';


// Definir la interfaz para la empresa y usu
interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  username: string;
  email: string;
  localizacion: string;
  descripcion: string;
  foto?: string | null;
}

interface Empresa {
  id: number;
  web: string;
  nif: string;
  usuario: Usuario;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const EmpresaPerfil = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/empresas/202`);
        if (!response.ok) throw new Error("Error al cargar datos de la empresa");
        const data: Empresa = await response.json();
        setEmpresa(data);
      } catch (err) {
        setError((err as Error)?.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresaData();
  }, []);

  if (loading) return <Text style={styles.loadingText}>Cargando...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <>
      {isMobile ? <BottomBar /> : <CamyoWebNavBar />}
      <View style={styles.bannerContainer}>
        <Image source={defaultBanner} style={styles.bannerImage} />
        <View style={isMobile ? styles.profileContainer : styles.desktopProfileContainer}>
          <Image 
            source={empresa?.usuario?.foto ? { uri: empresa.usuario.foto } : defaultImage} 
            style={isMobile ? styles.avatar : styles.desktopAvatar} 
          />
          <View style={styles.profileDetailsContainer}>
            <Text style={isMobile ? styles.name : styles.desktopName}>{empresa?.usuario?.nombre}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={[isMobile ? styles.container : styles.desktopContainer, { paddingTop: isMobile ? 0 : 100, paddingLeft: 10 }]}>
          <View style={styles.detailsOuterContainer}>
            <View style={styles.detailsColumn}>
              <View style={styles.detailItem}>
                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="globe" size={20}/>{empresa?.web}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="building" size={20}/>{empresa?.nif || "NIF no disponible"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="map-marker" size={20}/>{empresa?.usuario?.localizacion || "Ubicación no especificada"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="phone" size={20}/>{empresa?.usuario?.telefono || "Sin número de contacto"}</Text>
              </View>
            </View>
          </View>
      </ScrollView>
    </>
  );
};



const styles = StyleSheet.create({
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  }, 
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover", position: "absolute" },
  profileContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginBottom: 20,
      marginLeft: '12.5%', 
      position: 'relative',
      top: 100, 
  },
  desktopProfileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '45%',
      alignSelf: 'flex-start', 
      marginBottom: 20,
      marginLeft: '12.5%', 
      position: 'relative', 
      top: 100, 
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    position: 'relative',
    left: 20, 
    top: -60, 
  },
  desktopAvatar: {
      width: 200,
      height: 200,
      borderRadius: 100,
      marginBottom: 10,
      position: 'fixed',
      left: 420, 
      top: 100, 
  },
  profileDetailsContainer: { marginLeft: 20 },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  desktopName: {
      fontSize: 32,
      fontWeight: 'bold',
      position: 'fixed',
      left: 700, 
      top: 210, 
  },
  detailsOuterContainer: {
    alignItems: 'flex-start',
    position: 'fixed',
    top: 150,
    left: 330,
    width: '100%',
  },  
  detailsColumn: {
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 

  },  
  detailItem: {
    marginBottom: 10,
    flexDirection: 'row', 
    width: '100%', 
  },
  detailsText: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    textAlign: 'left', 
    width: '100%', 
  },
  icon: {
    fontSize: 20,
    color: colors.secondary,
    marginRight: 10,
    marginLeft: 10,
    position: 'relative',
    top: -2,
    right: 0,
    width: 30,
    textAlign: 'center',
    verticalAlign: 'bottom',
  },
  linkText: { color: "#007BFF", textDecorationLine: "underline" },
  loadingText: { textAlign: "center", fontSize: 18, color: "gray", marginTop: 50 },
  errorText: { textAlign: "center", fontSize: 18, color: "red", marginTop: 50 },
  detailsRow: { flexDirection: "row", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 100,
    paddingLeft: 10,
  }, 
  desktopContainer: { flexGrow: 1, padding: 50 },
  infoText: { fontSize: 16, color: "#333" },
  desktopDetailsText: {
    fontSize: 15,
    color: 'black',
    marginBottom: 15,
    marginLeft: '5%',
    textAlign: 'left',
    width: '100%', 
  },
});

export default EmpresaPerfil;
