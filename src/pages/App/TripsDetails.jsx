import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Typography, Spin, Alert, Button, Row, Col, Segmented, List, Avatar, Popconfirm, message, Tooltip } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from "dayjs";
import { useGetTripByIdQuery, useDeleteTripPlaceMutation, useGenerateItineraryMutation, useGetWeatherConditionsQuery } from '../../api/tripApi';
// import { useGetBookingSuggestionsQuery } from '../../api/bookingApi';
import { startCase, toLower } from 'lodash';
// Import the child components
// import TripMapView from '../../components/TripDetails/TripMapView';
import TripGoogleMapView from '../../components/TripDetails/TripGoogleMapView';
import TripItineraryView from '../../components/TripDetails/TripItineraryView';
import TripInfoDisplay from '../../components/TripDetails/TripInfoDisplay';
import TripTravelOptions from '../../components/TripDetails/TripTravelOptions';
import LoadingAnimationOverlay from '../../components/LoadingAnimation';
import TripBookingView from '../../components/TripDetails/TripBookingView';
import TripWeatherView from '../../components/TripDetails/TripWeatherView';


const { Title, Text } = Typography;

const TripsDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('info');
    const [highlightedPlaceId, setHighlightedPlaceId] = useState(null);
    const [messageApi, messageApiContextHolder] = message.useMessage();

    // Use RTK Query's polling feature to get live updates from the backend
    const { data: trip, error: tripError, isLoading: isLoadingTrip } = useGetTripByIdQuery(tripId, {
        // pollingInterval: 20000,
        refetchOnMountOrArgChange: true,
    });
    // Weather data query - only runs when we have a tripId

    const { data: weatherData, error: weatherError, isLoading: isLoadingWeather } = useGetWeatherConditionsQuery(tripId, {
        skip: !tripId,
    });

    const [deleteTripPlace, { isLoading: isDeletingPlace }] = useDeleteTripPlaceMutation();
    const [generateItinerary, { data: generateItineraryResp, isLoading: isGeneratingItinerary }] = useGenerateItineraryMutation();
    // const [generatetravelMode, { isLoading: isTravelModeLoading }] = useGenerateTravelModeMutation();


    // // When the itinerary is ready, automatically switch to that view
    // useEffect(() => {
    //     // Automatically switch view based on generation progress
    //     if (trip?.itineraries_status) {
    //         setActiveView('itinerary');
    //     } else if (trip?.travel_options_status) {
    //         setActiveView('travel');
    //     }
    // }, [trip?.itineraries_status, trip?.travel_options_status]);


    const handleDeletePlace = async (placeId) => {
        try {
            await deleteTripPlace(placeId).unwrap();
            messageApi.success('Place removed from trip!');
        } catch (err) {
            messageApi.error('Failed to remove place.');
        }
    };

    const handleGenerateItinerary = async () => {
        try {
            generateItinerary(tripId).unwrap();
            // generatetravelMode(tripId).unwrap();
            generateItineraryResp.status ? messageApi.loading({ content: generateItineraryResp.message, key: 'itinerary' }) : messageApi.error(generateItineraryResp.message);
            // Polling will automatically handle showing the result
        } catch (err) {
            messageApi.error({ content: 'Failed to start itinerary generation.', key: 'itinerary' });
        }
    };

    const isHistoricalTrip = trip?.start_date ? dayjs(trip.start_date).isBefore(dayjs(), "day") : false;


    const renderContent = () => {
        if (isLoadingTrip && !trip) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>
                {/* <Spin size="large" tip="Loading trip details..." /> */}
                <LoadingAnimationOverlay text={"Loading trip details"} />
            </div>;
        }

        if (tripError) {
            return <Alert message="Error" description="Could not fetch trip details." type="error" showIcon />;
        }

        if (trip) {
            const placesReady = trip.tourist_places_status;
            // const travelOptsReady = trip.travel_options_status;
            const itineraryReady = trip.itineraries_status;
            // const bookingReady = !!bookingData; // Check if booking data is available
            const weatherReady = !!weatherData; // Check if weather data is available


            return (
                <Row gutter={16} style={{ height: 'calc(100vh - 220px)' }}>
                    <Col xs={24} md={14} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Segmented
                            block
                            options={[
                                {
                                    label: (
                                        <Tooltip title={'Basic trip info'}>
                                            {'Trip Info'}
                                        </Tooltip>
                                    ), value: 'info'
                                },
                                {
                                    label: (
                                        <Tooltip title={placesReady ? null : 'Finding places for you'}>
                                            Locations
                                        </Tooltip>
                                    ), value: 'locations', disabled: !placesReady
                                },
                                // {
                                //     label: (
                                //         <Tooltip title={travelOptsReady ? null : 'Finding best options for you'}>
                                //             Travel Options
                                //         </Tooltip>
                                //     ), value: 'travel', disabled: !travelOptsReady
                                // },

                                {
                                    label: (
                                        <Tooltip title={weatherReady ? null : 'Fetching weather info'}>
                                            Weather & Alerts
                                        </Tooltip>
                                    ), value: 'weather', disabled: !weatherReady
                                },

                                {
                                    label: (
                                        <Tooltip title={itineraryReady ? null : <><Spin size='small' style={{
                                            'colorPrimary': 'white',
                                        }} /> Crafting your trip</>}>
                                            Itinerary
                                        </Tooltip>
                                    ), value: 'itinerary', disabled: !itineraryReady
                                },
                                // {
                                //     label: (
                                //         <Tooltip title={bookingReady ? null : 'Crafting your Bookings'}>
                                //             Booking
                                //         </Tooltip>
                                //     ), value: 'booking', disabled: !bookingReady
                                // },
                            ]}
                            value={activeView}
                            onChange={(value) => {
                                setHighlightedPlaceId(null);
                                setActiveView(value);
                            }}
                        />
                        <div style={{ flex: 1, marginTop: 16, overflowY: 'auto', paddingRight: '8px' }}>
                            {activeView === 'info' && <TripInfoDisplay trip={trip} />}

                            {activeView === 'locations' && (
                                !placesReady
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        {/* <Spin tip={trip.tourist_places_status_message || "Finding best spots..."} /> */}
                                        <LoadingAnimationOverlay text={trip.tourist_places_status_message || "Finding best spots..."} />
                                    </div>
                                    : <>
                                        <List
                                            dataSource={trip.tourist_places_list}
                                            renderItem={(item) => (
                                                <List.Item
                                                    actions={[
                                                        <Popconfirm
                                                            title="Remove this place?"
                                                            onConfirm={() => handleDeletePlace(item.id)}
                                                            okText="Yes"
                                                            cancelText="No"
                                                        >
                                                            <Button type="text" danger icon={<DeleteOutlined />} loading={isDeletingPlace} />
                                                        </Popconfirm>
                                                    ]}
                                                    onClick={() => setHighlightedPlaceId(item.id)}
                                                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'background-color 0.3s' }}
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
                                            {itineraryReady ? "Update Itinerary" : "Generate Itinerary"}
                                        </Button>

                                    </>
                            )}

                            {
                                // activeView === 'travel' && (
                                //     !travelOptsReady
                                //         ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                //             {/* <Spin tip={trip.travel_options_status_message || "Calculating travel options..."} /> */}
                                //             <LoadingAnimationOverlay text={trip.travel_options_status_message || "Calculating travel options..."} />
                                //         </div>
                                //         : <TripTravelOptions travelOptions={trip.travel_options} />
                                // )
                            }

                            {activeView === 'weather' && (
                                isLoadingWeather
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        {/* <Spin tip="Fetching live weather..." /> */}
                                        <LoadingAnimationOverlay text={"Fetching live weather..."} />
                                    </div>
                                    : weatherError
                                        ? <Alert message="Could not fetch weather data." type="error" />
                                        : <>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                            }}>
                                                <div style={{
                                                    flex: 1,
                                                    overflowY: 'auto',
                                                    paddingRight: 8 // optional scrollbar spacing
                                                }}>
                                                    <TripWeatherView weatherData={weatherData} />
                                                </div>
                                                <Tooltip
                                                    title={
                                                        isHistoricalTrip
                                                            ? "This trip has already started or passed. Syncing is no longer available. If not, User can update dates in TripInfo "
                                                            : "Update iternerary with weather data"
                                                    }
                                                >
                                                    <Button
                                                        type="primary"
                                                        block
                                                        style={{ marginTop: 16 }}
                                                    // onClick={handleGenerateItinerary}
                                                    // loading={isGeneratingItinerary}
                                                    >
                                                        Sync Iternerary based on Weather Conditions
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </>


                            )}

                            {activeView === 'itinerary' && (
                                !itineraryReady
                                    ? <div style={{ textAlign: 'center', padding: '50px' }}>
                                        {/* <Spin tip={trip.itineraries_status_message || "Crafting your itinerary..."} /> */}
                                        <LoadingAnimationOverlay text={trip.itineraries_status_message || "Crafting your itinerary..."} />
                                    </div>
                                    : <>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}>
                                            <div style={{
                                                flex: 1,
                                                overflowY: 'auto',
                                                paddingRight: 8 // optional scrollbar spacing
                                            }}>
                                                <TripItineraryView
                                                    itinerary={trip.itineraries}
                                                    onPlaceClick={setHighlightedPlaceId}
                                                />
                                            </div>
                                            <Tooltip
                                                title={
                                                    isHistoricalTrip
                                                        ? "This trip has already started or passed. Booking is no longer available. If not, User can update dates in TripInfo "
                                                        : ""
                                                }
                                            >
                                                <Button
                                                    type="primary"
                                                    block
                                                    style={{ marginTop: 24 }}
                                                    disabled={isHistoricalTrip}
                                                    onClick={() =>
                                                        !isHistoricalTrip && navigate(`/user/trips/${tripId}/booking`)
                                                    } // Navigate to the new booking page
                                                >
                                                    Proceed to Booking Options and Recommendations
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </>
                            )}
                        </div>
                    </Col>
                    <Col xs={24} md={10} style={{ height: '100%' }}>
                        <TripGoogleMapView
                            locations={placesReady ? trip.tourist_places_list : []}
                            route={itineraryReady && activeView === 'itinerary' ? trip.itineraries : []}
                            highlightedPlaceId={highlightedPlaceId}
                        />
                    </Col>
                </Row>
            );
        }

        return <Alert message="Trip data is unavailable." type="warning" />;
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
                            {startCase(toLower(trip?.trip_name)) || 'Loading...'}
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

