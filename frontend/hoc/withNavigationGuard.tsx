import { useRootNavigationState } from "expo-router";
import { View, Text } from "react-native";
import { useEffect } from "react";
import MapLoader from "@/app/_components/MapLoader";

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
          <MapLoader />
        </View>
      );
    }

    return <Component {...props} />;
  };
};

export default withNavigationGuard;