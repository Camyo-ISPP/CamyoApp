import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png"
const { unifyUserData } = require("../../utils/unifyData");
import defaultImage from "../../assets/images/empresa.jpg";
import { useAuth } from "../../contexts/AuthContext";
import BackButton from "../_components/BackButton";
import { startChat } from "../chat/services";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const PublicEmpresa = ({ userId }) => {
  const router = useRouter();

  const [empresa, setEmpresa] = useState(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // usuario autenticado
  const { user } = useAuth();

  useEffect(() => {
    // Si el usuario autenticado es la empresa, redirigir a su perfil
    if (user?.id == userId) {
      if (user.rol == "EMPRESA"){
        router.push("/miperfil");
        return;
      }
    }

    const fetchOpenOffers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${userId}`);
        setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
      } catch (error) {
        console.error("Error al cargar las ofertas:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/empresas/${userId}`);
        const unifiedData = unifyUserData(response.data)
        setEmpresa(unifiedData);
      } catch (error) {
        console.error("Error al cargar los datos de la empresa:", error);
      }
    };

    fetchOpenOffers();
    fetchUser();
  }, [userId]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowContainer}>
            <BackButton />

            {/* Logo de empresa */}
            <View style={styles.profileContainer}>
              <Image
                source={empresa?.foto ? { uri: empresa.foto } : defaultImage}
                style={styles.profileImage}
              />
            </View>
            {/* Información de la empresa */}
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{empresa?.nombre}</Text>
              <Text style={styles.username}>@{empresa?.username}</Text>
              <Text style={styles.info}><MaterialIcons name="email" size={18} color={colors.primary} /> {empresa?.email}</Text>
              <Text style={styles.info}><MaterialIcons name="phone" size={18} color={colors.primary} /> {empresa?.telefono}</Text>
              <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {empresa?.localizacion}</Text>
              <Text style={styles.description}>{empresa?.descripcion}</Text>
            </View>

            <View style={styles.buttonsWrapper}>
              {/* Botón de contactar a la empresa solo si el user autenticado es camionero */}
              {user && user.rol == "CAMIONERO" && (
                <View>
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={async () => {
                      const chatId = await startChat(user.id, empresa?.userId);
                      if (chatId) {
                        router.replace(`/chat?otherUserId=${empresa?.userId}`);
                      }
                    }}
                  >
                    <FontAwesome name="comments" size={16} color="white" style={styles.plusIcon} />
                    <Text style={styles.publishButtonText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </View>
          {/* Separador */}
          <View style={styles.separator} />

          <View style={styles.downContainer}>
            {/* Información empresarial */}
            <Text style={styles.sectionTitle}>Información Empresarial</Text>
            <Text style={styles.info}><FontAwesome5 name="globe" size={18} color={colors.primary} /> Web: {empresa?.web}</Text>
          </View>

          <View style={styles.separator} />

          {/* Lista de ofertas de la empresa */}
          <View style={styles.offersContainer}>
            <Text style={styles.sectionTitle}>Ofertas Abiertas</Text>
            {offers.length === 0 ? (
              <Text style={styles.info}>No hay ofertas abiertas</Text>
            ) : (
              <ScrollView>
                <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {offers && offers.map((item) => (
                    <View key={item.id} style={styles.card2}>
                      <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                      <View style={{ width: "30%" }}>
                        <Text style={styles.offerTitle}>{item.titulo}</Text>

                        <View style={{ display: "flex", flexDirection: "row" }}>
                          <Text style={styles.offerDetailsTagType}>{item.tipoOferta}</Text>
                          <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
                          <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>

                          <View style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
                            <Text style={styles.localizacion}>|</Text>
                            <MaterialIcons name="location-on" size={20} color="#696969" />
                            <Text style={styles.localizacion}>{item.localizacion}</Text>
                          </View>
                        </View>

                        <Text style={styles.offerInfo}>{item.notas}</Text>

                        <View />
                      </View>
                      <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                      <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
                        <MaterialCommunityIcons name="eye" size={15} color="white" style={styles.detailsIcon} />
                        <Text style={styles.buttonText}>Ver Detalles</Text>

                      </TouchableOpacity>
                    </View>
                  ))}
                </View >
              </ScrollView >
            )}
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginTop: 20,
    paddingTop: 70,
  },
  card: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    elevation: 6,
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonsWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 15,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  plusIcon: {
    marginRight: 6, 
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    position: "relative",
    marginRight: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: colors.primary,
    marginLeft: 30,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.secondary,
  },
  username: {
    fontSize: 18,
    color: colors.darkGray,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 6,
  },
  info: {
    fontSize: 16,
    color: colors.darkGray,
    marginVertical: 4,
  },
  description: {
    fontSize: 15,
    color: colors.darkGray,
    marginTop: 6,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  downContainer: {
    paddingHorizontal: 30,
    marginLeft: 30,
  },
  offersContainer: {
    paddingHorizontal: 30,
  },
  companyLogo: {
    height: 90,
    width: 90,
    marginRight: 10,
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
  offerSueldo: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "right",
    paddingLeft: 3,
    color: colors.secondary,
    textAlignVertical: "center",
    width: "35%",
    alignSelf: "center"
  },
  localizacion: {
    fontSize: 15,
    color: "#696969",
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
  card2: {
    backgroundColor: colors.white,
    padding: 20,
    marginVertical: 10,
    width: "100%",
    borderRadius: 10,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    borderLeftWidth: 4,
    borderColor: "red",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default PublicEmpresa;
