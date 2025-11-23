import React from 'react';
import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';
import "../styles/AnimationOverlay.css"
import LoadingAnimation from "/public/animations/loading.json"

const LoadingAnimationOverlay = ({ text }) => {
    const { t } = useTranslation();

    // If text is provided, use it, otherwise use a default loading message
    const displayText = text || t('loading');
    return (
        <div className="animation-overlay">
            <div className="animation-content">
                <Lottie
                    animationData={LoadingAnimation}
                    loop={true}
                    style={{ width: 150, height: 150 }}
                />
                {displayText && <p className="animation-text">{displayText}</p>}
            </div>
        </div>
    );
};

export default LoadingAnimationOverlay;