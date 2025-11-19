import React, { useState } from 'react';
import {
    Typography,
    Button,
    Row,
    Col,
    Input,
    DatePicker,
    Spin,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';;
import comingSoonAnimation from '../../assets/flight-booking-coming-soon.json'; 

const { Title, Text } = Typography;

// --- Search Form ---
const FlightSearchForm = ({ onSearch }) => (
    <Row gutter={16}>
        <Col flex={1}>
            <Text>From</Text>
            <Input placeholder="Enter origin city or airport" size="large" />
        </Col>
        <Col flex={1}>
            <Text>To</Text>
            <Input placeholder="Enter destination city or airport" size="large" />
        </Col>
        <Col>
            <Text>Date</Text>
            <DatePicker size="large" format="DD MMM YYYY" style={{ width: '100%' }} />
        </Col>
        <Col>
            <Button
                type="primary"
                icon={<SearchOutlined />}
                size="large"
                style={{ marginTop: '24px' }}
                onClick={onSearch}
            >
                Search Flights
            </Button>
        </Col>
    </Row>
);

// --- Main FlightBooking Component ---
const FlightBooking = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSearch = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setResults([]); // no results, coming soon message
            setLoading(false);
        }, 1000);
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <Title level={5} style={{ marginTop: 16 }}>
                        Searching for flights...
                    </Title>
                </div>
            );
        }

        if (!results) return null;

        // 🛫 Show “Coming Soon” animation here
        return (
            <div
                style={{
                    textAlign: 'center',
                    marginTop: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Lottie
                    animationData={comingSoonAnimation}
                    loop
                    style={{ width: 300, height: 300 }}
                />
                <Title level={3} style={{ marginTop: 16 }}>
                    Flight Booking Feature Coming Soon ✈️
                </Title>
                <Text type="secondary">
                    Our flight booking feature is under development. Stay tuned!
                </Text>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '8px' }}
        >
            {/* <FlightSearchForm onSearch={handleSearch} /> */}
            {/* {renderResults()} */}
            {/* Remove Below part when flight booking feature added */}
            <div
                style={{
                    textAlign: 'center',
                    marginTop: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Lottie
                    animationData={comingSoonAnimation}
                    loop
                    style={{ width: 300, height: 300 }}
                />
                <Title level={3} style={{ marginTop: 16 }}>
                    Flight Booking Feature Coming Soon ✈️
                </Title>
                <Text type="secondary">
                    Our flight booking feature is under development. Stay tuned!
                </Text>
            </div>
        </motion.div>
    );
};

export default FlightBooking;
