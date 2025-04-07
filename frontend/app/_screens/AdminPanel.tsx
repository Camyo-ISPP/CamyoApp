import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import axios from "axios";
import colors from "@/assets/styles/colors";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";

interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  nombre: string;
  estado: string;
}

interface Offer {
  id: number;
  titulo: string;
  tipoOferta: string;
  estado: string;
  nombreEmpresa: string;
  createdAt: string;
}

const AdminPanel = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "offers">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.rol !== "ADMIN") {
      router.replace("/");
      return;
    }

    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "users") {
        const response = await axios.get(`${BACKEND_URL}/usuarios`);
        setUsers(response.data);
      } else {
        const response = await axios.get(`${BACKEND_URL}/ofertas`);
        setOffers(response.data);
      }
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este usuario?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/admin/users/${userId}`);
              setUsers(users.filter(u => u.id !== userId));
            } catch (err) {
              setError("Error al eliminar el usuario");
              console.error("Error deleting user:", err);
            }
          }
        }
      ]
    );
  };

  const handleDeleteOffer = async (offerId: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar esta oferta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/admin/offers/${offerId}`);
              setOffers(offers.filter(o => o.id !== offerId));
            } catch (err) {
              setError("Error al eliminar la oferta");
              console.error("Error deleting offer:", err);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = (user: User) => (
    <View key={user.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome 
          name={user.rol === "EMPRESA" ? "building" : user.rol === "CAMIONERO" ? "truck" : "user"} 
          size={24} 
          color={colors.primary} 
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{user.nombre || user.username}</Text>
          <Text style={styles.cardSubtitle}>{user.email}</Text>
          <View style={styles.cardBadge}>
            <Text style={styles.badgeText}>{user.rol}</Text>
            <Text style={[styles.badgeText, { 
              color: user.estado === "ACTIVO" ? colors.green : colors.red 
            }]}>
              {user.estado}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteUser(user.id)}
      >
        <MaterialIcons name="delete" size={20} color={colors.red} />
      </TouchableOpacity>
    </View>
  );

  const renderOfferItem = (offer: Offer) => (
    <View key={offer.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons 
          name={offer.tipoOferta === "CARGA" ? "cube" : "briefcase"} 
          size={24} 
          color={colors.primary} 
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{offer.titulo}</Text>
          <Text style={styles.cardSubtitle}>{offer.nombreEmpresa}</Text>
          <View style={styles.cardBadge}>
            <Text style={styles.badgeText}>{offer.tipoOferta}</Text>
            <Text style={[styles.badgeText, { 
              color: offer.estado === "ABIERTA" ? colors.green : colors.red 
            }]}>
              {offer.estado}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteOffer(offer.id)}
      >
        <MaterialIcons name="delete" size={20} color={colors.red} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color={colors.white} />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "users" && styles.activeTab]}
          onPress={() => setActiveTab("users")}
        >
          <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
            Usuarios ({users.length})
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.lightGray,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
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
  deleteButton: {
    padding: 8,
    marginLeft: 10,
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
});

export default AdminPanel;