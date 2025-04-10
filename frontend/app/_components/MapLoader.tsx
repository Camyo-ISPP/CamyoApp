import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import colors from 'frontend/assets/styles/colors';

type MapLoaderProps = {
  message?: string;
};

const MapLoader: React.FC<MapLoaderProps> = ({ message = 'Trazando la mejor ruta para ti...' }) => {
  const [activeDot, setActiveDot] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 4);
    }, 500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MaterialIcons name="map" size={120} color={colors.lightGray} />
        {[0, 1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: i === activeDot ? fadeAnim : 0.3,
                backgroundColor: i === activeDot ? colors.primary : colors.secondary,
              },
              styles[`dot${i}`],
            ]}
          />
        ))}
        <FontAwesome5 
          name="truck" 
          size={36} 
          color={colors.primary} 
          style={styles.truckIcon}
        />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  mapContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dot0: { top: 40, left: 50 },
  dot1: { top: 100, right: 40 },
  dot2: { bottom: 50, left: 60 },
  dot3: { bottom: 100, right: 50 },
  truckIcon: {
    position: 'absolute',
  },
  text: {
    marginTop: 30,
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '500',
  },
});

export default MapLoader;
