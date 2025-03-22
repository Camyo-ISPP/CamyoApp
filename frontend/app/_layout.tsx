import { Stack, useSegments, useRouter, usePathname, router } from "expo-router";
import { Platform } from "react-native";
import { useState, useEffect } from 'react';
import CamyoWebNavBar from "./_components/CamyoNavBar";
import BottomBar from "./_components/BottomBar";
import withAuthProvider from '../hoc/withAuthProvider'; 
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

function RootLayout() {
  const segments = useSegments();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
 
  useEffect(() => {
    if (Platform.OS === "web") {
      const pageTitles: Record<string, string> = {
        index: "Inicio",
        login: "Iniciar Sesión",
        registro: "Registro",
        miperfil: "Mi Perfil",
        miperfilempresa: "Mi Perfil Empresa",
        miperfilcamionero: "Mi Perfil Camionero",
        "buscar-ofertas": "Buscar Ofertas",
        "camionero/[camioneroId]": "Perfil Camionero",
        "oferta/crear": "Publicar Nueva Oferta",
        empresas: "Lista de Empresas",
        "empresa/[empresaId]": "Perfil Empresa",
        "oferta/[ofertaId]": "Detalles de la Oferta",
        "miperfilcamionero/editar": "Editar Perfil Camionero",
        "miperfilempresa/editar": "Editar Perfil Empresa",
        "oferta/editar/[ofertaId]": "Editar Oferta",
        workinprogress: "Trabajo en Progreso",
        forbidden: "Acceso Denegado",
        chat:"Chat"
      };

      const currentSegment = segments.join("/");
      document.title = pageTitles[currentSegment] || "Camyo";
    }
  }, [segments]);

  return (
    <>
      <CamyoWebNavBar
        onSearch={(query: string) => {
          router.push({
            pathname: "/buscar-ofertas",
            params: { query }, 
          });
        }}
      />
      <SubscriptionProvider>
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)/index" />
        <Stack.Screen name="(public)/login" />
        <Stack.Screen name="(public)/registro" />
        <Stack.Screen name="(public)/registro/camionero" />
        <Stack.Screen name="(public)/registro/empresa" />
        <Stack.Screen name="(public)/empresas" />

        <Stack.Screen name="miperfil" />
        <Stack.Screen name="miperfil/editar" />
        
        <Stack.Screen name="empresas" />
        <Stack.Screen name="empresa/[empresaId]" />
        <Stack.Screen name="camionero/[camioneroId]" />
        
        <Stack.Screen name="oferta/crear" />
        <Stack.Screen name="oferta/editar/[ofertaId]" />
        <Stack.Screen name="oferta/[ofertaId]" />
        <Stack.Screen name="buscar-ofertas" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="chat/list" />

        <Stack.Screen name="(admin)/workinprogress" />
        <Stack.Screen name="(public)/forbidden" />
      </Stack>
      {isMobile && <BottomBar />}
      </SubscriptionProvider>
    </>

  );
}

// Envuelve RootLayout con withAuthProvider antes de exportarlo
export default withAuthProvider(RootLayout);