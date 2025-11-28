import React, { useState, useMemo } from 'react';
import {
    Layout,
    Typography,
    Spin,
    Alert,
    Empty,
    Tabs,
    Card,
    Button,
    Tag,
    Space,
    Row,
    Col,
    Dropdown,
    Menu,
    message
} from 'antd';
import {
    DownOutlined,
    GlobalOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useShowTripBookingsQuery } from '../../api/searchApi';
import { Link } from 'react-router'; // updated import for router v6+

const { Title, Text } = Typography;
const { Content } = Layout;

// --- Helpers ---
const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;
const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('ddd, DD MMM YYYY') : 'N/A';

const getBookingIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'flight': return <span className="material-symbols-outlined" style={{ color: '#1890ff' }}>flight</span>; //Do not add this in language translation function
        case 'hotel': return <span className="material-symbols-outlined" style={{ color: '#52c41a' }}>hotel</span>;
        case 'train': return <span className="material-symbols-outlined" style={{ color: '#faad14' }}>train</span>;
        case 'bus': return <span className="material-symbols-outlined" style={{ color: '#eb2f96' }}>directions_bus</span>;
        default: return <GlobalOutlined />;
    }
};

const getStatusTag = (isBooked) => (
    isBooked ? <Tag color="success">Confirmed</Tag> : <Tag>Not Booked</Tag>
);

// --- Booking Card ---
const BookingCard = ({ booking, tripName }) => (
    <Card hoverable style={{ marginBottom: 16, borderRadius: 8 }} bodyStyle={{ padding: '16px 20px' }}>
        <Row gutter={16} align="middle">
            <Col flex="40px">{getBookingIcon(booking.type)}</Col>
            <Col flex="auto">
                <Text strong>{booking.type} Booking</Text><br />
                <Text type="secondary" style={{ fontSize: 12 }}>Trip: {tripName}</Text><br />

                {(booking.type === 'train' || booking.type === 'Train') && (
                    <>
                        <Text>{booking.train_name} ({booking.train_number})</Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {booking.from_station} → {booking.to_station}
                        </Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Travel: {formatDate(booking.travel_date)}</Text>
                    </>
                )}

                {(booking.type === 'bus' || booking.type === 'Bus') && (
                    <>
                        <Text>{booking.travels_name}</Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {booking.from_city} → {booking.to_city}
                        </Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Date: {formatDate(booking.journey_date)}</Text>
                    </>
                )}

                {(booking.type === 'hotel' || booking.type === 'Hotel') && (
                    <>
                        <Text>{booking.hotel_name}</Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Destination: {booking.destination}</Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Check-in: {booking.check_in} | Check-out: {booking.check_out}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Amount: {booking.price}
                        </Text>
                    </>
                )}

                {booking.fare && (
                    <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Fare: {formatCurrency(booking.fare)}</Text>
                    </div>
                )}
            </Col>
            <Col style={{ textAlign: 'right' }}>
                {getStatusTag(booking.is_booked)}
            </Col>
        </Row>
    </Card>
);

// --- Main Component ---
const AllBookings = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [filter, setFilter] = useState('Upcoming First');

    const { data: bookingData, error, isLoading, refetch } = useShowTripBookingsQuery(undefined, {
        refetchOnMountOrArgChange: true
    });

    const filterMenu = (
        <Menu onClick={({ key }) => setFilter(key)} selectedKeys={[filter]}>
            <Menu.Item key="Upcoming First">Upcoming First</Menu.Item>
            <Menu.Item key="Past Bookings">Past Bookings</Menu.Item>
        </Menu>
    );

    const filteredData = useMemo(() => {
        if (!bookingData?.data) return [];
        let trips = bookingData.data;

        if (activeTab !== 'All') {
            trips = trips.map(trip => ({
                ...trip,
                bookings: trip.bookings.filter(b => b.type?.toLowerCase() === activeTab.toLowerCase())
            })).filter(trip => trip.bookings.length > 0);
        }

        return trips;
    }, [bookingData, activeTab]);

    // --- Render Content ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip={bookingData?.message || "Checking for travel options..."} />
                    <div style={{ marginTop: 20 }}>
                        <Button icon={<ReloadOutlined />} onClick={refetch}>Refresh</Button>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <Alert
                    message="Error Loading Bookings"
                    description={error.data?.message || "Could not fetch your bookings. Please try again."}
                    type="error"
                    showIcon
                    action={<Button size="small" danger onClick={refetch}>Retry</Button>}
                />
            );
        }

        // Handle "No trips or bookings found" case
        if (bookingData?.status === true && bookingData?.data?.length === 0) {
            return (
                <Card style={{ marginTop: 24, textAlign: 'center' }}>
                    <Empty
                        description={
                            <span>
                                <Title level={5}>No trips or bookings found</Title>
                                <Text>{bookingData.message}</Text>
                            </span>
                        }
                    >
                        <Button icon={<ReloadOutlined />} onClick={refetch}>Refresh</Button>
                    </Empty>
                </Card>
            );
        }

        if (!filteredData || filteredData.length === 0) {
            return (
                <Empty
                    description={<Text>No bookings to display.</Text>}
                />
            );
        }

        return (
            <AnimatePresence>
                {filteredData.map(trip => (
                    <motion.div
                        key={trip.trip_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ marginBottom: 24 }}
                    >
                        <Title level={4} style={{
                            marginBottom: 16,
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: 8
                        }}>
                            {trip.trip_name || `Trip ID: ${trip.trip_id}`} ({trip.total_bookings} total)
                        </Title>
                        {trip.bookings.map((booking, idx) => (
                            <BookingCard
                                key={`${trip.trip_id}-${booking.type}-${idx}`}
                                booking={booking}
                                tripName={trip.trip_name}
                            />
                        ))}
                    </motion.div>
                ))}
            </AnimatePresence>
        );
    };

    return (
        <Content style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>My Bookings</Title>
                </Col>
                <Col>
                    <Dropdown overlay={filterMenu}>
                        <Button>{filter} <DownOutlined /></Button>
                    </Dropdown>
                </Col>
            </Row>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="All" key="All" />
                <Tabs.TabPane tab="Flights" key="Flight" />
                <Tabs.TabPane tab="Hotels" key="Hotel" />
                <Tabs.TabPane tab="Trains" key="Train" />
                <Tabs.TabPane tab="Buses" key="Bus" />
            </Tabs>

            <div style={{ marginTop: 24 }}>
                {renderContent()}
            </div>
        </Content>
    );
};

export default AllBookings;
