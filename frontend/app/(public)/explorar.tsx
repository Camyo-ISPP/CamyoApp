import { router } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Image, Animated, Dimensions, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from '@react-native-picker/picker';
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
const DefaultLogo = require('../../assets/images/defaultCompImg.png');
import WebFooter from "../_components/_layout/WebFooter";
import ListadoOfertasPublico from "../_components/ListadoOfertasPublico";
import { useAuth } from "../../contexts/AuthContext";
import MapLoader from "../_components/MapLoader";

export default function BuscarOfertas({ searchQuery: externalSearchQuery = '' }: { searchQuery?: string }) {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
    const [selectedOfertaType, setSelectedOfertaType] = useState<'cargas' | 'trabajos' | null>(null);
    const [origenFilter, setOrigenFilter] = useState('');
    const [destinoFilter, setDestinoFilter] = useState('');
    const [minPesoFilter, setMinPesoFilter] = useState('');
    const [maxPesoFilter, setMaxPesoFilter] = useState('');
    const [minExperienceFilter, setMinExperienceFilter] = useState('');
    const [minSalaryFilter, setMinSalaryFilter] = useState('');
    const [jornadaFilter, setJornadaFilter] = useState('');
    const [licenciaFilter, setLicenciaFilter] = useState<string[]>([]);
    const [maxDistanceFilter, setMaxDistanceFilter] = useState('');

    // Posibles valores para los filtros
    const jornadaOptions = ['REGULAR', 'FLEXIBLE', 'COMPLETA', 'NOCTURNA', 'RELEVOS', 'MIXTA'];
    const licenciaOptions = ['AM', 'A1', 'A2', 'A', 'B', 'C1', 'C', 'C+E', 'C1+E', 'D1', 'D+E', 'D1+E', 'D', 'E'];

    const convertLicenseFormat = (licencia: string) => {
        if (licencia.includes('+')) {
            return licencia.replace(/\+/g, '_');
        }
        return licencia.replace(/_/g, '+');
    };

    useEffect(() => {
        const handleUrlChange = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('query') || '';
            if (queryFromUrl) {
                setSearchQuery(queryFromUrl);
                handleSearch(queryFromUrl);
            } else {
                setFilteredData(data);
            }
        };
        handleUrlChange();

        const onPopState = () => handleUrlChange();
        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [data]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/ofertas/info`);
            setData(response.data);
            setFilteredData(response.data.sort((a: { promoted: any; }, b: { promoted: any; }) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0)));
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
          <MapLoader />
        </View>
    );

    const handleSearch = (query = searchQuery) => {
        const normalizedQuery = query.toLowerCase();
        let filteredResults = data.filter((item) => {
            return (
                item.titulo?.toLowerCase().includes(normalizedQuery) ||
                item.nombreEmpresa?.toLowerCase().includes(normalizedQuery) ||
                item.notas?.toLowerCase().includes(normalizedQuery) ||
                item.tipoOferta?.toLowerCase().includes(normalizedQuery)
            );
        });

        if (selectedOfertaType === 'cargas') {
            filteredResults = filteredResults.filter((item) => item.tipoOferta === 'CARGA');

            // Origen Filter
            if (origenFilter) {
                filteredResults = filteredResults.filter((item) =>
                    item.origen?.toLowerCase().includes(origenFilter.toLowerCase())
                );
            }

            // Destino Filter
            if (destinoFilter) {
                filteredResults = filteredResults.filter((item) =>
                    item.destino?.toLowerCase().includes(destinoFilter.toLowerCase())
                );
            }

            // Peso Mínimo Filter
            if (minPesoFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso >= parseFloat(minPesoFilter)
                );
            }

            // Peso Máximo Filter
            if (maxPesoFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.peso <= parseFloat(maxPesoFilter)
                );
            }

            // Presupuesto Filter
            if (minSalaryFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.sueldo >= parseFloat(minSalaryFilter)
                );
            }

            // Experience Filter (para cargas)
            if (minExperienceFilter !== "") {
                if (parseInt(minExperienceFilter) === 5) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 5 && item.experiencia <= 9);
                } else if (parseInt(minExperienceFilter) === 10) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 10);
                } else {
                    filteredResults = filteredResults.filter((item) => item.experiencia === parseInt(minExperienceFilter));
                }
            }

            if (licenciaFilter.length > 0) {
                filteredResults = filteredResults.filter((item) => {
                    const itemLicenses = item.licencia.split(',').map(lic => lic.trim());
                    return licenciaFilter.some(filterLic =>
                        itemLicenses.some(itemLic => itemLic === filterLic)
                    );
                });
            }

            if (maxDistanceFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.distancia <= parseFloat(maxDistanceFilter)
                );
            }

        } else if (selectedOfertaType === 'trabajos') {
            filteredResults = filteredResults.filter((item) => item.tipoOferta.trim().toUpperCase() === 'TRABAJO');

            // Experience Filter
            if (minExperienceFilter !== "") {
                if (parseInt(minExperienceFilter) === 5) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 5 && item.experiencia <= 9);
                } else if (parseInt(minExperienceFilter) === 10) {
                    filteredResults = filteredResults.filter((item) => item.experiencia >= 10);
                } else {
                    filteredResults = filteredResults.filter((item) => item.experiencia === parseInt(minExperienceFilter));
                }
            }

            // Salary Filter
            if (minSalaryFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.sueldo >= parseFloat(minSalaryFilter)
                );
            }

            // Jornada Filter
            if (jornadaFilter) {
                filteredResults = filteredResults.filter(
                    (item) => item.jornada === jornadaFilter
                );
            }

            if (licenciaFilter.length > 0) {
                filteredResults = filteredResults.filter((item) => {
                    const itemLicenses = item.licencia.split(',').map(lic => lic.trim());
                    return licenciaFilter.some(filterLic =>
                        itemLicenses.some(itemLic => itemLic === filterLic)
                    );
                });
            }
        }

        setFilteredData(filteredResults);

        const newUrl = `${window.location.pathname}?query=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newUrl);
    };

    const toggleLicenciaFilter = (licencia: string) => {
        const internalLicencia = convertLicenseFormat(licencia);
        setLicenciaFilter(prev =>
            prev.includes(internalLicencia)
                ? prev.filter(l => l !== internalLicencia)
                : [...prev, internalLicencia]
        );
    };

    const clearFilters = () => {
        setSelectedOfertaType(null);
        setSearchQuery('');
        setOrigenFilter('');
        setDestinoFilter('');
        setMinPesoFilter('');
        setMaxPesoFilter('');
        setMinExperienceFilter('');
        setMinSalaryFilter('');
        setJornadaFilter('');
        setLicenciaFilter([]);
        setMaxDistanceFilter('');
        setFilteredData(data);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.webContainer}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Encuentra las mejores ofertas</Text>
                    <Text style={styles.headerSubtitle}>Filtra y encuentra el trabajo perfecto para ti</Text>
                </View>

                <View style={styles.mainContent}>
                    {/* Filters and Search Bar Card */}
                    <View style={[styles.filtersCard, { alignSelf: 'flex-start' }]}>
                        {/* Search Section */}
                        <View style={styles.searchSection}>
                            <Text style={styles.sectionTitle}>Buscar Ofertas</Text>
                            <View style={styles.searchContainer}>
                                <View style={styles.searchInputContainer}>
                                    <FontAwesome name="search" size={16} color="#666" style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar por palabras clave..."
                                        placeholderTextColor="#888"
                                        value={searchQuery}
                                        onChangeText={(text) => setSearchQuery(text)}
                                        onSubmitEditing={() => handleSearch()}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => handleSearch()}
                                >
                                    <Text style={styles.searchButtonText}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Filter Type Toggle */}
                        <View style={styles.filterTypeSection}>
                            <Text style={styles.sectionTitle}>Tipo de Oferta</Text>
                            <View style={styles.ofertaTypeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.ofertaTypeButton,
                                        selectedOfertaType === 'trabajos' && styles.ofertaTypeButtonActive,
                                    ]}
                                    onPress={() => setSelectedOfertaType('trabajos')}
                                >
                                    <Ionicons
                                        name="briefcase"
                                        size={18}
                                        color={selectedOfertaType === 'trabajos' ? '#fff' : '#666'}
                                    />
                                    <Text style={[
                                        styles.ofertaTypeButtonText,
                                        selectedOfertaType === 'trabajos' && styles.ofertaTypeButtonActiveText,
                                    ]}>
                                        Trabajos
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.ofertaTypeButton,
                                        selectedOfertaType === 'cargas' && styles.ofertaTypeButtonActive,
                                    ]}
                                    onPress={() => setSelectedOfertaType('cargas')}
                                >
                                    <Ionicons
                                        name="cube"
                                        size={18}
                                        color={selectedOfertaType === 'cargas' ? '#fff' : '#666'}
                                    />
                                    <Text style={[
                                        styles.ofertaTypeButtonText,
                                        selectedOfertaType === 'cargas' && styles.ofertaTypeButtonActiveText,
                                    ]}>
                                        Cargas
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        

                        {/* Placeholder cuando no hay tipo seleccionado */}
                        {!selectedOfertaType && (
                            <View style={styles.emptyFilterState}>
                                <MaterialCommunityIcons
                                    name="filter-outline"
                                    size={48}
                                    color="#e0e0e0"
                                    style={styles.emptyFilterIcon}
                                />
                                <Text style={styles.emptyFilterText}>
                                    Selecciona un tipo de oferta para ver los filtros disponibles
                                </Text>
                            </View>
                        )}

                        {/* Filters Section - Solo se muestra cuando hay tipo seleccionado */}
                        {selectedOfertaType && (
                            <View style={styles.filtersSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Filtros Avanzados</Text>
                                    <TouchableOpacity onPress={clearFilters}>
                                        <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
                                    </TouchableOpacity>
                                </View>

                                {selectedOfertaType === 'cargas' && (
                                    <View style={styles.filtersContainer}>
                                        {/* Presupuesto Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialIcons name="euro-symbol" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Presupuesto mínimo</Text>
                                            </View>
                                            <Text style={styles.sliderValue}>{minSalaryFilter}€</Text>
                                            <Slider
                                                style={styles.rangeSlider}
                                                minimumValue={0}
                                                maximumValue={10000}
                                                step={10}
                                                value={minSalaryFilter ? parseFloat(minSalaryFilter) : 0}
                                                minimumTrackTintColor={colors.primary}
                                                maximumTrackTintColor="#e0e0e0"
                                                thumbTintColor={colors.primary}
                                                onValueChange={(value: number) => {
                                                    setMinSalaryFilter(value.toString());
                                                }}
                                            />
                                        </View>
                                        

                                        {/* Experience Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="clock-outline" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Experiencia requerida</Text>
                                            </View>
                                            <Picker
                                                selectedValue={minExperienceFilter}
                                                style={styles.picker}
                                                onValueChange={(itemValue) => setMinExperienceFilter(itemValue)}
                                                dropdownIconColor="#555"
                                            >
                                                <Picker.Item label="Cualquier experiencia" value="" />
                                                <Picker.Item label="0 años de experiencia" value="0" />
                                                <Picker.Item label="1 año de experiencia" value="1" />
                                                <Picker.Item label="2 años de experiencia" value="2" />
                                                <Picker.Item label="3 años de experiencia" value="3" />
                                                <Picker.Item label="4 años de experiencia" value="4" />
                                                <Picker.Item label="5 años de experiencia" value="5" />
                                                <Picker.Item label="10 años de experiencia" value="10" />
                                            </Picker>
                                        </View>

                                        {/* Licencia Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="license" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Licencias requeridas</Text>
                                            </View>
                                            <View style={styles.filterOptions}>
                                                {licenciaOptions.map((licencia) => (
                                                    <TouchableOpacity
                                                        key={licencia}
                                                        style={[
                                                            styles.filterOptionButton,
                                                            licenciaFilter.includes(convertLicenseFormat(licencia)) && styles.filterOptionButtonActive
                                                        ]}
                                                        onPress={() => toggleLicenciaFilter(licencia)}
                                                    >
                                                        <Text style={[
                                                            styles.filterOptionButtonText,
                                                            licenciaFilter.includes(convertLicenseFormat(licencia)) && styles.filterOptionButtonActiveText
                                                        ]}>
                                                            {licencia}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Location Filters */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialIcons name="location-on" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Ubicación</Text>
                                            </View>
                                            <View style={styles.locationInputs}>
                                                <View style={styles.locationInputContainer}>
                                                    <TextInput
                                                        style={styles.filterInput}
                                                        placeholder="Origen (ciudad, región)"
                                                        placeholderTextColor="#888"
                                                        value={origenFilter}
                                                        onChangeText={setOrigenFilter}
                                                    />
                                                </View>
                                                <View style={styles.locationInputContainer}>
                                                    <TextInput
                                                        style={styles.filterInput}
                                                        placeholder="Destino (ciudad, región)"
                                                        placeholderTextColor="#888"
                                                        value={destinoFilter}
                                                        onChangeText={setDestinoFilter}
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        {/* Weight Filters */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="weight-kilogram" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Peso de la carga</Text>
                                            </View>
                                            <View style={styles.weightInputs}>
                                                <View style={styles.weightInputContainer}>
                                                    <TextInput
                                                        style={styles.filterInput}
                                                        placeholder="Mínimo (kg)"
                                                        placeholderTextColor="#888"
                                                        value={minPesoFilter}
                                                        onChangeText={setMinPesoFilter}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.weightInputContainer}>
                                                    <TextInput
                                                        style={styles.filterInput}
                                                        placeholder="Máximo (kg)"
                                                        placeholderTextColor="#888"
                                                        value={maxPesoFilter}
                                                        onChangeText={setMaxPesoFilter}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        {/* Distance Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="map-marker-distance" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Distancia máxima</Text>
                                            </View>
                                            <TextInput
                                                style={styles.filterInput}
                                                placeholder="Distancia máxima en km"
                                                placeholderTextColor="#888"
                                                value={maxDistanceFilter}
                                                onChangeText={setMaxDistanceFilter}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                )}

                                {selectedOfertaType === 'trabajos' && (
                                    <View style={styles.filtersContainer}>
                                        {/* Salary Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialIcons name="euro-symbol" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Salario mínimo</Text>
                                            </View>
                                            <Text style={styles.sliderValue}>{minSalaryFilter}€</Text>
                                            <Slider
                                                style={styles.rangeSlider}
                                                minimumValue={0}
                                                maximumValue={10000}
                                                step={10}
                                                value={minSalaryFilter ? parseFloat(minSalaryFilter) : 0}
                                                minimumTrackTintColor={colors.primary}
                                                maximumTrackTintColor="#e0e0e0"
                                                thumbTintColor={colors.primary}
                                                onValueChange={(value: number) => {
                                                    setMinSalaryFilter(value.toString());
                                                }}
                                            />
                                        </View>

                                        {/* Experience Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="clock-outline" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Experiencia requerida</Text>
                                            </View>
                                            <Picker
                                                selectedValue={minExperienceFilter}
                                                style={styles.picker}
                                                onValueChange={(itemValue) => setMinExperienceFilter(itemValue)}
                                                dropdownIconColor="#555"
                                            >
                                                <Picker.Item label="Cualquier experiencia" value="" />
                                                <Picker.Item label="0 años de experiencia" value="0" />
                                                <Picker.Item label="1 año de experiencia" value="1" />
                                                <Picker.Item label="2 años de experiencia" value="2" />
                                                <Picker.Item label="3 años de experiencia" value="3" />
                                                <Picker.Item label="4 años de experiencia" value="4" />
                                                <Picker.Item label="5 años de experiencia" value="5" />
                                                <Picker.Item label="10 años de experiencia" value="10" />
                                            </Picker>
                                        </View>

                                        {/* Jornada Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="calendar-clock" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Tipo de jornada</Text>
                                            </View>
                                            <Picker
                                                selectedValue={jornadaFilter}
                                                style={styles.picker}
                                                onValueChange={(itemValue) => setJornadaFilter(itemValue)}
                                                dropdownIconColor="#555"
                                            >
                                                <Picker.Item label="Cualquier jornada" value="" />
                                                {jornadaOptions.map((jornada) => (
                                                    <Picker.Item
                                                        key={jornada}
                                                        label={jornada.charAt(0) + jornada.slice(1).toLowerCase()}
                                                        value={jornada}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>

                                        {/* Licencia Filter */}
                                        <View style={styles.filterGroup}>
                                            <View style={styles.filterLabelContainer}>
                                                <MaterialCommunityIcons name="license" size={16} color="#555" />
                                                <Text style={styles.filterLabel}>Licencias requeridas</Text>
                                            </View>
                                            <View style={styles.filterOptions}>
                                                {licenciaOptions.map((licencia) => (
                                                    <TouchableOpacity
                                                        key={licencia}
                                                        style={[
                                                            styles.filterOptionButton,
                                                            licenciaFilter.includes(convertLicenseFormat(licencia)) && styles.filterOptionButtonActive
                                                        ]}
                                                        onPress={() => toggleLicenciaFilter(licencia)}
                                                    >
                                                        <Text style={[
                                                            styles.filterOptionButtonText,
                                                            licenciaFilter.includes(convertLicenseFormat(licencia)) && styles.filterOptionButtonActiveText
                                                        ]}>
                                                            {licencia}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                )}
                                
                            </View>
                            
                        )}
                        
                    </View>
                    {/* Ad Section - Wrap ads in a column */}
                    {user?.ads && (
                        <View style={styles.adsContainer}>
                            {/* First Ad */}
                            <View style={styles.adContainer}>
                                <Image
                                    source={require("../../assets/images/truck_mockup_ad.jpg")} // Replace with your ad image path
                                    style={styles.adImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Second Ad */}
                            <View style={styles.adContainer}>
                                <Image
                                    source={require("../../assets/images/truck_mockup_ad.jpg")} // Replace with another ad image path
                                    style={styles.adImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Add more ads as needed */}
                        </View>
                    )}
                        
                    

                    {/* Offer Cards Section */}
                    <View style={styles.offersSection}>
                        <ListadoOfertasPublico offers={filteredData} showPromoted={true} />
                    </View>
                </View>
                
            </View>
            
            <WebFooter />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: "#f9f9f9",
    },
    webContainer: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: 'center',
        marginBottom: 50,
    },
    header: {
        width: '100%',
        paddingVertical: 25,
        paddingHorizontal: '10%',
        backgroundColor: colors.secondary,
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 18,
        color: colors.white,
        opacity: 0.9,
    },
    mainContent: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    filtersCard: {
        width: '30%',
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 20,
        marginRight: 20,
        height: 'auto',
        shadowColor: "#000",
        flexShrink: 0,
        flexGrow: 0,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    clearFiltersText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    searchSection: {
        marginBottom: 25,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 14,
        outlineStyle: 'none',
    },
    searchButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    filterTypeSection: {
        marginBottom: 25,
    },
    ofertaTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 5,
    },
    ofertaTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 10,
        borderRadius: 6,
        marginHorizontal: 3,
        gap: 8,
    },
    ofertaTypeButtonActive: {
        backgroundColor: colors.primary,
    },
    ofertaTypeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    ofertaTypeButtonActiveText: {
        color: '#fff',
    },
    filtersSection: {
        marginBottom: 15,
    },
    filtersContainer: {
        marginBottom: 10,
    },
    filterGroup: {
        marginBottom: 20,
    },
    filterLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    filterInput: {
        height: 45,
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#333',
        fontSize: 14,
    },
    locationInputs: {
        flexDirection: 'column',
        gap: 10,
    },
    locationInputContainer: {
        flex: 1,
    },
    weightInputs: {
        flexDirection: 'row',
        gap: 10,
    },
    weightInputContainer: {
        flex: 1,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterOptionButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    filterOptionButtonActive: {
        backgroundColor: colors.primary,
    },
    filterOptionButtonText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
    },
    filterOptionButtonActiveText: {
        color: '#fff',
    },
    rangeSlider: {
        width: '100%',
        height: 30,
    },
    sliderValue: {
        textAlign: 'right',
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 5,
    },
    picker: {
        width: '100%',
        height: 45,
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
    },
    offersSection: {
        width: '70%',
        flexShrink: 1,
    },
    companyLogo: {
        height: 90,
        width: 120,
        marginRight: 10,
        marginLeft: -10,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
        color: colors.secondary
    },
    offerDetailsTagType: {
        fontSize: 9,
        backgroundColor: colors.primary,
        color: colors.white,
        borderRadius: 10,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "700",
    },
    offerDetailsTagLicense: {
        fontSize: 9,
        backgroundColor: colors.secondary,
        borderRadius: 10,
        color: colors.white,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
    },
    offerDetailsTagExperience: {
        fontSize: 9,
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: 10,
        color: colors.primary,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
    },
    offerInfo: {
        fontSize: 12,
        color: "gray",
        marginTop: 5,
    },
    offerSueldo: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "right",
        paddingLeft: 3,
        color: colors.secondary,
        textAlignVertical: "center",
        width: "35%",
        alignSelf: "center"
    },
    promotedCard: {
        borderWidth: 2,
        borderColor: colors.secondary,
    },
    patrocinadoBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: colors.secondary,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    patrocinadoText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
    button: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: "2%",
        marginTop: 4,
        flexDirection: "row",
        height: 40,
        width: 150,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: colors.white,
        fontWeight: "bold"
    },
    detailsIcon: {
        color: colors.white,
        alignSelf: "center",
        marginLeft: 3,
        marginTop: 3,
        marginRight: 5,
    },
    localizacion: {
        fontSize: 15,
        color: "#696969",
    },
    emptyFilterState: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f0f0f0',
        borderStyle: 'dashed',
        borderRadius: 10,
    },
    emptyFilterIcon: {
        marginBottom: 15,
        opacity: 0.5,
    },
    emptyFilterText: {
        textAlign: 'center',
        color: '#a0a0a0',
        fontSize: 16,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    contenedorOfertas: { width: '100%' },
    adsContainer: {
        marginTop: 20,
        justifyContent: "flex-start", // Stack ads vertically
        gap: 20, // Add spacing between ads
        position: "relative",
        right: 375,
        top: 500,
        width: "10%",
    },
    adContainer: {
        width: "10%", // Adjust width as needed
   
    },
    adImage: {
        width: 408, // Adjust width as needed
        height: 612, // Adjust height as needed
        borderRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white
    },
});
