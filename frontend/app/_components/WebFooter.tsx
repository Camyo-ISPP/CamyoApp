import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import colors from 'frontend/assets/styles/colors';

const WebFooter = () => {
  const router = useRouter();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        {/* Lado izquierdo - Copyright */}
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Camyo
        </Text>

        {/* Lado derecho - Enlaces */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push('/terminos')}>
            <Text style={styles.linkText}>Términos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/privacidad')}>
            <Text style={styles.linkText}>Privacidad</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => window.open('mailto:camyo.team@gmail.com')}>
  <Text style={styles.linkText}>Contacto</Text>
</TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    width: '100%',
    marginTop: 'auto',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  copyrightText: {
    fontSize: 13,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default WebFooter;