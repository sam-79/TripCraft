import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { Card, Typography, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const PlaceInfoWindow = ({ place, index, onCloseClick }) => {
    if (!place) return null;

    const position = {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
    };

    return (
        <InfoWindow position={position} onCloseClick={onCloseClick} pixelOffset={[0, -40]}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Card
                    className="infowindow-card"
                    cover={
                        <img
                            alt={place.name}
                            src={place.image_url}
                            className="infowindow-image"
                            onError={(e) => (e.target.src = '/fallback-image.png')} // fallback image
                            style={{ borderRadius: '8px 8px 0 0', objectFit: 'cover', height: 150 }}
                        />
                    }
                    bordered={false}
                    style={{
                        maxWidth: 320,
                        borderRadius: 12,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        backgroundColor: 'var(--infoWindow-bg, #fff)',
                        color: 'var(--infoWindow-text, #000)',
                    }}
                >
                    <Card.Meta
                        title={
                            <Space size="small" align="center" style={{ marginBottom: 6 }}>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 16,
                                        color: 'var(--infoWindow-primary, #1890ff)',
                                        userSelect: 'none',
                                    }}
                                >
                                    #{index + 1}
                                </Text>
                                <Title
                                    level={5}
                                    style={{
                                        margin: 0,
                                        color: 'var(--infoWindow-title, #111)',
                                        fontWeight: 600,
                                        flex: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    ellipsis
                                >
                                    {place.name}
                                </Title>
                                <EnvironmentOutlined style={{ color: 'var(--infoWindow-primary, #1890ff)' }} />
                            </Space>
                        }
                        description={
                            <Text
                                style={{
                                    color: 'var(--infoWindow-desc, #444)',
                                    fontSize: 14,
                                    lineHeight: 1.4,
                                }}
                            >
                                {place.description}
                            </Text>
                        }
                    />
                </Card>
            </motion.div>
        </InfoWindow>
    );
};

export default PlaceInfoWindow;