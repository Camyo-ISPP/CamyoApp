import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import colors from "@/assets/styles/colors";
import { FontAwesome5, MaterialIcons, AntDesign, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import SuccessModal from "../_components/SuccessModal";
import MapLoader from "../_components/MapLoader";

const { width } = Dimensions.get('window');

const AdminPanel = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user, userToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "offers">("users");
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteAction, setDeleteAction] = useState(() => { });

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchOffers();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchOffers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/usuarios`);
      setUsers(response.data);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/info`);
      setOffers(response.data);
    } catch (err) {
      setError("Error al cargar las ofertas");
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (type: "user" | "offer", id: number) => {
    const entityName = type === "user" ? "usuario" : "oferta";
    setDeleteMessage(`¿Estás seguro de que quieres eliminar este ${entityName}?`);
    setDeleteAction(() => async () => {
      try {
        const response = await axios.delete(`${BACKEND_URL}/${type === "user" ? "usuarios" : "ofertas"}/${id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (type === "user") {
          setUsers(users.filter(u => u.id !== id));
        } else {
          setOffers(offers.filter(o => o.id !== id));
        }

        if (response.status === 204) {
          setSuccessModalVisible(true);
          setTimeout(() => {
            setSuccessModalVisible(false);
          }, 1500);
        }

      } catch (err) {
        setError(`Error al eliminar el ${entityName}`);
        console.error(`Error deleting ${entityName}:`, err);
      } finally {
        setIsDeleteModalVisible(false);
      }
    });
    setIsDeleteModalVisible(true);
  };

  const renderUserItem = (user) => {
    if (user.authority.authority === "ADMIN") return null;

    else return (
      <View key={user.id} style={styles.card}>

        <View style={styles.offerMainInfo}>
          <Text style={styles.offerPosition}>{user.nombre}</Text>
          <View style={styles.companyInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="envelope" size={14} color={colors.primary} />
              <Text style={styles.companyName}>
                {user?.email}
              </Text>
            </View>

            <Text style={{ color: colors.secondary }}>  |  </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="location-on" size={16} color={colors.secondary} />
              <Text style={{ ...styles.detailText, color: colors.secondary, fontSize: 15 }}>{user?.localizacion}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.offerDetailsTagBase}>
              <FontAwesome5
                name={user.authority.authority == "EMPRESA" ? "building" : "truck"}
                size={14}
                color={colors.white}
              />
              <Text style={styles.detailText}>{user?.authority.authority}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => triggerDelete("user", user.id)}
        >
          <MaterialIcons name="delete" size={16} color={colors.white} />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>)
  };

  const renderOfferItem = (offer) => (
    <View key={offer.id} style={styles.offerCard}>
      <View style={styles.offerContent}>
        <View style={styles.offerHeader}>
          <View style={styles.offerMainInfo}>
            <Text style={styles.offerPosition}>{offer.titulo}</Text>
            <View style={styles.companyInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="building" size={14} color={colors.primary} />
                <Text style={styles.companyName}>
                  {offer?.nombreEmpresa}
                </Text>
              </View>

              <Text style={{ color: colors.secondary }}>  |  </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                <Text style={{ ...styles.detailText, color: colors.secondary, fontSize: 15 }}>{offer?.localizacion}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[
                styles.offerDetailsTagBase,
                offer.tipoOferta.toLowerCase() === 'trabajo' ? styles.offerDetailsTagWork : styles.offerDetailsTagLoad
              ]}>
                <Ionicons
                  name={offer.tipoOferta === "CARGA" ? "cube-outline" : "briefcase-outline"}
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.detailText}>{offer.tipoOferta}</Text>
              </View>

              <View style={styles.offerDetailsTagLicense}>
                <AntDesign name="idcard" size={12} color={colors.white} />
                <Text style={styles.detailText}>{offer.licencia.replace(/_/g, '+')}</Text>
              </View>

              <View style={styles.offerDetailsTagExperience}>
                <MaterialIcons name="timelapse" size={12} color={colors.white} />
                <Text style={styles.detailText}>{'>' + offer.experiencia} años</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.offerSalary}>{offer.sueldo}€</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => triggerDelete("offer", offer.id)}
          >
            <MaterialIcons name="delete" size={16} color={colors.white} />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MapLoader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>

      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <Text style={styles.headerSubtitle}>Filtra y encuentra el trabajo perfecto para ti</Text>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
              Usuarios ({users.length - 1})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "offers" && styles.activeTab]}
            onPress={() => setActiveTab("offers")}
          >
            <Text style={[styles.tabText, activeTab === "offers" && styles.activeTabText]}>
              Ofertas ({offers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "users" ? (
          users.length > 0 ? (
            users.map(renderUserItem)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={48} color={colors.mediumGray} />
              <Text style={styles.emptyText}>No hay usuarios registrados</Text>
            </View>
          )
        ) : offers.length > 0 ? (
          offers.map(renderOfferItem)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="work-outline" size={48} color={colors.mediumGray} />
            <Text style={styles.emptyText}>No hay ofertas publicadas</Text>
          </View>
        )}

        <ConfirmDeleteModal
          isVisible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={deleteAction}
          message={deleteMessage}
        />

        <SuccessModal
          isVisible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          message="¡Se ha eliminado correctamente!"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBanner: {
    width: '100%',
    paddingVertical: 25,
    paddingHorizontal: '10%',
    backgroundColor: colors.secondary,
    marginBottom: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 20,
    color: "#fff",
    opacity: 0.9,
  },
  mainContainer: {
    width: '70%',
    alignSelf: 'center',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.red,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  activeTabText: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardInfo: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 5,
  },
  cardBadge: {
    flexDirection: "row",
    gap: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.darkGray,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
    marginTop: 10,
    textAlign: "center",
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: width < 768 ? 12 : 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    position: 'relative',
  },
  offerContent: {
    paddingHorizontal: 5,
    width: '100%',
  },
  offerHeader: {
    flexDirection: width < 768 ? 'column' : 'row',
    alignItems: width < 768 ? 'flex-start' : 'center',
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
    gap: 8,
  },
  companyName: {
    fontSize: width < 768 ? 14 : 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  detailText: {
    fontSize: width < 768 ? 10 : 12,
    color: colors.white,
    fontWeight: '700',
    marginRight: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  offerDetailsTagBase: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  offerDetailsTagWork: {
    backgroundColor: '#6C9BCF',
  },
  offerDetailsTagLoad: {
    backgroundColor: '#D7B373',
  },
  offerDetailsTagLicense: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  offerDetailsTagExperience: {
    backgroundColor: colors.green,
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  offerSalary: {
    fontSize: width < 768 ? 22 : 26,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'center',
    marginRight: width < 768 ? 10 : 30,
    marginTop: width < 768 ? 10 : 0,
  },
  priceContainer: {
    justifyContent: 'center',
    marginHorizontal: width < 768 ? 0 : 15,
    alignSelf: width < 768 ? 'flex-start' : 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AdminPanel;