import React, { useState } from 'react';
import { Card, Row, Col, Image, Typography, Rate, Tag, Button, Divider, Modal, Space, message, Carousel } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, CoffeeOutlined, GiftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCreateHotelBookingMutation } from '../../api/bookingApi';
import { useCreateCheckoutSessionMutation } from '../../api/paymentApi';


import dayjs from 'dayjs';

function formatToYYYYMMDD(dateStr) {
    return dayjs(dateStr, 'DD-MM-YYYY').format('YYYY-MM-DD');
}


const { Title, Text, Paragraph } = Typography;

const HotelResultCard = ({ data, showModal, selectedTripId, userData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [messageApi, messageApiContextHolder] = message.useMessage();

    const [createHotelBooking, { isLoading: isBooking }] = useCreateHotelBookingMutation();
    const [createCheckoutSession, { isLoading: isPaying }] = useCreateCheckoutSessionMutation();

    // --- Price & Rating ---
    const finalPrice = data.prc + (data.tax || 0);
    const displayRating = data.tr ? parseFloat(data.tr) : parseFloat(data.rat || 0);
    const getRatingText = (rating) => {
        if (rating >= 4.5) return { text: "Exceptional", color: "purple" };
        if (rating >= 4.0) return { text: "Very Good", color: "success" };
        if (rating >= 3.5) return { text: "Good", color: "blue" };
        if (rating >= 3.0) return { text: "Average", color: "warning" };
        return { text: "Okay", color: "default" };
    };
    const ratingInfo = getRatingText(displayRating);
    const mainImage = data.imgU || (data.imgarry && data.imgarry[0]) || "https://placehold.co/300x250/EEE/CCC?text=No+Image";

    // --- Booking Handler ---
    const handleBookHotel = async () => {
        if (!selectedTripId) {
            messageApi.error("Trip not selected");
            showModal();
            return
        }
        try {
            const res = await createHotelBooking({
                ...data, ...{ trip_id: selectedTripId }, ...userData, check_in: formatToYYYYMMDD(userData.check_in),
                check_out: formatToYYYYMMDD(userData.check_out)
            }).unwrap();
            if (res.status) {
                setBookingData(res.data);
                setIsModalVisible(true);
                messageApi.success(res.message);
            }
        } catch (err) {
            console.error(err);
            messageApi.error("Booking failed. Please try again.");
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
                trip_id: selectedTripId
            }).unwrap();

            if (res.checkout_url) {
                window.location.href = res.checkout_url; // Redirect to Stripe
            } else {
                messageApi.error("Payment session could not be created.");
            }
        } catch (err) {
            console.error(err);
            messageApi.error("Payment initialization failed.");
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {messageApiContextHolder}
                <Card
                    style={{
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                        overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <Row gutter={0}>
                        {/* --- Image --- */}
                        <Col xs={24} sm={8} md={6}>
                            <div
                                style={{
                                    height: '200px',            // ✅ fixed height for all images
                                    width: '100%',
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                }}
                            >
                                <Carousel arrows autoplay dotPosition="bottom" effect="fade">
                                    {data.imgarry.slice(0, 5).map((img, index) => (
                                        <div key={index}>
                                            <img
                                                alt={data.nm}
                                                src={img}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderBottom: '1px solid #f0f0f0',
                                                }}
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://placehold.co/400x180/EEE/CCC?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        </Col>


                        {/* --- Details --- */}
                        <Col xs={24} sm={16} md={18} style={{ padding: '16px 20px' }}>
                            <Row justify="space-between" align="top">
                                <Col flex="auto">
                                    <Title level={5} style={{ margin: 0 }}>{data.nm}</Title>
                                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                                        <EnvironmentOutlined /> {data.loc || data.adrs?.split('>').pop() || 'Location unavailable'}
                                    </Paragraph>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    {displayRating > 0 && (
                                        <Tag color={ratingInfo.color} style={{ marginBottom: 4 }}>
                                            {ratingInfo.text}
                                        </Tag>
                                    )}
                                    <br />
                                    <Rate disabled defaultValue={displayRating} allowHalf style={{ fontSize: 14 }} />
                                    {data.tCount && (
                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                                            ({data.tCount} reviews)
                                        </Text>
                                    )}
                                </Col>
                            </Row>

                            <Divider style={{ margin: '12px 0' }} />

                            {/* --- Tags --- */}
                            <Space wrap>
                                {data.plcy && (
                                    <Tag
                                        color={data.plcy.toLowerCase().includes('free') ? "green" : "orange"}
                                        icon={<CheckCircleOutlined />}
                                    >
                                        {data.plcy}
                                    </Tag>
                                )}
                                {data.isBreakFast && (
                                    <Tag color="gold" icon={<CoffeeOutlined />}>
                                        Breakfast Included
                                    </Tag>
                                )}
                                {data.cpn && (
                                    <Tag color="purple" icon={<GiftOutlined />}>
                                        {data.cpn}
                                    </Tag>
                                )}
                            </Space>

                            <Row justify="space-between" align="bottom" style={{ marginTop: 16 }}>
                                <Col>
                                    <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                                        Total for {data.et || 1} {data.et > 1 ? 'nights' : 'night'}
                                    </Paragraph>
                                    <Title level={4} style={{ margin: '0 0 4px 0' }}>
                                        ₹{finalPrice.toLocaleString('en-IN')}
                                    </Title>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button
                                            type="default"
                                            href={data.durl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Deal
                                        </Button>
                                        <Button
                                            type="primary"
                                            loading={isBooking}
                                            onClick={handleBookHotel}
                                        >
                                            Book
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </motion.div>

            {/* --- Booking Modal --- */}
            <Modal
                open={isModalVisible}
                title="Booking Summary"
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="pay"
                        type="primary"
                        loading={isPaying}
                        onClick={handlePayNow}
                    >
                        Pay Now
                    </Button>,
                ]}
            >
                {bookingData ? (
                    <>
                        <Paragraph><strong>Hotel:</strong> {bookingData.hotel_name}</Paragraph>
                        <Paragraph><strong>Check-in:</strong> {bookingData.check_in}</Paragraph>
                        <Paragraph><strong>Check-out:</strong> {bookingData.check_out}</Paragraph>
                        <Paragraph><strong>Total Amount:</strong> ₹{finalPrice.toLocaleString('en-IN')}</Paragraph>
                    </>
                ) : (
                    <Paragraph>Loading booking details...</Paragraph>
                )}
            </Modal>
        </>
    );
};

export default HotelResultCard;
