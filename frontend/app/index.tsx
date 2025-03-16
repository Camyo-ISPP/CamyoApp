import { router } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, ScrollView, ActivityIndicator } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomBar from './_components/BottomBar';
import { MaterialIcons } from "@expo/vector-icons";
import CamyoWebNavBar from "./_components/CamyoNavBar";
import defaultCompanyLogo from "frontend/assets/images/defaultCompImg.png"
import Titulo from "./_components/Titulo";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const [error, setError] = useState(null);

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

  return (
    <>
      {Platform.OS === 'web' ? (
        <View style={styles.webContainer}>
          <CamyoWebNavBar />
          <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false} contentContainerStyle={{ scrollbarWidth: "none" }}>
          <Titulo texto="Lista de Ofertas" marginTop={100} />
            <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {data && data.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                  <View style={{width:"30%"}}>
                    <Text style={styles.offerTitle}>{item.titulo}</Text>

                    <View style={{ display: "flex", flexDirection: "row" }}>
                      <Text style={styles.offerDetailsTagType}>{item.tipoOferta}</Text>
                      <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
                      <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text> 

                      <View style={{display:"flex",alignItems:"center",flexDirection:"row"}}>
                        <Text style={styles.localizacion}>|</Text>
                        <MaterialIcons name="location-on" size={20} color="#696969" />
                        <Text style={styles.localizacion}>{item.localizacion}</Text>
                      </View>
                      
                    </View>

                    <Text style={styles.offerInfo}>{item.notas}</Text>

                    <View/>
                  </View>
                    <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                    <TouchableOpacity style={styles.button} onPress={()=>router.replace(`/oferta/${item.id}`)}>
                    <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                    <Text style={styles.buttonText}>Ver Detalles</Text>

                    </TouchableOpacity>
                </View>
              ))}
            </View >
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
  phone: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: colors.mediumGray,
  },
  searchIcon: {
    color: colors.primary,
    marginRight: 10,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  },
  webContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignContent: "center",
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    marginVertical: 10,
    width: "70%",
    borderRadius: 10,
    display: "flex",
    flexWrap:"wrap",
    flexDirection: "row",
    alignContent: "center",
    alignItems:"center",
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
    position: 'static',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
  },

  scrollviewIndicator: {
    backgroundColor: colors.primary,
    width: 3,
    borderRadius: 1.5,
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
  offerDetailsTagType: {
    fontSize: 9,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
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
  offerSueldo:{
    fontSize:25,
    fontWeight:"bold",
    textAlign:"right",
    paddingLeft:3,
    color: colors.secondary,
    textAlignVertical:"center",
    width:"35%",
    alignSelf:"center"
  

  },
  empresa: {
    fontSize: 20,
    color: '#0b4f6c',
    marginTop: 0,
},
  button:{
    backgroundColor:colors.primary,
    color:colors.white,
    paddingLeft:5,
    paddingRight:5,
    marginLeft: "2%",
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

  },// Estilos para el perfil
  profileContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  profileText: {
    fontSize: 18,
    color: colors.primary,
  },
  profileLink: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  // Estilos cuando el usuario no está logueado
  greetingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  greetingText: {
    fontSize: 18,
    color: colors.primary,
  },
  loginLink: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  localizacion: {
    fontSize: 15,
    color: "#696969",
},


});
