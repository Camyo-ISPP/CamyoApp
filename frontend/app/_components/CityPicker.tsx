// Componente independiente CityPicker.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import colors from '@/assets/styles/colors';

const CityPicker = ({ label, field, icon, formData, handleInputChange }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    setSearchText(formData[field] ?? "");
  }, [formData[field]]);
  
  // Función para buscar ciudades con Nominatim
  const searchCities = async (query) => {
    if (query.length < 3) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?`,
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 10,
          }
        }
      );
      
      const uniqueCities = [];
      const seen = new Set();
      
      response.data.forEach(item => {
        const cityName = item.address.city || item.address.town || item.address.village;
        if (cityName && !seen.has(cityName)) {
          seen.add(cityName);
          uniqueCities.push({
            name: cityName,
            state: item.address.state,
            country: item.address.country
          });
        }
      });
      
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText) {
        searchCities(searchText);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <View style={{ width: '90%', marginBottom: 15 }}>
      <Text style={{
        fontSize: 16,
        color: colors.secondary,
        marginLeft: 8,
        marginBottom: -6,
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        paddingHorizontal: 5,
        zIndex: 1,
        outline: 'none',
      }}>
        {label}
      </Text>
      
      <View style={styles.inputContainerStyle}>
        {React.cloneElement(icon, { color: colors.primary })}
        
        <TextInput
          style={{
            flex: 1,
            height: 40,
            paddingLeft: 8,
            color: 'black',
            outline: 'none',
          }}
          placeholder="Busca una ciudad..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (text === '') {
              handleInputChange(field, '');
              setCities([]);
            }
          }}
        />
        
        {loading && <ActivityIndicator size="large" color={colors.primary} />}
      </View>
      
      {cities.length > 0 && (
        <View style={{
          maxHeight: 200,
          borderWidth: 1,
          borderColor: colors.lightGray,
          borderRadius: 5,
          marginTop: 5,
          backgroundColor: colors.white,
          zIndex: 1000
        }}>
          <ScrollView>
            {cities.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 10,
                  borderBottomWidth: 0,
                  borderBottomColor: colors.lightGray,
                  outline: 'none',
                }}
                onPress={() => {
                  handleInputChange(field, city.name);
                  setSearchText(city.name);
                  setCities([]);
                }}
              >
                <Text style={{ color: colors.primary }}>
                  {city.name}
                  {city.state && `, ${city.state}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    inputContainerStyle: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.mediumGray,
      borderRadius: 8,
      paddingHorizontal: 10,
      backgroundColor: colors.white,
    },
  });

export default CityPicker;