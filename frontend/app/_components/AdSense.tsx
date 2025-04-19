import React, { useEffect, useState } from 'react';

const AdSense = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false); // Controla si el anuncio ya se cargó

  useEffect(() => {
    // Verificar si el script de AdSense ya está cargado
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) {
      console.log('Script de AdSense ya cargado.');
      return;
    }

    // Crear el script de Google AdSense
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4434133815240639'; // Tu ID de cliente
    script.async = true;
    script.crossOrigin = 'anonymous';

    // Agregar el script al head del documento
    document.head.appendChild(script);

    // Iniciar los anuncios después de cargar el script
    script.onload = () => {
      try {
        if (!isAdLoaded) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsAdLoaded(true); // Marcar el anuncio como cargado
          console.log('Anuncios de AdSense cargados correctamente.');
        }
      } catch (error) {
        console.error('Error al cargar los anuncios de AdSense:', error);
      }
    };

    // Manejar errores en caso de que el script falle
    script.onerror = () => {
      console.error('Error al cargar el script de AdSense.');
    };

    // Limpiar el script cuando el componente se desmonte
    return () => {
      document.head.removeChild(script);
    };
  }, [isAdLoaded]); // Añadir isAdLoaded como dependencia

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' , border: "1px solid blue" }}
      data-ad-client="ca-pub-4434133815240639" // Tu ID de cliente
      data-ad-slot="9365978845"               // Usar ID de prueba
      data-ad-format="auto"
      data-full-width-responsive="true"  
      data-adtest="off"     // Hacer que el anuncio sea responsive
    />
    
  );
};

export default AdSense;