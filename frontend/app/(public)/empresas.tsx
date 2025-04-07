import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet, ActivityIndicator, TouchableOpacity, ImageBackground, Dimensions } from "react-native";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import colors from '@/assets/styles/colors';
import { startChat } from "../(protected)/chat/services";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "react-native";
import defaultImage from "@/assets/images/empresa.jpg";
import WebFooter from "../_components/_layout/WebFooter";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

interface Empresa {
  id: number;
  web: string;
  nif: string;
  usuario: {
    id: number;
    nombre: string;
    localizacion: string;
    telefono: string;
    foto?: string;
  };
}

const EmpresasLista = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Hero Section */}
      <ImageBackground
        source={require('@/assets/images/edificios.jpg')}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle}>Empresas Transportistas</Text>
          <Text style={styles.heroSubtitle}>Conoce a las empresas líderes en el sector</Text>
        </LinearGradient>
      </ImageBackground>

      {/* Empresas List */}
      <View style={styles.listContainer}>
        {empresas.map((empresa) => (
          <View key={empresa.id} style={styles.card}>
            {/* Company Header */}
            <View style={styles.cardHeader}>
              <Image
                source={empresa.usuario.foto ? { uri: `data:image/png;base64,${empresa.usuario.foto}` } : defaultImage}
                style={styles.profileImage}
              />

              <View style={styles.headerTextContainer}>
                <Text style={styles.companyName}>{empresa.usuario.nombre}</Text>

                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                  <Text style={styles.locationText}>{empresa.usuario.localizacion}</Text>
                </View>

                {user && user.rol === "EMPRESA" && empresa.id === user.id && (
                  <View style={styles.ownCompanyBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color="white" />
                    <Text style={styles.ownCompanyText}>Tu empresa</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Company Details */}
            <View style={styles.detailsContainer}>
              <DetailItem
                icon="globe"
                text={empresa.web}
                link
                label="Web"
              />
              <DetailItem
                icon="id-card"
                text={empresa.nif}
                label="NIF"
              />
              <DetailItem
                icon="phone"
                text={empresa.usuario.telefono}
                label="Teléfono"
              />
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push(`/empresa/${empresa.id}`)}
              >
                <MaterialCommunityIcons name="eye-outline" size={16} color="white" />
                <Text style={styles.buttonText}>Ver detalles</Text>
              </TouchableOpacity>

              {user && user.rol === "CAMIONERO" && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={async () => {
                    const chatId = await startChat(user.userId, empresa.usuario.id);
                    if (chatId) router.push(`/chat`);
                  }}
                >
                  <MaterialCommunityIcons name="message-text-outline" size={16} color="white" />
                  <Text style={styles.buttonText}>Contactar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <WebFooter />
    </ScrollView>
  );
};

const DetailItem = ({
  icon,
  text,
  link = false,
  label
}: {
  icon: keyof typeof FontAwesome.glyphMap;
  text?: string;
  link?: boolean;
  label?: string;
}) => (
  <View style={styles.detailItem}>
    <View style={styles.detailLabelContainer}>
      <FontAwesome style={styles.detailIcon} name={icon} size={14} color={colors.mediumGray} />
      {label && <Text style={styles.detailLabel}>{label}</Text>}
    </View>

    {text ? (
      link ? (
        <TouchableOpacity onPress={() => Linking.openURL(text.startsWith('http') ? text : `https://${text}`)}>
          <Text style={styles.detailLink} ellipsizeMode="tail">
            {text.replace(/(^\w+:|^)\/\//, '').replace('www.', '')}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.detailText} ellipsizeMode="tail">
          {text}
        </Text>
      )
    ) : (
      <Text style={styles.detailEmpty}>No disponible</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    marginTop: 16,
    textAlign: 'center',
  },
  heroSection: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: width > 768 ? 42 : 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    width: '80%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
    width: width > 768 ? '30%' : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#2c3e50",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#2c3e50",
    marginLeft: 4,
  },
  ownCompanyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ownCompanyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  detailIcon: {
    marginRight: 8,
    color: "#0b4f6c",
  },
  detailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  detailText: {
    fontSize: 14,
    color: "#34495e",
    fontWeight: '500',
    width: '65%',
    textAlign: 'right',
  },
  detailLink: {
    fontSize: 15,
    color: "#0969CFFF",
    fontWeight: '500',
    textDecorationLine: 'underline',
    width: '100%',
    textAlign: 'right',
  },
  detailEmpty: {
    fontSize: 14,
    color: colors.lightGray,
    fontStyle: 'italic',
    width: '65%',
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default EmpresasLista;