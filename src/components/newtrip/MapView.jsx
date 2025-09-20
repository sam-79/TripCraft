import React from "react";
import { useTranslation } from "react-i18next";

const MapView = ({ destination }) => {
  const { t } = useTranslation();
  // If user has entered a destination, embed that
  const mapQuery = destination ? encodeURIComponent(destination) : "India";

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <iframe
        title={t("google_maps_view")}
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