
export const fetchPlaceSuggestions = async (query, callback) => {
    if (!query) {
        callback([]);
        return;
    }
    try {
        const response = await fetch(`${import.meta.env.VITE_PLACE_SUGGESTIONS}${query}`);
        const data = await response.json();
        const options = data.map(place => ({
            value: place.display_name,
            key: place.place_id,
        }));
        callback(options);
    } catch (error) {
        console.error("Failed to fetch place suggestions:", error);
        callback([]);
    }
};

export const fetchRailWaySuggestions = async (query, callback) => {
    if (!query) {
        callback([]);
        return;
    }
    try {
        const response = await fetch(`${import.meta.env.VITE_RAILWAY_SUGGESTIONS}${query}`);
        const data = await response.json();
        const options = data.map(place => ({
            key: place?.Code,
            value: place?.Code,
            label: `${place?.Name} - ${place?.State}`,
            state: place?.state,
        }));
        callback(options);
    } catch (error) {
        console.error("Failed to fetch place suggestions:", error);
        callback([]);
    }
};

