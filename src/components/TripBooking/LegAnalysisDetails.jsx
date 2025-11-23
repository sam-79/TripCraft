import React from 'react';
import { Typography, Row, Col, Tag, Button, Empty, Space, message, Alert  } from 'antd';
import { ArrowRightOutlined, LinkOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import TrainAnalysisSection from './TrainAnalysisSection';
import BusAnalysisSection from './BusAnalysisSection';
import CabAnalysisSection from './CabAnalysisSection'; // Import the new component

const { Title, Text, Link } = Typography;

// Helper to format currency
const formatCurrency = (amount) => `₹ ${amount?.toLocaleString('en-IN') ?? 'N/A'}`;

// Helper for Train Availability Tag
const getTrainAvailabilityTag = (status) => {
    if (!status) return <Tag color="default">N/A</Tag>;
    if (status.includes('AVAILABLE')) return <Tag color="success">{status}</Tag>;
    if (status.includes('WL') || status.includes('RLWL') || status.includes('RAC')) return <Tag color="warning">{status}</Tag>;
    if (status.includes('REGRET') || status.includes('NOT AVAILABLE')) return <Tag color="error">{status}</Tag>;
    return <Tag color="processing">{status}</Tag>; // For 'Tap To Refresh' etc.
};


// Main component to render details for a specific leg
const LegAnalysisDetails = ({ leg, bookingList, onAddToBooking }) => {
    const [messageApi, messageApiContextHolder] = message.useMessage();

    // Determine which analysis component to show
    const renderAnalysisComponent = () => {
        if (leg.mode?.toLowerCase() === 'train' && leg.train_data_analysis) {
            return (
                <TrainAnalysisSection
                    analysis={leg.train_data_analysis}
                    bookingList={bookingList}
                    onAddToBooking={onAddToBooking}
                />
            );
        }

        if (leg.mode?.toLowerCase() === 'bus' && leg.bus_data_analysis) {
            return (
                <BusAnalysisSection
                    analysis={leg.bus_data_analysis}
                    bookingList={bookingList}
                    onAddToBooking={onAddToBooking}
                />
            );
        }

        if (leg.mode?.toLowerCase() === 'cab') {
            return (
                <CabAnalysisSection
                    leg={leg} // Pass the whole leg
                    bookingList={bookingList}
                    onAddToBooking={onAddToBooking}
                />
            );
        }

        // Add condition for flight_data_analysis and more here if needed

        // Fallback for no detailed analysis
        return <Empty description="Detailed analysis for this leg is not available." />;
    };

    return (
        <div>
            {messageApiContextHolder}
            <Title level={4} style={{ marginBottom: 20 }}>
                {leg.mode} Analysis: {leg.from} ({leg.from_code || 'N/A'}) <ArrowRightOutlined /> {leg.to} ({leg.to_code || 'N/A'})
            </Title>

            {renderAnalysisComponent()}

            {/* Booking Button - Hide for cabs or if no booking URL */}
            {(leg.mode?.toLowerCase() !== 'cab' && leg.booking_url) && (
                <Alert
                    message={
                        <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                            <Col>
                                <Space>
                                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                                    <Text strong>Ready to book?</Text>
                                    <Text type="secondary">Complete your reservation securely on EaseMyTrip.</Text>
                                </Space>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<LinkOutlined />}
                                    onClick={() => window.open(leg.booking_url, '_blank')}
                                    style={{ background: '#1890ff', borderColor: '#1890ff' }}
                                >
                                    Book on EaseMyTrip
                                </Button>
                            </Col>
                        </Row>
                    }
                    type="info"
                    style={{ marginBottom: 24, marginTop: 24, padding: '12px 24px', borderRadius: 8, border: '1px solid #91caff' }}
                />
            )}

        </div>
    );
};

export default LegAnalysisDetails;
