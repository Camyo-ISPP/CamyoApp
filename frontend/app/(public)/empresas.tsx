import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import colors from '@/assets/styles/colors';
import Titulo from "../_components/Titulo";
import { startChat } from "../chat/services";
import { useAuth } from "@/contexts/AuthContext";

interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  localizacion: string;
  descripcion: string;
  foto?: string | null;
}

interface Empresa {
  id: number;
  web: string;
  nif: string;
  usuario: Usuario;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const EmpresasLista = () => {
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
        console.log(data);
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Titulo texto="Lista de Empresas" marginTop={100} />

      {empresas.map((empresa, index) => (
        <View key={empresa.id} style={[styles.card, index === 0 && { marginTop: 10 }]}>
          <View>
            <Text style={styles.name}>{empresa.usuario.nombre}</Text>
            <DetailItem icon="globe" text={empresa.web} link />
            <DetailItem icon="building" text={empresa.nif} />
            <DetailItem icon="map-marker" text={empresa.usuario.localizacion} />
            <DetailItem icon="phone" text={empresa.usuario.telefono} />
          </View>

          <View>
            {/* Botón "Ver Detalles" */}
            <TouchableOpacity style={styles.button} onPress={() => router.push(`/empresa/${empresa.id}`)}>
              <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
              <Text style={styles.buttonText}>Ver Detalles</Text>
            </TouchableOpacity>

            {/* Botón "Iniciar Chat" solo si hay usuario autenticado */}
            {user && (
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  const chatId = await startChat(user.id, empresa.usuario.id);
                  if (chatId) {
                    router.replace(`/chat?otherUserId=${empresa.usuario.id}`);
                  }
                }}
              >
                <Text style={styles.chatButtonText}>Iniciar Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
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
    backgroundColor: "#f5f5f5",
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
});

export default EmpresasLista;
