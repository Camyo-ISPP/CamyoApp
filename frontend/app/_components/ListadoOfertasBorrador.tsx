import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import defaultCompanyLogo from "frontend/assets/images/defaultCompImg.png";
import colors from "frontend/assets/styles/colors";

const { width } = Dimensions.get('window');

const ListadoOfertasBorrador = ({ data }: { data: any[] }) => {
  return (
    <>
      <View style={styles.offersList}>
        {data.map((item) => (
          <View key={item.id} style={styles.offerCard}>
            <View style={styles.offerContent}>
              <View style={styles.offerHeader}>
                <Image
                  source={item?.empresa?.usuario?.foto ? { uri: `data:image/png;base64,${item.empresa.usuario.foto}` } : defaultCompanyLogo}
                  style={styles.companyLogoOffer}
                />
                <View style={styles.offerMainInfo}>
                  <Text style={styles.offerPosition}>{item.titulo}</Text>
                  <View style={styles.companyInfo}>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => router.push(`/empresa/${item.empresa.id}`)}
                    >
                      <FontAwesome5 name="building" size={14} color={colors.primary} />
                      <Text style={styles.companyName}>{item?.empresa?.usuario?.nombre}</Text>
                    </TouchableOpacity>

                    <Text style={{ color: colors.secondary }}>  |  </Text>
                    <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                    <Text style={{ ...styles.detailText, color: colors.secondary, fontSize: 15 }}>{item.localizacion}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.offerDetailsTagBase}>
                      <MaterialIcons name="work-outline" size={12} color={colors.white} />
                      <Text style={styles.detailText}>{item.tipoOferta}</Text>
                    </View>

                    <View style={styles.offerDetailsTagLicense}>
                      <AntDesign name="idcard" size={12} color={colors.white} />
                      <Text style={styles.detailText}>{item.licencia.replace(/_/g, '+')}</Text>
                    </View>

                    <View style={styles.offerDetailsTagExperience}>
                      <MaterialIcons name="timelapse" size={12} color={colors.white} />
                      <Text style={styles.detailText}>{'>' + item.experiencia} años</Text>
                    </View>
                  </View>
                </View>


                <View style={styles.priceContainer}>
                  <Text style={styles.offerSalary}>{item.sueldo}€</Text>
                </View>
                <View style={styles.rightSection}>
                  <View style={styles.offerActions}>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.detailsButton]}
                      onPress={() => router.push(`/oferta/${item.id}/editar`)}
                    >
                      <MaterialCommunityIcons name="square-edit-outline" size={17} color="white" style={styles.editIcon} />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>


          </View>

        ))
        }
      </View >
    </>

  );
};

export default ListadoOfertasBorrador;

const styles = StyleSheet.create({

  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  noOffersText: {
    textAlign: 'center',
    color: colors.mediumGray,
    marginVertical: 20,
    fontSize: width < 768 ? 16 : 18,
  },
  offersList: {
    width: '100%',
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: width < 768 ? 12 : 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    position: 'relative',
  },
  promotedOfferCard: {
    borderWidth: 1.5,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  promotedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 10,
    zIndex: 1,
    backgroundColor: '#FFA500',
  },
  promotedText: {
    color: 'white',
    fontSize: width < 768 ? 10 : 12,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  offerHeader: {
    flexDirection: width < 768 ? 'column' : 'row',
    alignItems: width < 768 ? 'flex-start' : 'center',
  },
  companyLogo: {
    height: 120,
    width: 120,
    marginRight: 10,
  },
  companyLogoOffer: {
    height: 120,
    width: 120,
    marginRight: width < 768 ? 0 : 10,
    marginBottom: width < 768 ? 10 : 0,
    borderRadius: 50,
  },
  offerContent: {
    paddingHorizontal: 5,
    width: '100%',
  },
  offerMainInfo: {
    flex: 1,
    marginLeft: width < 768 ? 0 : 12,
    marginRight: width < 768 ? 0 : 12,
  },
  offerPosition: {
    fontSize: width < 768 ? 17 : 19,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
    lineHeight: 24,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: width < 768 ? 14 : 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  offerDetailsTagBase: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  offerDetailsTagLicense: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  offerDetailsTagExperience: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  detailText: {
    fontSize: width < 768 ? 10 : 12,
    color: colors.white,
    fontWeight: '700',
    marginRight: 8,
    marginLeft: 4,
    justifyContent: 'center',
  },
  offerSalary: {
    fontSize: width < 768 ? 22 : 26,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'center',
    marginRight: width < 768 ? 10 : 30,
    marginTop: width < 768 ? 10 : 0,
  },
  offerActions: {
    flexDirection: width < 768 ? 'row' : 'column',
    justifyContent: 'center',
    gap: 8,
    width: width < 768 ? '100%' : 120,
    marginTop: width < 768 ? 10 : 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    width: width < 768 ? '48%' : '100%',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 5,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: width < 768 ? 12 : 14,
    textAlign: "left",
    fontWeight: '500',
  },
  promoteButton: {
    backgroundColor: '#D4AF37',
  },
  unpromoteButton: {
    backgroundColor: colors.red,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  priceContainer: {
    justifyContent: 'center',
    marginHorizontal: width < 768 ? 0 : 15,
    alignSelf: width < 768 ? 'flex-start' : 'center',
  },
  editIcon: {
    marginRight: 5,
  },
});
