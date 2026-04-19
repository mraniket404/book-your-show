import React, { createContext, useState, useEffect, useContext } from 'react';
import theatreService from '../services/theatreService';

export const CityContext = createContext();

export const useCity = () => {
    const context = useContext(CityContext);
    if (!context) {
        throw new Error('useCity must be used within CityProvider');
    }
    return context;
};

export const CityProvider = ({ children }) => {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(() => {
        return localStorage.getItem('selectedCity') || '';
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCities = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await theatreService.getCities();
            
            if (response.success && response.data && response.data.length > 0) {
                setCities(response.data);
                if (!selectedCity && response.data.length > 0) {
                    setSelectedCity(response.data[0]);
                    localStorage.setItem('selectedCity', response.data[0]);
                }
            } else {
                setError('No cities found');
                setCities([]);
            }
        } catch (err) {
            console.error('Failed to load cities:', err);
            setError(err.response?.data?.message || 'Failed to load cities');
            setCities([]);
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