import React, { useEffect, useState } from 'react';
import { View, Text, Image, Platform, ScrollView, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import frontendData from '../../assets/frontendData.json'; // Adjust the path if necessary
import styles from './css/UserProfileScreen'; // Adjust the path if necessary
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../_components/BottomBar.jsx';
import CamyoWebNavBar from "../_components/CamyoNavBar.jsx";
import { useNavigation } from '@react-navigation/native';
import colors from '@/assets/styles/colors';
import defaultBanner from '../../assets/images/banner_default.jpg'; // Ensure this path is correct or update it accordingly
import defaultCompanyLogo from '../../assets/images/defaultCompImg.png'; // Ensure this path is correct or update it accordingly
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { router } from 'expo-router';

interface UserProfile {
    id: number;
    nombre: string;
    email: string;
    tipo: string;
    experiencia?: number;
    licencias?: string[];
    vehiculo_propio?: boolean;
    ubicacion: string;
    avatar: string;
}

interface Review {
    id: number;
    reviewer: string;
    rating: number;
    text: string;
    avatar: string;
}

// Get the first user from the JSON data
const placeholderUser: UserProfile = {
    id: frontendData.usuarios[0].id,
    nombre: frontendData.usuarios[0].nombre,
    email: frontendData.usuarios[0].email,
    tipo: frontendData.usuarios[0].tipo,
    experiencia: frontendData.usuarios[0].experiencia,
    licencias: frontendData.usuarios[0].licencias,
    vehiculo_propio: frontendData.usuarios[0].vehiculo_propio,
    ubicacion: frontendData.usuarios[0].ubicacion,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg', // Placeholder image URL of a person
};

// Fake reviews data
const reviews: Review[] = [
    { id: 1, reviewer: 'John Doe', rating: 4, text: 'Great service!', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 2, reviewer: 'Jane Smith', rating: 5, text: 'Highly recommended!', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, reviewer: 'Alice Johnson', rating: 3, text: 'Good, but could be better.', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: 4, reviewer: 'Bob Brown', rating: 4, text: 'Very satisfied!', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 5, reviewer: 'Charlie Davis', rating: 5, text: 'Excellent experience!', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const UserProfileScreen: React.FC = () => {
    //const [user, setUser] = useState<UserProfile | null>(placeholderUser);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation();
    const { userToken, user } = useAuth();
    const [offers, setOffers] = useState<any[]>([]);
    const placeholderAvatar = 'https://ui-avatars.com/api/?name='
    const PlaceHolderLicencias = 'No tiene licencias'

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    useEffect(() => {
       /* if (!userToken) {
            router.push('/login');
        }
            */
        fetchOffers();
        // Hide the default header
        navigation.setOptions({ headerShown: false });

        // Fetch user profile based on session ID
        
        

        
    }, [userToken,user]);

    const fetchOffers = async () => {
        try {
          const response = await axios.get('http://localhost:8080/ofertas');
          console.log(response.data);
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

    console.log(userToken)
    console.log("id" + user)
    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

    return (
        <>
            {isMobile ? <BottomBar /> : <CamyoWebNavBar />}
            <ScrollView contentContainerStyle={[isMobile ? styles.container : styles.desktopContainer, { paddingTop: isMobile ? 0 : 100, paddingLeft: 10 }]}>
            <View style={styles.bannerContainer}>
                <Image source={defaultBanner} style={styles.bannerImage} />
                <View style={isMobile ? styles.profileContainer : styles.desktopProfileContainer}>
                    <Image 
                        source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.nombre }} 
                        style={isMobile ? styles.avatar : styles.desktopAvatar} 
                    />
                    <View style={styles.profileDetailsContainer}>
                        <Text style={isMobile ? styles.name : styles.desktopName}>{user?.nombre}</Text>
                        <View style={styles.detailsRow}>
                            <Text style={styles.infoText}>Tipo: {capitalizeFirstLetter(user?.descripcion || '')}</Text>
                            {user?.experiencia !== undefined && (
                                <Text style={styles.infoText}>{user.experiencia} años de experiencia</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
            
                {isMobile && (
                    <View style={styles.infoContainer}>
                        <View style={styles.infoButton}>
                            <Text style={styles.infoText}>Descripción: {user?.descripcion}</Text>
                        </View>
                        {user?.experiencia !== undefined && (
                            <View style={styles.infoButton2}>
                                <Text style={styles.infoText}>{user.experiencia} años de experiencia</Text>
                            </View>
                        )}
                    </View>
                                    )}
                <View style={styles.detailsOuterContainer}>
                    <View style={styles.detailsColumn}>
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}>
                                <FontAwesome style={styles.envelopeIcon} name="envelope" size={20}/>
                                 <Text style={styles.linkText}>
                                    <Text onPress={() => Linking.openURL(`mailto:${user?.email}`)}>{user?.email}</Text>
                                    </Text>  
                            </Text>
                        </View>
                        {user?.licencias && (
                            <View style={styles.detailItem}>
                                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="id-card" size={20}/>{user?.licencias.join(', ') || PlaceHolderLicencias}</Text>
                            </View>
                        )}
                        {user?.vehiculo_propio !== undefined && (
                            <View style={styles.detailItem}>
                                <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.truckIcon} name="truck" size={23}/>{user.vehiculo_propio ? 'Vehículo propio' : 'Sin vehículo propio'}</Text>
                            </View>
                        )}
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="map" size={20}/>{user?.localizacion}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={isMobile ? styles.detailsText : styles.desktopDetailsText}><FontAwesome style={styles.icon} name="phone" size={20}/>{user?.telefono}</Text>
                        </View>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{capitalizeFirstLetter(user?.descripcion || '')}</Text>
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
                        <TouchableOpacity style={styles.offersButton}>
                            <Text style={styles.offersButtonText}>Ofertas nuevas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.offersButton}>
                            <Text style={styles.offersButtonText}>Ofertas aplicadas</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false}>
                        <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {offers && offers.map((item) => (
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
                                    <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
                                        <MaterialCommunityIcons name="details" size={15} color="white" style={styles.detailsIcon} />
                                        <Text style={styles.buttonText}>Ver Detalles</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </>
        
    );
};

export default UserProfileScreen;