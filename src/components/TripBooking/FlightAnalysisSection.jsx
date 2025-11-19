import React from 'react';
import { Typography, Row, Col, Statistic, Table, Tag, Button, Empty, Space, Card, Alert } from 'antd'; // Added Alert
import { ClockCircleOutlined, DollarCircleOutlined, ThunderboltOutlined, WalletOutlined, LikeOutlined, InfoCircleOutlined } from '@ant-design/icons'; // Added InfoCircleOutlined
import { motion } from 'framer-motion';

const { Title, Text, Link } = Typography;

// Helper to format currency
const formatCurrency = (amount) => `₹ ${amount?.toLocaleString('en-IN') ?? 'N/A'}`;

// Placeholder - Adjust when real data is available
const FlightAnalysisSection = ({ analysis, bookingUrl, bookingList, onAddToBooking }) => {

    // --- Handle "Coming Soon" State ---
    if (!analysis || analysis.status === false) {
        return (
            <Alert
                message={analysis?.message || "Flight Analysis Feature Coming Soon"}
                description={`Details for flights from ${analysis?.info?.from} to ${analysis?.info?.to} on ${analysis?.info?.journey_date} will be available here soon.`}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                action={
                    <Button type="link" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                        Check on EaseMyTrip
                    </Button>
                }
            />
        );
    }

    // --- Placeholder Structure for Future Data ---
    // Assuming a structure similar to Train/Bus analysis when implemented
    const legAnalysis = analysis?.leg_wise_analysis?.[0]; // Example placeholder
    const overallStats = analysis?.overall_statistics; // Example placeholder

    if (!legAnalysis || !overallStats) {
        return <Empty description="Detailed flight analysis data structure not yet defined or data is missing." />;
    }

    // Example Columns (Adapt based on actual flight data)
    const columns = [
        {
            title: 'Airline',
            key: 'airline',
            render: (_, record) => (
                <div>
                    <Text strong>{record.airline_name}</Text><br />
                    <Text type="secondary">{record.flight_number}</Text>
                </div>
            ),
        },
        { title: 'Departure', dataIndex: 'departure_time', key: 'departure', align: 'center' },
        { title: 'Arrival', dataIndex: 'arrival_time', key: 'arrival', align: 'center' },
        { title: 'Duration', dataIndex: 'duration', key: 'duration', align: 'center' },
        {
            title: 'Fare',
            dataIndex: 'fare',
            key: 'fare',
            align: 'right',
            render: (fare) => <Text strong>{formatCurrency(fare)}</Text>
        },
        // Add columns for stops, baggage info, etc. if available
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: () => <Button type="primary" size="small" href={bookingUrl} target="_blank">Book Now</Button>,
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* --- Summary Statistics --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24, background: '#f0f2f5', padding: '16px', borderRadius: '8px' }}>
                <Col xs={12} sm={6}>
                    <Statistic title="Total Flights Found" value={overallStats?.total_flights_found || 'N/A'} />
                </Col>
                <Col xs={12} sm={6}>
                    {/* Add relevant stats like Non-Stop vs Connecting */}
                    <Statistic title="Non-Stop Flights" value={overallStats?.non_stop_flights || 'N/A'} />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic title="Avg. Duration" value={legAnalysis?.average_duration || 'N/A'} prefix={<ClockCircleOutlined />} />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic title="Avg. Fare (Economy)" value={formatCurrency(analysis?.fare_analysis?.economy?.average)} />
                </Col>
            </Row>

            {/* --- Recommendations (Placeholder) --- */}
            {legAnalysis?.recommendations && (
                <>
                    <Title level={5} style={{ marginBottom: 16 }}>Recommendations</Title>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        {legAnalysis.recommendations.fastest && <Col xs={24} md={8}><Card size="small" title={<Space><ThunderboltOutlined />Fastest</Space>}><Text>{legAnalysis.recommendations.fastest.airline_name} ({legAnalysis.recommendations.fastest.duration})</Text></Card></Col>}
                        {legAnalysis.recommendations.cheapest && <Col xs={24} md={8}><Card size="small" title={<Space><WalletOutlined />Cheapest</Space>}><Text>{legAnalysis.recommendations.cheapest.airline_name} ({formatCurrency(legAnalysis.recommendations.cheapest.fare)})</Text></Card></Col>}
                        {/* Add 'Best Rated' or other relevant recommendations */}
                    </Row>
                </>
            )}

            <Title level={5} style={{ marginBottom: 16 }}>Available Flight Options</Title>
            <Table
                columns={columns}
                dataSource={legAnalysis?.available_flights?.map(f => ({ ...f, key: f.flight_number })) || []} // Use appropriate key
                pagination={{ pageSize: 5, simple: true }}
                size="middle"
                scroll={{ x: 800 }}
            />
        </motion.div>
    );
};

export default FlightAnalysisSection;
