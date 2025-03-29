import React, { useEffect, useRef } from 'react';

type RouteMapProps = {
  origin: string;
  destination: string;
  openCageKey: string;
  googleMapsApiKey: string;
};

export const RouteMap: React.FC<RouteMapProps> = ({ origin, destination, openCageKey, googleMapsApiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMap = async () => {
      // 1. Geocode origin and destination using OpenCage
      const getCoordinates = async (location: string): Promise<{ lat: number; lng: number }> => {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length === 0) throw new Error(`No se encontró: ${location}`);
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      };

      const [originCoords, destCoords] = await Promise.all([
        getCoordinates(origin),
        getCoordinates(destination)
      ]);

      // 2. Cargar el script de Google Maps
      const loaderId = 'google-maps-script';
      if (!document.getElementById(loaderId)) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.id = loaderId;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        await new Promise((res) => (script.onload = res));
      }

      // 3. Crear el mapa y trazar la ruta
      const map = new google.maps.Map(mapRef.current!, {
        center: originCoords,
        zoom: 15,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: originCoords,
          destination: destCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            console.error('Error al obtener la ruta:', status);
          }
        }
      );
    };

    loadMap().catch((err) => console.error('Error al cargar el mapa:', err));
  }, [origin, destination, openCageKey, googleMapsApiKey]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};
