import { useLocalSearchParams } from "expo-router";

import PublicEmpresa from "../../_screens/PublicEmpresa";

const EmpresaScreen = () => {
  const { empresaid } = useLocalSearchParams();

  return (
    <PublicEmpresa userId={empresaid}></PublicEmpresa>
  );
};

export default EmpresaScreen;