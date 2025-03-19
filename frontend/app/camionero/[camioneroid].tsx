import React, { useEffect, useState } from 'react';
import { View, Text, Image, Platform, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import styles from './css/CamioneroScreen'; 
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../_components/BottomBar.jsx';
import CamyoWebNavBar from "../_components/CamyoNavBar.jsx";
import { useNavigation } from '@react-navigation/native';
import defaultBanner from '../../assets/images/banner_default.jpg'; 
import defaultCompanyLogo from '../../assets/images/defaultCompImg.png'; 
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';


interface Review {
    id: number;
    reviewer: string;
    rating: number;
    text: string;
    avatar: string;
}

const CamioneroScreen: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { camioneroid } = useLocalSearchParams(); 
    const [camionero, setCamionero] = useState<any>(null);
    const navigation = useNavigation();
    const router = useRouter();
    const [offers, setOffers] = useState<any[]>([]);
    const PlaceHolderLicencias = 'No tiene licencias';
    const [licencias, setLicencias] = useState<string[]>([]);
    const [disp, setDisp] = useState<string>('');
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    const normalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (camioneroid) {
            fetchCamioneroData();
            fetchOffers();
            navigation.setOptions({ headerShown: false });
        }
    }, [camioneroid]);

    const fetchCamioneroData = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/camioneros/${camioneroid}`);
            setCamionero(response.data);
            setLicencias(response.data.licencias);
            setDisp(response.data.disponibilidad);
        } catch (err) {
            setError((err as Error)?.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ofertas/camionero/${camioneroid}`);
            setOffers(response.data);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

    return (
        <>
            {isMobile ? <BottomBar /> : <CamyoWebNavBar />}
            {camionero && (
            <ScrollView contentContainerStyle={[isMobile ? styles.container : styles.desktopContainer, { paddingTop: isMobile ? 0 : 100, paddingLeft: 10 }]}>
                <View style={styles.bannerContainer}>
                    <Image source={defaultBanner} style={styles.bannerImage} />
                    <View style={isMobile ? styles.profileContainer : styles.desktopProfileContainer}>
                        <Image
                            source={{ uri: camionero.usuario?.foto || 'https://ui-avatars.com/api/?name=' + camionero.usuario?.nombre }}
                            style={isMobile ? styles.avatar : styles.desktopAvatar}
                        />
                        <View style={styles.profileDetailsContainer}>
                            <Text style={isMobile ? styles.name : styles.desktopName}>{camionero.usuario?.nombre}</Text>
                            <View style={styles.detailsRow}>
                                <Text style={styles.infoText}>Disponibilidad: {normalizeFirstLetter(disp || '')}</Text>
                                {camionero.usuario?.experiencia !== undefined && (
                                    <Text style={styles.infoText}>{camionero.usuario.experiencia} años de experiencia</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {isMobile && (
                    <View style={styles.infoContainer}>
                        <View style={styles.infoButton}>
                            <Text style={styles.infoText}>Descripción: {camionero.usuario?.descripcion}</Text>
                        </View>
                        {camionero.usuario?.experiencia !== undefined && (
                            <View style={styles.infoButton2}>
                                <Text style={styles.infoText}>{camionero.usuario.experiencia} años de experiencia</Text>
                            </View>
                        )}
                    </View>
                )}
                <View style={styles.detailsOuterContainer}>
                    <View style={styles.detailsColumn}>
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}>
                                <FontAwesome style={styles.envelopeIcon} name="envelope" size={20} />
                                <Text style={styles.linkText}>
                                    <Text onPress={() => Linking.openURL(`mailto:${camionero.usuario?.email}`)}>{camionero.usuario?.email}</Text>
                                </Text>
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="id-card" size={20} />{licencias.join(', ') || PlaceHolderLicencias}</Text>
                        </View>

                        {camionero.usuario?.vehiculo_propio !== undefined && (
                            <View style={styles.detailItem}>
                                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.truckIcon} name="truck" size={23} />{camionero?.vehiculo_propio ? 'Vehículo propio' : 'Sin vehículo propio'}</Text>
                            </View>
                        )}
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="map" size={20} />{camionero.usuario?.localizacion}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="phone" size={20} />{camionero.usuario?.telefono}</Text>
                        </View>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{capitalizeFirstLetter(camionero.usuario?.descripcion || '')}</Text>
                        </View>
                    </View>
                </View>
                {/* <FlatList
                    data={reviews}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.reviewCard, !isMobile && styles.desktopReviewCard]}>
                            <Image source={{ uri: item.avatar }} style={styles.reviewerAvatar} />
                            <Text style={styles.reviewerName}>{item.reviewer}</Text>
                            <View style={styles.ratingContainer}>
                                {[...Array(5)].map((_, index) => (
                                    <FontAwesome
                                        key={index}
                                        name="star"
                                        size={20}
                                        color={index < item.rating ? colors.primary : colors.lightGray}
                                    />
                                ))}
                            </View>
                            <Text style={styles.reviewText}>{item.text}</Text>
                        </View>
                    )}

                    contentContainerStyle={isMobile ? styles.reviewsContainer : styles.desktopReviewsContainer}
                /> */}
                <View style={styles.offersContainer}>
                    <View style={styles.offersButtonContainer}>
                        <View style={styles.offersButton}>  
                            <Text style={styles.offersButtonText}>Ofertas aceptadas</Text>
                        </View>
                    </View>
                    <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false}>
                        <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {offers.length === 0 || offers[2].length === 0 ? (
                                <Text style={styles.noOffersText}>{"No hay ofertas aceptadas"}</Text>
                            ) : (
                                offers[2].map((item) => (
                                    <View key={item.id} style={styles.card}>
                                        <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                                        <View style={{ width: "30%" }}>
                                            <Text style={styles.offerTitle}>{item.titulo}</Text>
                                            <View style={{ display: "flex", flexDirection: "row" }}>
                                                <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>
                                                <Text style={styles.offerDetailsTagLicense}>{item.licencia}</Text>
                                            </View>
                                            <Text style={styles.offerInfo}>{item.notas}</Text>
                                        </View>
                                        <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                                        <TouchableOpacity style={styles.button} onPress={() => router.replace(`/oferta/${item.id}`)}>
                                            <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                                            <Text style={styles.buttonText}>Ver Detalles</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
            )}
        </>
    );
};

export default CamioneroScreen;