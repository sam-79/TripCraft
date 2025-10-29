import React from 'react';
import { Typography, Row, Col, Statistic, Table, Tag, Button, Empty, Space, Card, Tooltip, message } from 'antd';
import { ClockCircleOutlined, DollarCircleOutlined, CheckCircleOutlined, WarningOutlined, CarOutlined, StarFilled, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import TrainAnalysisSection from './TrainAnalysisSection';
import BusAnalysisSection from './BusAnalysisSection';

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
    return (
        <div>
            {messageApiContextHolder}
            <Title level={4} style={{ marginBottom: 20 }}>
                {leg.mode} Analysis: {leg.from} ({leg.from_code || 'N/A'}) <ArrowRightOutlined /> {leg.to} ({leg.to_code || 'N/A'})
            </Title>

            {/* Pass the required props to TrainAnalysisSection */}
            {leg.train_data_analysis && (
                <TrainAnalysisSection
                    analysis={leg.train_data_analysis}
                    bookingList={bookingList}
                    onAddToBooking={onAddToBooking}
                />
            )}

            {leg.bus_data_analysis && (
                <BusAnalysisSection
                    analysis={leg.bus_data_analysis}
                    bookingList={bookingList}
                    onAddToBooking={onAddToBooking}
                />
            )}
            {/* Add condition for flight_data_analysis */}

            {!leg.train_data_analysis && !leg.bus_data_analysis && (
                <Empty description="Detailed analysis for this leg is not available." />
            )}

            {/* Booking Button - Consider placing this more strategically */}
            <Button
                type="link"
                href={leg.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 16 }}
            >
                <Tooltip title={"Book with EaseMyTrip"}>
                    View on EaseMyTrip
                </Tooltip>
            </Button>
        </div>
    );
};

export default LegAnalysisDetails;
