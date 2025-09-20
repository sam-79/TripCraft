import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Typography, Spin, Alert, Button, Row, Col, Segmented, List, Avatar, Popconfirm, message, Tooltip } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGetTripByIdQuery, useDeleteTripPlaceMutation, useGenerateItineraryMutation, useGenerateTravelModeMutation } from '../../api/tripApi';
import { useGetBookingSuggestionsQuery } from '../../api/bookingApi';

// Import the child components
// import TripMapView from '../../components/TripDetails/TripMapView';
import TripGoogleMapView from '../../components/TripDetails/TripGoogleMapView';
import TripItineraryView from '../../components/TripDetails/TripItineraryView';
import TripInfoDisplay from '../../components/TripDetails/TripInfoDisplay';
import TripTravelOptions from '../../components/TripDetails/TripTravelOptions';
import LoadingAnimationOverlay from '../../components/LoadingAnimation';
import TripBookingView from '../../components/TripDetails/TripBookingView';



const { Title, Text } = Typography;

const TripsDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [messageApi, messageApiContextHolder] = message.useMessage();
    const { t } = useTranslation();

    // State for the currently selected view (map, itinerary, etc.)
    const [activeView, setActiveView] = useState('info');
    const [highlightedPlaceId, setHighlightedPlaceId] = useState(null);

    // Fetch trip data
    const { data: trip, error: tripError, isLoading } = useGetTripByIdQuery(tripId, {
        // Polling to check the status of itinerary generation
        pollingInterval: (tripData) => {
            // Only poll if the trip is being processed
            return tripData?.itineraries_status && tripData.itineraries_status !== 'completed'
                ? 5000 // Poll every 5 seconds if it's still processing
                : 0;   // Stop polling once completed or if there's nothing to poll
        },
    });

    // Determine if the itinerary is ready
    const itineraryReady = trip?.itineraries_status === 'completed';
    const travelOptsReady = trip?.travel_options_status === 'completed';

    // Booking suggestions query - only runs when we have a tripId
    const { data: bookingData, error: bookingError, isLoading: isLoadingBooking } = useGetBookingSuggestionsQuery(tripId, {
        skip: !tripId,
    });

    const [deleteTripPlace, { isLoading: isDeletingPlace }] = useDeleteTripPlaceMutation();
    const [generateItinerary, { isLoading: isGeneratingItinerary }] = useGenerateItineraryMutation();
    const [generatetravelMode, { isLoading: isTravelModeLoading }] = useGenerateTravelModeMutation();


    // When the itinerary is ready, automatically switch to that view
    useEffect(() => {
        // Automatically switch view based on generation progress
        if (trip?.itineraries_status) {
            setActiveView('itinerary');
        } else if (trip?.travel_options_status) {
            setActiveView('travel');
        }
    }, [trip?.itineraries_status, trip?.travel_options_status]);


    const handleDeletePlace = async (placeId) => {
        try {
            await deleteTripPlace(placeId).unwrap();
            messageApi.success(t('place_removed'));
        } catch (err) {
            messageApi.error(t('place_removal_error'));
        }
    };

    const handleGenerateItinerary = async () => {
        try {
            generateItinerary(tripId).unwrap();
            generatetravelMode(tripId).unwrap();
            messageApi.loading({ content: t('generating_itinerary'), key: 'itinerary' });
            // Polling will automatically handle showing the result
        } catch (err) {
            messageApi.error({ content: t('itinerary_generation_failed'), key: 'itinerary' });
        }
    };


    const renderContent = () => {
        if (isLoading && !trip) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>
                <LoadingAnimationOverlay text={t('loading_trip_details')} />
            </div>;
        }

        if (tripError) {
            return <Alert message={t('error')} description={t('trip_load_error')} type="error" />;
        }

        if (trip) {
            return (
                <Row gutter={[16, 16]} style={{ height: '100%' }}>
                    {/* Left Column - Content */}
                    <Col span={14} style={{ height: '100%' }}>
                        <Card
                            style={{ borderRadius: 12, height: '100%' }}
                            tabList={[
                                {
                                    key: 'info',
                                    tab: t('details'),
                                },
                                {
                                    key: 'places',
                                    tab: t('places'),
                                    disabled: !trip.places || trip.places.length === 0
                                },
                                {
                                    key: 'itinerary',
                                    tab: t('itinerary'),
                                    disabled: !itineraryReady
                                },
                                {
                                    key: 'travel',
                                    tab: t('travel_options'),
                                    disabled: !travelOptsReady
                                },
                                {
                                    key: 'booking',
                                    tab: t('booking'),
                                    disabled: !bookingData
                                },
                            ]}
                            activeTabKey={activeView}
                            onTabChange={setActiveView}
                            bodyStyle={{ height: 'calc(100% - 57px)', overflowY: 'auto' }} // 57px is the height of the tab header
                        >
                            {activeView === 'info' && (
                                <TripInfoDisplay trip={trip} />
                            )}

                            {activeView === 'places' && (
                                <>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={trip.places}
                                        renderItem={(item) => (
                                            <List.Item
                                                key={item.id}
                                                actions={[
                                                    <Popconfirm
                                                        title={t('remove_place_confirmation')}
                                                        onConfirm={() => handleDeletePlace(item.id)}
                                                        okText={t('yes')}
                                                        cancelText={t('no')}
                                                    >
                                                        <Button icon={<DeleteOutlined />} danger loading={isDeletingPlace} />
                                                    </Popconfirm>
                                                ]}
                                                onMouseEnter={() => setHighlightedPlaceId(item.id)}
                                                onMouseLeave={() => setHighlightedPlaceId(null)}
                                                className="list-item-hover"
                                            >
                                                <List.Item.Meta avatar={<Avatar src={item.image_url} />} title={item.name} description={item.description} />
                                            </List.Item>
                                        )}
                                    />

                                    <Button
                                        type="primary"
                                        block
                                        style={{ marginTop: 16 }}
                                        onClick={handleGenerateItinerary}
                                        loading={isGeneratingItinerary}
                                    >
                                        {itineraryReady ? t('update_itinerary') : t('generate_itinerary')}
                                    </Button>

                                </>
                            )}

                            {activeView === 'travel' && (
                                !travelOptsReady
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        <LoadingAnimationOverlay text={trip.travel_options_status_message || t('calculating_travel_options')} />
                                    </div>
                                    : <TripTravelOptions travelOptions={trip.travel_options} />
                            )}

                            {activeView === 'itinerary' && (
                                !itineraryReady
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        <LoadingAnimationOverlay text={trip.itineraries_status_message || t('creating_itinerary')} />
                                    </div>
                                    : <TripItineraryView itinerary={trip.itineraries} />
                            )}

                            {activeView === 'booking' && (
                                isLoadingBooking
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        <LoadingAnimationOverlay text={t('loading_booking_options')} />
                                    </div>
                                    : bookingError
                                        ? <Alert message={t('error')} description={t('booking_options_error')} type="error" />
                                        : <TripBookingView bookingData={bookingData} />
                            )}
                        </Card>
                    </Col>

                    {/* Right Column - Map */}
                    <Col span={10} style={{ height: '100%' }}>
                        <TripGoogleMapView
                            tripPlaces={trip.places}
                            highlightedPlaceId={highlightedPlaceId}
                        />
                    </Col>
                </Row>
            );
        }

        return <Alert message={t('trip_unavailable')} type="warning" />;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {messageApiContextHolder}
            {/* Simple CSS for list item hover effect */}
            <style>{`.list-item-hover:hover { background-color: #f0f2f5; }`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/user/trips')}>Back to My Trips</Button> */}
                <Card title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/user/trips')}
                            type="text"
                            style={{ marginRight: 8 }}
                        />
                        <Title level={3} style={{ margin: 0 }}>
                            {trip?.trip_name || t('loading')}
                        </Title>
                    </span>
                }
                    style={{ borderRadius: 16 }}
                >
                    {renderContent()}
                </Card>
            </div>
        </motion.div>
    );
};

export default TripsDetails;

