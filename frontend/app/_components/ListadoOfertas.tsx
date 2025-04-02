import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import defaultCompanyLogo from "frontend/assets/images/defaultCompImg.png";
import colors from "frontend/assets/styles/colors";

const ListadoOfertas = ({ data, mostrarPatrocinadas = true, styles = {} }: { data: any[]; mostrarPatrocinadas?: boolean; styles?: Partial<typeof styles>; }) => {
  return (
    <View style={styles.contenedorOfertas}>
      {data.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            item.promoted && mostrarPatrocinadas && styles.promotedCard
          ]}>

          {mostrarPatrocinadas && item.promoted && (
            <View style={styles.patrocinadoBadge}>
              <Text style={styles.patrocinadoText}>PATROCINADO</Text>
            </View>
          )}

          <Image
            source={item?.empresa?.usuario?.foto ? { uri: `data:image/png;base64,${item.empresa.usuario.foto}` } : defaultCompanyLogo}
            style={styles.companyLogo}
            resizeMode="contain"
          />

          <View style={{ width: "30%" }}>
            <Text style={styles.offerTitle}>{item.titulo}</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
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

          <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
            <MaterialCommunityIcons name="eye" size={15} color="white" style={styles.detailsIcon} />
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};


export default ListadoOfertas;

// TODO: Remove
const styles2 = StyleSheet.create({
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
    borderColor: "red",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: colors.secondary,
  },
  offerDetailsTagType: {
    fontSize: 9,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "700",
    flexWrap: "wrap",
  },
  offerDetailsTagLicense: {
    fontSize: 9,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    color: colors.white,
    paddingTop: 2,
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
    alignSelf: "center",
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: "2%",
    marginTop: 4,
    flexDirection: "row",
    height: 40,
    width: 150,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  detailsIcon: {
    color: colors.white,
    alignSelf: "center",
    marginLeft: 3,
    marginTop: 3,
    marginRight: 5,
  },
  localizacion: {
    fontSize: 15,
    color: "#696969",
  },
});
