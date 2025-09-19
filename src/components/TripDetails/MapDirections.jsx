import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { themeColors } from './mapStyle'; 

const MapDirections = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || locations.length < 2) return;

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true, // for  custom markers
            polylineOptions: {
                strokeColor: themeColors.route, // Use the themed route color
                strokeOpacity: 0.9,
                strokeWeight: 6,
            },
        });

        directionsRenderer.setMap(map);

        const origin = {
            lat: parseFloat(locations[0].latitude),
            lng: parseFloat(locations[0].longitude),
        };
        const destination = {
            lat: parseFloat(locations[locations.length - 1].latitude),
            lng: parseFloat(locations[locations.length - 1].longitude),
        };
        const waypoints = locations.slice(1, -1).map(place => ({
            location: {
                lat: parseFloat(place.latitude),
                lng: parseFloat(place.longitude),
            },
            stopover: true,
        }));

        directionsService.route(
            {
                origin,
                destination,
                waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                } else {
                    console.error(`Directions request failed due to ${status}`);
                }
            }
        );

        // Cleanup function
        return () => {
            directionsRenderer.setMap(null);
        };

    }, [map, locations]);

    return null; // This component does not render anything itself
};

export default MapDirections;