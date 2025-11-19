import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag, Empty, List, Divider, Button, Tooltip, Alert } from "antd";
import { motion } from "framer-motion";
import { DollarCircleOutlined, ClockCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

const CabAnalysisSection = ({ leg, bookingList, onAddToBooking }) => {
    // The 'analysis' object is at the root of the 'leg' for cabs, not nested.
    const { analysis, approx_cost, approx_time, mode, from, to } = leg;

    // Create a unique ID for the cab record
    const id = `cab-${from.replace(/\s+/g, '-')}-${to.replace(/\s+/g, '-')}`;
    const isAdded = bookingList.some(item => item.id === id);

    const bookingItem = {
        id,
        type: 'cab',
        name: `Cab: ${from} to ${to}`,
        approx_cost,
        approx_time,
        fare: approx_cost, // Standardize fare
        departure: 'N/A',
        arrival: 'N/A',
        duration: approx_time,
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card bordered={false}>
                        <Statistic title="Approx. Cost" value={approx_cost || "N/A"} prefix={<DollarCircleOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false}>
                        <Statistic title="Approx. Time" value={approx_time || "N/A"} prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Space>
                    <Title level={5} style={{ margin: 0 }}>Cab Details</Title>
                    <Tooltip title={isAdded ? 'Remove from list' : 'Add to list'}>
                        <Button
                            type={isAdded ? 'default' : 'primary'}
                            ghost={!isAdded}
                            danger={isAdded}
                            size="small"
                            icon={isAdded ? <MinusCircleOutlined /> : <PlusOutlined />}
                            onClick={() => onAddToBooking(bookingItem)}
                        >
                            {isAdded ? 'Remove' : 'Add'}
                        </Button>
                    </Tooltip>
                </Space>
                <Paragraph style={{ marginTop: 16 }}>
                    This leg of the journey is a local cab ride. Detailed live analysis is not available.
                </Paragraph>
                {analysis && !analysis.status && (
                    <Alert
                        message="Analysis Note"
                        description={analysis.message}
                        type="info"
                        showIcon
                    />
                )}
            </Card>
        </motion.div>
    );
};

export default CabAnalysisSection;
