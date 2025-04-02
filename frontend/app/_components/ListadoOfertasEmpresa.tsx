import React from "react";
import { View, Text, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { FontAwesome5, MaterialIcons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import SuccessModal from "../_components/SuccessModal";
import { LinearGradient } from "expo-linear-gradient";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

const ListadoOfertasEmpresa = ({
  offers,
  canPromoteNewOffer,
  promoteOffer,
  successModalVisible,
  setSuccessModalVisible,
  isModalVisibleCancelar,
  setIsModalVisibleCancelar,
  selectedOfferId,
  setSelectedOfferId,
  unpromoteOffer,
}) => {

  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.offersContainer}>
      <Text style={styles.sectionTitle}>Ofertas Activas</Text>
      {offers.length === 0 ? (
        <Text style={styles.noOffersText}>No hay ofertas activas en este momento</Text>
      ) : (
        <View style={styles.offersList}>
          {offers.map((item: any) => (
            <View key={item.id} style={styles.offerCard}>
              <View style={styles.offerContent}>
                <View style={styles.offerHeader}>
                  <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                  <View style={styles.offerMainInfo}>
                    <Text style={styles.offerPosition}>{item.titulo}</Text>
                    <View style={styles.companyInfo}>
                      <FontAwesome5 name="building" size={14} color={colors.primary} />
                      <Text style={styles.companyName}>{user.nombre}</Text>
                      <Text style={{ color: colors.secondary }}>  |  </Text>
                      <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                      <Text style={{ ...styles.detailText, color: colors.secondary, fontSize: 15 }}>{item.localizacion}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.offerDetailsTagType}>
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
                  <View style={{ alignItems: "flex-end" }}>
                    {item.promoted && (
                      <View style={styles.promotedBadge}>
                        <AntDesign name="star" size={14} color="#FFD700" />
                        <Text style={styles.promotedText}>PATROCINADA</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: "row", gap: 30, alignItems: "center" }}>
                      <Text style={styles.offerSalary}>{item.sueldo}€</Text>
                      <View style={styles.offerActions}>
                        {
                          item.promoted ? (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.unpromoteButton]}
                              onPress={() => { setIsModalVisibleCancelar(true); setSelectedOfferId(item.id) }}
                            >
                              <AntDesign name="closecircleo" size={14} color={colors.white} style={{ paddingRight: 19 }} />
                              <Text style={styles.actionButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                          ) : canPromoteNewOffer() ? (
                            <TouchableOpacity
                              onPress={() => promoteOffer(item.id)}
                            >
                              <LinearGradient
                                colors={['#D4AF37', '#F0C674', '#B8860B', '#F0C674']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.actionButton]}
                              >
                                <AntDesign name="star" size={14} color={colors.white} style={{ paddingRight: 9 }} />
                                <Text style={styles.actionButtonText}>Patrocinar</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          ) : null
                        }
                        <SuccessModal
                          isVisible={successModalVisible}
                          onClose={() => setSuccessModalVisible(false)}
                          message="¡Oferta patrocinada con éxito!"
                        />
                        <Modal
                          animationType="fade"
                          transparent={true}
                          visible={isModalVisibleCancelar}
                          onRequestClose={() => setIsModalVisibleCancelar(false)}
                        >
                          <TouchableWithoutFeedback onPress={() => setIsModalVisibleCancelar(false)}>
                            <View style={styles.modalBackground}>
                              <TouchableWithoutFeedback>
                                <View style={styles.modalContainer}>
                                  <Text style={styles.modalText}>¿Estás seguro/a de que quieres dejar de patrocinar la oferta?</Text>
                                  <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={() => setIsModalVisibleCancelar(false)} style={styles.modalButton}>
                                      <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => unpromoteOffer(selectedOfferId)} style={styles.modalButton}>
                                      <Text style={styles.modalButtonText}>Confirmar</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                          </TouchableWithoutFeedback>
                        </Modal>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.detailsButton]}
                          onPress={() => router.push(`/oferta/${item.id}`)}
                        >
                          <MaterialCommunityIcons name="eye-outline" size={14} color={colors.white} />
                          <Text style={styles.actionButtonText}>Ver detalles</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  offersContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  noOffersText: {
    textAlign: 'center',
    color: colors.mediumGray,
    marginVertical: 20,
    fontSize: 16,
  },
  offersList: {
    width: '100%',
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promotedOfferCard: {
    borderLeftColor: colors.secondary,
    backgroundColor: '#F8F9FF',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    height: 120,
    width: 120,
    marginRight: 10,
  },
  offerContent: {
    paddingHorizontal: 5,
  },
  offerMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  offerPosition: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 5,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  companyName: {
    fontSize: 15,
    fontWeight: 700,
    color: colors.primary,
    marginLeft: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  offerDetailsTagType: {
    backgroundColor: colors.secondary,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
    alignItems: "center",
  },
  offerDetailsTagLicense: {
    backgroundColor: colors.primary,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    alignItems: "center",
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
  },
  offerDetailsTagExperience: {
    backgroundColor: colors.green,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    alignItems: "center",
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
  },
  detailText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '700',
    marginRight: 10,
    marginLeft: 4,
  },
  offerSalary: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.secondary,
  },
  offerActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    width: 150,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
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
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    textAlign: "left",
    fontWeight: '500',
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  promotedText: {
    color: '#D4A017',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  // Modal
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
});


export default ListadoOfertasEmpresa;
