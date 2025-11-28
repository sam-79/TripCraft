import React from 'react';
import { Typography, Card, Tag, Collapse, Space, Divider, Empty, Button, Tooltip } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    CarOutlined,
    EnvironmentOutlined,
    ArrowRightOutlined,
    CalendarOutlined,
    WalletOutlined,
    LinkOutlined
} from '@ant-design/icons';
import '../../styles/TripBookingView.css';
import { useTranslation } from 'react-i18next';

const { Title, Text, Link } = Typography;
const { Panel } = Collapse;

// A more robust function to determine tag color and icon based on availability
const getAvailabilityTag = (status) => {
    // const { t } = useTranslation();
    if (!status) return null;
    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes('available')) {
        const count = status.match(/\d+/) ? `(${status.match(/\d+/)[0]})` : '';
        return <Tag icon={<CheckCircleOutlined />} color="success">{`Available ${count}`}</Tag>;
    }
    if (lowerStatus.includes('wl')) {
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
                        <Text className="class-fare"><WalletOutlined />{t('fare')}: ₹{cls.totalFare}</Text>
                        {getAvailabilityTag(cls.availablityStatus)}
                    </div>
                </div>
            ))}
        </div>
    );
};


// A dedicated card component for displaying a single train's details
const TrainCard = ({ train }) => {
    const { t } = useTranslation();

    return (
        <Card className="train-card" bordered={false}>
            <div className="train-header">
                <Title level={5} style={{ margin: 0 }}>{train.trainName} <Text type="secondary">({train.trainNumber})</Text></Title>
                <Tag color="blue">{train.duration} {t('hours')}</Tag>
            </div>
            <Divider className="train-divider" />
            <div className="train-route">
                <div className="station-info">
                    <Text strong>{train.fromStnCode}</Text>
                    <Text>{train.departureTime}</Text>
                    <Text type="secondary">{train.departuredate}</Text>
                </div>
                <div className="route-line">
                    <ArrowRightOutlined />
                    <Text type="secondary">{train.distance} km</Text>
                </div>
                <div className="station-info end">
                    <Text strong>{train.toStnCode}</Text>
                    <Text>{train.arrivalTime}</Text>
                    <Text type="secondary">{train.ArrivalDate}</Text>
                </div>
            </div>
            <Collapse ghost expandIconPosition="right" className="class-collapse">
                <Panel header={t('availabilitynfare')} key="1">
                    <ClassAvailability classes={train.classes} />
                </Panel>
            </Collapse>
        </Card>
    );
};

// The main view component
const TripBookingView = ({ bookingData }) => {
    const { t } = useTranslation();
    
    if (!bookingData || !bookingData.to || bookingData.to.length === 0) {
        return <Empty description={t('no_booking_suggestion')} />;
    }

    return (
        <div className="trip-booking-container">
            <div className="booking-header">
                <Title level={4} style={{ margin: 0 }}>{t('booking')} {t('suggestion')}</Title>
                <Text type="secondary">{t('live_suggestion')} {t('from')} <Text strong>{bookingData.from}</Text></Text>
            </div>

            {bookingData.to.map((leg, index) => (
                <div key={index} className="booking-leg">
                    <div className="leg-header">
                        <Title level={5}><EnvironmentOutlined /> {t('to')}: {leg.destination}</Title>
                        <Tooltip title="Open booking website in a new tab">
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                href={leg.booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t('book_now')}
                            </Button>
                        </Tooltip>
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {leg.details.Trains && leg.details.Trains.map((train, trainIndex) => (
                            <TrainCard key={trainIndex} train={train} />
                        ))}
                        {/* You can add similar checks for Flights or Buses here in the future */}
                    </Space>
                </div>
            ))}
        </div>
    );
};

export default TripBookingView;
