import React, { useState } from 'react';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Input,
    DatePicker,
    InputNumber, // For guests
    Space,
    Empty,
    Spin,
    Tooltip,
    Tag,
    message,
    Alert,
    Rate,
    Image, // To display hotel image
    Divider
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    EnvironmentOutlined,
    UserOutlined,
    CalendarOutlined,
    StarFilled,
    CheckCircleOutlined, // For amenities
    WifiOutlined,
    RestOutlined, // Restaurant
    CoffeeOutlined, // Bar
    InfoCircleOutlined // For policy info
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
// Import RTK Query hook
import { useSearchHotelsMutation } from '../../api/searchApi.js';

import HotelResultCard from './HotelResultCard.jsx';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// --- Search Form ---
const HotelSearchForm = ({ onSearch, searchParams, setSearchParams }) => {
    const { destination, dateRange, guests } = searchParams;

    return (
        <Row gutter={16} align="bottom">
            <Col flex={1}>
                <Text>Destination</Text>
                <Input
                    value={destination}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                    size="large"
                    placeholder="Enter city or hotel name"
                />
            </Col>
            <Col>
                <Text>Check-in / Check-out</Text>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => setSearchParams(prev => ({ ...prev, dateRange: dates }))}
                    size="large"
                    format="DD-MM-YYYY" // API expects this format
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
            </Col>
            <Col>
                <Text>Guests</Text>
                <InputNumber
                    value={guests}
                    onChange={(value) => setSearchParams(prev => ({ ...prev, guests: value }))}
                    size="large"
                    min={1}
                    max={10}
                    addonBefore={<UserOutlined />}
                    style={{ width: '100%' }}
                />
            </Col>
            {/* Rooms might be needed later, add InputNumber if required */}
            <Col>
                <Button type="primary" icon={<SearchOutlined />} size="large" style={{ marginTop: '24px' }} onClick={onSearch}>
                    Search Hotels
                </Button>
            </Col>
        </Row>
    );
};

// --- Amenity Helper ---
const HotelAmenityIcon = ({ name }) => {
    const iconStyle = { color: '#595959', marginRight: 4, fontSize: 14 };
    const textStyle = { color: '#595959', fontSize: 12 };

    let icon = null;
    let text = name;
    const lowerName = name.toLowerCase();

    if (lowerName.includes('wi-fi')) {
        icon = <WifiOutlined style={iconStyle} />;
        text = 'Free WiFi';
    } else if (lowerName.includes('restaurant')) {
        icon = <RestOutlined style={iconStyle} />;
        text = 'Restaurant';
    } else if (lowerName.includes('bar')) {
        icon = <CoffeeOutlined style={iconStyle} />;
        text = 'Bar';
    } else if (lowerName.includes('room service')) {
        icon = <span className="material-symbols-outlined" style={iconStyle}>room_service</span>;
        text = 'Room Service';
    } else if (lowerName.includes('gym')) {
        icon = <span className="material-symbols-outlined" style={iconStyle}>fitness_center</span>;
        text = 'Gym';
    } else {
        return null; // Show only common ones
    }

    return (
        <Tooltip title={name}>
            <span style={{ marginRight: 10, display: 'inline-flex', alignItems: 'center' }}>
                {icon}
                <Text style={textStyle}>{text}</Text>
            </span>
        </Tooltip>
    );
};


// --- Main HotelBooking Component ---
const HotelBooking = ({ selectedTripId, showModal }) => {
    // --- State for Search ---
    const [searchParams, setSearchParams] = useState({
        destination: '',
        dateRange: [dayjs().add(1, 'day'), dayjs().add(4, 'day')], // Default check-in tomorrow, 3 nights
        guests: 2,
        rooms: 1 // Default to 1 room
    });

    // --- RTK Query Hook ---
    const [
        triggerSearchHotels,
        { data: hotelResults, isLoading: isSearchLoading, error: searchError }
    ] = useSearchHotelsMutation();

    // --- Search Handler ---
    const handleSearch = () => {
        const { destination, dateRange, guests, rooms } = searchParams;

        if (!destination) {
            message.error('Please enter a destination.');
            return;
        }
        if (!dateRange || dateRange.length !== 2) {
            message.error('Please select check-in and check-out dates.');
            return;
        }

        const body = {
            destination: destination,
            check_in: dateRange[0].format('DD-MM-YYYY'),
            check_out: dateRange[1].format('DD-MM-YYYY'),
            no_of_rooms: rooms,
            no_of_adult: guests,
            no_of_child: 0,
            no_of_results: 20 // Fetch more results
        };

        triggerSearchHotels(body);
    };

    // --- Render Results ---
    const RenderResults = ({selectedTripId}) => {
        if (isSearchLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <Title level={5} style={{ marginTop: 16 }}>Searching for hotels...</Title>
                </div>
            );
        }

        if (searchError) {
            return <Alert message="Error" description={searchError.data?.message || "Failed to fetch hotels. Please try again."} type="error" showIcon style={{ marginTop: 24 }} />;
        }

        // API returns data directly as an array
        if (!hotelResults || !hotelResults.data) {
            return <Empty description="Please search for hotels to see results." style={{ marginTop: 40 }} />;
        }

        const hotels = hotelResults.data;
        // Extract user data for display, safely
        const userData = hotelResults.user_data || {};
        const { destination: searchedDest, check_in, check_out } = userData;
        const displayCheckIn = check_in ? dayjs(check_in, 'DD-MM-YYYY').format('ddd, DD MMM') : '';
        const displayCheckOut = check_out ? dayjs(check_out, 'DD-MM-YYYY').format('ddd, DD MMM') : '';

        if (hotels.length === 0) {
            return <Empty description="No hotels found matching your criteria." style={{ marginTop: 40 }} />;
        }


        return (
            <div style={{ marginTop: 24 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Text strong>
                            Showing {hotels.length} hotels in {searchedDest}
                            {displayCheckIn && displayCheckOut && ` from ${displayCheckIn} to ${displayCheckOut}`}
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<FilterOutlined />}>Filter</Button>
                            <Button icon={<SortAscendingOutlined />}>Sort</Button>
                        </Space>
                    </Col>
                </Row>
                <AnimatePresence>
                    {hotels.map(item => <HotelResultCard key={item.hid || item.ecid} data={item} showModal={showModal} selectedTripId={selectedTripId} userData={userData} />)}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '8px' }}>
            <HotelSearchForm
                onSearch={handleSearch}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
            />
            {/* {renderResults()} */}
            <RenderResults selectedTripId={selectedTripId} />
        </motion.div>
    );
};

export default HotelBooking;
