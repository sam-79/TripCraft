import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const MapHandler = ({ locations, highlightedPlaceId }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !window.google) return;

        if (highlightedPlaceId) {
            // A place is selected, fly to it
            const place = locations.find(p => p.id === highlightedPlaceId);
            if (place) {
                map.panTo({ lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) });
                map.setZoom(15);
            }
        } else if (locations.length > 0) {
            // No place selected, fit all markers in view
            const bounds = new window.google.maps.LatLngBounds();
            locations.forEach(place => {
                bounds.extend({
                    lat: parseFloat(place.latitude),
                    lng: parseFloat(place.longitude),
                });
            });
            map.fitBounds(bounds, 100); // 100px padding
        }
    }, [map, locations, highlightedPlaceId]);

    return null;
};

export default MapHandler;