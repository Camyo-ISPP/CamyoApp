import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import Empresa from "../../_screens/Empresa";

const EmpresaScreen = () => {
  const { empresaid } = useLocalSearchParams();

  return (
    <Empresa userId={empresaid}></Empresa>
  );
};


export default EmpresaScreen;