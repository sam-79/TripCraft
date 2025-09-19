import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import { themeColors } from './mapStyle'; 

const CustomMarker = ({ place, onClick, isSelected, index }) => {
    const position = {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
    };

    return (
        <AdvancedMarker position={position} onClick={() => onClick(place)}>
            <motion.div
                animate={{ scale: isSelected ? [1.5, 1.2] : 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                title={place.name}
                style={{ cursor: 'pointer' }}
            >
                <Pin
                    background={isSelected ? themeColors.selected : themeColors.primary}
                    borderColor={'#FFFFFF'}
                    glyph={`${index + 1}`}
                    glyphColor={'#FFFFFF'}
                />
            </motion.div>
        </AdvancedMarker>
    );
};

export default CustomMarker;