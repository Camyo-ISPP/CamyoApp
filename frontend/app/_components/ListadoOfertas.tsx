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