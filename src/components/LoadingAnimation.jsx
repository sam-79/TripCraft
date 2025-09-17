import React from 'react';
import Lottie from 'lottie-react';
import "../styles/AnimationOverlay.css"
import LoadingAnimation from "/public/animations/loading.json"

const LoadingAnimationOverlay = ({ text }) => {
    return (
        <div className="animation-overlay">
            <div className="animation-content">
                <Lottie
                    animationData={LoadingAnimation}
                    loop={true}
                    style={{ width: 150, height: 150 }}
                />
                {text && <p className="animation-text">{text}</p>}
            </div>
        </div>
    );
};

export default LoadingAnimationOverlay;