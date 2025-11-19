import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Card,
    Typography,
    Tabs,
    Modal,
    Select,
    Col,
    Row,
    List,
    Avatar,
    Tag,
    Statistic,
    Divider,
    Empty,
} from 'antd';
import {
    CarOutlined,
    HomeOutlined,
    GlobalOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router';

// Import the new sub-components
import TrainBooking from '../../components/Explore/TrainBooking';
import BusBooking from '../../components/Explore/BusBooking';
import HotelBooking from '../../components/Explore/HotelBooking';
import FlightBooking from '../../components/Explore/FlightBooking';
import { useGetAllTripsQuery } from "../../api/tripApi";

import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;


const { Option } = Select;
const { Text } = Typography;

// Helper to format currency
const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

// New component to render the passed data
const PassedBookingSummary = ({ data }) => {
    const { travelItems, hotelItems, totalCost } = data;
    const hasData =
        (travelItems && travelItems.length > 0) ||
        (hotelItems && hotelItems.length > 0);

    if (!hasData) {
        return null; // Don't render anything if no data
    }

    return (
        <Card
            style={{
                marginBottom: 24,
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
            }}
        >
            <Title level={4}>
                <ShoppingCartOutlined /> Your Selections
            </Title>
            <Paragraph type="secondary">
                This is the booking list you just prepared. You can now search for new
                options below to add or replace items.
            </Paragraph>
            <Row gutter={[16, 16]}>
                {travelItems && travelItems.length > 0 && (
                    <Col xs={24} lg={12}>
                        <Title level={5}>Travel ({travelItems.length})</Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={travelItems}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar style={{ backgroundColor: '#1890ff' }}>
                                                {item.type.charAt(0).toUpperCase()}
                                            </Avatar>
                                        }
                                        title={<Text strong>{item.name || item.train_name}</Text>}
                                        description={`${item.route || `${item.from} to ${item.to}`
                                            }`}
                                    />
                                    <Text>{formatCurrency(item.fare)}</Text>
                                </List.Item>
                            )}
                        />
                    </Col>
                )}
                {hotelItems && hotelItems.length > 0 && (
                    <Col xs={24} lg={12}>
                        <Title level={5}>Hotels ({hotelItems.length})</Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={hotelItems}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" src={item.image} />}
                                        title={<Text strong>{item.name}</Text>}
                                        description={item.address}
                                    />
                                    <Text>{formatCurrency(item.price)}</Text>
                                </List.Item>
                            )}
                        />
                    </Col>
                )}
            </Row>
            <Divider />
            <Statistic
                title="Estimated Total"
                value={totalCost}
                precision={2}
                prefix="₹"
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    );
};

const TripSelection = ({ trips, selectedTripId, handleTripSelect }) => {
    const optionsList = trips.map((trip) => ({
        label: trip.trip_name, // required
        value: trip.trip_id,   // required
        data: trip              // store full object for optionRender
    }));

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
                    options={optionsList}
                    optionRender={option => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Text strong>Trip #{option.trip_id}: {option.label}</Text>
                            <Text type="secondary">{option.data.destination}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(option.data.start_date).format('DD MMM YYYY')} → {dayjs(option.data.end_date).format('DD MMM YYYY')}
                            </Text>
                        </div>
                    )}
                />
            </div>
        </>
    );
};


const Explore = () => {
    const { tabKey } = useParams(); // Get 'train', 'bus', etc. from URL
    const navigate = useNavigate();

    const location = useLocation(); // Get location
    const passedData = location.state; // Get passed state
    const { travelItems, hotelItems, totalCost } = passedData || {};

    const [activeTab, setActiveTab] = useState('hotels'); // Default tab

    const [selectedTripId, setSelectedTripId] = useState();
    const [isTripSelectionModalOpen, setIsTripSelectionModalOpen] = useState(false);

    const { data: alltrips, error, isLoading } = useGetAllTripsQuery();

    // Wrap showModal in useCallback so its reference is stable
    const showModal = useCallback(() => {
        setIsTripSelectionModalOpen(true);
    }, []); // This function doesn't depend on any state, so [] is correct here

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
    ], [selectedTripId, showModal]); // Empty array means this only runs once

    // This effect syncs the URL parameter with the active tab state
    useEffect(() => {
        const validTabs = tabContent.map(tab => tab.key);
        if (tabKey && validTabs.includes(tabKey)) {
            setActiveTab(tabKey);
        } else {
            // If no tabKey or invalid tabKey, default to 'hotels'
            // and update URL to match
            setActiveTab('hotels');
            navigate('/user/bookings/search/hotels', { replace: true, state: passedData });
        }
    }, [tabKey, navigate, tabContent]); // Add tabContent to dependency array

    // This handler updates the URL when the user clicks a tab
    const handleTabChange = (key) => {
        setActiveTab(key);
        navigate(`/user/bookings/search/${key}`, { state: passedData });
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
                        handleTripSelect={handleTripSelect}
                    />}
                </Col>
            </Row>

            {/* Show Passed Data Here */}
            {passedData && (
                <div
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: 24,
                        // padding: 10,
                        scrollBehavior: 'smooth',
                        justifyContent: "space-around",
                        maxHeight: 350,
                        marginBottom:10
                    }}
                >
                    <div style={{ flex: '1', minHeight: 350, width: "100%" }}>
                        {/* Travel Selections Card */}
                        <Card
                            title={
                                <>
                                    <CarOutlined /> Travel Selections ({travelItems?.length || 0})
                                </>
                            }
                            bordered={false}
                            style={{
                                height: '100%',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderRadius: 8,
                                overflowX: 'auto'
                            }}
                        >

                            {travelItems && travelItems.length > 0 ? (
                                <List
                                    itemLayout="vertical"
                                    dataSource={travelItems}
                                    renderItem={(item) => {
                                        const isTrain = item.type === 'train';
                                        const isBus = item.type === 'bus';

                                        return (
                                            <List.Item
                                                key={item.id}
                                                style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            style={{
                                                                backgroundColor: isTrain ? '#1890ff' : '#13c2c2',
                                                            }}
                                                            icon={
                                                                <span className="material-symbols-outlined">
                                                                    {isTrain ? 'train' : 'directions_bus'}
                                                                </span>
                                                            }
                                                        />
                                                    }
                                                    title={<Text strong>{item.name}</Text>}
                                                    description={
                                                        <>
                                                            <Tag color={isTrain ? 'blue' : 'green'}>
                                                                {isTrain ? 'TRAIN' : 'BUS'}
                                                            </Tag>

                                                            {/* Common info (shared by both train and bus) */}
                                                            <div style={{ marginTop: 4 }}>
                                                                <Text>
                                                                    <strong>Departure:</strong> {item.departure} &nbsp;|&nbsp;
                                                                    <strong>Duration:</strong> {item.duration}
                                                                </Text>
                                                            </div>

                                                            {/* Train-specific info */}
                                                            {isTrain && (
                                                                <div style={{ marginTop: 4 }}>
                                                                    {item.arrival && (
                                                                        <Text>
                                                                            <strong>Arrival:</strong> {item.arrival}
                                                                        </Text>
                                                                    )}
                                                                    {item.class_code && (
                                                                        <>
                                                                            <br />
                                                                            <Text>
                                                                                <strong>Class:</strong> {item.class_code}
                                                                            </Text>
                                                                        </>
                                                                    )}
                                                                    {item.train_number && (
                                                                        <>
                                                                            <br />
                                                                            <Text type="secondary">
                                                                                Train No: {item.train_number}
                                                                            </Text>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Bus-specific info */}
                                                            {isBus && (
                                                                <div style={{ marginTop: 4 }}>
                                                                    {item.seats && (
                                                                        <Text>
                                                                            <strong>Seats Available:</strong> {item.seats}
                                                                        </Text>
                                                                    )}
                                                                    {item.type && (
                                                                        <>
                                                                            <br />
                                                                            <Text type="secondary">{item.type}</Text>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    }
                                                />

                                                {/* Fare (common to both) */}
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {formatCurrency(item.fare)}
                                                </Text>
                                            </List.Item>
                                        );
                                    }}
                                />
                            ) : (
                                <Empty description="No travel options selected" />
                            )}
                        </Card>
                    </div>


                    {/* Hotel Column */}
                    <div style={{ flex: '1', minHeight: 350, width: "100%" }}>
                        {/* Hotel Selections Card */}
                        <Card
                            title={
                                <>
                                    <HomeOutlined /> Accommodation Selections ({hotelItems?.length || 0})
                                </>
                            }
                            bordered={false}
                            style={{
                                height: '100%',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderRadius: 8,
                            }}
                        >
                            {hotelItems && hotelItems.length > 0 ? (
                                <List
                                    itemLayout="vertical"
                                    dataSource={hotelItems}
                                    renderItem={(item) => (
                                        <List.Item
                                            key={item.id}
                                            style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        shape="square"
                                                        size={80}
                                                        src={item.image}
                                                        style={{ objectFit: 'cover' }}
                                                        icon={<HomeOutlined />}
                                                    />
                                                }
                                                title={
                                                    <a
                                                        href={item.booking_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#1890ff', textDecoration: 'none' }}
                                                    >
                                                        <Text strong>{item.name}</Text>
                                                    </a>
                                                }
                                                description={
                                                    <>
                                                        {/* Address */}
                                                        <Text type="secondary">{item.address}</Text>
                                                        <br />

                                                        {/* Ratings */}
                                                        <div style={{ marginTop: 4 }}>
                                                            {item.rating && (
                                                                <Tag color="gold">
                                                                    ⭐ {item.rating} / 5
                                                                </Tag>
                                                            )}
                                                            {item.trip_rating && (
                                                                <Tag color="geekblue">
                                                                    Trip Rating: {item.trip_rating}
                                                                </Tag>
                                                            )}
                                                        </div>

                                                        {/* Check-in/out */}
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text>
                                                                <strong>Check-in:</strong> {item.check_in} &nbsp;|&nbsp;
                                                                <strong>Check-out:</strong> {item.check_out}
                                                            </Text>
                                                        </div>

                                                        {/* Couple-friendly badge */}
                                                        {item.is_couple_friendly && (
                                                            <div style={{ marginTop: 4 }}>
                                                                <Tag color="magenta">Couple Friendly</Tag>
                                                            </div>
                                                        )}
                                                    </>
                                                }
                                            />

                                            {/* Price per night */}
                                            <div style={{ textAlign: 'right' }}>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {formatCurrency(item.price)}
                                                </Text>
                                                <Text type="secondary"> / night</Text>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="No hotels selected" />
                            )}
                        </Card>
                    </div>
                </div>


            )}


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
                <TripSelection trips={alltrips} selectedTripId={selectedTripId} handleTripSelect={handleTripSelect} />
            </Modal>

        </motion.div>
    );
};

export default Explore;

