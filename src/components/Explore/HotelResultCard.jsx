import React, { useState } from 'react';
import {
    Card, Row, Col, Typography, Rate, Tag, Button, Divider, Modal, Space,
    message, Carousel, Drawer, Empty, Tooltip
} from 'antd';

import {
    EnvironmentOutlined,
    CheckCircleOutlined,
    CoffeeOutlined,
    GiftOutlined,
    GlobalOutlined,
    WifiOutlined,
    CarOutlined,
    UserOutlined,
    StarOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    BankOutlined
} from '@ant-design/icons';

import { motion } from 'framer-motion';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

import { useCreateHotelBookingMutation } from '../../api/bookingApi';
import { useCreateCheckoutSessionMutation } from '../../api/paymentApi';

import dayjs from 'dayjs';

function formatToYYYYMMDD(dateStr) {
    return dayjs(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD');
}

const { Title, Text, Paragraph } = Typography;

const HotelResultCard = ({ data, showModal, selectedTripId, userData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    const [createHotelBooking, { isLoading: isBooking }] =
        useCreateHotelBookingMutation();
    const [createCheckoutSession, { isLoading: isPaying }] =
        useCreateCheckoutSessionMutation();

    // --- Price & Rating ---
    const finalPrice = data.prc + (data.tax || 0);
    const displayRating = data.tr ? parseFloat(data.tr) : parseFloat(data.rat || 0);

    const ratingText = (rating) => {
        if (rating >= 4.5) return { text: "Exceptional", color: "purple" };
        if (rating >= 4.0) return { text: "Very Good", color: "green" };
        if (rating >= 3.5) return { text: "Good", color: "blue" };
        if (rating >= 3.0) return { text: "Average", color: "orange" };
        return { text: "Okay", color: "default" };
    };

    const ratingInfo = ratingText(displayRating);

    const images = data.imgarry?.length ? data.imgarry : [data.imgU];

    // --- Amenities Parser ---
    const parsedAmenities = [
        ...(data.highlt ? data.highlt.split("|").map((a) => a.trim()) : []),
        ...(Array.isArray(data.amen) ? data.amen : [])
    ];

    // Offers Parsing (Removing HTML tags for cleaner view)
    const cleanOfferText = data.cOffers ? data.cOffers.replace(/<[^>]*>?/gm, '') : null;

    const amenityIcons = {
        "Free wifi": <WifiOutlined />,
        "Breakfast": <CoffeeOutlined />,
        "Parking": <CarOutlined />,
        "Couple Friendly": <UserOutlined />,
        "Family Friendly": <UserOutlined />,
        "Rating": <StarOutlined />
    };

    // --- Booking Handler ---
    const handleBookHotel = async () => {
        if (!selectedTripId) {
            messageApi.error("Select a trip first");
            showModal();
            return;
        }

        try {
            const res = await createHotelBooking({
                ...data,
                trip_id: selectedTripId,
                ...userData,
                check_in: formatToYYYYMMDD(userData.check_in),
                check_out: formatToYYYYMMDD(userData.check_out),
            }).unwrap();

            if (res.status) {
                setBookingData(res.data);
                setIsModalVisible(true);
                messageApi.success(res.message);
            }
        } catch (err) {
            console.error(err);
            messageApi.error("Booking failed.");
        }
    };

    // --- Pay Now Handler ---
    const handlePayNow = async () => {
        try {
            const res = await createCheckoutSession({
                booking_id: bookingData?.booking_id,
                amount: finalPrice,
                hotel_name: bookingData?.hotel_name,
                booking_type: "Hotel",
                trip_id: selectedTripId,
            }).unwrap();

            if (res.checkout_url) window.location.href = res.checkout_url;
            else messageApi.error("Failed to create payment session.");
        } catch (err) {
            console.error(err);
            messageApi.error("Payment failed.");
        }
    };

    return (
        <>
            {contextHolder}

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
            >
                <Card
                    style={{
                        marginBottom: 20,
                        borderRadius: 14,
                        overflow: "hidden",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <Row>
                        {/* IMAGE CAROUSEL */}
                        <Col xs={24} sm={9} md={8} lg={7}>
                            <div
                                style={{
                                    width: "100%",
                                    aspectRatio: "16/9",
                                    overflow: "hidden",
                                }}
                            >
                                <Carousel
                                    arrows
                                    pauseOnFocus
                                    lazyLoad
                                    autoplay
                                    dotPosition="bottom"
                                    effect="fade" >
                                    {images.map((img, i) => (
                                        <div key={i}>
                                            <img
                                                src={img}
                                                alt={data.nm}
                                                loading='lazy'
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                                onError={(e) => {
                                                    e.target.src =
                                                        "https://placehold.co/600x350?text=No+Image";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        </Col>

                        {/* DETAILS */}
                        <Col xs={24} sm={15} md={16} lg={17} style={{ padding: 20 }}>
                            <Row justify="space-between">
                                {/* LEFT SECTION — hotel name wraps normally */}
                                <Col
                                    flex="1 1 auto"
                                    style={{ minWidth: 0 }}   // allows text wrapping inside
                                >
                                    <Title level={4} style={{ marginBottom: 4, whiteSpace: "normal" }}>
                                        {data.nm}
                                        {data.catgry && (
                                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                                {data.catgry}
                                            </Tag>
                                        )}
                                    </Title>

                                    <Paragraph type="secondary" style={{ marginBottom: 6, whiteSpace: "normal" }}>
                                        <EnvironmentOutlined />{" "}
                                        {data.loc?.split('>').filter(Boolean).join(', ') ||
                                            data.adrs?.split('>').filter(Boolean).join(', ') ||
                                            "Location unavailable"}
                                    </Paragraph>
                                </Col>

                                {/* RIGHT SECTION — rating stays fixed width */}
                                <Col
                                    flex="0 0 140px"       // fixed width so it never wraps
                                    style={{ textAlign: "right" }}
                                >
                                    {displayRating > 0 && (
                                        <>
                                            <Tag color={ratingInfo.color}>{ratingInfo.text}</Tag>
                                            <br />
                                            <Rate disabled allowHalf defaultValue={displayRating} />
                                            <Text type="secondary">
                                                ({data.tCount || 0} reviews)
                                            </Text>
                                        </>
                                    )}
                                </Col>
                                <Divider />
                                <Col flex="auto">
                                    {/* AMENITIES */}
                                    <Space wrap>
                                        {parsedAmenities.slice(0, 6).map((amen, i) => (
                                            <Tag
                                                key={i}
                                                color="geekblue"
                                                icon={amenityIcons[amen] || <InfoCircleOutlined />}
                                            >
                                                {amen}
                                            </Tag>
                                        ))}
                                    </Space>
                                </Col>

                                <Col style={{ textAlign: parsedAmenities ?? "right" }}>
                                    {/* CHECK-IN / CHECK-OUT */}
                                    <Text strong>Check-in:</Text> {data.cinTime}
                                    <br />
                                    <Text strong>Check-out:</Text> {data.coutTime}
                                </Col>
                            </Row>

                            {/* Bank Offer Alert */}
                            {cleanOfferText && (
                                <div style={{ marginTop: 12, background: '#fff7e6', border: '1px solid #ffd591', padding: '8px 12px', borderRadius: 8, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <BankOutlined style={{ color: '#fa8c16' }} />
                                    <Text type="secondary" ellipsis={{ tooltip: cleanOfferText }}>{cleanOfferText}</Text>
                                </div>
                            )}

                            {/* <Space wrap>
                                {parsedAmenities.slice(0, 6).map((amen, i) => (
                                    <Tag
                                        key={i}
                                        color="geekblue"
                                        icon={amenityIcons[amen] || <InfoCircleOutlined />}
                                    >
                                        {amen}
                                    </Tag>
                                ))}
                            </Space> */}

                            <Divider />


                            {/* PRICE + BUTTONS */}
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={3} style={{ margin: 0 }}>
                                        ₹{finalPrice.toLocaleString("en-IN")}
                                    </Title>
                                    {data.cpn && (
                                        <Tag color="purple" icon={<GiftOutlined />}>
                                            Coupon: {data.cpn}
                                        </Tag>
                                    )}
                                </Col>

                                <Col>
                                    <Space>
                                        <Button onClick={() => setDrawerOpen(true)}>
                                            View Map
                                        </Button>

                                        <Button href={data.durl} target="_blank">
                                            View on EMT
                                        </Button>

                                        <Button type="primary" onClick={handleBookHotel} loading={isBooking}>
                                            Book
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </motion.div>

            {/* MAP DRAWER */}
            <Drawer
                title={<span><EnvironmentOutlined /> {data.nm}</span>}
                placement="right"
                width="40%"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <div style={{ height: "100%", width: "100%" }}>
                        <Map
                            defaultCenter={{
                                lat: parseFloat(data.lat),
                                lng: parseFloat(data.lon),
                            }}
                            defaultZoom={14}
                        >
                            <Marker position={{
                                lat: parseFloat(data.lat),
                                lng: parseFloat(data.lon),
                            }} />
                        </Map>
                    </div>
                </APIProvider>
            </Drawer>

            {/* BOOKING MODAL */}
            <Modal
                open={isModalVisible}
                title="Booking Summary"
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button onClick={() => setIsModalVisible(false)}>Close</Button>,
                    <Button type="primary" loading={isPaying} onClick={handlePayNow}>
                        Pay Now
                    </Button>
                ]}
            >
                {bookingData ? (
                    <>
                        <Paragraph><strong>Hotel:</strong> {bookingData.hotel_name}</Paragraph>
                        <Paragraph><strong>Check-in:</strong> {bookingData.check_in}</Paragraph>
                        <Paragraph><strong>Check-out:</strong> {bookingData.check_out}</Paragraph>
                        <Paragraph><strong>Total Amount:</strong> ₹{finalPrice.toLocaleString("en-IN")}</Paragraph>
                    </>
                ) : (
                    <Paragraph>Loading…</Paragraph>
                )}
            </Modal>
        </>
    );
};

export default HotelResultCard;
