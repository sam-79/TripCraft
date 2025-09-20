import React from 'react';
import { Tabs, Card, Typography, Tag, Space, Button, List, Divider } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined,
    WarningOutlined,
    ArrowRightOutlined,
    DollarOutlined,
    RocketOutlined
} from '@ant-design/icons';
import "../../styles/TripBookingView.css";
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

// Helper function to render availability status tags
const getStatusTag = (status) => {
    const { t } = useTranslation();
    
    // RLWL, PQWL, etc. are wait list types
    if (status.includes('WL')) {
        return <Tag icon={<ClockCircleOutlined />} color="orange">{status}</Tag>;
    }
    // Available or variants
    if (status.includes('Available') || status.includes('AVBL')) {
        return <Tag icon={<CheckCircleOutlined />} color="success">{t('available')}</Tag>;
    }
    // Formatted status like "6/WL12" for partial waitlist
    if (status.includes('/')) {
        return <Tag icon={<WarningOutlined />} color="warning">{status.replace(/\//g, ' / ')}</Tag>;
    }
    // For any other status like "Not Available", "RAC", etc.
    return <Tag icon={<ClockCircleOutlined />} color="processing">{status}</Tag>;
};

// Component to display the list of classes for a single train
const ClassAvailability = ({ classes }) => {
    const { t } = useTranslation();
    
    // Filter out any classes with the "Tap To Refresh" status
    const availableClasses = classes.filter(cls =>
        cls.availablityStatus && !cls.availablityStatus.toLowerCase().includes('tap to refresh')
    );

    if (availableClasses.length === 0) {
        return <Text type="secondary">{t('no_availability_info')}</Text>;
    }

    return (
        <div className="class-availability-list">
            {availableClasses.map((cls, index) => (
                <div key={index} className="class-item">
                    <Text className="class-name">{cls.className}</Text>
                    <div className="class-details">
                        <Text type="secondary">{t('fare')}: ₹{cls.fare}</Text>
                        {getStatusTag(cls.availablityStatus)}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Component to display a single train card
const TrainCard = ({ train }) => {
    const { t } = useTranslation();
    
    return (
        <Card className="train-card">
            <div className="train-header">
                <div>
                    <Title level={4} className="train-name">{train.trainName} ({train.trainNumber})</Title>
                    <Text type="secondary">{train.runDays.join(', ')}</Text>
                </div>
                <Tag color="blue">{train.travelTime}</Tag>
            </div>

            <div className="train-times">
                <div className="departure">
                    <Text strong>{train.departureTime}</Text>
                    <Text>{train.departureStation}</Text>
                </div>
                <ArrowRightOutlined className="arrow-animation" />
                <div className="arrival">
                    <Text strong>{train.arrivalTime}</Text>
                    <Text>{train.arrivalStation}</Text>
                </div>
            </div>

            <Divider />
            <Title level={5}>{t('availability')}:</Title>
            <ClassAvailability classes={train.classesAvailability} />

            <div className="train-actions">
                <Button type="primary">{t('check_on_irctc')}</Button>
            </div>
        </Card>
    );
};

const TripBookingView = ({ bookingData }) => {
    const { t } = useTranslation();
    
    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            <Tabs defaultActiveKey="train" style={{ marginBottom: 16 }}>
                <TabPane tab={<span><RocketOutlined /> {t('trains')}</span>} key="train">
                    {bookingData?.trains?.length > 0 ? (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Paragraph>{t('train_suggestions')}</Paragraph>
                            {bookingData.trains.map((train, index) => (
                                <TrainCard key={index} train={train} />
                            ))}
                        </Space>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">{t('no_train_suggestions')}</Text>
                        </div>
                    )}
                </TabPane>
                <TabPane tab={<span><CarOutlined /> {t('flights')}</span>} key="flight">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">{t('flight_suggestions_coming_soon')}</Text>
                    </div>
                </TabPane>
                <TabPane tab={<span><DollarOutlined /> {t('hotels')}</span>} key="hotel">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">{t('hotel_suggestions_coming_soon')}</Text>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default TripBookingView;
