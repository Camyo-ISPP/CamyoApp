import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import colors from '@/assets/styles/colors';
import { startChat } from "../(protected)/chat/services";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "react-native";
import defaultImage from "@/assets/images/empresa.jpg";
import WebFooter from "../_components/_layout/WebFooter";


interface Empresa {
  id: number;
  web: string;
  nif: string;
}

const EmpresasLista = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Obtiene el usuario autenticado

  useEffect(() => {
    const fetchEmpresasData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/empresas`);
        if (!response.ok) throw new Error("Error al cargar empresas");
        const data: Empresa[] = await response.json();
        setEmpresas(data);
      } catch (err) {
        setError((err as Error)?.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresasData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007BFF" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1,
    }}>
      {empresas.map((empresa, index) => (
        <View key={empresa.id} style={[styles.card, index === 0 && { marginTop: 40 }]}>
          <View style={styles.contentRow}>
            <Image
              source={empresa.usuario.foto ? { uri: `data:image/png;base64,${empresa.usuario.foto}` } : defaultImage}
              style={styles.profileImage}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{empresa.usuario.nombre}</Text>
              <DetailItem icon="globe" text={empresa.web} link />
              <DetailItem icon="building" text={empresa.nif} />
              <DetailItem icon="map-marker" text={empresa.usuario.localizacion} />
              <DetailItem icon="phone" text={empresa.usuario.telefono} />
            </View>
          </View>

          <View>
            {user && user.rol == "EMPRESA" && empresa.id === user.id ? (
              <TouchableOpacity style={styles.ownOfferBadge} onPress={() => router.push('/miperfil')}>
                <MaterialCommunityIcons name="office-building" size={15} color="white" style={styles.detailsIcon} />
                <Text style={styles.ownOfferText}>Tu Empresa</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => router.push(`/empresa/${empresa.id}`)}>
                <MaterialCommunityIcons name="eye" size={15} color="white" style={styles.detailsIcon} />
                <Text style={styles.buttonText}>Ver Detalles</Text>
              </TouchableOpacity>
            )}



            {/* Botón "Contactar" solo si hay usuario autenticado */}
            {user && user.rol == "CAMIONERO" && (
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  const chatId = await startChat(user.userId, empresa.usuario.id);
                  if (chatId) {

                    router.push(`/chat`);

                  }
                }}
              >
                <FontAwesome name="comments" size={16} color="white" style={styles.chatIcon} />
                <Text style={styles.chatButtonText}>Contactar</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      ))}
      <WebFooter />
    </ScrollView>
  );
};

const DetailItem = ({ icon, text, link = false }: { icon: keyof typeof FontAwesome.glyphMap; text?: string; link?: boolean }) => (
  <View style={styles.detailItem}>
    <FontAwesome style={styles.icon} name={icon} size={20} />
    {link ? (
      <Text style={styles.linkText} onPress={() => text && Linking.openURL(text)}>
        {text || "No disponible"}
      </Text>
    ) : (
      <Text style={styles.detailsText}>{text}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "60%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 20, fontWeight: "bold" },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  detailsText: { fontSize: 14, color: "#333" },
  icon: { marginRight: 10, color: "#0b4f6c" },
  linkText: { color: "#007BFF", textDecorationLine: "underline" },
  errorText: { textAlign: "center", fontSize: 18, color: "red", marginTop: 50 },
  button: {
    backgroundColor: colors.primary,
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: "-20%",
    marginTop: 4,
    flexDirection: "row",
    height: 40,
    width: 150,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
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
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatIcon: {
    marginRight: 8,
  },
  ownOfferBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A6572",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 30,
  },
  ownOfferText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary,
    marginHorizontal: 20,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  }
});

export default EmpresasLista;
