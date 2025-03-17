import { Stack, useSegments, useRouter, usePathname } from "expo-router";
import { Platform } from "react-native";
import { useState, useEffect } from 'react';
import CamyoWebNavBar from "./_components/CamyoNavBar";
import BottomBar from "./_components/BottomBar";
import { useAuth } from "../contexts/AuthContext"; // Importa useAuth
import withAuthProvider from './withAuthProvider'; // Importa el HOC

function RootLayout() {
  const segments = useSegments();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  /*
  const router = useRouter();
  const pathname = usePathname();
  const { user, userToken } = useAuth(); // Usa useAuth
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // Track if the layout is ready
  */
 
  useEffect(() => {
    if (Platform.OS === "web") {
      const pageTitles: Record<string, string> = {
        index: "Inicio",
        login: "Iniciar Sesión",
        registro: "Registro",
        miperfil: "Mi Perfil",
        miperfilempresa: "Mi Perfil Empresa",
        miperfilcamionero: "Mi Perfil Camionero",
        "oferta/crear": "Publicar Nueva Oferta",
        empresas: "Lista de Empresas",
        "oferta/[ofertaId]": "Detalles de la Oferta",
        "miperfilcamionero/editar": "Editar Perfil Camionero",
        "miperfilempresa/editar": "Editar Perfil Empresa",
        "oferta/editar/[ofertaId]": "Editar Oferta",
        workinprogress: "Trabajo en Progreso",
        forbidden: "Acceso Denegado",
      };

      const currentSegment = segments.join("/");
      document.title = pageTitles[currentSegment] || "Camyo";
    }
  }, [segments]);

   /*
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authenticated = !!userToken; // TODO: revisar si el token está expirado o no.

      const empresaPaths = [
        "/miperfilempresa",
        "/oferta/crear",
        "/miperfilempresa/editar",
        "/oferta/editar/",
      ];

      const camioneroPaths = [
        "/miperfilcamionero",
        "/miperfilcamionero/editar"
      ];

      const adminPaths = [
        "/workinprogress"
      ];

      const authGroupPaths = [...empresaPaths, ...camioneroPaths, ...adminPaths];
      const inAuthGroup = authGroupPaths.some(path => pathname.startsWith(path));

      if (inAuthGroup) {
        if (authenticated && user) {
          switch (user.rol) {
            case 'EMPRESA':
              if (!empresaPaths.some(path => pathname.startsWith(path))) {
                if (pathname !== '/') {
                  setTimeout(() => {
                    router.replace('/forbidden');
                  }, 100);
                }
              }
              break;
  
            case 'CAMIONERO':
              if (!camioneroPaths.some(path => pathname.startsWith(path))) {
                if (pathname !== '/') {
                  setTimeout(() => {
                    router.replace('/forbidden');
                  }, 100);
                }
              }
              break;
  
            case 'ADMIN':
              if (!adminPaths.some(path => pathname.startsWith(path))) {
                if (pathname !== '/') {
                  setTimeout(() => {
                    router.replace('/forbidden');
                  }, 100);
                }
              }
              break;
  
          
          }
        } else {
        }
      }
      setIsLoading(false);
    };

    // Asegúrate de que el layout esté listo antes de verificar la autenticación
    setIsReady(true);
    checkAuthAndRedirect();
  }, [user, userToken, pathname]);
  

  if (isLoading || !isReady) {
    return null; // O un componente de carga
  }*/

  return (
    <>
      {!isMobile && <CamyoWebNavBar />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)/index" />
        <Stack.Screen name="(public)/login" />
        <Stack.Screen name="(public)/registro" />
        <Stack.Screen name="(public)/registro/camionero" />
        <Stack.Screen name="(public)/registro/empresa" />
        <Stack.Screen name="(public)/empresas" />

        <Stack.Screen name="miperfil" />
        <Stack.Screen name="miperfil/editar" />
        
        <Stack.Screen name="oferta/crear" />
        <Stack.Screen name="oferta/editar/[ofertaId]" />
        <Stack.Screen name="oferta/[ofertaId]" />

        <Stack.Screen name="(admin)/workinprogress" />
        <Stack.Screen name="(public)/forbidden" />
      </Stack>
      {isMobile && <BottomBar />}
    </>
  );
}

// Envuelve RootLayout con withAuthProvider antes de exportarlo
export default withAuthProvider(RootLayout);