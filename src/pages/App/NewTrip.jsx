import React, { useEffect, useRef } from "react";
import { Row, Col, Card, message, Spin, Alert } from "antd";
import { useNavigate } from "react-router";
import TripForm from "../../components/newtrip/NewTripForm";
import MapView from "../../components/newtrip/MapView";

// Import the necessary hooks from your API slices
import { useGetUserPreferencesQuery } from "../../api/userApi";
import { useAddTripMutation } from "../../api/tripApi";
import LoadingAnimationOverlay from "../../components/LoadingAnimation";

const NewTrip = () => {
  const navigate = useNavigate();
  const [messageApi, messageApiContextHolder] = message.useMessage();

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

      messageApi.info(`Trip creating added to queue ${tripId}`); // Show loading for 2 seconds
      navigate(`/user/trips/${tripId}`);

    } catch (err) {
      messageApi.error(err.data?.message || "Failed to create trip. Please try again.");
      console.error('Failed to create trip:', err);
    }
  };

  if (preferences && !preferences.status) {
    messageApi.error(preferences.message);
  }

  if (isAddingTrip) {
    return <LoadingAnimationOverlay text={"Creating your trip"} />
  }

  return (
    <Row gutter={16} style={{ height: "100%", minHeight: "85vh" }}>
      {messageApiContextHolder}
      <Col xs={24} md={14} >
        <Card style={{ borderRadius: 16, height: "100%", overflowY: 'auto' }}>
          {
            isLoadingPreferences ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} >
                {/* <Spin tip="Loading your preferences..." size="large" /> */}
                <LoadingAnimationOverlay text={"Loading your preferences..."} />
              </div>
            ) : (
              <TripForm
                onSubmit={handleFormSubmit}
                defaultPreferences={preferences.data}
                isAddingTrip={isAddingTrip}
              />
            )}
        </Card>
      </Col>
      < Col xs={24} md={10} >
        <Card style={{ borderRadius: 16, height: "100%", overflow: "hidden" }}>
          <MapView />
        </Card>
      </Col>
    </Row>
  );
};

export default NewTrip;

