import { router } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, ScrollView, ActivityIndicator, Dimensions, Animated, Easing } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomBar from '../_components/BottomBar';
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import CamyoWebNavBar from "../_components/CamyoNavBar";
const defaultCompanyLogo = require("../../assets/images/defaultCompImg.png");
const truckImage = require("../../assets/images/camion.png");
const heroBackground = require("../../assets/images/lonely-road.jpg");
import { useAuth } from "../../contexts/AuthContext";

export default function Index() {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 1040);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updateSize = () => setIsCompact(Dimensions.get("window").width < 1040);
    Dimensions.addEventListener("change", updateSize);
    
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad)
    }).start();

    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/recientes`);
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const CardOferta = ({ item }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    
    const handleHover = (toValue) => {
      if (Platform.OS === "web") {
        Animated.spring(scaleValue, {
          toValue,
          friction: 3,
          useNativeDriver: true,
        }).start();
      }
    };

    return (
      <Animated.View 
        style={[styles.card, { transform: [{ scale: scaleValue }] }]}
        onMouseEnter={() => handleHover(1.03)}
        onMouseLeave={() => handleHover(1)}
      >
        <Image 
          source={item.empresa?.logo ? { uri: item.empresa.logo } : defaultCompanyLogo} 
          style={styles.companyLogo} 
        />
        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>{item.titulo}</Text>
          <View style={styles.tagsContainer}>
            <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
            <Text style={styles.offerDetailsTagExperience}>+{item.experiencia} años</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#696969" />
              <Text style={styles.localizacion}>{item.localizacion}</Text>
            </View>
          </View>
        </View>
        <View style={styles.offerActions}>
          <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push(`/oferta/${item.id}`)}
          >
            <MaterialCommunityIcons name="eye" size={16} color="white" />
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const StatsSection = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <FontAwesome name="comments" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>100%</Text>
        <Text style={styles.statLabel}>Feedback Real</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="chatbubbles" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>Contacto</Text>
        <Text style={styles.statLabel}>Directo</Text>
      </View>
      <View style={styles.statItem}>
        <MaterialIcons name="local-shipping" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>24/7</Text>
        <Text style={styles.statLabel}>Disponibilidad</Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {Platform.OS === 'web' ? (
        <View style={styles.webContainer}>
          <CamyoWebNavBar onSearch={undefined} />
          <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false}>
          <View style={styles.whiteTransition} />
            {/* Hero Section */}
            <View style={styles.heroContainer}>
              <Image source={heroBackground} style={styles.heroBackground} blurRadius={2} />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  {(!user || !user.rol) 
                    ? "Donde los profesionales del transporte y las empresas se encuentran" 
                    : `¡Bienvenido de nuevo, ${user.nombre}!`}
                </Text>
                <Text style={styles.heroSubtitle}>
                  Conectamos el talento con las mejores oportunidades del sector
                </Text>
                <View style={styles.heroButtons}>
                  {(!user || !user.rol) ? (
                    <>
                      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/login")}>
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/registro")}>
                        <Text style={styles.secondaryButtonText}>Registrarse</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/miperfil")}>
                        <Text style={styles.buttonText}>Mi Perfil</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/buscar-ofertas")}>
                        <Text style={styles.secondaryButtonText}>Explorar Ofertas</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Stats Section */}
            <StatsSection />

            {/* Ofertas Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ofertas Recientes</Text>
              <Text style={styles.sectionSubtitle}>Las mejores oportunidades del mercado</Text>
              
              <View style={styles.listaContainer}>
                {/* Columna de Carga */}
                <View style={styles.columna}>
                  <View style={styles.columnaHeader}>
                    <FontAwesome5 name="route" size={24} color={colors.secondary} />
                    <Text style={styles.columnaTitulo}>Transporte de Carga</Text>
                  </View>
                  {data.filter(item => item.tipoOferta === "CARGA").map(item => (
                    <CardOferta key={item.id} item={item} />
                  ))}
                </View>

                {/* Columna de Trabajo */}
                <View style={styles.columna}>
                  <View style={styles.columnaHeader}>
                    <MaterialIcons name="work" size={24} color={colors.secondary} />
                    <Text style={styles.columnaTitulo}>Ofertas de Trabajo</Text>
                  </View>
                  {data.filter(item => item.tipoOferta === "TRABAJO").map(item => (
                    <CardOferta key={item.id} item={item} />
                  ))}
                </View>
              </View>
            </View>

            {/* Testimonios */}
            <View style={[styles.section, styles.testimonialsSection]}>
              <Text style={styles.sectionTitle}>Testimonios</Text>
              <Text style={styles.sectionSubtitle}>¿Quieres ser el primero en compartir tu experiencia?</Text>
              
              <View style={styles.testimonialsContainer}>
                <View style={styles.testimonialCard}>
                  <Text style={styles.testimonialText}>
                  ¡Sé el primero en dejar tu testimonio! Cuéntanos cómo ha sido tu experiencia y aparecerás aquí.
                  </Text>
                  <Text style={styles.testimonialAuthor}>- Tu Nombre</Text>
                </View>
                <View style={styles.testimonialCard}>
                  <Text style={styles.testimonialText}>
                  ¡Sé el primero en dejar tu testimonio! Cuéntanos cómo ha sido tu experiencia y aparecerás aquí.
                  </Text>
                  <Text style={styles.testimonialAuthor}>- Tu Nombre</Text>
                </View>
              </View>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <Text style={styles.ctaTitle}>¿Listo para encontrar tu próxima oportunidad?</Text>
              <Text style={styles.ctaSubtitle}>Regístrate ahora y accede a las mejores ofertas del sector</Text>
              <TouchableOpacity 
                style={styles.ctaButton} 
                onPress={() => router.push(!user ? "/registro" : "/buscar-ofertas")}
              >
                <Text style={styles.ctaButtonText}>
                  {!user ? "Regístrate Gratis" : "Explorar Ofertas"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.phoneContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
          <View style={styles.searchView}>
            <Ionicons name="menu" size={30} color="black" style={styles.menuIcon} />
            <View style={styles.barraSuperior}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar Ofertas"
                placeholderTextColor={colors.secondary}
              />
              <TouchableOpacity>
                <FontAwesome name="search" size={24} color="black" style={styles.searchIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <BottomBar />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white
  },
  webContainer: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
  },

  /* Hero Section */
  heroContainer: {
    height: 550,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    width: '80%',
    maxWidth: 1200,
    zIndex: 2,
    padding: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 22,
    color: colors.white,
    marginBottom: 30,
    opacity: 0.9,
    maxWidth: 600,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Stats Section */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 50,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginTop: -50,
    marginHorizontal: 40,
    borderRadius: 12,
    zIndex: 3,
  },
  statItem: {
    alignItems: 'center',
    padding: 15,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },

  /* General Section */
  section: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 40,
  },

  /* Ofertas Section */
  listaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    flexWrap: 'wrap',
  },
  columna: {
    width: Platform.OS === 'web' ? '45%' : '100%',
    minWidth: 350,
  },
  columnaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray,
  },
  columnaTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: colors.secondary,
  },

  /* Card Oferta */
  card: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    transition: 'transform 0.3s ease',
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  offerCompany: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 5,
  },
  whiteTransition: {
    height: '5%', // Altura del espacio blanco
    backgroundColor: colors.white,
    width: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  offerDetailsTagLicense: {
    fontSize: 12,
    backgroundColor: colors.secondary,
    color: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
    overflow: 'hidden',
  },
  offerDetailsTagExperience: {
    fontSize: 12,
    borderColor: colors.primary,
    borderWidth: 1,
    color: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localizacion: {
    fontSize: 14,
    color: "#696969",
    marginLeft: 5,
  },
  offerActions: {
    alignItems: 'center',
    marginLeft: 15,
  },
  offerSueldo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Testimonials */
  testimonialsSection: {
    backgroundColor: '#f5f7fa',
  },
  testimonialsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  testimonialCard: {
    backgroundColor: colors.white,
    padding: 25,
    borderRadius: 12,
    width: Platform.OS === 'web' ? '45%' : '100%',
    minWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.darkGray,
    lineHeight: 24,
    marginBottom: 15,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  /* CTA Section */
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* Mobile Styles */
  phoneContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: colors.mediumGray,
  },
  searchView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "5%",
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 20,
  },
  menuIcon: {
    marginRight: 10,
  },
  barraSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.lightGray,
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 50,
    borderColor: "transparent",
    marginRight: 3,
    outlineStyle: "none",
    flex: 1,
  },
  searchIcon: {
    color: colors.primary,
    marginRight: 10,
  },
});