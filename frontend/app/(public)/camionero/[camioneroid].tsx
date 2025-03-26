import { useLocalSearchParams } from "expo-router";
import ProtectedRoute from "@/security/ProtectedRoute";
import PublicCamionero from "../../_screens/PublicCamionero";

const CamioneroScreen = () => {
  const { camioneroid } = useLocalSearchParams();

  return (
    <ProtectedRoute>
      <PublicCamionero userId={camioneroid}></PublicCamionero>
    </ProtectedRoute>
  );
};

export default CamioneroScreen;