import { router, useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const ProyectoLogo = require('frontend/assets/images/camyo.png');
import BottomBar from '../_components/BottomBar';
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import CamyoWebNavBar from "../_components/CamyoNavBar";
const defaultCompanyLogo = require("../../assets/images/defaultCompImg.png");
const truckImage = require("../../assets/images/camion.png");
import Titulo from "../_components/Titulo";

export default function Index() {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 1040);

  useEffect(() => {
    const updateSize = () => {
      setIsCompact(Dimensions.get("window").width < 1040);
    };
    Dimensions.addEventListener("change", updateSize);
    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas`);
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const CardOferta = ({ item }) => {
    return (
      <View key={item.id} style={styles.card}>
        <Image source={defaultCompanyLogo} style={styles.companyLogo} />
        <View style={{ width: "45%" }}>
          <Text style={styles.offerTitle}>{item.titulo}</Text>
          <View style={{ display: "flex", flexDirection: "row", marginBottom: 8 }}>
            <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
            <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>
            <View style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
              <Text style={styles.localizacion}>|</Text>
              <MaterialIcons name="location-on" size={20} color="#696969" />
              <Text style={styles.localizacion}>{item.localizacion}</Text>
            </View>
          </View>
          <Text style={styles.offerInfo}>{item.notas}</Text>
        </View>
        <View>
          <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
            <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === 'web' ? (
        <View style={styles.webContainer}>
          <CamyoWebNavBar onSearch={undefined}/>
          <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false} contentContainerStyle={{ scrollbarWidth: "none" }}>

            <View style={styles.heroContainer}>
              <View style={styles.heroBox}>
                <View style={styles.textContainer}>
                  <Text style={styles.heroText}>Donde los camioneros y las empresas se encuentran.</Text>
                  <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/login")}>
                    <Text style={styles.registerButtonText}>Accede</Text>
                    <Ionicons name="arrow-forward" size={25} color="white" style={styles.arrowIcon} />
                  </TouchableOpacity>
                </View>
                <Image source={truckImage} style={styles.truckImage} resizeMode="contain" />
              </View>
            </View>
            
            <View style={styles.separator} />

            <Text style={styles.title}> Lista de Ofertas </Text>
            <View style={styles.listaContainer}>
              {/* Columna de Carga */}
              <View style={styles.columna}>
                <View style={styles.columnaTituloContainer}>
                  <FontAwesome5 name="route" size={23} color={colors.secondary} />
                  <Text style={styles.columnaTitulo}>Carga</Text>
                </View>
                {data.filter(item => item.tipoOferta === "CARGA").map(item => <CardOferta key={item.id} item={item} />)}
              </View>

              {/* Columna de Trabajo */}
              <View style={styles.columna}>
                <View style={styles.columnaTituloContainer}>
                  <MaterialIcons name="work-history" size={23
                    
                  } color={colors.secondary} />
                  <Text style={styles.columnaTitulo}>Trabajo</Text>
                </View>
                {data.filter(item => item.tipoOferta === "TRABAJO").map(item => <CardOferta key={item.id} item={item} />)}
              </View>
            </View>

            <View style={styles.separator} />

          </ScrollView >
        </View >
      ) : (
        <View style={styles.phone}>
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
      )
      }
    </>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignContent: "center",
    flex: 1,
  },
  scrollview: {
    flex: 1,
    padding: 10,
    position: 'static',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 20,
  },

  separator: {
    width: "80%",
    height: 2,
    backgroundColor: colors.lightGray,
    alignSelf: "center",
    marginTop: 60,
    marginBottom: -40,
  },

  listaContainer: {
    flexDirection: "row",
    alignSelf: "center",
    width: "90%",
    marginTop: 20,
  },
  columna: {
    width: "50%",
    alignItems: "center",
  },
  columnaTituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  columnaTitulo: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 8,
    alignSelf: "center",
    color: colors.secondary,
  },

  /* Estilos Hero */
  heroContainer: {
    width: "100%",
    height: 400,
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBox: {
    width: 700,
    height: 300,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginRight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    zIndex: 2,
  },
  heroText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 45,
    marginRight: 225,
    marginLeft: 10,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    width: 200,
    paddingVertical: 16,
    paddingHorizontal: 55,
    marginBottom: 10,
    marginLeft: 50,
    borderRadius: 10,
    alignItems: "center",
  },
  registerButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  arrowIcon: {
    marginLeft: 10,
  },
  truckImage: {
    position: "absolute",
    marginLeft: "45%",
    marginTop: "15%",
    width: 450,
    height: 300,
    borderRadius: 10,
    alignSelf: "center",
  },

  /* Estilos Ofertas */
  card: {
    backgroundColor: colors.white,
    padding: 25,
    marginVertical: 10,
    width: "75%",
    borderRadius: 12,
    flexWrap:"wrap",
    flexDirection: "row",
    alignContent: "center",
    alignItems:"center",
    borderLeftWidth: 5,
    borderColor: "red",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  companyLogo: {
    height: 90,
    width: 90,
    marginRight:10,
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
  offerDetailsTagLicense: {
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
  offerDetailsTagExperience: {
    fontSize: 9,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    color: colors.primary,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerInfo: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    paddingRight: 8,
    flexWrap: "wrap",
  },
  offerSueldo:{
    fontSize:25,
    fontWeight:"bold",
    color: colors.secondary,
    textAlignVertical:"center",
    alignSelf:"center",
    },
  button:{
    backgroundColor:colors.primary,
    color:colors.white,
    marginTop:4,
    flexDirection:"row",
    flexWrap:"nowrap",
    height:40,
    width: 150,
    borderRadius:10,
    alignItems:"center",
    justifyContent:"center"
  },
  buttonText:{
    color:colors.white,
    fontWeight:"bold"
  },
  detailsIcon:{
    color:colors.white,
    alignSelf:"center",
    marginLeft:3,
    marginTop:3,
    marginRight:5,
  },
  localizacion: {
    fontSize: 15,
    color: "#696969",
  },

  /* Estilos móvil */
  phone: { //
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: colors.mediumGray,
  },
  searchIcon: { //
    color: colors.primary,
    marginRight: 10,
  },
  searchView: { //
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "5%",
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 20,
  },
  menuIcon: { //
    marginRight: 10,
  },
  barraSuperior: { //
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.lightGray,
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: { //
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 50,
    borderColor: "transparent",
    marginRight: 3,
    outlineStyle: "none",
  },

});