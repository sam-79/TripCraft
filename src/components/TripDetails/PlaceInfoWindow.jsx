import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { Card, Typography, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const PlaceInfoWindow = ({ place, index, onCloseClick }) => {
    const { t } = useTranslation();
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
                        <div style={{ position: 'relative' }}>
                            {/* IMAGE */}
                            <img
                                alt={place.name}
                                src={place.image_url}
                                loading='lazy'
                                className="infowindow-image"
                                onError={(e) => {
                                    e.target.onerror = null; // prevent infinite loop
                                    e.target.style.display = 'none'; // hide broken image
                                    const placeholder = e.target.parentNode.querySelector('#image-placeholder');
                                    if (placeholder) placeholder.style.display = 'flex';
                                }}
                                style={{
                                    borderRadius: '8px 8px 0 0',
                                    objectFit: 'cover',
                                    height: 150,
                                    width: '100%',
                                }}
                            />

                            {/* TEXTUAL PLACEHOLDER */}
                            <div style={{
                                display: 'none',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 150,
                                borderRadius: '8px 8px 0 0',
                                background: '#f5f5f5',
                                id:'image-placeholder'
                            }}>
                                <EnvironmentOutlined style={{ fontSize: 24, color: '#888' }} />
                                <span style={{ marginTop: 4, color: '#666', fontWeight: 500 }}>{t('no_image')}</span>
                            </div>

                        </div>
                    }
                    bordered={false}
                    style={{
                        maxWidth: 320,
                        borderRadius: 12,
                        // boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        // backgroundColor: 'var(--infoWindow-bg, #fff)',
                        // color: 'var(--infoWindow-text, #000)',
                    }}
                >
                    <Card.Meta
                        title={
                            <Space size="small" align="center" style={{ marginBottom: 6 }}>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 16,
                                        // color: 'var(--infoWindow-primary, #1890ff)',
                                        userSelect: 'none',
                                    }}
                                >
                                    #{index + 1}
                                </Text>
                                <Title
                                    level={5}
                                    style={{
                                        margin: 0,
                                        // color: 'var(--infoWindow-title, #111)',
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
                                    // color: 'var(--infoWindow-desc, #444)',
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