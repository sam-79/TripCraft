import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Typography,
    Tabs,
    Modal,
    Select,
    Col,
    Row
} from 'antd';
import {
    CarOutlined,
    HomeOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router';
// Import the new sub-components
import TrainBooking from '../../components/Explore/TrainBooking';
import BusBooking from '../../components/Explore/BusBooking';
import HotelBooking from '../../components/Explore/HotelBooking';
import FlightBooking from '../../components/Explore/FlightBooking';
import { useGetAllTripsQuery } from "../../api/tripApi";


const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// --- Main Explore Component (Parent Container) ---

import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const TripSelection = ({ trips, selectedTripId, setSelectedTripId }) => {
    // const selectedTrip = trips.find((t) => t.trip_id === selectedTripId);

    const handleTripSelect = (tripId) => {
        setSelectedTripId(tripId);
        console.log('Selected Trip ID:', tripId);
    };


    return (
        <>
            {/* Dropdown for selecting a trip */}
            <div style={{ marginBottom: 24 }}>
                <Select
                    placeholder="Select a trip"
                    style={{ width: 400 }}
                    onChange={handleTripSelect}
                    value={selectedTripId}
                    optionLabelProp="label"
                    showSearch
                    filterOption={(input, option) =>
                        option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {trips.map((trip) => (
                        <Option
                            key={trip.trip_id}
                            value={trip.trip_id}
                            label={`${trip.trip_name} (${trip.destination})`}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Text strong>Trip #{trip.trip_id}: {trip.trip_name}</Text>
                                <Text type="secondary">{trip.destination}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    🗓 {dayjs(trip.start_date).format('DD MMM YYYY')} → {dayjs(trip.end_date).format('DD MMM YYYY')}
                                </Text>
                            </div>
                        </Option>
                    ))}
                </Select>
            </div>
        </>
    );
};


const Explore = () => {
    const { tabKey } = useParams(); // Get 'train', 'bus', etc. from URL
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('hotels'); // Default tab

    const [selectedTripId, setSelectedTripId] = useState();
    const [isTripSelectionModalOpen, setIsTripSelectionModalOpen] = useState(false);

    const { data: alltrips, error, isLoading } = useGetAllTripsQuery();

    const showModal = () => {
        setIsTripSelectionModalOpen(true);
    };

    const handleOk = () => {
        setIsTripSelectionModalOpen(false);
    };

    const handleCancel = () => {
        setIsTripSelectionModalOpen(false);
    };

    const handleTripSelect = (tripId) => {
        setSelectedTripId(tripId);
        console.log('Selected Trip ID:', tripId);
    };

    // Wrap tabContent in useMemo to stabilize its reference
    const tabContent = useMemo(() => [
        {
            key: 'trains',
            label: 'Trains',
            icon: <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>train</span>,
            component: <TrainBooking selectedTripId={selectedTripId} showModal={showModal} />,
        },
        {
            key: 'buses',
            label: 'Buses',
            icon: <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>directions_bus</span>,
            component: <BusBooking selectedTripId={selectedTripId} showModal={showModal} />,
        },
        {
            key: 'flights',
            label: 'Flights',
            icon: <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>train</span>,
            component: <FlightBooking selectedTripId={selectedTripId} showModal={showModal} />,
        },
        {
            key: 'hotels',
            label: 'Hotels',
            icon: <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>hotel</span>,
            component: <HotelBooking selectedTripId={selectedTripId} showModal={showModal} />,
        },
    ], []); // Empty array means this only runs once

    // This effect syncs the URL parameter with the active tab state
    useEffect(() => {
        const validTabs = tabContent.map(tab => tab.key);
        if (tabKey && validTabs.includes(tabKey)) {
            setActiveTab(tabKey);
        } else {
            // If no tabKey or invalid tabKey, default to 'hotels'
            // and update URL to match
            setActiveTab('hotels');
            navigate('/user/bookings/search/hotels', { replace: true });
        }
    }, [tabKey, navigate, tabContent]); // Add tabContent to dependency array

    // This handler updates the URL when the user clicks a tab
    const handleTabChange = (key) => {
        setActiveTab(key);
        navigate(`/user/bookings/search/${key}`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >
                {/* Left Section — Title + Description */}
                <Col xs={24} md={14} lg={16}>
                    <div>
                        <Title level={2} style={{ marginBottom: 8 }}>
                            Book Your Next Journey
                        </Title>
                        <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
                            Search for trains, buses, flights, and hotels all in one place.
                        </Paragraph>
                    </div>
                </Col>

                {/* Right Section — Trip Selection Dropdown */}
                <Col
                    xs={24}
                    md={10}
                    lg={8}
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    {alltrips && <TripSelection
                        trips={alltrips}
                        selectedTripId={selectedTripId}
                        setSelectedTripId={setSelectedTripId}
                    />}
                </Col>
            </Row>


            <Card style={{ borderRadius: 16 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    size="large"
                >
                    {tabContent.map(tab => (
                        <TabPane
                            tab={
                                <span>
                                    {tab.icon}
                                    {tab.label}
                                </span>
                            }
                            key={tab.key}
                        >
                            {/* Render the component associated with the tab */}
                            {tab.component}
                        </TabPane>
                    ))}
                </Tabs>
            </Card>

            <Modal
                title="Select Trip"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isTripSelectionModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <TripSelection trips={alltrips} selectedTripId={selectedTripId} setSelectedTripId={setSelectedTripId} />
            </Modal>

        </motion.div>
    );
};

export default Explore;

