import React, { useEffect, useRef, useState } from "react";
import { useRootNavigationState } from "expo-router";
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const withNavigationGuard = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    const navigationState = useRootNavigationState();
    const fuelAnim = useRef(new Animated.Value(0)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const [ready, setReady] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [firstLoad, setFirstLoad] = useState(true);
    const [showSimpleLoader, setShowSimpleLoader] = useState(false);

    // Verificar si es la primera carga
    useEffect(() => {
      const checkFirstLoad = async () => {
        try {
          const hasLoadedBefore = await AsyncStorage.getItem('hasLoadedBefore');
          setFirstLoad(!hasLoadedBefore);

          // Mostrar loader simple después de 1.5s si no es primera carga
          if (hasLoadedBefore) {
            const timer = setTimeout(() => {
              setShowSimpleLoader(true);
            }, 1500);
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error("Error checking first load:", error);
        }
      };
      checkFirstLoad();
    }, []);

    // Animación de olas (solo para primera carga)
    useEffect(() => {
      if (firstLoad) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(waveAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }, [firstLoad]);

    useEffect(() => {
      const listener = fuelAnim.addListener(({ value }) => {
        const p = Math.round(value * 100);
        setPercentage(p);
        if (p >= 100) {
          setTimeout(() => {
            setReady(true);
            if (firstLoad) {
              AsyncStorage.setItem('hasLoadedBefore', 'true');
            }
          }, firstLoad ? 500 : 0);
        }
      });
    
      return () => {
        fuelAnim.removeListener(listener);
        waveAnim.removeAllListeners();
      };
    }, [firstLoad]);

    useEffect(() => {
      if (navigationState?.key) {
        const duration = firstLoad ? 4000 : 800;
        const toValue = firstLoad ? 1 : 1;

        Animated.timing(fuelAnim, {
          toValue,
          duration,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
      } else {
        // Animación más lenta solo para primera carga
        if (firstLoad) {
          Animated.timing(fuelAnim, {
            toValue: 0.7,
            duration: 4000,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }).start();
        } else {
          // Para cargas posteriores, ir directo al 100%
          fuelAnim.setValue(1);
          setReady(true);
        }
      }
    }, [navigationState, firstLoad]);

    const fuelHeight = fuelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["5%", "95%"],
    });

    const wavePosition = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, 10],
    });

    if (!ready) {
      if (showSimpleLoader || !firstLoad) {
        // Mostrar spinner simple para cargas posteriores
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Cargando navegación...</Text>
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Cargando la aplicación</Text>
            <Text style={styles.subtitle}>Tanqueando oportunidades...</Text>
          </View>

          <View style={styles.gasStation}>
            <View style={styles.pump}>
              <View style={styles.hose} />
              <View style={styles.nozzle} />
              <View style={styles.pumpBase} />
            </View>
            <View style={styles.tankContainer}>
              <View style={styles.tank}>
                <Animated.View style={[styles.fuel, { height: fuelHeight }]}>
                  <Animated.View
                    style={[
                      styles.wave,
                      {
                        bottom: 0,
                        transform: [{ translateX: wavePosition }]
                      }
                    ]}
                  />
                </Animated.View>
                <View style={styles.tankDetails}>
                  <View style={styles.tankStripes} />
                  <View style={styles.tankStripes} />
                  <View style={styles.tankStripes} />
                </View>
                <Text style={styles.percentage}>{percentage}%</Text>
              </View>
              <View style={styles.tankStand} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.message}>
              {percentage < 30
                ? "Buscando cargas cercanas..."
                : percentage < 70
                  ? "Optimizando rutas..."
                  : percentage < 100
                    ? "¡Últimos ajustes!"
                    : "¡Gracias por tu paciencia! Estamos cargando datos..."}
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: fuelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]}
              />
            </View>
          </View>
        </View>
      );
    }

    return <Component {...props} />;
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  gasStation: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 220,
  },
  pump: {
    marginRight: 20,
    alignItems: "center",
    position: "relative",
  },
  hose: {
    width: 16,
    height: 50,
    backgroundColor: "#95a5a6",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    zIndex: 2,
  },
  nozzle: {
    width: 24,
    height: 12,
    backgroundColor: "#e74c3c",
    borderRadius: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#c0392b",
    zIndex: 3,
  },
  pumpBase: {
    width: 40,
    height: 60,
    backgroundColor: "#34495e",
    borderRadius: 5,
    marginTop: -10,
    zIndex: 1,
  },
  tankContainer: {
    alignItems: "center",
  },
  tank: {
    width: 90,
    height: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#bdc3c7",
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fuel: {
    backgroundColor: "#2ecc71",
    width: "100%",
    borderTopWidth: 2,
    borderTopColor: "#27ae60",
    overflow: "hidden",
    position: "relative",
  },
  wave: {
    position: "absolute",
    width: "200%",
    height: 20,
    backgroundColor: "#27ae60",
    opacity: 0.8,
    borderRadius: 10,
  },
  tankDetails: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  tankStripes: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(189, 195, 199, 0.5)",
  },
  percentage: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    color: "#2c3e50",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  tankStand: {
    width: 110,
    height: 10,
    backgroundColor: "#34495e",
    borderRadius: 3,
    marginTop: 5,
  },
  footer: {
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  message: {
    marginBottom: 15,
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#ecf0f1",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default withNavigationGuard;