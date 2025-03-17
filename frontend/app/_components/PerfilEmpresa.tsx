import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import defaultBanner from "../../assets/images/empresa.jpg";
import defaultImage from "../../assets/images/image_perfil_empresa.jpg";
import colors from '@/assets/styles/colors';
import { useAuth } from '../../contexts/AuthContext';
import { router, useNavigation } from "expo-router";
import axios from "axios";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Definir la interfaz para la empresa y usuario
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

const PerfilEmpresa = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userToken, user } = useAuth();
  const navigation = useNavigation();
  const [offers, setOffers] = useState<any[]>([]);
  const [offerStatus, setOfferStatus] = useState<string>('ACEPTADA');

  useEffect(() => {
    if (!userToken || !user || user.rol !== "EMPRESA") {
      setLoading(false);
      return;
    }

    fetchEmpresaData();
    fetchOffers();
    // Hide the default header
    navigation.setOptions({ headerShown: false });
  }, [userToken, user, offerStatus]);

  const fetchEmpresaData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/empresas/${user.id}`);
      setEmpresa(response.data);
    } catch (err) {
      setError((err as Error)?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
      setOffers(response.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userToken || !user || user.rol !== "EMPRESA") {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Acceso denegado, inicia sesión con tu cuenta de empresa</Text>
      </View>
    );
  }

  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  const getNoOffersMessage = () => {
    switch (offerStatus) {
      case 'ACEPTADA':
        return 'No hay ofertas aceptadas';
      case 'PENDIENTE':
        return 'No hay ofertas pendientes';
      case 'RECHAZADA':
        return 'No hay ofertas rechazadas';
      default:
        return '';
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={[isMobile ? styles.container : styles.desktopContainer, { paddingTop: isMobile ? 0 : 100, paddingLeft: 10 }]}>
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
        <View style={styles.detailsOuterContainer}>
          <View style={styles.detailsColumn}>
            <View style={styles.detailItem}>
              <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="globe" size={20} />{empresa?.web}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="building" size={20} />{empresa?.nif || "NIF no disponible"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="map-marker" size={20} />{empresa?.usuario?.localizacion || "Ubicación no especificada"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="phone" size={20} />{empresa?.usuario?.telefono || "Sin número de contacto"}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/miperfil/editar`)}
            >
              <Text style={styles.editButtonText}> Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/oferta/crear`)}
            >
              <Text style={styles.editButtonText}>Publicar nueva oferta</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.offersContainer}>
          <View style={styles.offersButtonContainer}>
            <View style={styles.offersButton}>
              <Text style={styles.offersButtonText}>Tus Ofertas</Text>
            </View>
          </View>
          <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false}>
            <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {offers.length === 0 ? (
                <Text style={styles.noOffersText}>{getNoOffersMessage()}</Text>
              ) : (
                offers.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Image source={defaultImage} style={styles.companyLogo} />
                    <View style={{ width: "30%" }}>
                      <Text style={styles.offerTitle}>{item.titulo}</Text>
                      <View style={{ display: "flex", flexDirection: "row" }}>
                        <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>
                        <Text style={styles.offerDetailsTagLicense}>{item.licencia}</Text>
                      </View>
                      <Text style={styles.offerInfo}>{item.notas}</Text>
                    </View>
                    <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                    <View>
                      <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
                        <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                        <Text style={styles.buttonText}>Ver Detalles</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/editar/${item.id}`)}>
                        <MaterialCommunityIcons name="pencil" size={15} color="white" style={styles.detailsIcon} />
                        <Text style={styles.buttonText}>Editar Oferta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'fixed',
    top: 50,
    width: '100%',
    left: 0,
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
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
    top: -40,
  },
  desktopAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
    position: 'fixed',
    left: 350,
    top: 150,
  },
  profileDetailsContainer: {
    marginLeft: 50,
    marginTop: 40,
    position: 'fixed',
    top: 100,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  desktopName: {
    fontSize: 32,
    fontWeight: 'bold',
    position: 'fixed',
    left: 600,
    top: 260,
  },
  detailsOuterContainer: {
    alignItems: 'left',
    position: 'fixed',
    top: 370,
    bottom: 50,
    left: 350,
    width: '100%',
  },
  detailsColumn: {
    flexDirection: 'column',
    justifyContent: 'left',
    alignItems: 'left',
    position: 'fixed',
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
    marginLeft: '1%',
    textAlign: 'left',
    width: '100%',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollview: {
    flex: 1,
    padding: 10,
    marginVertical: 40,
    position: 'absolute',
    top: 20, // Adjust this value based on the height of CamyoWebNavBar
    left: 0,
    right: 0,
    bottom: -40,
  },
  scrollviewIndicator: {
    backgroundColor: colors.primary,
    width: 3,
    borderRadius: 1.5,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    marginVertical: 10,
    width: "70%",
    borderRadius: 10,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    borderLeftWidth: 4,
    borderColor: "red", // Cambia a "green" si quieres un borde verde
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollview: {
    flex: 1,
    padding: 10,
    marginVertical: 40,
    position: 'absolute',
    top: 20, // Adjust this value based on the height of CamyoWebNavBar
    left: 0,
    right: 0,
    bottom: -40,
  },

  scrollviewIndicator: {
    backgroundColor: colors.primary,
    width: 3,
    borderRadius: 1.5,
  },
  companyLogo: {
    height: 90,
    width: 90,
    marginRight: 10,
    borderRadius: 100,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
    marginBottom: 2,
    color: colors.secondary
  },
  offerDate: {
    fontSize: 12,
    color: "gray", flexWrap: "wrap",
  },
  offerDetails: {
    fontSize: 12,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerDetailsTagExperience: {
    fontSize: 9,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    color: colors.white,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerDetailsTagLicense: {
    fontSize: 9,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "700",
    flexWrap: "wrap",
  },
  offerInfo: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    flexWrap: "wrap",
  },
  offerSueldo: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "right",
    paddingLeft: 3,
    marginRight: 20,
    color: colors.secondary,
    textAlignVertical: "center",
    width: "35%",
    alignSelf: "center"


  },
  empresa: {
    fontSize: 20,
    color: '#0b4f6c',
    marginTop: 0,
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: "2%",
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "nowrap",
    height: 40,
    width: 150,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"



  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold"
  },
  detailsIcon: {
    color: colors.white,
    alignSelf: "center",
    marginLeft: 3,
    marginTop: 3,
    marginRight: 5,

  },

  offersContainer: {
    flex: 1,
    width: '65%',
    position: 'fixed',
    top: 350, // Adjusted to place the offers below the header
    left: 400,
    height: 1000,
    padding: 10,
    marginLeft: 20, // Adjust as needed to position next to the details column
    marginTop: 1, // Adjust to start at the height of the email
  },
  offersButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '65%',
    position: 'absolute', // Match the position of the offers container
    top: 10, // Adjust as needed to match the offers container
    left: 210, // Adjust as needed to match the offers container
    right: 0, // Adjust as needed to match the offers container

  },

  offersButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },

  offersButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  // Add styles for the description box and text
  // Add styles for the description box and text
  descriptionBox: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    minHeight: 500, // Set a minimum height
    maxHeight: 500, // Set a maximum height
    overflow: 'hidden', // Hide overflow text
    position: 'fixed',
    top: 540, // Adjusted to place the description below the details
  },

  descriptionText: {
    fontSize: 15,
    color: 'dark-gray',
  },
  noOffersText: {
    fontSize: 20,
    color: colors.secondary
  },
});

export default PerfilEmpresa;