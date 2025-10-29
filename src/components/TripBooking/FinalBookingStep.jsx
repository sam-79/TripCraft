import React, { useMemo } from 'react';
import { Result, Typography, List, Card, Button, Tag, Avatar, Divider, Statistic, Row, Col, Empty, message } from 'antd';
import { ShoppingCartOutlined, CarOutlined, HomeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Helper to format currency
const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

const FinalBookingStep = ({ tripId, bookingData, bookingList, setStatus }) => {

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
        message.success("Redirecting you to our booking partners...");
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

            <Row gutter={[24, 24]}>
                {/* Travel Column */}
                <Col xs={24} md={12}>
                    <Card
                        title={<><CarOutlined /> Travel Selections ({travelItems.length})</>}
                        bordered={false}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    >
                        {travelItems.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={travelItems}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.type.charAt(0).toUpperCase()}</Avatar>}
                                            title={<Text strong>{item.name || item.train_name}</Text>}
                                            description={
                                                <>
                                                    <Tag color="blue">{item.type.toUpperCase()}</Tag>
                                                    <Text>Route: {item.route || `${item.from} to ${item.to}`}</Text>
                                                </>
                                            }
                                        />
                                        <Text strong>{formatCurrency(item.fare)}</Text>
                                    </List.Item>
                                )}
                            />
                        ) : <Empty description="No travel options selected" />}
                    </Card>
                </Col>

                {/* Hotel Column */}
                <Col xs={24} md={12}>
                    <Card
                        title={<><HomeOutlined /> Accommodation Selections ({hotelItems.length})</>}
                        bordered={false}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    >
                        {hotelItems.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={hotelItems}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar shape="square" size={64} src={item.image} />}
                                            title={<Text strong>{item.name}</Text>}
                                            description={item.address}
                                        />
                                        <Text strong>{formatCurrency(item.price)}<Text type="secondary">/night</Text></Text>
                                    </List.Item>
                                )}
                            />
                        ) : <Empty description="No hotels selected" />}
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Total Cost and Final Action */}
            <Card style={{ marginTop: 24, background: '#f6ffed' }}>
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
                            Proceed to Book on Partner Sites
                        </Button>
                    </Col>
                </Row>
            </Card>
        </motion.div>
    );
};

export default FinalBookingStep;