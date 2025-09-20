import React, { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    LayersControl,
    LayerGroup,
    ZoomControl
} from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "../../styles/TripMapView.css"

// Custom marker icon (optional)
const customIcon = new L.Icon({
    iconUrl:
        "https://cdn-icons-png.flaticon.com/512/684/684908.png", // custom marker link
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
});

const Routing = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || positions.length < 2) return;

        const routingControl = L.Routing.control({
            waypoints: positions.map((pos) => L.latLng(pos[0], pos[1])),
            routeWhileDragging: false,
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            createMarker: () => null, // prevent adding default route markers
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, positions]);

    return null;
};

const TripMapView = ({ locations, highlightedPlaceId }) => {
    const markerRefs = useRef({});
    const mapRef = useRef(null);
    const { t } = useTranslation();

    const positions = locations.map((place) => [
        parseFloat(place.latitude),
        parseFloat(place.longitude),
    ]);

    // Effect to open popup when `highlightedPlaceId` changes
    // useEffect(() => {
    //     if (
    //         highlightedPlaceId &&
    //         markerRefs.current[highlightedPlaceId] &&
    //         mapRef.current
    //     ) {
    //         const marker = markerRefs.current[highlightedPlaceId];
    //         const latLng = marker.getLatLng();
    //         mapRef.current.flyTo(latLng, 14, { duration: 1.2 });
    //         marker.openPopup();
    //     }
    // }, [highlightedPlaceId]);

    useEffect(() => {
        if (highlightedPlaceId && markerRefs.current[highlightedPlaceId]) {
            mapRef.current.flyTo(markerRefs.current.getLatLng(), 14, { duration: 1.2 })
            markerRefs.current[highlightedPlaceId].openPopup();
        }
    }, [highlightedPlaceId]);

    return (
        <MapContainer
            center={positions[0]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "600px", width: "100%", borderRadius: "8px" }}
            // whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            ref={mapRef}
        >
            {/* Add zoom control to top-right instead */}
            <ZoomControl position="topright" />

            {/* --- Layer Controls --- */}
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name={t("openstreetmap")}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name={t("satellite_view")}>
                    <TileLayer
                        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        attribution='Map data ©2024 Google'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            {locations.map((place) => (
                <Marker
                    key={place.id}
                    position={[
                        parseFloat(place.latitude),
                        parseFloat(place.longitude),
                    ]}
                    icon={customIcon}
                    ref={(ref) => {
                        if (ref) markerRefs.current[place.id] = ref;
                    }}
                >
                    <Popup>
                        <div className="popup-card">
                            <img
                                src={place.image_url}
                                alt={place.name}
                                className="popup-image"
                                onError={(e) => {
                                    e.target.src =
                                        "https://png.pngtree.com/thumb_back/fh260/background/20230411/pngtree-nature-forest-sun-ecology-image_2256183.jpg";
                                }}
                            />
                            <div className="popup-content">
                                <h3>{place.name}</h3>
                                <p>{place.description}</p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <Routing positions={positions} />
        </MapContainer>
    );
};

export default TripMapView;
