import React from "react";

const MapView = ({ destination }) => {
  // If user has entered a destination, embed that
  const mapQuery = destination ? encodeURIComponent(destination) : "India";

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <iframe
        title="Google Maps"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/place?q=${mapQuery}&key=DUMMYKEY`}
      />
    </div>
  );
};

export default MapView;