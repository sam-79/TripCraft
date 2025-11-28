import React, { useMemo } from 'react';
import { Result, Typography, List, Card, Button, Tag, Avatar, Divider, Statistic, Row, Col, Empty, message } from 'antd';
import { ShoppingCartOutlined, CarOutlined, HomeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
const { Title, Text, Paragraph } = Typography;

// Helper to format currency
const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

const FinalBookingStep = ({ tripId, bookingData, bookingList, setStatus }) => {
    const navigate = useNavigate(); // Add the useNavigate hook


    // 1. Separate the booking list into travel and hotel items
    const { travelItems, hotelItems } = useMemo(() => {
        const travel = bookingList.filter(item => item.type === 'bus' || item.type === 'train' || item.type === 'flight');
        const hotels = bookingList.filter(item => item.type === 'hotel');
        return { travelItems: travel, hotelItems: hotels };
    }, [bookingList]);

    // 2. Calculate the total estimated cost
    const totalCost = useMemo(() => {
        return bookingList.reduce((acc, item) => {
            const price = parseFloat(item.price || item.fare || 0);
            return acc + price;
        }, 0);
    }, [bookingList]);

    // 3. Handle the final booking action
    const handleFinalizeBooking = () => {
        message.success('Redirecting to search...');
        // Navigate to the explore page and pass the data in state
        navigate('/user/bookings/search/', {
            state: {
                travelItems: travelItems,
                hotelItems: hotelItems,
                totalCost: totalCost,
            },
        });
    };

    // If the list is empty, show a prompt
    if (bookingList.length === 0) {
        return (
            <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                description={
                    <span>
                        <Title level={5}>Your Booking List is Empty</Title>
                        <Text>Go back to the previous steps to add travel and hotel options to your trip.</Text>
                    </span>
                }
            />
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Result
                icon={<ShoppingCartOutlined />}
                title="Your Trip Booking Summary"
                subTitle="Please review your selected travel and accommodation options below before proceeding."
            />

            <div
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 24,
                    padding:10,
                    scrollBehavior: 'smooth',
                    justifyContent: "space-around",
                    maxHeight:350
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
                            overflowX:'auto'
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

            <Divider />

            {/* Total Cost and Final Action */}
            <Card style={{ marginTop: 24}}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Statistic
                            title={<Title level={4}>Estimated Total Cost</Title>}
                            value={totalCost}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#3f8600', fontSize: '28px' }}
                        />
                        <Paragraph type="secondary">This is an approximate cost. Prices may vary on the booking sites.</Paragraph>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ArrowRightOutlined />}
                            onClick={handleFinalizeBooking}
                            block
                        >
                            Proceed to Book 
                        </Button>
                    </Col>
                </Row>
            </Card>
        </motion.div >
    );
};

export default FinalBookingStep;