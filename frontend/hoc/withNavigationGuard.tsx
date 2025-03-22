import { useRootNavigationState } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect } from "react";

const withNavigationGuard = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    const navigationState = useRootNavigationState();

    useEffect(() => {
      if (navigationState?.key) {
      }
    }, [navigationState]);

    if (!navigationState?.key) {
      return (
        <View>
          <ActivityIndicator size="large" />
          <Text>Cargando navegación...</Text>
        </View>
      );
    }

    return <Component {...props} />;
  };
};

export default withNavigationGuard;
