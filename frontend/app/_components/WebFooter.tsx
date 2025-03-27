import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, Linking } from "react-native";
import colors from "frontend/assets/styles/colors";
import React, { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const CamyoLogo = require('../../assets/images/camyoV2.png');

export default function WebFooter() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(Dimensions.get("window").width < 768);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(Dimensions.get("window").width < 768);
    };
    Dimensions.addEventListener("change", updateSize);
    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  const currentYear = new Date().getFullYear();

  const handleSocialPress = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <LinearGradient 
      colors={["rgba(0, 0, 0, 0.9)", "rgba(0, 0, 0, 0.95)"]}
      style={styles.footer}
    >
      <View style={styles.footerContent}>
        {/* Sección superior del footer */}
        <View style={styles.topSection}>
          {/* Logo y descripción */}
          <View style={styles.logoSection}>
            <Image source={CamyoLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.description}>
              Conectando talento con oportunidades. La plataforma líder para encontrar y ofrecer empleo en tu sector.
            </Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => handleSocialPress("https://www.linkedin.com/in/camyo/")}>
                <Feather name="linkedin" size={24} color={colors.white} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSocialPress("https://instagram.com")}>
                <Feather name="instagram" size={24} color={colors.white} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Enlaces rápidos */}
          {!isMobile && (
            <>
              <View style={styles.linksSection}>
                <Text style={styles.sectionTitle}>Enlaces rápidos</Text>
                <TouchableOpacity onPress={() => router.push("/")}>
                  <Text style={styles.linkText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/buscar-ofertas")}>
                  <Text style={styles.linkText}>Explorar ofertas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/empresas")}>
                  <Text style={styles.linkText}>Empresas</Text>
                </TouchableOpacity>
              </View>

              {/* Contacto */}
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contacto</Text>
                <View style={styles.contactItem}>
                  <Feather name="mail" size={18} color={colors.white} />
                  <Text style={styles.contactText}>camyo.team@gmail.com</Text>
                </View>
                <View style={styles.contactItem}>
                  <MaterialIcons name="location-on" size={18} color={colors.white} />
                  <Text style={styles.contactText}>ETSII, Sevilla, España</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Sección inferior del footer */}
        <View style={styles.bottomSection}>
          <Text style={styles.copyright}>
            © {currentYear} Camyo. Todos los derechos reservados.
          </Text>
          {isMobile && (
            <View style={styles.mobileLinks}>
              <TouchableOpacity onPress={() => router.push("/terminos")}>
                <Text style={styles.mobileLinkText}>Términos</Text>
              </TouchableOpacity>
              <Text style={styles.mobileSeparator}>|</Text>
              <TouchableOpacity onPress={() => router.push("/privacidad")}>
                <Text style={styles.mobileLinkText}>Privacidad</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.black,
  },
  footerContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  logoSection: {
    width: 300,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 60,
    marginBottom: 15,
  },
  description: {
    color: colors.lightGray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  icon: {
    opacity: 0.8,
    transitionProperty: 'opacity',
    transitionDuration: '0.3s',
  },
  linksSection: {
    marginBottom: 20,
    minWidth: 150,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  linkText: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 10,
    transitionProperty: 'color',
    transitionDuration: '0.3s',
  },
  contactSection: {
    marginBottom: 20,
    minWidth: 200,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  contactText: {
    color: colors.lightGray,
    fontSize: 14,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    color: colors.lightGray,
    fontSize: 12,
  },
  mobileLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileLinkText: {
    color: colors.lightGray,
    fontSize: 12,
  },
  mobileSeparator: {
    color: colors.lightGray,
    fontSize: 12,
  },
  // Estilos responsive
  '@media (max-width: 768px)': {
    topSection: {
      flexDirection: 'column',
    },
    logoSection: {
      width: '100%',
      marginBottom: 30,
    },
    linksSection: {
      width: '100%',
      marginBottom: 25,
    },
    contactSection: {
      width: '100%',
    },
  },
});