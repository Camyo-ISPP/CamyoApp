import { Stack, useSegments, useRouter, usePathname, router } from "expo-router";
import { useState, useEffect } from 'react';
import CamyoWebNavBar from "./_components/_layout/CamyoNavBar";
import withAuthProvider from '../hoc/withAuthProvider'; 
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { useAuth } from "../contexts/AuthContext";
import { PopupAdProvider } from "./_components/PopUpAd";

function RootLayout() {
  const segments = useSegments();
  const { user } = useAuth();
 
  useEffect(() => {
      const pageTitles: Record<string, string> = {
        index: "Inicio",
        login: "Iniciar Sesión",
        registro: "Registro",
        miperfil: "Mi Perfil",
        miperfilempresa: "Mi Perfil Empresa",
        miperfilcamionero: "Mi Perfil Camionero",
        "explorar": "Explorar Ofertas",
        "camionero/[camioneroId]": "Perfil Camionero",
        "oferta/crear": "Publicar Nueva Oferta",
        empresas: "Lista de Empresas",
        "empresa/[empresaId]": "Perfil Empresa",
        "oferta/[ofertaId]": "Detalles de la Oferta",
        "miperfilcamionero/editar": "Editar Perfil Camionero",
        "miperfilempresa/editar": "Editar Perfil Empresa",
        workinprogress: "Trabajo en Progreso",
        forbidden: "Acceso Denegado",
        chat:"Mis Mensajes",
        "pago/checkout": "Pago",
        suscripcion: "Planes de Suscripción",
        misofertas: "Mis Ofertas",
        admin: "Panel de Administración",
      };

      const currentSegment = segments.join("/");
      document.title = pageTitles[currentSegment] || "Camyo";

  }, [segments]);

  return (
    <PopupAdProvider user={user}>
      <>
        <CamyoWebNavBar
          onSearch={(query: string) => {
            router.push(`/explorar?query=${query}`);
          }}/>
      
      <PaymentProvider>
      <SubscriptionProvider>
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)/index" />
        <Stack.Screen name="(public)/login" />
        <Stack.Screen name="(public)/registro" />
        <Stack.Screen name="(public)/registro/camionero" />
        <Stack.Screen name="(public)/registro/empresa" />
        <Stack.Screen name="(public)/empresas" />
        <Stack.Screen name="(public)/terminos" />
        <Stack.Screen name="(public)/privacidad" />

        <Stack.Screen name="miperfil" />
        <Stack.Screen name="miperfil/editar" />
        
        <Stack.Screen name="empresas" />
        <Stack.Screen name="empresa/[empresaId]" />
        <Stack.Screen name="camionero/[camioneroId]" />
        
        <Stack.Screen name="oferta/crear" />
        <Stack.Screen name="oferta/[ofertaId]" />
        <Stack.Screen name="explorar" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="chat/list" />
        
        <Stack.Screen name="suscripcion" />

        <Stack.Screen name="(admin)/admin" />
        <Stack.Screen name="(public)/forbidden" />

        <Stack.Screen name="pago/checkout" />
        <Stack.Screen name="misofertas" />
      </Stack>
      
      </SubscriptionProvider>
      </PaymentProvider>
    </>
    </PopupAdProvider>
  );
}

// Envuelve RootLayout con withAuthProvider antes de exportarlo
export default withAuthProvider(RootLayout);