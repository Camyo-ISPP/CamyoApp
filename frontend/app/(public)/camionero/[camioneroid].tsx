import { useLocalSearchParams } from "expo-router";

import PublicCamionero from "../../_screens/PublicCamionero";

const CamioneroScreen = () => {
  const { camioneroid } = useLocalSearchParams();

  return (
    <PublicCamionero userId={camioneroid}></PublicCamionero>
  );
};

export default CamioneroScreen;