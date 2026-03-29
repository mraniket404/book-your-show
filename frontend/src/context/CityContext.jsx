import React, { createContext, useState, useEffect, useContext } from 'react';
import theatreService from '../services/theatreService';

// Create the context
export const CityContext = createContext();

// Custom hook to use the city context
export const useCity = () => {
    const context = useContext(CityContext);
    if (!context) {
        throw new Error('useCity must be used within CityProvider');
    }
    return context;
};

// Provider component
export const CityProvider = ({ children }) => {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(() => {
        return localStorage.getItem('selectedCity') || 'Mumbai';
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCities = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📍 Loading cities...');
            
            const response = await theatreService.getCities();
            console.log('📍 Cities response:', response);
            
            if (response.success && response.data) {
                setCities(response.data);
                // If selected city is not in the list, default to first city
                if (selectedCity && !response.data.includes(selectedCity) && response.data.length > 0) {
                    setSelectedCity(response.data[0]);
                    localStorage.setItem('selectedCity', response.data[0]);
                }
            } else {
                // Fallback cities if API fails
                const fallbackCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
                setCities(fallbackCities);
                if (!selectedCity) {
                    setSelectedCity(fallbackCities[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load cities:', err);
            setError('Failed to load cities. Using default cities.');
            // Fallback cities
            const fallbackCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
            setCities(fallbackCities);
            if (!selectedCity) {
                setSelectedCity(fallbackCities[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCities();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            localStorage.setItem('selectedCity', selectedCity);
        }
    }, [selectedCity]);

    const value = {
        cities,
        selectedCity,
        setSelectedCity,
        loading,
        error,
        refreshCities: loadCities
    };

    return (
        <CityContext.Provider value={value}>
            {children}
        </CityContext.Provider>
    );
};