import React, { useEffect, useRef } from "react";
import { Row, Col, Card, message, Spin, Alert, Grid } from "antd";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import TripForm from "../../components/newtrip/NewTripForm";
import MapView from "../../components/newtrip/MapView";

// Import the necessary hooks from your API slices
import { useGetUserPreferencesQuery } from "../../api/userApi";
import { useAddTripMutation } from "../../api/tripApi";
import LoadingAnimationOverlay from "../../components/LoadingAnimation";

const NewTrip = () => {
  const navigate = useNavigate();
  const [messageApi, messageApiContextHolder] = message.useMessage();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();

  // 1. Fetch user preferences to pre-fill the form.
  const { data: preferences, isLoading: isLoadingPreferences, isSuccess, error: preferencesError, } = useGetUserPreferencesQuery();

  // 2. Get the mutation hook for adding a new trip
  const [addTrip, { data: newTripData, isLoading: isAddingTrip }] = useAddTripMutation();


  const handleFormSubmit = async (formData) => {
    try {
      const response = await addTrip(formData).unwrap(); // Fire and forget, don't await
      const tripId = response?.data.trip_id;

      console.log(`New Trip response: ${response}`)
      console.log(`New Trip newTripData: ${newTripData}`)

      messageApi.info(t('trip_creation_queued', { tripId })); // Show loading for 2 seconds
      navigate(`/user/trips/${tripId}`);

    } catch (err) {
      messageApi.error(err.data?.message || t('trip_creation_failed'));
      console.error('Failed to create trip:', err);
    }
  };

  if (preferences && !preferences.status) {
    messageApi.error(preferences.message);
  }

  if (isAddingTrip) {
    return <LoadingAnimationOverlay text={t("creating_your_trip")} />
  }

  return (
    <Row gutter={16} style={{ height: "100%", minHeight: "85vh" }}>
      {messageApiContextHolder}
      <Col xs={24} md={14} lg={16}>
        <TripForm onSubmit={handleFormSubmit} defaultPreferences={preferences?.data} isAddingTrip={isAddingTrip} />
      </Col>
      <Col xs={24} md={10} lg={8} style={{ height: screens.xs ? "300px" : "100%" }}>
        <Card style={{ height: "100%", borderRadius: 16 }} bodyStyle={{ padding: 8, height: "100%" }}>
          <MapView />
        </Card>
      </Col>
    </Row>
  );
};

export default NewTrip;

