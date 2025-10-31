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

// --- Result Card (Updated for Hotel Data) ---
// const HotelResultCard = ({ data }) => {
//     // Calculate final price including tax
//     const finalPrice = data.prc + data.tax;
//     // Tripadvisor rating if available, otherwise hotel rating
//     const displayRating = data.tr ? parseFloat(data.tr) : parseFloat(data.rat);

//     // Parse amenities string
//     const amenities = data.hAmen ? data.hAmen.split(',') : [];

//     // Parse highlights
//     const highlights = data.highlt ? data.highlt.split('|').map(h => h.trim()) : [];

//     const getRatingText = (rating) => {
//         if (rating >= 4.5) return { text: "Exceptional", color: "purple" };
//         if (rating >= 4.0) return { text: "Very Good", color: "success" };
//         if (rating >= 3.5) return { text: "Good", color: "blue" };
//         if (rating >= 3.0) return { text: "Average", color: "warning" };
//         return { text: "Okay", color: "default" };
//     };

//     const ratingInfo = getRatingText(displayRating);

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//         >
//             <Card
//                 style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
//                 bodyStyle={{ padding: 0 }} // Remove default padding
//             >
//                 <Row gutter={0}>
//                     {/* Image Column */}
//                     <Col xs={24} sm={8} md={6}>
//                         <Image
//                             src={data.imgU || (data.imgarry && data.imgarry[0])} // Use main image or first from array
//                             alt={data.nm}
//                             style={{ height: '100%', width: '100%', objectFit: 'cover', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
//                             fallback="https://placehold.co/300x250/EEE/CCC?text=No+Image"
//                             preview={false} // Disable preview for cleaner look in list
//                         />
//                     </Col>

//                     {/* Details Column */}
//                     <Col xs={24} sm={16} md={18} style={{ padding: '16px 20px' }}>
//                         <Row justify="space-between" align="top">
//                             <Col flex="auto">
//                                 <Title level={5} style={{ margin: 0 }}>{data.nm}</Title>
//                                 <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
//                                     <EnvironmentOutlined /> {data.loc || data.adrs.split('>').pop()}
//                                 </Paragraph>
//                             </Col>
//                             <Col style={{ textAlign: 'right' }}>
//                                 {displayRating > 0 && (
//                                     <Tag color={ratingInfo.color} style={{ marginBottom: 4 }}>
//                                         {ratingInfo.text}
//                                     </Tag>
//                                 )}
//                                 <br />
//                                 <Rate disabled defaultValue={displayRating} allowHalf style={{ fontSize: 14 }} />
//                                 {data.tCount && <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>({data.tCount} reviews)</Text>}
//                             </Col>
//                         </Row>


//                         <Divider style={{ margin: '12px 0' }} />

//                         <Paragraph style={{ fontSize: 12, marginBottom: 8 }}>
//                             <Text strong>Key Amenities:</Text><br />
//                             {amenities.slice(0, 4).map(amenity => ( // Show first 4
//                                 <HotelAmenityIcon key={amenity} name={amenity} />
//                             ))}
//                         </Paragraph>

//                         {highlights.length > 0 && (
//                             <Paragraph style={{ fontSize: 12, marginBottom: 12 }}>
//                                 {highlights.map(h => (
//                                     <Tag key={h} color="geekblue" style={{ marginRight: 4, marginBottom: 4 }}>{h}</Tag>
//                                 ))}
//                             </Paragraph>
//                         )}

//                         <Row justify="space-between" align="bottom">
//                             <Col>
//                                 {data.plcy && (
//                                     <Tag color={data.plcy.toLowerCase().includes('free') ? "green" : "orange"} icon={<InfoCircleOutlined />}>
//                                         {data.plcy}
//                                     </Tag>
//                                 )}
//                             </Col>
//                             <Col style={{ textAlign: 'right' }}>
//                                 <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>Total for {data.et} nights</Paragraph>
//                                 <Title level={4} style={{ margin: '0 0 4px 0' }}>
//                                     ₹{finalPrice.toLocaleString('en-IN')}
//                                 </Title>
//                                 {data.tPr > finalPrice && ( // Show original price if higher
//                                     <Text delete type="secondary" style={{ marginRight: 8, fontSize: 12 }}>
//                                         ₹{data.tPr.toLocaleString('en-IN')}
//                                     </Text>
//                                 )}
//                                 <Button type="primary" href={data.durl} target="_blank" rel="noopener noreferrer">
//                                     View Deal
//                                 </Button>
//                             </Col>
//                         </Row>
//                     </Col>
//                 </Row>
//             </Card>
//         </motion.div>
//     );
// };

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
