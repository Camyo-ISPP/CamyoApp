import { useLocalSearchParams } from "expo-router";

import Camionero from "../../_screens/Camionero";

const CamioneroScreen = () => {
  const { camioneroid } = useLocalSearchParams();

  return (
    <Camionero userId={camioneroid}></Camionero>
  );
};

export default CamioneroScreen;