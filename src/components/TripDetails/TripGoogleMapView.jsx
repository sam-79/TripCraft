import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import MapHandler from './MapHandler';
import CustomMarker from './CustomMarker';
import PlaceInfoWindow from './PlaceInfoWindow';
import MapDirections from './MapDirections';
import { mapStyle } from './mapStyle'; // Import style from its own file
import "../../styles/TripGoogleMapView.css"

const { Title, Text } = Typography;

const TripGoogleMapView = ({ locations, highlightedPlaceId }) => {
    const { t } = useTranslation();
    const [selectedPlace, setSelectedPlace] = useState(null);

    // Find the index of the currently selected place
    const selectedPlaceIndex = useMemo(() => {
        if (!selectedPlace) return -1;
        return locations.findIndex(p => p.id === selectedPlace.id);
    }, [locations, selectedPlace]);

    // Effect to open InfoWindow when a place is highlighted from the list
    useEffect(() => {
        if (highlightedPlaceId) {
            const place = locations.find(p => p.id === highlightedPlaceId);
            setSelectedPlace(place || null);
        } else {
            setSelectedPlace(null);
        }
    }, [highlightedPlaceId, locations]);

    const center = useMemo(() => {
        if (locations.length > 0) {
            return {
                lat: parseFloat(locations[0].latitude),
                lng: parseFloat(locations[0].longitude),
            };
        }
        return { lat: 20.5937, lng: 78.9629 }; // Default to India
    }, [locations]);

    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="map-error-container">
                <Title level={4}>{t('configuration_missing')}</Title>
                <Text>{t('add_google_maps_key')} <Text code>VITE_GOOGLE_MAPS_API_KEY</Text> {t('to_env_file')}</Text>
            </div>
        );
    }

    if (locations.length === 0) {
        return <div className="map-placeholder">{t('finding_locations')}</div>;
    }

    return (
        <div className="map-container-google">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={center}
                    defaultZoom={12}
                    mapId="a2e7318721617490"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    styles={mapStyle}
                >
                    <MapHandler locations={locations} highlightedPlaceId={highlightedPlaceId} />
                    <MapDirections locations={locations} />

                    {/* {locations.map((place) => (
                        <CustomMarker
                            key={place.id}
                            place={place}
                            onClick={() => setSelectedPlace(place)}
                            isSelected={selectedPlace?.id === place.id}
                        />
                    ))}

                    {selectedPlace && (
                        <PlaceInfoWindow
                            place={selectedPlace}
                            onCloseClick={() => setSelectedPlace(null)}
                        />
                    )} */}

                    {locations.map((place, index) => (
                        <CustomMarker
                            key={place.id}
                            place={place}
                            index={index} // <-- PASS THE INDEX HERE
                            onClick={() => setSelectedPlace(place)}
                            isSelected={selectedPlace?.id === place.id}
                        />
                    ))}

                    {selectedPlace && selectedPlaceIndex !== -1 && (
                        <PlaceInfoWindow
                            place={selectedPlace}
                            index={selectedPlaceIndex} // <-- PASS THE INDEX HERE
                            onCloseClick={() => setSelectedPlace(null)}
                        />
                    )}
                </Map>
            </APIProvider>
        </div>
    );
};

export default TripGoogleMapView;