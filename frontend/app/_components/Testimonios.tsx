import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonios = [
  {
    texto: 'Encontré trabajo en menos de una semana gracias a la app. Todo fue rápido y sencillo. ¡Muy recomendable!',
    autor: 'Isabel Pantoja, Sevilla',
  },
  {
    texto: 'Como empresa, necesitábamos cubrir rutas urgentes y en la app dimos con conductores cualificados al instante.',
    autor: 'Transportes Hermanos Sánchez',
  },
  {
    texto: 'Después de meses buscando, finalmente tengo un trabajo estable. Esta plataforma me cambió la vida.',
    autor: 'Juan y Medio, Tomares',
  },
  {
    texto: 'Publicamos una vacante por la mañana y a mediodía ya teníamos chofer asignado.',
    autor: 'Logística SurCargo S.L.',
  },
  {
    texto: 'Nos registramos sin muchas expectativas, pero en menos de 48 horas ya teníamos 3 candidatos serios.',
    autor: 'Distribuciones Ortega e Hijos',
  },
  {
    texto: 'Conectamos con camioneros autónomos cuando más lo necesitamos. Para nosotros es ya una herramienta clave.',
    autor: 'Logística SurCargo S.L.',
  },
  {
    texto: 'Después de tantos portales que prometen, este fue el único que me trajo curro real. Muy agradecido.',
    autor: 'Antonio Romero, Sevilla',
  },
  {
    texto: 'Ahora encuentro trabajo más fácil que aparcar en doble fila. Y eso ya es decir.',
    autor: 'Camión Díaz, San Diego',
  },
  {
    texto: 'Lo mejor que han sacado pa’ los que vivimos en la carretera. Encuentro viajes sin dar mil vueltas.',
    autor: 'Sergio Ramos, Camas',
  },
  {
    texto: 'Estaba tirando de contactos como siempre, pero desde que uso esta app no me falta curro. Mano de santo.',
    autor: 'Fernando Alonso, Oviedo',
  },
  {
    texto: 'Entre Sálvame y Camyo, me quedo con el que me da trabajo. Y cotiza.',
    autor: 'Belén Estebus, Madrid',
  },
  {
    texto: 'Pensé que esto era otra app más del montón… ahora me llaman más que mi ex. Gracias, Camyo.',
    autor: 'Benito Antonio Martínez Ocasio, Bayamón',
  },
];


const Testimonios: React.FC = () => {
  const { width } = useWindowDimensions();

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Testimonios</Text>
      <Text style={styles.subtitle}>¿Quieres ser el próximo en compartir tu experiencia?</Text>

      <View style={[{ width: width > 1200 ? 1000 : width > 800 ? 900 : '100%' }, styles.sliderContainer]}>
        <Slider {...settings}>
          {testimonios.map((item, idx) => (
            <View key={idx}>
              <View style={styles.card}>
                <Text style={styles.text}>"{item.texto}"</Text>
                <Text style={styles.author}>– {item.autor}</Text>
              </View>
            </View>
          ))}
        </Slider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#f5f7fa',
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  sliderContainer: {
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 20,
  },
  author: {
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'right',
  },
});

export default Testimonios;
