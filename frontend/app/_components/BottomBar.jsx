import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import colors from 'frontend/assets/styles/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useRouter } from 'expo-router';

const BottomBar = () => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const router = useRouter();


  return (
    <>
      {Platform.OS === 'android' || Platform.OS === 'ios' ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => setSelectedIcon('work')}>
            <MaterialIcons
              name="work"
              size={35}
              color={selectedIcon === 'work' ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setSelectedIcon('business');
            router.replace('/registro');
            }}>
            <Ionicons
              name="business"
              size={32}
              color={selectedIcon === 'business' ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setSelectedIcon('user');
            router.replace('/miperfil');
          }}>

            <FontAwesome
              name="user-circle-o"
              size={32}
              color={selectedIcon === 'user' ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: colors.white, // Blanco
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingLeft: "9%",
    paddingRight: "9%",
    position: 'absolute',
    bottom: 0,
    width: '112%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5, // Aumentar la altura de la sombra
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 10,
    zIndex: 1000,
  },
});

export default BottomBar;