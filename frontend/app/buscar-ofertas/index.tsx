import { router, useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, Image, Animated, Dimensions, ScrollView, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const ProyectoLogo = require('frontend/assets/images/camyo.png');
import BottomBar from '../_components/BottomBar';
import { MaterialIcons } from "@expo/vector-icons";
const CompanyLogo = require('frontend/assets/images/camyo.png');
import Titulo from "../_components/Titulo";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function BuscarOfertas({ searchQuery: externalSearchQuery = '' }: { searchQuery?: string }){
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);// State for the search query
    

  useEffect(() => {
    const handleUrlChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('query') || '';
        if (queryFromUrl) {
          setSearchQuery(queryFromUrl); // Pre-fill the search bar
          handleSearch(queryFromUrl); // Trigger the search with the query
        } else {
          setFilteredData(data); // If no query, show all data
        }
      };// Initial call to handle URL changes
      handleUrlChange();
  
      // Listen for popstate events (back/forward navigation)
      const onPopState = () => handleUrlChange();
      window.addEventListener('popstate', onPopState);
  
      return () => {
        window.removeEventListener('popstate', onPopState);
      };
    }, [data]);

    useEffect(() => {
        fetchData();
      }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas`);
      setData(response.data);
      setFilteredData(response.data); // Initialize filteredData with all data
      console.log(response.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = (query = searchQuery) => {
    const filteredResults = data.filter((item) =>
      item.titulo?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filteredResults);

    // Update the URL with the query parameter
    const newUrl = `${window.location.pathname}?query=${encodeURIComponent(query)}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <View style={styles.webContainer}>
      <ScrollView style={styles.scrollview}>
        <Titulo texto="Lista de Ofertas" marginTop={30} />
        {/* Search bar and button */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ofertas por título..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)} // Update searchQuery state
            onSubmitEditing={() => handleSearch()}  // Trigger search on "Enter"
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          {filteredData.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={CompanyLogo} style={styles.companyLogo} />
              <View style={{ width: "30%" }}>
                <Text style={styles.offerTitle}>{item.titulo}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.offerDetailsTagType}>{item.tipoOferta}</Text>
                  <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
                  <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.localizacion}>|</Text>
                    <MaterialIcons name="location-on" size={20} color="#696969" />
                    <Text style={styles.localizacion}>{item.localizacion}</Text>
                  </View>
                </View>
                <Text style={styles.offerInfo}>{item.notas}</Text>
              </View>
              <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.replace(`/oferta/${item.id}`)}>
                <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                <Text style={styles.buttonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  },
  webContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignContent: "center",
    flex: 1,
    backgroundColor: colors.lightGray,
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
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },

});
