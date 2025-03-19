import { useRootNavigationState } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";

const withNavigationGuard = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    const navigationState = useRootNavigationState();

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
